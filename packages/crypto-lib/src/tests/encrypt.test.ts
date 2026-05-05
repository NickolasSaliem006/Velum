import { describe, it, expect } from 'vitest'
import { encryptRecord, decryptRecord } from '../encrypt'

describe('AES-GCM encrypt / decrypt', () => {
  it('round-trips a short plaintext', async () => {
    const plaintext = 'Hello, Velum!'
    const { encrypted, rawKeyBase64 } = await encryptRecord(plaintext)
    const result = await decryptRecord(encrypted, rawKeyBase64)
    expect(result).toBe(plaintext)
  })

  it('round-trips a multi-line medical record', async () => {
    const plaintext = 'Patient: Jane Doe\nDiagnosis: Hypertension\nPrescription: Amlodipine 5mg'
    const { encrypted, rawKeyBase64 } = await encryptRecord(plaintext)
    expect(await decryptRecord(encrypted, rawKeyBase64)).toBe(plaintext)
  })

  it('round-trips unicode content', async () => {
    const plaintext = '诊断: 高血压\n处方: 氨氯地平 5mg'
    const { encrypted, rawKeyBase64 } = await encryptRecord(plaintext)
    expect(await decryptRecord(encrypted, rawKeyBase64)).toBe(plaintext)
  })

  it('produces distinct ciphertexts for the same plaintext (random IV)', async () => {
    const plaintext = 'same content'
    const { encrypted: a } = await encryptRecord(plaintext)
    const { encrypted: b } = await encryptRecord(plaintext)
    expect(a.ciphertext).not.toBe(b.ciphertext)
    expect(a.iv).not.toBe(b.iv)
  })

  it('encrypted output has ciphertext, iv, and wrappedKey fields', async () => {
    const { encrypted } = await encryptRecord('test')
    expect(typeof encrypted.ciphertext).toBe('string')
    expect(typeof encrypted.iv).toBe('string')
    expect(typeof encrypted.wrappedKey).toBe('string')
    expect(encrypted.ciphertext.length).toBeGreaterThan(0)
  })

  it('fails to decrypt with wrong key', async () => {
    const { encrypted } = await encryptRecord('secret')
    const { rawKeyBase64: wrongKey } = (await encryptRecord('other')).valueOf() as { rawKeyBase64: string }
    // Grab the wrong key from a fresh encrypt
    const { rawKeyBase64: badKey } = await encryptRecord('unrelated')
    await expect(decryptRecord(encrypted, badKey)).rejects.toThrow()
  })

  it('wrappedKey matches rawKeyBase64 (simulation — same value)', async () => {
    const { encrypted, rawKeyBase64 } = await encryptRecord('velum')
    expect(encrypted.wrappedKey).toBe(rawKeyBase64)
  })
})
