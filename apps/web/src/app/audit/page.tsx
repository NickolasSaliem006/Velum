'use client'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import {
  Activity,
  FilePlus,
  ShieldCheck,
  ShieldOff,
  Eye,
  Search,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'

// ── Demo event feed ───────────────────────────────────────────────────────────

type EventType = 'RecordWritten' | 'ConsentGranted' | 'ConsentRevoked' | 'RecordAccessed'

interface AuditEvent {
  id: string
  type: EventType
  txHash: string
  blockNumber: number
  timestamp: number
  actor: string
  subject: string
  recordId?: string
  extra?: string
}

const DEMO_EVENTS: AuditEvent[] = [
  {
    id: '1',
    type: 'RecordWritten',
    txHash: '0x7f3e9a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    blockNumber: 15_482_901,
    timestamp: Math.floor(Date.now() / 1000) - 60,
    actor: '0x1234567890123456789012345678901234567890',
    subject: '0xCaFe1234567890CaFe1234567890CaFe12345678',
    recordId: '0xa3f7c2e1d4b59f0e8c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    extra: 'Severity: Low',
  },
  {
    id: '2',
    type: 'ConsentGranted',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    blockNumber: 15_482_943,
    timestamp: Math.floor(Date.now() / 1000) - 320,
    actor: '0xCaFe1234567890CaFe1234567890CaFe12345678',
    subject: '0xAbCd1234567890AbCd1234567890AbCd12345678',
    recordId: '0xa3f7c2e1d4b59f0e8c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    extra: 'Expires in 7 days',
  },
  {
    id: '3',
    type: 'RecordWritten',
    txHash: '0x9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8',
    blockNumber: 15_481_200,
    timestamp: Math.floor(Date.now() / 1000) - 3_600,
    actor: '0x9876543210987654321098765432109876543210',
    subject: '0xFaCe5678901234FaCe5678901234FaCe56789012',
    recordId: '0xb4e8d3f2c1a0b9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4',
    extra: 'Severity: High — co-sign pending',
  },
  {
    id: '4',
    type: 'RecordWritten',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    blockNumber: 15_481_188,
    timestamp: Math.floor(Date.now() / 1000) - 3_720,
    actor: '0x1234567890123456789012345678901234567890',
    subject: '0xDeAdBeEf1234567890DeAdBeEf1234567890DeAd',
    recordId: '0xc5f9e4d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5',
    extra: 'Severity: Medium',
  },
  {
    id: '5',
    type: 'ConsentRevoked',
    txHash: '0xf1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
    blockNumber: 15_480_500,
    timestamp: Math.floor(Date.now() / 1000) - 86_400,
    actor: '0xFaCe5678901234FaCe5678901234FaCe56789012',
    subject: '0xDeAdBeEf1234567890DeAdBeEf1234567890DeAd',
    recordId: '0xc5f9e4d3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5',
  },
  {
    id: '6',
    type: 'RecordAccessed',
    txHash: '0xb3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    blockNumber: 15_479_900,
    timestamp: Math.floor(Date.now() / 1000) - 86_400 * 2,
    actor: '0xAbCd1234567890AbCd1234567890AbCd12345678',
    subject: '0xCaFe1234567890CaFe1234567890CaFe12345678',
    recordId: '0xa3f7c2e1d4b59f0e8c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function short(hex: string) {
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const EVENT_CONFIG: Record<
  EventType,
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  RecordWritten: {
    icon: FilePlus,
    label: 'Record Written',
    color: 'text-accent',
    bg: 'bg-accent/10 border-accent/20',
  },
  ConsentGranted: {
    icon: ShieldCheck,
    label: 'Consent Granted',
    color: 'text-green-400',
    bg: 'bg-green-400/5 border-green-400/20',
  },
  ConsentRevoked: {
    icon: ShieldOff,
    label: 'Consent Revoked',
    color: 'text-red-400',
    bg: 'bg-red-400/5 border-red-400/20',
  },
  RecordAccessed: {
    icon: Eye,
    label: 'Record Accessed',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/5 border-yellow-400/20',
  },
}

const ALL_TYPES: EventType[] = [
  'RecordWritten',
  'ConsentGranted',
  'ConsentRevoked',
  'RecordAccessed',
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const [filter, setFilter] = useState<EventType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const filtered = DEMO_EVENTS.filter((e) => {
    if (filter !== 'all' && e.type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        e.txHash.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        (e.recordId?.toLowerCase().includes(q) ?? false)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Nav */}
      <header className="border-b border-bone/10 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Activity className="text-accent w-5 h-5 shrink-0" />
          <Link href="/" className="font-semibold text-bone hover:text-bone/80 transition-colors">
            Velum
          </Link>
          <span className="text-bone/40 text-sm hidden sm:inline">/ Audit Trail</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-1.5 text-xs text-bone/50 hover:text-bone transition-colors p-1 min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" key={refreshKey} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <ConnectButton />
        </div>
      </header>

      {/* Demo banner */}
      <div className="bg-accent/10 border-b border-accent/20 px-6 py-2 text-sm text-accent/90 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        Demo mode — events simulated. In production, events are polled from Polygon Amoy via
        contract logs.
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-bone">On-Chain Audit Trail</h1>
            <p className="text-bone/50 text-sm mt-1">
              Immutable log of every record write, consent grant, revocation, and access event.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-bone">{DEMO_EVENTS.length}</p>
            <p className="text-xs text-bone/50">total events</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {ALL_TYPES.map((type) => {
            const cfg = EVENT_CONFIG[type]
            const count = DEMO_EVENTS.filter((e) => e.type === type).length
            const Icon = cfg.icon
            return (
              <button
                key={type}
                onClick={() => setFilter(filter === type ? 'all' : type)}
                className={`rounded-lg border p-3 min-h-[60px] text-left transition-all ${
                  filter === type ? cfg.bg : 'bg-bone/5 border-bone/10 hover:border-bone/20'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 mb-1 ${filter === type ? cfg.color : 'text-bone/60'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{cfg.label}</span>
                </div>
                <p className={`text-xl font-bold ${filter === type ? cfg.color : 'text-bone'}`}>
                  {count}
                </p>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone/30" />
          <input
            type="text"
            placeholder="Search by tx hash, address, or record ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bone/5 border border-bone/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-bone placeholder-bone/30 focus:outline-none focus:border-accent"
          />
        </div>

        {/* Event feed */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-bone/30">
              <Activity className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No events match this filter.</p>
            </div>
          )}
          {filtered.map((event) => {
            const cfg = EVENT_CONFIG[event.type]
            const Icon = cfg.icon
            return (
              <div
                key={event.id}
                className="bg-bone/5 border border-bone/10 rounded-lg p-4 hover:border-bone/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-md ${cfg.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs text-bone/40 shrink-0">
                        {timeAgo(event.timestamp)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
                      <p className="text-xs text-bone/50">
                        Actor: <span className="font-mono text-bone/70">{short(event.actor)}</span>
                      </p>
                      <p className="text-xs text-bone/50">
                        Block:{' '}
                        <span className="font-mono text-bone/70">
                          {event.blockNumber.toLocaleString()}
                        </span>
                      </p>
                      {event.recordId && (
                        <p className="text-xs text-bone/50">
                          Record:{' '}
                          <span className="font-mono text-bone/70">{short(event.recordId)}</span>
                        </p>
                      )}
                      {event.extra && <p className="text-xs text-bone/50">{event.extra}</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 min-w-0">
                      <p className="font-mono text-xs text-bone/40 truncate min-w-0">
                        {short(event.txHash)}
                      </p>
                      <a
                        href={`https://amoy.polygonscan.com/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-1 -m-1 text-bone/30 hover:text-accent transition-colors"
                        title="View on Polygonscan"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length > 0 && (
          <p className="text-center text-xs text-bone/30 mt-6">
            Showing {filtered.length} of {DEMO_EVENTS.length} events
          </p>
        )}
      </main>
    </div>
  )
}
