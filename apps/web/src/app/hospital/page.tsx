'use client'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { Building2, FileText, Clock, ShieldCheck, Download, Unlock, Loader2 } from 'lucide-react'
import { SEVERITY_LABELS } from '@/lib/contracts'
import { encryptRecord, decryptRecord } from '@velum/crypto-lib'
import { uploadToIpfs, retrieveFromIpfs, IpfsError } from '@/lib/ipfs'
import type { EncryptedRecord } from '@velum/shared-types'

// ── Demo data ─────────────────────────────────────────────────────────────────

/**
 * Demo plaintexts — encrypted+uploaded to the IPFS sim on mount so the
 * "Fetch & decrypt" button can do a real round-trip. SIMULATION: in production
 * the wrappedKey would be ECIES-encrypted to the hospital's public key and
 * unwrapped after on-chain consent verification.
 */
const DEMO_PLAINTEXTS: Record<string, string> = {
  '0xa3f7c2e1d4b59f0e8c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3':
    'Patient: Nickolas Saliem, DOB: 1999-03-14\nDiagnosis: Mild hypertension (I10)\nPrescription: Amlodipine 5mg, once daily\nNote: Follow up in 3 months. Monitor blood pressure.',
  '0xb4e8d3f2c1a0b9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4':
    'Patient: Nickolas Saliem, DOB: 1999-03-14\nDiagnosis: Acute appendicitis (K35.89)\nProcedure: Laparoscopic appendectomy — successful\nDischarge: 2025-10-12. Full recovery expected in 2 weeks.',
  '0xc5f9e4d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5':
    'Patient: Nickolas Saliem, DOB: 1999-03-14\nDiagnosis: Seasonal allergic rhinitis (J30.1)\nPrescription: Loratadine 10mg PRN\nNote: Avoid dusty environments. Review in 6 months.',
}

interface UploadedRecord {
  cid: string
  wrappedKey: string
  encrypted: EncryptedRecord
}

type FetchState =
  | { phase: 'idle' }
  | { phase: 'fetching' }
  | { phase: 'decrypting' }
  | { phase: 'plaintext'; text: string }
  | { phase: 'error'; message: string }

const DEMO_CONSENTED_RECORDS = [
  {
    id: '0xa3f7c2e1d4b59f0e8c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3' as `0x${string}`,
    patient: '0xCaFe1234567890CaFe1234567890CaFe12345678' as `0x${string}`,
    doctor: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    cid: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    severity: 0 as 0 | 1 | 2,
    finalized: true,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 3),
    grantExpiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400 * 4),
  },
  {
    id: '0xb4e8d3f2c1a0b9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4' as `0x${string}`,
    patient: '0xFaCe5678901234FaCe5678901234FaCe56789012' as `0x${string}`,
    doctor: '0x9876543210987654321098765432109876543210' as `0x${string}`,
    cid: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    severity: 2 as 0 | 1 | 2,
    finalized: true,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 10),
    grantExpiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400 * 1),
  },
  {
    id: '0xc5f9e4d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5' as `0x${string}`,
    patient: '0xDeAdBeEf1234567890DeAdBeEf1234567890DeAd' as `0x${string}`,
    doctor: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    cid: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    severity: 1 as 0 | 1 | 2,
    finalized: true,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400),
    grantExpiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400 * 14),
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function short(hex: string) {
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleDateString()
}

function formatDateTime(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleString()
}

function expiresIn(ts: bigint): string {
  const diff = Number(ts) - Math.floor(Date.now() / 1000)
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / 86400)
  if (days > 0) return `${days}d remaining`
  const hours = Math.floor(diff / 3600)
  return `${hours}h remaining`
}

const SEVERITY_COLORS = [
  'text-green-400 bg-green-400/10',
  'text-yellow-400 bg-yellow-400/10',
  'text-red-400 bg-red-400/10',
]

