// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AccessController
 * @notice Patient-controlled consent management with time-window enforcement.
 * @dev Every grant, revocation, and access event is permanently logged on-chain.
 */
contract AccessController is Ownable, ReentrancyGuard {
    struct ConsentGrant {
        bytes32 id;
        address patient;
        address verifier;
        bytes32 recordId;
        uint256 grantedAt;
        uint256 expiresAt;
        bool revoked;
    }

    /// @notice All grants by grant ID.
    mapping(bytes32 => ConsentGrant) public grants;

    /// @notice Active grant IDs per patient.
    mapping(address => bytes32[]) public patientGrants;

    /// @notice Per-patient per-record per-verifier latest grant (for quick lookup).
    mapping(address => mapping(bytes32 => mapping(address => bytes32))) public activeGrant;

    event ConsentGranted(
        bytes32 indexed grantId,
        address indexed patient,
        address indexed verifier,
        bytes32 recordId,
        uint256 expiresAt
    );

    event ConsentRevoked(bytes32 indexed grantId, address indexed patient, address indexed verifier);

    event RecordAccessed(
        bytes32 indexed grantId,
        bytes32 indexed recordId,
        address indexed verifier,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Grant a verifier time-limited access to a specific record.
     * @param verifier   The address being granted access.
     * @param recordId   The record ID to grant access for.
     * @param duration   Access window in seconds (max 30 days).
     * @return grantId   Unique ID for this consent grant.
     */
    function grantConsent(
        address verifier,
        bytes32 recordId,
        uint256 duration
    ) external nonReentrant returns (bytes32 grantId) {
        require(verifier != address(0), "AccessController: zero verifier");
        require(verifier != msg.sender, "AccessController: cannot grant to self");
        require(duration > 0 && duration <= 30 days, "AccessController: invalid duration");

        uint256 expiresAt = block.timestamp + duration;
        grantId = keccak256(
            abi.encodePacked(msg.sender, verifier, recordId, block.timestamp)
        );

        grants[grantId] = ConsentGrant({
            id: grantId,
            patient: msg.sender,
            verifier: verifier,
            recordId: recordId,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false
        });

        patientGrants[msg.sender].push(grantId);
        activeGrant[msg.sender][recordId][verifier] = grantId;

        emit ConsentGranted(grantId, msg.sender, verifier, recordId, expiresAt);
    }

    /**
     * @notice Revoke a previously granted consent. Only the patient can revoke.
     */
    function revokeConsent(bytes32 grantId) external nonReentrant {
        ConsentGrant storage grant = grants[grantId];
        require(grant.patient == msg.sender, "AccessController: not grant owner");
        require(!grant.revoked, "AccessController: already revoked");

        grant.revoked = true;
        emit ConsentRevoked(grantId, msg.sender, grant.verifier);
    }

    /**
     * @notice Log an access event. Called by the verifier when reading a record.
     *         Reverts if the grant is invalid, expired, or revoked.
     */
    function logAccess(bytes32 grantId) external nonReentrant {
        ConsentGrant storage grant = grants[grantId];
        require(grant.verifier == msg.sender, "AccessController: not the grantee");
        require(!grant.revoked, "AccessController: consent revoked");
        require(block.timestamp <= grant.expiresAt, "AccessController: consent expired");

        emit RecordAccessed(grantId, grant.recordId, msg.sender, block.timestamp);
    }

    /**
     * @notice Check whether a verifier currently has valid access to a record.
     */
    function hasAccess(
        address patient,
        bytes32 recordId,
        address verifier
    ) external view returns (bool) {
        bytes32 grantId = activeGrant[patient][recordId][verifier];
        if (grantId == bytes32(0)) return false;
        ConsentGrant storage grant = grants[grantId];
        return !grant.revoked && block.timestamp <= grant.expiresAt;
    }

    /** @notice Get all grant IDs for a patient. */
    function getPatientGrants(address patient) external view returns (bytes32[] memory) {
        return patientGrants[patient];
    }
}
