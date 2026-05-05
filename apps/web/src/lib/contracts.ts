export const CONTRACT_ADDRESSES = {
  RecordRegistry: (process.env.NEXT_PUBLIC_RECORD_REGISTRY_ADDRESS ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  AccessController: (process.env.NEXT_PUBLIC_ACCESS_CONTROLLER_ADDRESS ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
  CredentialIssuerRegistry: (process.env.NEXT_PUBLIC_CREDENTIAL_ISSUER_REGISTRY_ADDRESS ??
    '0x0000000000000000000000000000000000000000') as `0x${string}`,
}

export const RECORD_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'writeRecord',
    inputs: [
      { name: 'patient', type: 'address' },
      { name: 'cid', type: 'string' },
      { name: 'severity', type: 'uint8' },
    ],
    outputs: [{ name: 'recordId', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cosignRecord',
    inputs: [{ name: 'recordId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPatientRecords',
    inputs: [{ name: 'patient', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'records',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [
      { name: 'id', type: 'bytes32' },
      { name: 'patient', type: 'address' },
      { name: 'doctor', type: 'address' },
      { name: 'hospital', type: 'address' },
      { name: 'cid', type: 'string' },
      { name: 'severity', type: 'uint8' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'requiresMultiSig', type: 'bool' },
      { name: 'finalized', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalRecords',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'RecordWritten',
    inputs: [
      { name: 'recordId', type: 'bytes32', indexed: true },
      { name: 'patient', type: 'address', indexed: true },
      { name: 'doctor', type: 'address', indexed: true },
      { name: 'cid', type: 'string', indexed: false },
      { name: 'severity', type: 'uint8', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'DOCTOR_ROLE',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grantRole',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

export const ACCESS_CONTROLLER_ABI = [
  {
    type: 'function',
    name: 'grantConsent',
    inputs: [
      { name: 'verifier', type: 'address' },
      { name: 'recordId', type: 'bytes32' },
      { name: 'duration', type: 'uint256' },
    ],
    outputs: [{ name: 'grantId', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeConsent',
    inputs: [{ name: 'grantId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasAccess',
    inputs: [
      { name: 'patient', type: 'address' },
      { name: 'recordId', type: 'bytes32' },
      { name: 'verifier', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPatientGrants',
    inputs: [{ name: 'patient', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grants',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [
      { name: 'id', type: 'bytes32' },
      { name: 'patient', type: 'address' },
      { name: 'verifier', type: 'address' },
      { name: 'recordId', type: 'bytes32' },
      { name: 'grantedAt', type: 'uint256' },
      { name: 'expiresAt', type: 'uint256' },
      { name: 'revoked', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'ConsentGranted',
    inputs: [
      { name: 'grantId', type: 'bytes32', indexed: true },
      { name: 'patient', type: 'address', indexed: true },
      { name: 'verifier', type: 'address', indexed: true },
      { name: 'recordId', type: 'bytes32', indexed: false },
      { name: 'expiresAt', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ConsentRevoked',
    inputs: [
      { name: 'grantId', type: 'bytes32', indexed: true },
      { name: 'patient', type: 'address', indexed: true },
      { name: 'verifier', type: 'address', indexed: true },
    ],
  },
] as const

export const SEVERITY_LABELS = ['Low', 'Medium', 'High'] as const
export type Severity = 0 | 1 | 2

export const ONE_DAY = 86400n
export const ONE_WEEK = 604800n
export const THIRTY_DAYS = 2592000n
