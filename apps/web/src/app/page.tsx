import Link from 'next/link'

const FLOW_STEPS = [
  {
    n: '01',
    actor: 'Doctor',
    title: 'Encrypt & Write',
    body: 'Record content is AES-256-GCM encrypted in the browser. Ciphertext goes to IPFS. The SHA-256 hash (CID) is written on-chain — only the hash, never the plaintext.',
    color: 'border-accent/30 bg-accent/5',
    badge: 'text-accent',
  },
  {
    n: '02',
    actor: 'Patient',
    title: 'Grant Consent',
    body: 'The patient calls grantConsent(verifier, recordId, expiresAt) directly on-chain. Time-limited. Instantly revocable. No company intermediary — the contract is the gatekeeper.',
    color: 'border-green-400/30 bg-green-400/5',
    badge: 'text-green-400',
  },
  {
    n: '03',
    actor: 'Hospital',
    title: 'Verify & Access',
    body: 'Hospital checks hasAccess() on-chain. A ZK access claim is issued and verified off-chain. On pass: fetch IPFS blob, decrypt with patient key. Every access is logged as an immutable event.',
    color: 'border-yellow-400/30 bg-yellow-400/5',
    badge: 'text-yellow-400',
  },
  {
    n: '04',
    actor: 'Polygon',
    title: 'Immutable Audit',
    body: 'RecordWritten, ConsentGranted, ConsentRevoked, RecordAccessed — all four event types are emitted and permanently stored. No one can alter or delete the log.',
    color: 'border-purple-400/30 bg-purple-400/5',
    badge: 'text-purple-400',
  },
]

const STATS = [
  { value: '39', label: 'Foundry tests' },
  { value: '97.87%', label: 'line coverage' },
  { value: '3', label: 'deployed contracts' },
  { value: 'AES-256', label: 'record encryption' },
]

const FEATURES = [
  {
    icon: '🔐',
    title: 'Patient-Controlled Access',
    desc: 'Grant and revoke consent to any verifier. Every decision is on-chain and permanent.',
  },
  {
    icon: '⛓️',
    title: 'On-Chain Audit Trail',
    desc: 'Every write, every access, every revocation logged on Polygon — immutable and public.',
  },
  {
    icon: '🧮',
    title: 'Zero-Knowledge Proofs',
    desc: 'Prove authorization without revealing credentials. The math owns the data — not us.',
  },
  {
    icon: '🏥',
    title: 'Multi-Role Architecture',
    desc: 'Separate interfaces for patients, doctors, and hospitals — each with enforced permissions.',
  },
]

const ROLES = [
  { href: '/patient', label: 'Patient Portal', color: 'bg-accent hover:bg-accent-hover' },
  {
    href: '/doctor',
    label: 'Doctor Interface',
    color: 'bg-bone/10 hover:bg-bone/20 border border-bone/20',
  },
  {
    href: '/hospital',
    label: 'Hospital Dashboard',
    color: 'bg-bone/10 hover:bg-bone/20 border border-bone/20',
  },
  {
    href: '/audit',
    label: 'Audit Trail',
    color: 'bg-bone/10 hover:bg-bone/20 border border-bone/20',
  },
  {
    href: '/docs',
    label: 'User Manual',
    color: 'bg-bone/10 hover:bg-bone/20 border border-bone/20',
  },
]

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-5xl px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-bone/20 bg-bone/5 px-4 py-1.5 text-sm text-bone/60 mb-8">
          <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          Prototype — deploy contracts to go live
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-bone mb-6">
          The Trust Layer for
          <br />
          Medical Records
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-bone/60 mb-10">
          Velum gives patients full control over who sees their data. Every access request is
          cryptographically verified. Every event is permanently audited on-chain. No central
          server. No database administrator. No company that can be subpoenaed.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {ROLES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={`rounded-lg px-6 py-3 font-semibold transition-colors ${r.color}`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-5xl px-6 pb-16">
        <h2 className="text-center text-2xl font-bold text-bone mb-2">How It Works</h2>
        <p className="text-center text-bone/50 text-sm mb-10">
          Four steps. Every one cryptographically enforced.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FLOW_STEPS.map((s) => (
            <div key={s.n} className={`rounded-xl border p-5 ${s.color}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-3xl font-black opacity-20 ${s.badge}`}>{s.n}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-bone/10 ${s.badge}`}
                >
                  {s.actor}
                </span>
              </div>
              <h3 className="font-semibold text-bone mb-2">{s.title}</h3>
              <p className="text-xs text-bone/55 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="w-full max-w-5xl px-6 pb-16">
        <div className="rounded-xl border border-bone/10 bg-bone/5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-bone/10">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-5 text-center">
              <p className="text-2xl font-bold text-bone">{s.value}</p>
              <p className="text-xs text-bone/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="w-full max-w-5xl px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-bone/10 bg-obsidian-50 p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-bone mb-2">{f.title}</h3>
            <p className="text-sm text-bone/60">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Prototype disclosure */}
      <footer className="w-full border-t border-bone/10 py-6 text-center text-xs text-bone/40">
        <strong>PROTOTYPE NOTE:</strong> ZK proofs are simulated (Ed25519-signed claims). IPFS
        storage runs on a single local server. Threshold encryption is mocked. Real components:
        Polygon smart contracts, AES-GCM encryption, Ed25519 signatures, on-chain consent
        enforcement.
      </footer>
    </main>
  )
}
