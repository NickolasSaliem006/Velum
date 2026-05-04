import { ed25519 } from '@noble/curves/ed25519'
import { bytesToHex, hexToBytes } from './keypair'

/** Sign arbitrary bytes (hex-encoded) with an Ed25519 private key. */
export function sign(messageHex: string, privateKeyHex: string): string {
  const sig = ed25519.sign(hexToBytes(messageHex), hexToBytes(privateKeyHex))
  return bytesToHex(sig)
}

/** Verify an Ed25519 signature. Returns true only if signature is valid. */
export function verify(messageHex: string, signatureHex: string, publicKeyHex: string): boolean {
  return ed25519.verify(hexToBytes(signatureHex), hexToBytes(messageHex), hexToBytes(publicKeyHex))
}
