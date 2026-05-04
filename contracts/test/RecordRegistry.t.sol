// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/RecordRegistry.sol";

contract RecordRegistryTest is Test {
    RecordRegistry registry;
    address admin = makeAddr("admin");
    address doctor = makeAddr("doctor");
    address doctor2 = makeAddr("doctor2");
    address doctor3 = makeAddr("doctor3");
    address patient = makeAddr("patient");

    // Valid 64-char hex CID
    string constant CID = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";

    // Record tuple: (id, patient, doctor, hospital, cid, severity, timestamp, requiresMultiSig, finalized)

    function _finalized(bytes32 id) internal view returns (bool v) {
        (,,,,,,,, v) = registry.records(id);
    }

    function _requiresMultiSig(bytes32 id) internal view returns (bool v) {
        (,,,,,,,  v,) = registry.records(id);
    }

    function _recPatient(bytes32 id) internal view returns (address v) {
        (, v,,,,,,,) = registry.records(id);
    }

    function _recDoctor(bytes32 id) internal view returns (address v) {
        (,, v,,,,,,) = registry.records(id);
    }

    function _recCid(bytes32 id) internal view returns (string memory v) {
        (,,, , v,,,,) = registry.records(id);
    }

    function setUp() public {
        registry = new RecordRegistry(admin);
        bytes32 doctorRole = registry.DOCTOR_ROLE(); // cache before prank to avoid consuming it
        vm.prank(admin);
        registry.grantRole(doctorRole, doctor);
        vm.prank(admin);
        registry.grantRole(doctorRole, doctor2);
        vm.prank(admin);
        registry.grantRole(doctorRole, doctor3);
    }

    // ── Happy path ────────────────────────────────────────────────────────────

    function test_writeLowSeverityRecord() public {
        vm.prank(doctor);
        bytes32 id = registry.writeRecord(patient, CID, RecordRegistry.Severity.Low);

        assertEq(_recPatient(id), patient);
        assertEq(_recDoctor(id), doctor);
        assertEq(_recCid(id), CID);
        assertTrue(_finalized(id));
        assertFalse(_requiresMultiSig(id));
    }

    function test_writeHighSeverityRequiresMultiSig() public {
        vm.prank(doctor);
        bytes32 id = registry.writeRecord(patient, CID, RecordRegistry.Severity.High);

        assertTrue(_requiresMultiSig(id));
        assertFalse(_finalized(id));
    }

    function test_cosignFinalizeHighSeverity() public {
        vm.prank(doctor);
        bytes32 id = registry.writeRecord(patient, CID, RecordRegistry.Severity.High);

        vm.prank(doctor2);
        registry.cosignRecord(id);

        assertTrue(_finalized(id));
        assertEq(registry.secondSigner(id), doctor2);
    }

    function test_patientRecordsList() public {
        vm.startPrank(doctor);
        registry.writeRecord(patient, CID, RecordRegistry.Severity.Low);
        // different CID to avoid duplicate ID
        string memory cid2 = "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3";
        registry.writeRecord(patient, cid2, RecordRegistry.Severity.Medium);
        vm.stopPrank();

        assertEq(registry.patientRecordCount(patient), 2);
        assertEq(registry.getPatientRecords(patient).length, 2);
    }

    function test_totalRecordsIncrement() public {
        assertEq(registry.totalRecords(), 0);
        vm.prank(doctor);
        registry.writeRecord(patient, CID, RecordRegistry.Severity.Low);
        assertEq(registry.totalRecords(), 1);
    }

    // ── Negative tests ────────────────────────────────────────────────────────

    function test_rejectWriteFromNonDoctor() public {
        vm.expectRevert();
        vm.prank(patient);
        registry.writeRecord(patient, CID, RecordRegistry.Severity.Low);
    }

    function test_rejectZeroPatientAddress() public {
        vm.expectRevert("RecordRegistry: zero patient address");
        vm.prank(doctor);
        registry.writeRecord(address(0), CID, RecordRegistry.Severity.Low);
    }

    function test_rejectInvalidCidLength() public {
        vm.expectRevert("RecordRegistry: CID must be 64 hex chars");
        vm.prank(doctor);
        registry.writeRecord(patient, "tooshort", RecordRegistry.Severity.Low);
    }

    function test_rejectSelfCosign() public {
        vm.prank(doctor);
        bytes32 id = registry.writeRecord(patient, CID, RecordRegistry.Severity.High);

        vm.expectRevert("RecordRegistry: cannot self-cosign");
        vm.prank(doctor);
        registry.cosignRecord(id);
    }

    function test_rejectDoubleCosign() public {
        vm.prank(doctor);
        bytes32 id = registry.writeRecord(patient, CID, RecordRegistry.Severity.High);

        vm.prank(doctor2);
        registry.cosignRecord(id);

        vm.expectRevert("RecordRegistry: already finalized");
        vm.prank(doctor3);
        registry.cosignRecord(id);
    }

    function test_rejectCosignLowSeverity() public {
        vm.prank(doctor);
        bytes32 id = registry.writeRecord(patient, CID, RecordRegistry.Severity.Low);

        vm.expectRevert("RecordRegistry: record does not require multi-sig");
        vm.prank(doctor2);
        registry.cosignRecord(id);
    }

    // ── Events ────────────────────────────────────────────────────────────────

    function test_emitsRecordWrittenEvent() public {
        // Skip recordId (topic1) — computed on-chain; verify patient+doctor topics
        vm.expectEmit(false, true, true, false);
        emit RecordRegistry.RecordWritten(
            bytes32(0), patient, doctor, CID, RecordRegistry.Severity.Low, block.timestamp
        );
        vm.prank(doctor);
        registry.writeRecord(patient, CID, RecordRegistry.Severity.Low);
    }
}
