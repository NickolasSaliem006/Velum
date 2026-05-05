import Link from 'next/link'

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
