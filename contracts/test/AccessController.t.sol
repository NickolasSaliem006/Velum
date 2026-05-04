// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/AccessController.sol";

contract AccessControllerTest is Test {
    AccessController ctrl;
    address patient = makeAddr("patient");
    address verifier = makeAddr("verifier");
    bytes32 constant RECORD_ID = keccak256("record-1");
    uint256 constant ONE_DAY = 86400;

    function setUp() public {
        ctrl = new AccessController();
    }

    // ── Happy path ────────────────────────────────────────────────────────────

    function test_grantConsentCreatesActiveGrant() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        assertTrue(ctrl.hasAccess(patient, RECORD_ID, verifier));

        (,,,, uint256 grantedAt, uint256 expiresAt, bool revoked) = ctrl.grants(grantId);
        assertEq(expiresAt, grantedAt + ONE_DAY);
        assertFalse(revoked);
    }

    function test_logAccessSucceedsWithValidGrant() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        vm.prank(verifier);
        ctrl.logAccess(grantId); // must not revert
    }

    function test_revokeConsentRemovesAccess() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        vm.prank(patient);
        ctrl.revokeConsent(grantId);

        assertFalse(ctrl.hasAccess(patient, RECORD_ID, verifier));
    }

    function test_accessExpiredExactlyAtWindow() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        // Warp to expiry
        vm.warp(block.timestamp + ONE_DAY);

        // Exactly at expiry — should still be valid (<=)
        assertTrue(ctrl.hasAccess(patient, RECORD_ID, verifier));

        // One second past expiry
        vm.warp(block.timestamp + 1);
        assertFalse(ctrl.hasAccess(patient, RECORD_ID, verifier));
    }

    // ── Negative tests ────────────────────────────────────────────────────────

    function test_rejectLogAccessAfterRevoke() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        vm.prank(patient);
        ctrl.revokeConsent(grantId);

        vm.expectRevert("AccessController: consent revoked");
        vm.prank(verifier);
        ctrl.logAccess(grantId);
    }

    function test_rejectLogAccessAfterExpiry() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);

        vm.expectRevert("AccessController: consent expired");
        vm.prank(verifier);
        ctrl.logAccess(grantId);
    }

    function test_rejectLogAccessByWrongVerifier() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        vm.expectRevert("AccessController: not the grantee");
        vm.prank(makeAddr("impostor"));
        ctrl.logAccess(grantId);
    }

    function test_rejectSelfGrant() public {
        vm.expectRevert("AccessController: cannot grant to self");
        vm.prank(patient);
        ctrl.grantConsent(patient, RECORD_ID, ONE_DAY);
    }

    function test_rejectZeroDuration() public {
        vm.expectRevert("AccessController: invalid duration");
        vm.prank(patient);
        ctrl.grantConsent(verifier, RECORD_ID, 0);
    }

    function test_rejectExcessiveDuration() public {
        vm.expectRevert("AccessController: invalid duration");
        vm.prank(patient);
        ctrl.grantConsent(verifier, RECORD_ID, 31 days);
    }

    function test_rejectRevokeByNonPatient() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        vm.expectRevert("AccessController: not grant owner");
        vm.prank(verifier);
        ctrl.revokeConsent(grantId);
    }

    function test_rejectDoubleRevoke() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        vm.prank(patient);
        ctrl.revokeConsent(grantId);

        vm.expectRevert("AccessController: already revoked");
        vm.prank(patient);
        ctrl.revokeConsent(grantId);
    }

    // ── Race condition ────────────────────────────────────────────────────────

    function test_revokeWhileAccessInFlight() public {
        vm.prank(patient);
        bytes32 grantId = ctrl.grantConsent(verifier, RECORD_ID, ONE_DAY);

        // Revoke happens in the same block as the access attempt
        vm.prank(patient);
        ctrl.revokeConsent(grantId);

        // Access attempt in same block — must be rejected
        vm.expectRevert("AccessController: consent revoked");
        vm.prank(verifier);
        ctrl.logAccess(grantId);
    }
}
