'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState } from 'react'
import { ShieldCheck, Plus, Trash2, FileText, Clock } from 'lucide-react'
import {
  CONTRACT_ADDRESSES,
  RECORD_REGISTRY_ABI,
  ACCESS_CONTROLLER_ABI,
  SEVERITY_LABELS,
  ONE_DAY,
  ONE_WEEK,
  THIRTY_DAYS,
} from '@/lib/contracts'

// ── Demo data shown when no wallet is connected ───────────────────────────────

const DEMO_RECORDS = [
  {
    id: '0xa3f7c2e1d4b59f0e8c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3' as `0x${string}`,
    cid: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    severity: 0 as 0 | 1 | 2,
    finalized: true,
    doctor: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 3),
  },
  {
    id: '0xb4e8d3f2c1a0b9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4' as `0x${string}`,
    cid: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    severity: 2 as 0 | 1 | 2,
    finalized: true,
    doctor: '0x9876543210987654321098765432109876543210' as `0x${string}`,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 10),
  },
  {
    id: '0xc5f9e4d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5' as `0x${string}`,
    cid: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    severity: 1 as 0 | 1 | 2,
    finalized: true,
    doctor: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 1),
  },
]

const DEMO_GRANTS = [
  {
    grantId: '0xd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2' as `0x${string}`,
    verifier: '0xAbCd1234567890AbCd1234567890AbCd12345678' as `0x${string}`,
    recordId: DEMO_RECORDS[0].id,
    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400),
    revoked: false,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function short(hex: string) {
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`
}

function formatTime(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleDateString()
}

function severityBadge(s: 0 | 1 | 2) {
  const colors = ['text-green-400 bg-green-400/10', 'text-yellow-400 bg-yellow-400/10', 'text-red-400 bg-red-400/10']
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[s]}`}>
      {SEVERITY_LABELS[s]}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PatientPage() {
  const { address, isConnected } = useAccount()
  const [tab, setTab] = useState<'records' | 'grants'>('records')
  const [grantForm, setGrantForm] = useState({
    verifier: '',
    recordId: '',
    duration: '86400',
  })
  const [grantError, setGrantError] = useState('')

  const isDemo = !isConnected

  // ── Contract reads ──────────────────────────────────────────────────────────

  const { data: recordIds } = useReadContract({
    address: CONTRACT_ADDRESSES.RecordRegistry,
    abi: RECORD_REGISTRY_ABI,
    functionName: 'getPatientRecords',
    args: [address!],
    query: { enabled: isConnected && !!address },
  })

  const { data: grantIds } = useReadContract({
    address: CONTRACT_ADDRESSES.AccessController,
    abi: ACCESS_CONTROLLER_ABI,
    functionName: 'getPatientGrants',
    args: [address!],
    query: { enabled: isConnected && !!address },
  })

  // ── Contract writes ─────────────────────────────────────────────────────────

  const { writeContract: doGrantConsent, data: grantTxHash, isPending: grantPending } = useWriteContract()
  const { writeContract: doRevoke, data: revokeTxHash, isPending: revokePending } = useWriteContract()
  const { isLoading: grantConfirming } = useWaitForTransactionReceipt({ hash: grantTxHash })
  const { isLoading: revokeConfirming } = useWaitForTransactionReceipt({ hash: revokeTxHash })

  function handleGrantConsent(e: React.FormEvent) {
    e.preventDefault()
    setGrantError('')
    if (!/^0x[0-9a-fA-F]{40}$/.test(grantForm.verifier)) {
      setGrantError('Invalid verifier address')
      return
    }
    if (!/^0x[0-9a-fA-F]{64}$/.test(grantForm.recordId)) {
      setGrantError('Invalid record ID (must be 0x + 64 hex chars)')
      return
    }
    doGrantConsent({
      address: CONTRACT_ADDRESSES.AccessController,
      abi: ACCESS_CONTROLLER_ABI,
      functionName: 'grantConsent',
      args: [grantForm.verifier as `0x${string}`, grantForm.recordId as `0x${string}`, BigInt(grantForm.duration)],
    })
  }

  function handleRevoke(grantId: `0x${string}`) {
    doRevoke({
      address: CONTRACT_ADDRESSES.AccessController,
      abi: ACCESS_CONTROLLER_ABI,
      functionName: 'revokeConsent',
      args: [grantId],
    })
  }

  // ── Display data (demo or real) ─────────────────────────────────────────────

  const displayRecords = isDemo ? DEMO_RECORDS : []
  const displayGrants = isDemo ? DEMO_GRANTS : []

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Nav */}
      <header className="border-b border-bone/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-accent w-5 h-5" />
          <span className="font-semibold text-bone">Velum</span>
          <span className="text-bone/40 text-sm">/ Patient Portal</span>
        </div>
        <ConnectButton />
      </header>

      {/* Demo banner */}
      {isDemo && (
        <div className="bg-accent/10 border-b border-accent/20 px-6 py-2 text-sm text-accent/90 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Demo mode — connect wallet to interact with live contracts
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-bone">My Health Records</h1>
          {isConnected && (
            <p className="text-bone/50 text-sm mt-1">{address}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-bone/10">
          {(['records', 'grants'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'text-accent border-b-2 border-accent -mb-px'
                  : 'text-bone/50 hover:text-bone'
              }`}
            >
              {t === 'records' ? 'Medical Records' : 'Access Grants'}
            </button>
          ))}
        </div>

        {/* Records tab */}
        {tab === 'records' && (
          <div className="space-y-3">
            {displayRecords.length === 0 && (
              <div className="text-center py-16 text-bone/30">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p>No records found.</p>
              </div>
            )}
            {displayRecords.map((rec) => (
              <div
                key={rec.id}
                className="bg-bone/5 border border-bone/10 rounded-lg p-4 flex items-start justify-between hover:border-bone/20 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {severityBadge(rec.severity)}
                    {rec.finalized && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-green-400 bg-green-400/10">
                        Finalized
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-bone/70">{short(rec.id)}</p>
                  <p className="text-xs text-bone/40">
                    CID: <span className="font-mono">{rec.cid.slice(0, 20)}…</span>
                  </p>
                  <p className="text-xs text-bone/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(rec.timestamp)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-bone/30">Doctor</p>
                  <p className="font-mono text-xs text-bone/60">{short(rec.doctor)}</p>
                  <button
                    onClick={() => {
                      setGrantForm((f) => ({ ...f, recordId: rec.id }))
                      setTab('grants')
                    }}
                    className="mt-2 text-xs text-accent hover:underline"
                  >
                    Grant access →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grants tab */}
        {tab === 'grants' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grant form */}
            <div className="bg-bone/5 border border-bone/10 rounded-lg p-5">
              <h2 className="font-semibold text-bone mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" />
                Grant New Access
              </h2>
              <form onSubmit={handleGrantConsent} className="space-y-3">
                <div>
                  <label className="text-xs text-bone/50 block mb-1">Verifier address</label>
                  <input
                    type="text"
                    placeholder="0x…"
                    value={grantForm.verifier}
                    onChange={(e) => setGrantForm((f) => ({ ...f, verifier: e.target.value }))}
                    className="w-full bg-bone/10 border border-bone/20 rounded px-3 py-2 text-sm text-bone placeholder-bone/30 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-bone/50 block mb-1">Record ID (0x…)</label>
                  <input
                    type="text"
                    placeholder="0x…"
                    value={grantForm.recordId}
                    onChange={(e) => setGrantForm((f) => ({ ...f, recordId: e.target.value }))}
                    className="w-full bg-bone/10 border border-bone/20 rounded px-3 py-2 text-sm text-bone placeholder-bone/30 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-bone/50 block mb-1">Duration</label>
                  <select
                    value={grantForm.duration}
                    onChange={(e) => setGrantForm((f) => ({ ...f, duration: e.target.value }))}
                    className="w-full bg-bone/10 border border-bone/20 rounded px-3 py-2 text-sm text-bone focus:outline-none focus:border-accent"
                  >
                    <option value={String(ONE_DAY)}>1 day</option>
                    <option value={String(ONE_WEEK)}>7 days</option>
                    <option value={String(THIRTY_DAYS)}>30 days</option>
                  </select>
                </div>
                {grantError && <p className="text-red-400 text-xs">{grantError}</p>}
                <button
                  type="submit"
                  disabled={!isConnected || grantPending || grantConfirming}
                  className="w-full bg-accent hover:bg-accent/80 disabled:opacity-40 text-bone rounded px-4 py-2 text-sm font-medium transition-colors"
                >
                  {grantPending || grantConfirming ? 'Confirming…' : 'Grant Access'}
                </button>
                {!isConnected && (
                  <p className="text-center text-xs text-bone/40">Connect wallet to grant access</p>
                )}
              </form>
            </div>

            {/* Active grants list */}
            <div>
              <h2 className="font-semibold text-bone mb-4">Active Grants</h2>
              {displayGrants.length === 0 && (
                <p className="text-bone/30 text-sm">No active grants.</p>
              )}
              {displayGrants.map((g) => (
                <div
                  key={g.grantId}
                  className="bg-bone/5 border border-bone/10 rounded-lg p-4 mb-3 flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-bone/50">Verifier</p>
                    <p className="font-mono text-xs text-bone/80">{short(g.verifier)}</p>
                    <p className="text-xs text-bone/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires {formatTime(g.expiresAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevoke(g.grantId)}
                    disabled={!isConnected || revokePending || revokeConfirming}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
