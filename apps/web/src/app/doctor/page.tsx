'use client'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState } from 'react'
import { Stethoscope, FilePlus, CheckCircle2, Clock, Loader2, Sparkles } from 'lucide-react'
import { CONTRACT_ADDRESSES, RECORD_REGISTRY_ABI, SEVERITY_LABELS } from '@/lib/contracts'
import { encryptRecord } from '@velum/crypto-lib'
import { uploadToIpfs, IpfsError } from '@/lib/ipfs'

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_PENDING = [
  {
    id: '0xb4e8d3f2c1a0b9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4' as `0x${string}`,
    patient: '0xDeAdBeEf1234567890DeAdBeEf1234567890DeAd' as `0x${string}`,
    cid: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    severity: 2 as const,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 3600),
  },
]

const DEMO_RECENT = [
  {
    id: '0xa3f7c2e1d4b59f0e8c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3' as `0x${string}`,
    patient: '0xCaFe1234567890CaFe1234567890CaFe12345678' as `0x${string}`,
    cid: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    severity: 0 as const,
    finalized: true,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400),
  },
  {
    id: '0xc5f9e4d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5' as `0x${string}`,
    patient: '0xFaCe5678901234FaCe5678901234FaCe56789012' as `0x${string}`,
    cid: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    severity: 1 as const,
    finalized: true,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 7200),
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function short(hex: string) {
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`
}

function formatTime(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleString()
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function DoctorPage() {
  const { isConnected } = useAccount()
  const isDemo = !isConnected

  const [form, setForm] = useState({
    patient: '',
    cid: '',
    severity: '0',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [plaintext, setPlaintext] = useState('')
  const [uploadState, setUploadState] = useState<
    | { phase: 'idle' }
    | { phase: 'uploading' }
    | { phase: 'done'; cid: string; wrappedKey: string; size: number }
  >({ phase: 'idle' })

  const { writeContract: doWrite, data: writeTxHash, isPending: writePending } = useWriteContract()
  const {
    writeContract: doCosign,
    data: cosignTxHash,
    isPending: cosignPending,
  } = useWriteContract()
  const { isLoading: writeConfirming } = useWaitForTransactionReceipt({ hash: writeTxHash })
  const { isLoading: cosignConfirming } = useWaitForTransactionReceipt({ hash: cosignTxHash })

  function handleWrite(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!/^0x[0-9a-fA-F]{40}$/.test(form.patient)) {
      setFormError('Invalid patient address')
      return
    }
    if (form.cid.length !== 64 || !/^[0-9a-fA-F]+$/.test(form.cid)) {
      setFormError('CID must be exactly 64 hex characters')
      return
    }

    doWrite(
      {
        address: CONTRACT_ADDRESSES.RecordRegistry,
        abi: RECORD_REGISTRY_ABI,
        functionName: 'writeRecord',
        args: [form.patient as `0x${string}`, form.cid, Number(form.severity) as 0 | 1 | 2],
      },
      {
        onSuccess: () => setFormSuccess('Record submitted! Awaiting confirmation…'),
        onError: (err) => setFormError(err.message.split('\n')[0]),
      }
    )
  }

  async function handleEncryptAndUpload() {
    setFormError('')
    setFormSuccess('')
    if (plaintext.trim().length === 0) {
      setFormError('Enter record content before encrypting')
      return
    }
    setUploadState({ phase: 'uploading' })
    try {
      const { encrypted, rawKeyBase64 } = await encryptRecord(plaintext)
      const result = await uploadToIpfs(encrypted.ciphertext)
      setUploadState({
        phase: 'done',
        cid: result.cid,
        wrappedKey: rawKeyBase64,
        size: result.size,
      })
      setForm((f) => ({ ...f, cid: result.cid }))
      setFormSuccess(`Encrypted ${plaintext.length} chars → uploaded to IPFS sim → CID auto-filled`)
    } catch (err) {
      setUploadState({ phase: 'idle' })
      if (err instanceof IpfsError) {
        setFormError(
          `IPFS sim unreachable at NEXT_PUBLIC_IPFS_URL. Run: pnpm --filter @velum/ipfs-sim dev`
        )
      } else {
        setFormError(err instanceof Error ? err.message : 'Encryption failed')
      }
    }
  }

  function handleCosign(recordId: `0x${string}`) {
    doCosign({
      address: CONTRACT_ADDRESSES.RecordRegistry,
      abi: RECORD_REGISTRY_ABI,
      functionName: 'cosignRecord',
      args: [recordId],
    })
  }

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Nav */}
      <header className="border-b border-bone/10 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Stethoscope className="text-accent w-5 h-5 shrink-0" />
          <Link href="/" className="font-semibold text-bone hover:text-bone/80 transition-colors">
            Velum
          </Link>
          <span className="text-bone/40 text-sm hidden sm:inline">/ Doctor Interface</span>
        </div>
        <ConnectButton />
      </header>

      {isDemo && (
        <div className="bg-accent/10 border-b border-accent/20 px-6 py-2 text-sm text-accent/90 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Demo mode — connect a wallet with DOCTOR_ROLE to write records
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Write record form */}
        <div>
          <h2 className="font-semibold text-bone mb-4 flex items-center gap-2">
            <FilePlus className="w-4 h-4 text-accent" />
            Write Medical Record
          </h2>
          {/* Encrypt + upload helper (writes the CID into the form below) */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <p className="text-xs font-medium text-accent">Generate CID from content</p>
            </div>
            <p className="text-xs text-bone/50 mb-3">
              Write plaintext below — it gets AES-256-GCM encrypted in your browser, uploaded to the
              IPFS sim, and the resulting SHA-256 CID is auto-filled into the form. Plaintext never
              leaves the browser unencrypted.
            </p>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Patient: Jane Doe&#10;Diagnosis: …&#10;Prescription: …"
              rows={4}
              className="w-full bg-bone/10 border border-bone/20 rounded px-3 py-2 text-sm text-bone placeholder-bone/30 focus:outline-none focus:border-accent font-mono leading-relaxed"
            />
            <button
              type="button"
              onClick={handleEncryptAndUpload}
              disabled={uploadState.phase === 'uploading' || plaintext.trim().length === 0}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-accent/20 hover:bg-accent/30 disabled:opacity-40 text-accent rounded px-3 py-2 text-xs font-medium transition-colors"
            >
              {uploadState.phase === 'uploading' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Encrypting & uploading…
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" /> Encrypt → Upload → Auto-fill CID
                </>
              )}
            </button>
            {uploadState.phase === 'done' && (
              <div className="mt-3 pt-3 border-t border-accent/20 space-y-1">
                <p className="text-xs text-green-400">
                  ✓ Uploaded {uploadState.size} bytes of ciphertext
                </p>
                <p className="text-xs text-bone/50">
                  CID: <span className="font-mono text-bone/80 break-all">{uploadState.cid}</span>
                </p>
                <p className="text-xs text-bone/40">
                  Wrapped key (give to patient out-of-band):{' '}
                  <span className="font-mono text-bone/60">
                    {uploadState.wrappedKey.slice(0, 16)}…
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="bg-bone/5 border border-bone/10 rounded-lg p-5">
            <form onSubmit={handleWrite} className="space-y-4">
              <div>
                <label className="text-xs text-bone/50 block mb-1">Patient wallet address</label>
                <input
                  type="text"
                  placeholder="0x…"
                  value={form.patient}
                  onChange={(e) => setForm((f) => ({ ...f, patient: e.target.value }))}
                  className="w-full bg-bone/10 border border-bone/20 rounded px-3 py-2 text-sm text-bone placeholder-bone/30 focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-bone/50 block mb-1">
                  Content CID
                  <span className="ml-1 text-bone/30">
                    (SHA-256 of encrypted content, 64 hex chars)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="a1b2c3d4…"
                  value={form.cid}
                  onChange={(e) => setForm((f) => ({ ...f, cid: e.target.value.toLowerCase() }))}
                  className="w-full bg-bone/10 border border-bone/20 rounded px-3 py-2 text-sm text-bone placeholder-bone/30 focus:outline-none focus:border-accent font-mono"
                  maxLength={64}
                />
                <div className="text-right text-xs text-bone/30 mt-0.5">{form.cid.length}/64</div>
              </div>

              <div>
                <label className="text-xs text-bone/50 block mb-1">Severity</label>
                <div className="flex gap-2">
                  {(['0', '1', '2'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, severity: s }))}
                      className={`flex-1 min-h-[44px] py-2.5 rounded text-sm font-medium transition-colors border ${
                        form.severity === s
                          ? `border-transparent ${SEVERITY_COLORS[Number(s) as 0 | 1 | 2]}`
                          : 'border-bone/20 text-bone/50 hover:text-bone'
                      }`}
                    >
                      {SEVERITY_LABELS[Number(s) as 0 | 1 | 2]}
                    </button>
                  ))}
                </div>
                {form.severity === '2' && (
                  <p className="text-yellow-400/70 text-xs mt-2">
                    ⚠ High severity requires a second doctor to cosign before finalization.
                  </p>
                )}
              </div>

              {formError && <p className="text-red-400 text-xs">{formError}</p>}
              {formSuccess && <p className="text-green-400 text-xs">{formSuccess}</p>}

              <button
                type="submit"
                disabled={!isConnected || writePending || writeConfirming}
                className="w-full bg-accent hover:bg-accent/80 disabled:opacity-40 text-bone rounded px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {writePending || writeConfirming ? 'Confirming…' : 'Write Record On-Chain'}
              </button>
              {!isConnected && (
                <p className="text-center text-xs text-bone/40">
                  Connect a wallet with DOCTOR_ROLE to write records
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Right column: pending cosigns + recent */}
        <div className="space-y-6">
          {/* Pending cosigns */}
          <div>
            <h2 className="font-semibold text-bone mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              Pending Co-Signatures
              {isDemo && (
                <span className="ml-auto text-xs text-bone/30 font-normal">
                  {DEMO_PENDING.length} demo
                </span>
              )}
            </h2>
            {(isDemo ? DEMO_PENDING : []).map((rec) => (
              <div
                key={rec.id}
                className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-4 mb-3 flex items-start justify-between"
              >
                <div className="space-y-1">
                  <Badge s={rec.severity} />
                  <p className="font-mono text-xs text-bone/70 mt-1">{short(rec.id)}</p>
                  <p className="text-xs text-bone/50">Patient: {short(rec.patient)}</p>
                  <p className="text-xs text-bone/40">{formatTime(rec.timestamp)}</p>
                </div>
                <button
                  onClick={() => handleCosign(rec.id)}
                  disabled={!isConnected || cosignPending || cosignConfirming}
                  className="flex items-center gap-1 text-xs bg-accent/20 hover:bg-accent/30 text-accent rounded px-3 py-2.5 min-h-[44px] transition-colors disabled:opacity-40"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Co-sign
                </button>
              </div>
            ))}
            {!isDemo && (
              <p className="text-bone/30 text-sm">
                Connect wallet to view records requiring your co-signature.
              </p>
            )}
          </div>

          {/* Recent records */}
          <div>
            <h2 className="font-semibold text-bone mb-3">Recent Records</h2>
            {(isDemo ? DEMO_RECENT : []).map((rec) => (
              <div
                key={rec.id}
                className="bg-bone/5 border border-bone/10 rounded-lg p-4 mb-3 flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge s={rec.severity} />
                    {rec.finalized && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-green-400 bg-green-400/10">
                        Finalized
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-bone/70">{short(rec.id)}</p>
                  <p className="text-xs text-bone/50">Patient: {short(rec.patient)}</p>
                </div>
                <p className="text-xs text-bone/40">{formatTime(rec.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
