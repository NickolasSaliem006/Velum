export type RecordSeverity = 'low' | 'medium' | 'high'
export type EventType =
  | 'RECORD_WRITTEN'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'RECORD_ACCESSED'

export interface MedicalRecord {
  id: string
  patientAddress: string
  doctorAddress: string
  hospitalAddress: string
  cid: string // SHA-256 of encrypted blob — content-addressed
  severity: RecordSeverity
  timestamp: number
  txHash: string
}

export interface ConsentGrant {
  id: string
  patientAddress: string
  verifierAddress: string
  recordId: string
  expiresAt: number
  grantedAt: number
  txHash: string
  revoked: boolean
}

export interface AuditEvent {
  id: string
  eventType: EventType
  actor: string
  subject: string
  recordId?: string
  txHash: string
  blockNumber: number
  timestamp: number
}

export interface ZKAccessClaim {
  /** SIMULATION: production replaces this JWT with a Groth16 zk-SNARK proof */
  type: 'simulated-jwt-claim'
  verifierAddress: string
  recordId: string
  consentGrantId: string
  issuedAt: number
  expiresAt: number
  signature: string
}

export interface EncryptedRecord {
  /** AES-GCM encrypted content, base64-encoded */
  ciphertext: string
  /** Base64-encoded IV */
  iv: string
  /**
   * Wrapped symmetric key, base64-encoded.
   * SIMULATION: production encrypts this to the patient's public key
   * using asymmetric key encapsulation (e.g. ECIES or threshold re-encryption).
   */
  wrappedKey: string
}
