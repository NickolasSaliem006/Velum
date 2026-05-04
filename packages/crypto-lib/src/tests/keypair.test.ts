import { describe, it, expect } from 'vitest'
import { generateKeypair, deriveKeypairFromPassphrase } from '../keypair'
import { sign, verify } from '../sign'

describe('keypair generation', () => {
  it('generates a 32-byte keypair', () => {
    const kp = generateKeypair()
    expect(kp.privateKey).toHaveLength(64) // 32 bytes hex
    expect(kp.publicKey).toHaveLength(64)
  })

  it('derives a deterministic keypair from the same passphrase + salt', () => {
    const a = deriveKeypairFromPassphrase('hunter2', 'salt1')
    const b = deriveKeypairFromPassphrase('hunter2', 'salt1')
    expect(a.privateKey).toBe(b.privateKey)
    expect(a.publicKey).toBe(b.publicKey)
  })

  it('produces different keys for different salts', () => {
    const a = deriveKeypairFromPassphrase('hunter2', 'saltA')
    const b = deriveKeypairFromPassphrase('hunter2', 'saltB')
    expect(a.privateKey).not.toBe(b.privateKey)
  })

  it('produces different keys for different passphrases', () => {
    const a = deriveKeypairFromPassphrase('passA', 'salt1')
    const b = deriveKeypairFromPassphrase('passB', 'salt1')
    expect(a.privateKey).not.toBe(b.privateKey)
  })
})

describe('ed25519 sign / verify', () => {
  it('verifies a valid signature', () => {
    const kp = generateKeypair()
    const msg = '48656c6c6f' // "Hello" in hex
    const sig = sign(msg, kp.privateKey)
    expect(verify(msg, sig, kp.publicKey)).toBe(true)
  })

  it('rejects a tampered message', () => {
    const kp = generateKeypair()
    const sig = sign('48656c6c6f', kp.privateKey)
    expect(verify('48656c6c61', sig, kp.publicKey)).toBe(false)
  })

  it('rejects a wrong public key', () => {
    const kp1 = generateKeypair()
    const kp2 = generateKeypair()
    const sig = sign('48656c6c6f', kp1.privateKey)
    expect(verify('48656c6c6f', sig, kp2.publicKey)).toBe(false)
  })

  it('rejects a tampered signature', () => {
    const kp = generateKeypair()
    const sig = sign('48656c6c6f', kp.privateKey)
    const tampered = sig.slice(0, -2) + 'ff'
    expect(verify('48656c6c6f', tampered, kp.publicKey)).toBe(false)
  })
})
