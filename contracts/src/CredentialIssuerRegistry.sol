// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CredentialIssuerRegistry
 * @notice Multi-sig governed registry of trusted credential issuers.
 * @dev Adding a new issuer requires approval from a quorum of existing admins.
 *      SIMULATION: production uses a threshold multi-sig wallet (e.g. Safe).
 */
contract CredentialIssuerRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Issuer {
        address addr;
        string name;
        string issuerType; // "hospital" | "national_id" | "insurer"
        uint256 addedAt;
        bool active;
    }

    struct AddProposal {
        address candidate;
        string name;
        string issuerType;
        uint256 approvals;
        mapping(address => bool) hasApproved;
        bool executed;
    }

    /// @notice Registered issuers by address.
    mapping(address => Issuer) public issuers;
    address[] public issuerList;

    /// @notice Pending add proposals.
    mapping(bytes32 => AddProposal) public proposals;
    bytes32[] public proposalIds;

    /// @notice Number of admin approvals required to add a new issuer.
    uint256 public quorum;

    event IssuerProposed(bytes32 indexed proposalId, address indexed candidate, string name);
    event IssuerApproved(bytes32 indexed proposalId, address indexed approver);
    event IssuerAdded(address indexed issuer, string name, string issuerType);
    event IssuerDeactivated(address indexed issuer);

    constructor(address[] memory initialAdmins, uint256 _quorum) {
        require(_quorum > 0 && _quorum <= initialAdmins.length, "CredentialIssuerRegistry: invalid quorum");
        quorum = _quorum;
        for (uint256 i = 0; i < initialAdmins.length; i++) {
            _grantRole(DEFAULT_ADMIN_ROLE, initialAdmins[i]);
        }
    }

    /**
     * @notice Propose adding a new credential issuer.
     */
    function proposeIssuer(
        address candidate,
        string calldata name,
        string calldata issuerType
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (bytes32 proposalId) {
        require(candidate != address(0), "CredentialIssuerRegistry: zero address");
        require(!issuers[candidate].active, "CredentialIssuerRegistry: already an issuer");

        proposalId = keccak256(abi.encodePacked(candidate, name, block.timestamp));
        AddProposal storage p = proposals[proposalId];
        p.candidate = candidate;
        p.name = name;
        p.issuerType = issuerType;
        proposalIds.push(proposalId);

        emit IssuerProposed(proposalId, candidate, name);
    }

    /**
     * @notice Approve an issuer proposal. Executes automatically when quorum is reached.
     */
    function approveIssuer(bytes32 proposalId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        AddProposal storage p = proposals[proposalId];
        require(p.candidate != address(0), "CredentialIssuerRegistry: proposal not found");
        require(!p.executed, "CredentialIssuerRegistry: already executed");
        require(!p.hasApproved[msg.sender], "CredentialIssuerRegistry: already approved");

        p.hasApproved[msg.sender] = true;
        p.approvals++;

        emit IssuerApproved(proposalId, msg.sender);

        if (p.approvals >= quorum) {
            _executeAddIssuer(proposalId, p.candidate, p.name, p.issuerType);
            p.executed = true;
        }
    }

    function _executeAddIssuer(
        bytes32,
        address candidate,
        string memory name,
        string memory issuerType
    ) internal {
        issuers[candidate] = Issuer({
            addr: candidate,
            name: name,
            issuerType: issuerType,
            addedAt: block.timestamp,
            active: true
        });
        issuerList.push(candidate);
        _grantRole(ISSUER_ROLE, candidate);

        emit IssuerAdded(candidate, name, issuerType);
    }

    /** @notice Deactivate an issuer (admin only). */
    function deactivateIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(issuers[issuer].active, "CredentialIssuerRegistry: not an active issuer");
        issuers[issuer].active = false;
        _revokeRole(ISSUER_ROLE, issuer);
        emit IssuerDeactivated(issuer);
    }

    /** @notice Get all registered issuer addresses. */
    function getIssuers() external view returns (address[] memory) {
        return issuerList;
    }
}
