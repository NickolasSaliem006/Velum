import { ed25519 } from '@noble/curves/ed25519'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex, hexToBytes, randomBytes } from '@noble/curves/abstract/utils'

export interface KeyPair {
  privateKey: string // hex-encoded 32 bytes
  publicKey: string // hex-encoded 32 bytes
}

/** Derive a deterministic keypair from a passphrase + salt using SHA-256. */
export function deriveKeypairFromPassphrase(passphrase: string, salt: string): KeyPair {
  const encoder = new TextEncoder()
  const seed = sha256(new Uint8Array([...encoder.encode(passphrase), ...encoder.encode(salt)]))
  const privateKey = seed.slice(0, 32)
  const publicKey = ed25519.getPublicKey(privateKey)
  return { privateKey: bytesToHex(privateKey), publicKey: bytesToHex(publicKey) }
}

/** Generate a fresh random keypair. */
export function generateKeypair(): KeyPair {
  const privateKey = randomBytes(32)
  const publicKey = ed25519.getPublicKey(privateKey)
  return { privateKey: bytesToHex(privateKey), publicKey: bytesToHex(publicKey) }
}

export { bytesToHex, hexToBytes }