function Badge({ s }: { s: 0 | 1 | 2 }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[s]}`}>
      {SEVERITY_LABELS[s]}
    </span>
  )
}

function ExpiryBadge({ ts }: { ts: bigint }) {
  const diff = Number(ts) - Math.floor(Date.now() / 1000)
  const label = expiresIn(ts)
  const color =
    diff < 86400
      ? 'text-red-400 bg-red-400/10'
      : diff < 86400 * 3
        ? 'text-yellow-400 bg-yellow-400/10'
        : 'text-green-400 bg-green-400/10'
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HospitalPage() {
  const { isConnected } = useAccount()
  const isDemo = !isConnected
  const [selected, setSelected] = useState<`0x${string}` | null>(null)
  const [uploaded, setUploaded] = useState<Record<string, UploadedRecord>>({})
  const [fetchStates, setFetchStates] = useState<Record<string, FetchState>>({})

  // On mount in demo mode: encrypt each demo plaintext and upload to the IPFS
  // sim so the "Fetch & decrypt" button below can do a real round-trip.
  // Silently skip if the sim is offline — the page still renders without it.
  useEffect(() => {
    if (!isDemo) return
    let cancelled = false
    ;(async () => {
      const results: Record<string, UploadedRecord> = {}
      for (const [recordId, plaintext] of Object.entries(DEMO_PLAINTEXTS)) {
        try {
          const { encrypted, rawKeyBase64 } = await encryptRecord(plaintext)
          const { cid } = await uploadToIpfs(encrypted.ciphertext)
          results[recordId] = { cid, wrappedKey: rawKeyBase64, encrypted }
        } catch {
          // ipfs-sim probably not running — fall through, button will show error
        }
      }
      if (!cancelled) setUploaded(results)
    })()
    return () => {
      cancelled = true
    }
  }, [isDemo])

  async function handleFetchAndDecrypt(recordId: `0x${string}`) {
    const u = uploaded[recordId]
    if (!u) {
      setFetchStates((s) => ({
        ...s,
        [recordId]: {
          phase: 'error',
          message: 'IPFS sim not reachable. Run: pnpm --filter @velum/ipfs-sim dev',
        },
      }))
      return
    }
    setFetchStates((s) => ({ ...s, [recordId]: { phase: 'fetching' } }))
    try {
      const ciphertext = await retrieveFromIpfs(u.cid)
      setFetchStates((s) => ({ ...s, [recordId]: { phase: 'decrypting' } }))
      const text = await decryptRecord({ ...u.encrypted, ciphertext }, u.wrappedKey)
      setFetchStates((s) => ({ ...s, [recordId]: { phase: 'plaintext', text } }))
    } catch (err) {
      const message =
        err instanceof IpfsError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Decryption failed'
      setFetchStates((s) => ({ ...s, [recordId]: { phase: 'error', message } }))
    }
  }

  const records = isDemo
    ? DEMO_CONSENTED_RECORDS.map((r) => ({
        ...r,
        // Display the real SHA-256 CID once uploaded, else the placeholder
        cid: uploaded[r.id]?.cid ?? r.cid,
      }))
    : []

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Nav */}
      <header className="border-b border-bone/10 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Building2 className="text-accent w-5 h-5 shrink-0" />
          <Link href="/" className="font-semibold text-bone hover:text-bone/80 transition-colors">
            Velum
          </Link>
          <span className="text-bone/40 text-sm hidden sm:inline">/ Hospital Dashboard</span>
        </div>
        <ConnectButton />
      </header>

      {isDemo && (
        <div className="bg-accent/10 border-b border-accent/20 px-6 py-2 text-sm text-accent/90 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Demo mode — connect a wallet with HOSPITAL_ROLE to view live consented records
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-bone">Consented Records</h1>
          <p className="text-bone/50 text-sm mt-1">
            Read-only view of patient records where consent has been granted to this hospital. All
            access is enforced on-chain.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Grants', value: records.length, icon: ShieldCheck },
            { label: 'Total Records', value: records.length, icon: FileText },
            {
              label: 'Expiring Soon',
              value: records.filter((r) => Number(r.grantExpiresAt) - Date.now() / 1000 < 86400 * 3)
                .length,
              icon: Clock,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-bone/5 border border-bone/10 rounded-lg p-4 flex items-center gap-3"
            >
              <Icon className="w-5 h-5 text-accent shrink-0" />
              <div>
                <p className="text-2xl font-bold text-bone">{value}</p>
                <p className="text-xs text-bone/50">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Record list */}
        {records.length === 0 ? (
          <div className="text-center py-16 text-bone/30">
            <Building2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No consented records. Patients must grant access to this hospital address.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => (
              <div
                key={rec.id}
                className={`bg-bone/5 border rounded-lg p-4 transition-colors cursor-pointer ${
                  selected === rec.id
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-bone/10 hover:border-bone/20'
                }`}
                onClick={() => setSelected(selected === rec.id ? null : rec.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge s={rec.severity} />
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-green-400 bg-green-400/10">
                        Finalized
                      </span>
                      <ExpiryBadge ts={rec.grantExpiresAt} />
                    </div>
                    <p className="font-mono text-xs text-bone/70">{short(rec.id)}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-bone/50">
                        Patient:{' '}
                        <span className="font-mono text-bone/70">{short(rec.patient)}</span>
                      </p>
                      <p className="text-xs text-bone/50">
                        Doctor: <span className="font-mono text-bone/70">{short(rec.doctor)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-bone/40">
                    <p>{formatDate(rec.timestamp)}</p>
                    <p className="mt-0.5">Grant expires {formatDate(rec.grantExpiresAt)}</p>
                  </div>
                </div>

                {/* Expanded detail */}
                {selected === rec.id && (
                  <div className="mt-4 pt-4 border-t border-bone/10 space-y-2">
                    <div>
                      <p className="text-xs text-bone/40 mb-0.5">Record ID</p>
                      <p className="font-mono text-xs text-bone/80 break-all">{rec.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-bone/40 mb-0.5">Content CID (SHA-256)</p>
                      <p className="font-mono text-xs text-bone/80 break-all">{rec.cid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-bone/40 mb-0.5">Written at</p>
                      <p className="text-xs text-bone/60">{formatDateTime(rec.timestamp)}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <ShieldCheck className="w-3 h-3 text-accent" />
                      <p className="text-xs text-accent/80">
                        Access cryptographically verified on-chain. Decryption requires
                        patient&apos;s key.
                      </p>
                    </div>

                    {/* Fetch & decrypt — exercises the real ipfs-sim round-trip */}
                    {isDemo &&
                      (() => {
                        const fs = fetchStates[rec.id] ?? { phase: 'idle' }
                        const isReady = uploaded[rec.id] !== undefined
                        return (
                          <div
                            className="pt-2 mt-1 border-t border-bone/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleFetchAndDecrypt(rec.id)}
                              disabled={
                                !isReady || fs.phase === 'fetching' || fs.phase === 'decrypting'
                              }
                              className="flex items-center gap-1.5 text-xs bg-accent/15 hover:bg-accent/25 disabled:opacity-40 text-accent rounded px-3 py-1.5 transition-colors"
                            >
                              {fs.phase === 'fetching' ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" /> Fetching from IPFS
                                  sim…
                                </>
                              ) : fs.phase === 'decrypting' ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" /> Decrypting AES-GCM…
                                </>
                              ) : fs.phase === 'plaintext' ? (
                                <>
                                  <Unlock className="w-3 h-3" /> Decrypted ✓
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" /> Fetch & decrypt
                                </>
                              )}
                            </button>
                            {!isReady && (
                              <p className="text-xs text-bone/30 mt-2">
                                Waiting for IPFS sim upload… start it with{' '}
                                <span className="font-mono">pnpm --filter @velum/ipfs-sim dev</span>
                              </p>
                            )}
                            {fs.phase === 'plaintext' && (
                              <div className="mt-2 bg-green-400/5 border border-green-400/20 rounded p-3">
                                <p className="text-xs text-bone/30 mb-1">
                                  Decrypted record content
                                </p>
                                <pre className="text-xs text-green-400/90 whitespace-pre-wrap font-mono leading-relaxed">
                                  {fs.text}
                                </pre>
                              </div>
                            )}
                            {fs.phase === 'error' && (
                              <p className="text-xs text-red-400 mt-2">{fs.message}</p>
                            )}
                          </div>
                        )
                      })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
