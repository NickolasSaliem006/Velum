// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RecordRegistry
 * @notice Append-only registry of medical record CIDs with per-record metadata.
 * @dev Records are immutable once written. History is preserved via event logs.
 *      Content is stored off-chain (IPFS sim); only the content hash is on-chain.
 */
contract RecordRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum Severity {
        Low,
        Medium,
        High
    }

    struct Record {
        bytes32 id;
        address patient;
        address doctor;
        address hospital;
        string cid; // SHA-256 hex of encrypted content blob
        Severity severity;
        uint256 timestamp;
        bool requiresMultiSig; // true for High severity entries
        bool finalized;
    }

    /// @notice All records, indexed by record ID.
    mapping(bytes32 => Record) public records;

    /// @notice Record IDs per patient address, in write order.
    mapping(address => bytes32[]) public patientRecords;

    /// @notice Second-signature approvals for high-severity multi-sig flow.
    mapping(bytes32 => address) public secondSigner;

    uint256 public totalRecords;

    event RecordWritten(
        bytes32 indexed recordId,
        address indexed patient,
        address indexed doctor,
        string cid,
        Severity severity,
        uint256 timestamp
    );

    event RecordFinalized(bytes32 indexed recordId, address secondDoctor);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    /**
     * @notice Write a new medical record entry.
     * @param patient  The patient's wallet address.
     * @param cid      SHA-256 hex of the encrypted content blob stored off-chain.
     * @param severity Low / Medium / High.
     * @return recordId Unique ID for this record.
     */
    function writeRecord(
        address patient,
        string calldata cid,
        Severity severity
    ) external nonReentrant onlyRole(DOCTOR_ROLE) returns (bytes32 recordId) {
        require(patient != address(0), "RecordRegistry: zero patient address");
        require(bytes(cid).length == 64, "RecordRegistry: CID must be 64 hex chars");

        recordId = keccak256(
            abi.encodePacked(patient, msg.sender, cid, block.timestamp, totalRecords)
        );
        require(records[recordId].timestamp == 0, "RecordRegistry: duplicate record ID");

        bool needsMultiSig = severity == Severity.High;

        records[recordId] = Record({
            id: recordId,
            patient: patient,
            doctor: msg.sender,
            hospital: address(0), // set by hospital role if needed
            cid: cid,
            severity: severity,
            timestamp: block.timestamp,
            requiresMultiSig: needsMultiSig,
            finalized: !needsMultiSig // low/medium are immediately finalized
        });

        patientRecords[patient].push(recordId);
        totalRecords++;

        emit RecordWritten(recordId, patient, msg.sender, cid, severity, block.timestamp);
        return recordId;
    }

    /**
     * @notice Provide the second signature for a High-severity record.
     * @dev The second doctor must be different from the first.
     */
    function cosignRecord(bytes32 recordId) external onlyRole(DOCTOR_ROLE) {
        Record storage rec = records[recordId];
        require(rec.timestamp != 0, "RecordRegistry: record not found");
        require(rec.requiresMultiSig, "RecordRegistry: record does not require multi-sig");
        require(!rec.finalized, "RecordRegistry: already finalized");
        require(rec.doctor != msg.sender, "RecordRegistry: cannot self-cosign");

        secondSigner[recordId] = msg.sender;
        rec.finalized = true;

        emit RecordFinalized(recordId, msg.sender);
    }

    /** @notice Get all record IDs for a patient. */
    function getPatientRecords(address patient) external view returns (bytes32[] memory) {
        return patientRecords[patient];
    }

    /** @notice Number of records written for a patient. */
    function patientRecordCount(address patient) external view returns (uint256) {
        return patientRecords[patient].length;
    }
}
