import type { EncryptedRecord } from '@velum/shared-types'

/** Encrypt a plaintext string using AES-GCM (Web Crypto API). */
export async function encryptRecord(plaintext: string): Promise<{
  encrypted: EncryptedRecord
  rawKeyBase64: string
}> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const exportedKey = await crypto.subtle.exportKey('raw', key)
  const rawKeyBase64 = Buffer.from(exportedKey).toString('base64')

  return {
    encrypted: {
      ciphertext: Buffer.from(cipherBuf).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      // SIMULATION: production encrypts wrappedKey to patient's public key
      wrappedKey: rawKeyBase64,
    },
    rawKeyBase64,
  }
}

/** Decrypt an EncryptedRecord. rawKeyBase64 is the exported AES key. */
export async function decryptRecord(
  encrypted: EncryptedRecord,
  rawKeyBase64: string
): Promise<string> {
  const keyBytes = Buffer.from(rawKeyBase64, 'base64')
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
    'decrypt',
  ])
  const iv = Buffer.from(encrypted.iv, 'base64')
  const ciphertext = Buffer.from(encrypted.ciphertext, 'base64')
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(plainBuf)
}
