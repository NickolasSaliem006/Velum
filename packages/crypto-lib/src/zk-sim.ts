/**
 * SIMULATION: ZK access proof — signed JWT-style claim.
 *
 * Production replaces this with a Circom-compiled Groth16 verifier.
 * The claim attests: "verifier X is authorized to access record Y under
 * consent Z, and consent Z has not expired."
 *
 * Migration path: swap verifyAccessClaim() with a call to the on-chain
 * Groth16 verifier. All upstream code remains unchanged.
 */

import { sha256 } from '@noble/hashes/sha256'
import { sign, verify } from './sign'
import { bytesToHex } from './keypair'
import type { ZKAccessClaim } from '@velum/shared-types'

type ClaimCore = Omit<ZKAccessClaim, 'signature'>

function claimDigest(claim: ClaimCore): string {
  const payload = JSON.stringify({
    verifierAddress: claim.verifierAddress,
    recordId: claim.recordId,
    consentGrantId: claim.consentGrantId,
    issuedAt: claim.issuedAt,
    expiresAt: claim.expiresAt,
  })
  return bytesToHex(sha256(new TextEncoder().encode(payload)))
}

/** Issue a simulated ZK access claim signed by the patient's private key. */
export function issueAccessClaim(
  verifierAddress: string,
  recordId: string,
  consentGrantId: string,
  expiresAt: number,
  patientPrivateKeyHex: string
): ZKAccessClaim {
  const issuedAt = Math.floor(Date.now() / 1000)
  const core: ClaimCore = {
    type: 'simulated-jwt-claim',
    verifierAddress,
    recordId,
    consentGrantId,
    issuedAt,
    expiresAt,
  }
  return { ...core, signature: sign(claimDigest(core), patientPrivateKeyHex) }
}

/** Verify a simulated ZK access claim. Returns false if expired or signature invalid. */
export function verifyAccessClaim(claim: ZKAccessClaim, patientPublicKeyHex: string): boolean {
  if (Math.floor(Date.now() / 1000) > claim.expiresAt) return false
  const { signature, ...core } = claim
  return verify(claimDigest(core as ClaimCore), signature, patientPublicKeyHex)
}
