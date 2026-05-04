// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CredentialIssuerRegistry.sol";

contract CredentialIssuerRegistryTest is Test {
    CredentialIssuerRegistry reg;

    address admin1 = makeAddr("admin1");
    address admin2 = makeAddr("admin2");
    address admin3 = makeAddr("admin3");
    address candidate = makeAddr("candidate");

    // Issuer struct: (address addr, string name, string issuerType, uint256 addedAt, bool active)

    function _issuerActive(address a) internal view returns (bool active) {
        (,,,, active) = reg.issuers(a);
    }

    function _issuerName(address a) internal view returns (string memory name) {
        (, name,,,) = reg.issuers(a);
    }

    function _issuerType(address a) internal view returns (string memory issuerType) {
        (,, issuerType,,) = reg.issuers(a);
    }

    function setUp() public {
        address[] memory admins = new address[](3);
        admins[0] = admin1;
        admins[1] = admin2;
        admins[2] = admin3;
        reg = new CredentialIssuerRegistry(admins, 2); // quorum = 2
    }

    // ── Happy path ────────────────────────────────────────────────────────────

    function test_proposeIssuer() public {
        vm.prank(admin1);
        bytes32 pid = reg.proposeIssuer(candidate, "General Hospital", "hospital");
        assertTrue(pid != bytes32(0));
    }

    function test_quorumReachedAddsIssuer() public {
        vm.prank(admin1);
        bytes32 pid = reg.proposeIssuer(candidate, "General Hospital", "hospital");

        vm.prank(admin1);
        reg.approveIssuer(pid);
        assertFalse(_issuerActive(candidate)); // only 1 approval so far

        vm.prank(admin2);
        reg.approveIssuer(pid); // hits quorum = 2

        assertTrue(_issuerActive(candidate));
        assertEq(_issuerName(candidate), "General Hospital");
        assertEq(_issuerType(candidate), "hospital");
        assertTrue(reg.hasRole(reg.ISSUER_ROLE(), candidate));
    }

    function test_issuerListUpdated() public {
        vm.prank(admin1);
        bytes32 pid = reg.proposeIssuer(candidate, "Clinic A", "hospital");

        vm.prank(admin1);
        reg.approveIssuer(pid);
        vm.prank(admin2);
        reg.approveIssuer(pid);

        address[] memory list = reg.getIssuers();
        assertEq(list.length, 1);
        assertEq(list[0], candidate);
    }

    function test_deactivateIssuer() public {
        vm.prank(admin1);
        bytes32 pid = reg.proposeIssuer(candidate, "Clinic B", "insurer");
        vm.prank(admin1);
        reg.approveIssuer(pid);
        vm.prank(admin2);
        reg.approveIssuer(pid);

        assertTrue(_issuerActive(candidate));

        vm.prank(admin1);
        reg.deactivateIssuer(candidate);

        assertFalse(_issuerActive(candidate));
        assertFalse(reg.hasRole(reg.ISSUER_ROLE(), candidate));
    }

    // ── Negative tests ────────────────────────────────────────────────────────

    function test_rejectProposeFromNonAdmin() public {
        vm.expectRevert();
        vm.prank(makeAddr("stranger"));
        reg.proposeIssuer(candidate, "Rogue Hospital", "hospital");
    }

    function test_rejectZeroAddressProposal() public {
        vm.expectRevert("CredentialIssuerRegistry: zero address");
        vm.prank(admin1);
        reg.proposeIssuer(address(0), "Nobody", "hospital");
    }

    function test_rejectDuplicateProposalForActiveIssuer() public {
        vm.prank(admin1);
        bytes32 pid = reg.proposeIssuer(candidate, "Hospital X", "hospital");
        vm.prank(admin1);
        reg.approveIssuer(pid);
        vm.prank(admin2);
        reg.approveIssuer(pid);

        vm.expectRevert("CredentialIssuerRegistry: already an issuer");
        vm.prank(admin1);
        reg.proposeIssuer(candidate, "Hospital X", "hospital");
    }

    function test_rejectDoubleApprovalBySameAdmin() public {
        vm.prank(admin1);
        bytes32 pid = reg.proposeIssuer(candidate, "Lab A", "national_id");

        vm.prank(admin1);
        reg.approveIssuer(pid);

        vm.expectRevert("CredentialIssuerRegistry: already approved");
        vm.prank(admin1);
        reg.approveIssuer(pid);
    }

    function test_rejectApproveOnExecutedProposal() public {
        vm.prank(admin1);
        bytes32 pid = reg.proposeIssuer(candidate, "Lab B", "hospital");

        vm.prank(admin1);
        reg.approveIssuer(pid);
        vm.prank(admin2);
        reg.approveIssuer(pid); // executes

        vm.expectRevert("CredentialIssuerRegistry: already executed");
        vm.prank(admin3);
        reg.approveIssuer(pid);
    }

    function test_rejectDeactivateNonActiveIssuer() public {
        vm.expectRevert("CredentialIssuerRegistry: not an active issuer");
        vm.prank(admin1);
        reg.deactivateIssuer(candidate);
    }

    function test_rejectInvalidQuorum() public {
        address[] memory admins = new address[](2);
        admins[0] = admin1;
        admins[1] = admin2;

        vm.expectRevert("CredentialIssuerRegistry: invalid quorum");
        new CredentialIssuerRegistry(admins, 0);

        vm.expectRevert("CredentialIssuerRegistry: invalid quorum");
        new CredentialIssuerRegistry(admins, 3); // exceeds admin count
    }

    // ── Events ────────────────────────────────────────────────────────────────

    function test_emitsIssuerProposedEvent() public {
        // Skip proposalId (topic1) — it's computed on-chain; verify candidate (topic2) only
        vm.expectEmit(false, true, false, false);
        emit CredentialIssuerRegistry.IssuerProposed(bytes32(0), candidate, "Hospital Z");
        vm.prank(admin1);
        reg.proposeIssuer(candidate, "Hospital Z", "hospital");
    }

    function test_emitsIssuerAddedEvent() public {
        vm.prank(admin1);
        bytes32 pid = reg.proposeIssuer(candidate, "Hospital W", "hospital");
        vm.prank(admin1);
        reg.approveIssuer(pid);

        vm.expectEmit(true, false, false, true);
        emit CredentialIssuerRegistry.IssuerAdded(candidate, "Hospital W", "hospital");
        vm.prank(admin2);
        reg.approveIssuer(pid);
    }

    function test_emitsIssuerDeactivatedEvent() public {
        vm.prank(admin1);
        bytes32 pid = reg.proposeIssuer(candidate, "Clinic C", "insurer");
        vm.prank(admin1);
        reg.approveIssuer(pid);
        vm.prank(admin2);
        reg.approveIssuer(pid);

        vm.expectEmit(true, false, false, false);
        emit CredentialIssuerRegistry.IssuerDeactivated(candidate);
        vm.prank(admin1);
        reg.deactivateIssuer(candidate);
    }
}
