import { describe, it, expect } from 'vitest'
import { generateKeypair } from '../keypair'
import { issueAccessClaim, verifyAccessClaim } from '../zk-sim'

const RECORD_ID = '0xa3f7c2e1d4b59f0e8c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3'
const GRANT_ID = '0xd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2'
const VERIFIER = '0xAbCd1234567890AbCd1234567890AbCd12345678'

describe('ZK access claim (simulated)', () => {
  it('issues a claim with correct shape', () => {
    const kp = generateKeypair()
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const claim = issueAccessClaim(VERIFIER, RECORD_ID, GRANT_ID, expiresAt, kp.privateKey)

    expect(claim.type).toBe('simulated-jwt-claim')
    expect(claim.verifierAddress).toBe(VERIFIER)
    expect(claim.recordId).toBe(RECORD_ID)
    expect(claim.consentGrantId).toBe(GRANT_ID)
    expect(claim.expiresAt).toBe(expiresAt)
    expect(typeof claim.signature).toBe('string')
    expect(claim.signature.length).toBeGreaterThan(0)
  })

  it('verifies a valid claim with the matching public key', () => {
    const kp = generateKeypair()
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const claim = issueAccessClaim(VERIFIER, RECORD_ID, GRANT_ID, expiresAt, kp.privateKey)
    expect(verifyAccessClaim(claim, kp.publicKey)).toBe(true)
  })

  it('rejects a claim with the wrong public key', () => {
    const kp1 = generateKeypair()
    const kp2 = generateKeypair()
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const claim = issueAccessClaim(VERIFIER, RECORD_ID, GRANT_ID, expiresAt, kp1.privateKey)
    expect(verifyAccessClaim(claim, kp2.publicKey)).toBe(false)
  })

  it('rejects an expired claim', () => {
    const kp = generateKeypair()
    const expiresAt = Math.floor(Date.now() / 1000) - 1 // 1 second in the past
    const claim = issueAccessClaim(VERIFIER, RECORD_ID, GRANT_ID, expiresAt, kp.privateKey)
    expect(verifyAccessClaim(claim, kp.publicKey)).toBe(false)
  })

  it('rejects a tampered verifier address', () => {
    const kp = generateKeypair()
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const claim = issueAccessClaim(VERIFIER, RECORD_ID, GRANT_ID, expiresAt, kp.privateKey)
    const tampered = { ...claim, verifierAddress: '0x0000000000000000000000000000000000000000' }
    expect(verifyAccessClaim(tampered, kp.publicKey)).toBe(false)
  })

  it('rejects a tampered record ID', () => {
    const kp = generateKeypair()
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const claim = issueAccessClaim(VERIFIER, RECORD_ID, GRANT_ID, expiresAt, kp.privateKey)
    const tampered = { ...claim, recordId: '0xdeadbeef' }
    expect(verifyAccessClaim(tampered, kp.publicKey)).toBe(false)
  })

  it('issuedAt is set to approximately now', () => {
    const kp = generateKeypair()
    const before = Math.floor(Date.now() / 1000)
    const claim = issueAccessClaim(VERIFIER, RECORD_ID, GRANT_ID, before + 3600, kp.privateKey)
    const after = Math.floor(Date.now() / 1000)
    expect(claim.issuedAt).toBeGreaterThanOrEqual(before)
    expect(claim.issuedAt).toBeLessThanOrEqual(after)
  })
})
