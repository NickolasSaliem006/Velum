import Link from 'next/link'

// ── Static manual page — no wallet, no hooks, fully server-rendered ───────────

export const metadata = {
  title: 'Velum — User Manual',
  description: 'How to use Velum: platform guide, role walkthroughs, and debugging reference.',
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-bone mb-4 pb-2 border-b border-bone/10">{title}</h2>
      <div className="space-y-4 text-bone/70 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-bone mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-bone/10 text-accent font-mono text-xs px-1.5 py-0.5 rounded">
      {children}
    </code>
  )
}

function Block({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-obsidian-50 border border-bone/10 rounded-lg p-4 text-xs font-mono text-bone/80 overflow-x-auto whitespace-pre-wrap">
      {children}
    </pre>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 text-accent/90 text-sm">
      {children}
    </div>
  )
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-4 py-3 text-yellow-300/90 text-sm">
      {children}
    </div>
  )
}

const TOC = [
  { id: 'overview', label: 'Platform Overview' },
  { id: 'prerequisites', label: 'Prerequisites' },
  { id: 'quickstart', label: 'Quickstart (Demo Mode)' },
  { id: 'roles', label: 'Roles & Permissions' },
  { id: 'patient', label: 'Patient Portal — Full Walkthrough' },
  { id: 'doctor', label: 'Doctor Interface — Full Walkthrough' },
  { id: 'hospital', label: 'Hospital Dashboard — Full Walkthrough' },
  { id: 'audit', label: 'Audit Trail — Full Walkthrough' },
  { id: 'crypto', label: 'Cryptography & What to Expect' },
  { id: 'contracts', label: 'Smart Contracts Reference' },
  { id: 'live-mode', label: 'Going Live (Polygon Amoy)' },
  { id: 'debug', label: 'Debugging Guide' },
  { id: 'errors', label: 'Error Reference' },
  { id: 'faq', label: 'FAQ' },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      {/* Nav */}
      <header className="border-b border-bone/10 px-4 sm:px-6 py-4 flex items-center justify-between gap-3 sticky top-0 bg-obsidian z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="font-semibold text-bone hover:text-bone/80 transition-colors">
            Velum
          </Link>
          <span className="text-bone/40 text-sm hidden sm:inline">/ User Manual</span>
        </div>
        <Link
          href="/"
          className="text-xs text-bone/50 hover:text-bone transition-colors border border-bone/20 rounded px-3 py-1.5"
        >
          ← Back to app
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex gap-10">
        {/* Sidebar TOC — desktop only */}
        <aside className="hidden lg:block w-52 shrink-0 sticky top-24 self-start">
          <p className="text-xs font-semibold text-bone/40 uppercase tracking-wider mb-3">
            Contents
          </p>
          <nav className="space-y-1">
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block text-sm text-bone/50 hover:text-bone transition-colors py-0.5"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-14">
          <div>
            <h1 className="text-3xl font-bold text-bone mb-3">Velum — User Manual</h1>
            <p className="text-bone/60 text-base">
              Complete guide to using the Velum platform: demo walkthrough, role-by-role
              instructions, cryptography explainer, and full debugging reference.
            </p>
          </div>

          {/* ── OVERVIEW ── */}
          <Section id="overview" title="Platform Overview">
            <p>
              Velum is a decentralized medical records system built on Polygon. Patients own their
              health data. Doctors write records on-chain. Hospitals request time-limited read
              access. Every action is logged permanently.
            </p>
            <p>
              There is no central server, no database administrator, and no company that holds your
              data. All access control logic lives in three Solidity smart contracts deployed to
              Polygon Amoy testnet.
            </p>
            <Sub title="What makes Velum different">
              <ul className="list-disc list-inside space-y-1.5 text-bone/60">
                <li>
                  <span className="text-bone/80">Patient-controlled consent</span> — you decide who
                  sees each record and for how long
                </li>
                <li>
                  <span className="text-bone/80">Immutable audit trail</span> — every write, grant,
                  revocation, and access is permanently logged on-chain
                </li>
                <li>
                  <span className="text-bone/80">AES-GCM encryption</span> — record content is
                  encrypted in your browser before any upload; the server never sees plaintext
                </li>
                <li>
                  <span className="text-bone/80">ZK access claims</span> — access authorization is
                  proved cryptographically without revealing your credentials (simulated via
                  Ed25519-signed claims in this prototype)
                </li>
                <li>
                  <span className="text-bone/80">High-severity co-sign</span> — critical records
                  require two doctors before finalization
                </li>
              </ul>
            </Sub>
            <Sub title="Current state">
              <p>
                This is a working prototype. Contracts are deployed to Polygon Amoy testnet. The UI
                runs in <strong className="text-bone">demo mode</strong> when no wallet is connected
                — all data is simulated locally and nothing is written to any chain.
              </p>
            </Sub>
          </Section>

          {/* ── PREREQUISITES ── */}
          <Section id="prerequisites" title="Prerequisites">
            <Sub title="To use demo mode (no wallet needed)">
              <p>
                Just open the app in a browser. All four role pages work without any wallet or
                account. Demo data is hard-coded and nothing is persisted.
              </p>
            </Sub>
            <Sub title="To interact with live contracts (Polygon Amoy)">
              <ul className="list-disc list-inside space-y-1.5 text-bone/60">
                <li>
                  A browser wallet — <span className="text-bone/80">MetaMask</span> (recommended),
                  Rainbow, or any WalletConnect-compatible wallet
                </li>
                <li>
                  Polygon Amoy testnet added to your wallet (Chain ID: <Code>80002</Code>, RPC:{' '}
                  <Code>https://rpc-amoy.polygon.technology</Code>)
                </li>
                <li>
                  Test MATIC for gas — free from <Code>faucet.polygon.technology</Code>
                </li>
                <li>
                  The correct role assigned to your wallet address by the contract owner (
                  <Code>DOCTOR_ROLE</Code> or <Code>HOSPITAL_ROLE</Code>) — patients need no special
                  role
                </li>
              </ul>
            </Sub>
            <Sub title="To run locally">
              <Block>{`# Install dependencies
pnpm install

# Start the dev server (Next.js at localhost:3000)
pnpm dev

# Or run the full monorepo (IPFS sim + web)
pnpm --filter @velum/web dev`}</Block>
            </Sub>
          </Section>

          {/* ── QUICKSTART ── */}
          <Section id="quickstart" title="Quickstart — Demo Mode">
            <Note>
              Demo mode requires no wallet. All data is local and simulated. Nothing is written to
              any blockchain.
            </Note>
            <ol className="list-decimal list-inside space-y-3 text-bone/70">
              <li>
                Open <Code>http://localhost:3000</Code> (or the deployed URL)
              </li>
              <li>
                Click <strong className="text-bone">Patient Portal</strong> to see your medical
                records, toggle encrypt/decrypt on each record, and manage access grants
              </li>
              <li>
                Click <strong className="text-bone">Doctor Interface</strong> to see the
                write-record form and pending co-signatures
              </li>
              <li>
                Click <strong className="text-bone">Hospital Dashboard</strong> to see which patient
                records this hospital has been granted access to, with expiry countdowns
              </li>
              <li>
                Click <strong className="text-bone">Audit Trail</strong> to browse the immutable
                event log — filter by event type or search by address
              </li>
              <li>
                Click the <strong className="text-bone">Velum</strong> wordmark in any page header
                to return to the landing page
              </li>
            </ol>
          </Section>

          {/* ── ROLES ── */}
          <Section id="roles" title="Roles & Permissions">
            <p>
              Velum uses an on-chain role system enforced by <Code>AccessController.sol</Code> and{' '}
              <Code>RecordRegistry.sol</Code>. Three roles exist:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-bone/10">
                    <th className="text-left py-2 pr-6 text-bone/50 font-medium">Role</th>
                    <th className="text-left py-2 pr-6 text-bone/50 font-medium">Who</th>
                    <th className="text-left py-2 text-bone/50 font-medium">Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bone/5">
                  <tr>
                    <td className="py-2.5 pr-6">
                      <Code>DEFAULT_ROLE</Code>
                    </td>
                    <td className="py-2.5 pr-6 text-bone/60">Any wallet</td>
                    <td className="py-2.5 text-bone/60">
                      Grant/revoke consent on own records, view own grants
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-6">
                      <Code>DOCTOR_ROLE</Code>
                    </td>
                    <td className="py-2.5 pr-6 text-bone/60">Credentialed physicians</td>
                    <td className="py-2.5 text-bone/60">
                      Write records, co-sign High-severity records
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-6">
                      <Code>HOSPITAL_ROLE</Code>
                    </td>
                    <td className="py-2.5 pr-6 text-bone/60">Healthcare institutions</td>
                    <td className="py-2.5 text-bone/60">
                      Read records where patient has granted consent
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Warn>
              Roles are granted by the contract owner (deployer wallet). There is no
              self-registration. Contact the system administrator to have your wallet credentialed.
            </Warn>
          </Section>

          {/* ── PATIENT ── */}
          <Section id="patient" title="Patient Portal — Full Walkthrough">
            <p>
              The Patient Portal is your personal health records dashboard. Navigate to{' '}
              <Link href="/patient" className="text-accent hover:underline">
                /patient
              </Link>
              .
            </p>
            <Sub title="Records tab">
              <p>
                Shows all medical records associated with your wallet address. Each card displays:
              </p>
              <ul className="list-disc list-inside space-y-1 text-bone/60">
                <li>
                  <strong className="text-bone/80">Severity badge</strong> — Low (green) / Medium
                  (yellow) / High (red)
                </li>
                <li>
                  <strong className="text-bone/80">Finalized badge</strong> — High records show
                  pending until a second doctor co-signs
                </li>
                <li>
                  <strong className="text-bone/80">ZK Verified badge</strong> (purple) — confirms an
                  Ed25519 access claim was issued and verified for this record
                </li>
                <li>
                  <strong className="text-bone/80">Content CID</strong> — the SHA-256 hash of the
                  encrypted content stored in IPFS
                </li>
                <li>
                  <strong className="text-bone/80">Encrypt / Decrypt toggle</strong> — demonstrates
                  AES-GCM encryption in your browser (see Cryptography section)
                </li>
              </ul>
            </Sub>
            <Sub title="Encrypt/Decrypt demo flow">
              <ol className="list-decimal list-inside space-y-1.5 text-bone/60">
                <li>
                  Click <strong className="text-bone/80">Show encrypted</strong> — the plaintext
                  content is encrypted with AES-256-GCM in your browser; the hex ciphertext is
                  displayed
                </li>
                <li>
                  Click <strong className="text-bone/80">Decrypt</strong> — the ciphertext is
                  decrypted back to plaintext using the same ephemeral key
                </li>
                <li>
                  Click <strong className="text-bone/80">Reset</strong> to return to idle state
                </li>
              </ol>
              <Note>
                Each encryption uses a fresh random IV (initialization vector). The same plaintext
                will produce a different ciphertext every time you click &quot;Show encrypted&quot;.
              </Note>
            </Sub>
            <Sub title="Access Grants tab">
              <p>Shows all active consent grants you have issued and lets you create new ones.</p>
              <ul className="list-disc list-inside space-y-1.5 text-bone/60">
                <li>
                  <strong className="text-bone/80">Grant New Access</strong> — enter a verifier
                  wallet address (hospital or researcher), a Record ID, and an expiry duration (1
                  day / 1 week / 30 days), then confirm the transaction
                </li>
                <li>
                  <strong className="text-bone/80">Revoke</strong> button — immediately revokes
                  consent for a specific grant; the revocation is written on-chain and takes effect
                  instantly
                </li>
                <li>
                  <strong className="text-bone/80">Expiry countdown</strong> — grants expire
                  automatically at the block timestamp set on creation; expired grants show in red
                </li>
              </ul>
            </Sub>
            <Sub title="What to expect in demo mode">
              <p>
                Three pre-loaded records are shown. The encrypt/decrypt buttons work with real
                browser-side AES-GCM. Grant/revoke buttons are disabled (greyed out) — connect a
                wallet to write to the chain.
              </p>
            </Sub>
          </Section>

          {/* ── DOCTOR ── */}
          <Section id="doctor" title="Doctor Interface — Full Walkthrough">
            <p>
              The Doctor Interface is where credentialed physicians write records and co-sign
              High-severity entries. Navigate to{' '}
              <Link href="/doctor" className="text-accent hover:underline">
                /doctor
              </Link>
              .
            </p>
            <Sub title="Write Medical Record form">
              <ul className="list-disc list-inside space-y-1.5 text-bone/60">
                <li>
                  <strong className="text-bone/80">Patient wallet address</strong> — the{' '}
                  <Code>0x…</Code> Ethereum address of the patient. Must be a valid 40-hex-char
                  address.
                </li>
                <li>
                  <strong className="text-bone/80">Content CID</strong> — the SHA-256 hash (64 hex
                  chars) of the AES-GCM–encrypted content blob stored in IPFS. In production, your
                  client uploads the encrypted blob to the IPFS node first and pastes the returned
                  CID here.
                </li>
                <li>
                  <strong className="text-bone/80">Severity</strong> — Low / Medium / High.
                  Selecting <em>High</em> shows a warning: a second doctor must co-sign before the
                  record is finalized.
                </li>
                <li>
                  Click <strong className="text-bone/80">Write Record On-Chain</strong> — triggers a
                  MetaMask transaction to{' '}
                  <Code>RecordRegistry.writeRecord(patient, cid, severity)</Code>
                </li>
              </ul>
            </Sub>
            <Sub title="Pending Co-Signatures">
              <p>
                Lists all High-severity records written by any doctor that are awaiting a second
                signature. In demo mode one pending record is shown. Click{' '}
                <strong className="text-bone/80">Co-sign</strong> to call{' '}
                <Code>RecordRegistry.cosignRecord(recordId)</Code>.
              </p>
            </Sub>
            <Sub title="Recent Records">
              <p>
                Shows records written recently by this doctor&apos;s wallet. Finalized badge appears
                once a record either (a) has severity Low/Medium, or (b) has been co-signed for
                High.
              </p>
            </Sub>
            <Warn>
              You must have <Code>DOCTOR_ROLE</Code> on the connected wallet. Calling{' '}
              <Code>writeRecord</Code> without the role will revert with{' '}
              <Code>AccessControl: account ... is missing role</Code>.
            </Warn>
          </Section>

          {/* ── HOSPITAL ── */}
          <Section id="hospital" title="Hospital Dashboard — Full Walkthrough">
            <p>
              The Hospital Dashboard shows all patient records where the patient has granted consent
              to this hospital&apos;s wallet. Navigate to{' '}
              <Link href="/hospital" className="text-accent hover:underline">
                /hospital
              </Link>
              .
            </p>
            <Sub title="Stats bar">
              <ul className="list-disc list-inside space-y-1 text-bone/60">
                <li>
                  <strong className="text-bone/80">Active Grants</strong> — total records currently
                  consented
                </li>
                <li>
                  <strong className="text-bone/80">Total Records</strong> — same as Active Grants in
                  demo (live: includes expired)
                </li>
                <li>
                  <strong className="text-bone/80">Expiring Soon</strong> — grants expiring within
                  72 hours (yellow/red badge)
                </li>
              </ul>
            </Sub>
            <Sub title="Record cards">
              <p>
                Each card shows severity, finalization status, expiry countdown, patient address,
                and doctor address. Click a card to expand and reveal the full Record ID and Content
                CID. The CID is what you would use to fetch the encrypted blob from IPFS.
              </p>
            </Sub>
            <Sub title="Expiry badge colors">
              <ul className="list-disc list-inside space-y-1 text-bone/60">
                <li>
                  <span className="text-green-400">Green</span> — more than 3 days remaining
                </li>
                <li>
                  <span className="text-yellow-400">Yellow</span> — 1–3 days remaining
                </li>
                <li>
                  <span className="text-red-400">Red</span> — less than 24 hours or expired
                </li>
              </ul>
            </Sub>
            <Warn>
              You must have <Code>HOSPITAL_ROLE</Code> on the connected wallet. Without it, the
              contract returns an empty list and the dashboard shows no records.
            </Warn>
          </Section>

          {/* ── AUDIT ── */}
          <Section id="audit" title="Audit Trail — Full Walkthrough">
            <p>
              The Audit Trail is a public, read-only log of every on-chain event. Anyone can view it
              without a wallet. Navigate to{' '}
              <Link href="/audit" className="text-accent hover:underline">
                /audit
              </Link>
              .
            </p>
            <Sub title="Event types">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-bone/10">
                      <th className="text-left py-2 pr-6 text-bone/50 font-medium">Event</th>
                      <th className="text-left py-2 pr-6 text-bone/50 font-medium">Color</th>
                      <th className="text-left py-2 text-bone/50 font-medium">When emitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bone/5">
                    <tr>
                      <td className="py-2.5 pr-6 text-accent">Record Written</td>
                      <td className="py-2.5 pr-6 text-bone/60">Blue/accent</td>
                      <td className="py-2.5 text-bone/60">
                        Doctor calls <Code>writeRecord</Code>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-6 text-green-400">Consent Granted</td>
                      <td className="py-2.5 pr-6 text-bone/60">Green</td>
                      <td className="py-2.5 text-bone/60">
                        Patient calls <Code>grantConsent</Code>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-6 text-red-400">Consent Revoked</td>
                      <td className="py-2.5 pr-6 text-bone/60">Red</td>
                      <td className="py-2.5 text-bone/60">
                        Patient calls <Code>revokeConsent</Code>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-6 text-yellow-400">Record Accessed</td>
                      <td className="py-2.5 pr-6 text-bone/60">Yellow</td>
                      <td className="py-2.5 text-bone/60">
                        Hospital calls <Code>logAccess</Code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Sub>
            <Sub title="Filtering and search">
              <p>
                Click any stat card (Record Written, Consent Granted, etc.) to filter the feed to
                that event type. Click again to clear the filter. Use the search bar to filter by tx
                hash, actor address, subject address, or record ID (partial match works).
              </p>
            </Sub>
            <Sub title="Polygonscan links">
              <p>
                Every event row has an <Code>↗</Code> icon that opens the transaction on Polygon
                Amoy Polygonscan in a new tab. In demo mode the links point to real-looking hashes
                that do not exist on-chain.
              </p>
            </Sub>
          </Section>

          {/* ── CRYPTO ── */}
          <Section id="crypto" title="Cryptography & What to Expect">
            <Sub title="AES-GCM record encryption">
              <p>
                When a record is created, the plaintext content is encrypted in the browser using
                the <strong className="text-bone">Web Crypto API</strong> (<Code>AES-256-GCM</Code>
                ). The browser generates a random 256-bit key and a random 96-bit IV for each
                encryption. Only the ciphertext and its SHA-256 hash (the CID) leave the browser —
                the key stays with the patient.
              </p>
              <Block>{`Key:  AES-256-GCM, random per record
IV:   96-bit random nonce (fresh each encryption)
Auth: GCM authentication tag (128-bit) — tamper-evident
CID:  SHA-256(ciphertext) — stored on-chain, used to fetch from IPFS`}</Block>
              <p>
                <strong className="text-bone">What the demo shows:</strong> The &quot;Show
                encrypted&quot; button encrypts the demo plaintext in your browser right now. Each
                click produces a different ciphertext (because the IV is re-randomized). The
                &quot;Decrypt&quot; button uses the same ephemeral key+IV to reverse it.
              </p>
              <Note>
                In production, the encrypted blob is uploaded to IPFS. The key is stored only in the
                patient&apos;s wallet-derived key store. Velum never sees the plaintext or the key.
              </Note>
            </Sub>
            <Sub title="Ed25519 / ZK access claims (simulated)">
              <p>
                Real ZK proofs (Groth16/Circom) are not yet integrated. Instead, Velum simulates
                zero-knowledge authorization using{' '}
                <strong className="text-bone">Ed25519-signed claims</strong>:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-bone/60">
                <li>An ephemeral Ed25519 keypair is generated per record</li>
                <li>
                  An access claim is signed:{' '}
                  <Code>{`{ verifier, recordId, grantId, expiresAt }`}</Code>
                </li>
                <li>The claim is immediately verified against the public key</li>
                <li>
                  A purple <strong className="text-bone/80">ZK Verified</strong> badge appears if
                  verification succeeds
                </li>
              </ol>
              <p>
                This proves the <em>structural correctness</em> of the authorization flow without
                requiring a full ZK circuit. Real Groth16 proofs are on the P3 roadmap.
              </p>
            </Sub>
            <Sub title="On-chain consent enforcement">
              <p>
                <Code>AccessController.sol</Code> is the single source of truth for who can read
                what. Even if a hospital knows a record&apos;s CID, they cannot decrypt the content
                unless:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-bone/60">
                <li>
                  The patient has called <Code>grantConsent</Code> for that record
                </li>
                <li>The grant has not expired (block timestamp check)</li>
                <li>The grant has not been revoked</li>
              </ol>
            </Sub>
          </Section>

          {/* ── CONTRACTS ── */}
          <Section id="contracts" title="Smart Contracts Reference">
            <Sub title="RecordRegistry.sol">
              <p>Stores medical record metadata on-chain. Key functions:</p>
              <Block>{`writeRecord(address patient, bytes32 cid, Severity severity)
  → emits RecordWritten(recordId, doctor, patient, cid, severity)
  → requires DOCTOR_ROLE

cosignRecord(bytes32 recordId)
  → finalizes a High-severity record
  → requires DOCTOR_ROLE, different from original writer

getRecord(bytes32 recordId)
  → returns (doctor, patient, cid, severity, finalized, timestamp)`}</Block>
            </Sub>
            <Sub title="AccessController.sol">
              <p>Manages patient consent grants. Key functions:</p>
              <Block>{`grantConsent(address verifier, bytes32 recordId, uint256 expiresAt)
  → emits ConsentGranted(grantId, patient, verifier, recordId, expiresAt)
  → msg.sender must be the record's patient

revokeConsent(bytes32 grantId)
  → emits ConsentRevoked(grantId, patient, verifier)
  → msg.sender must be the grant's patient

hasConsent(address verifier, bytes32 recordId)
  → returns bool — true if an unexpired, unrevoked grant exists`}</Block>
            </Sub>
            <Sub title="CredentialIssuerRegistry.sol">
              <p>Multi-sig registry for issuing DOCTOR_ROLE and HOSPITAL_ROLE credentials:</p>
              <Block>{`proposeCredential(address account, bytes32 role)
  → starts a proposal (requires existing credentialer)

approveCredential(uint256 proposalId)
  → adds approval; at threshold, grants the role

revokeCredential(address account, bytes32 role)
  → removes role from account`}</Block>
            </Sub>
            <Sub title="Deployed addresses (Polygon Amoy testnet)">
              <p>
                Set in <Code>apps/web/.env.local</Code>. When contracts are deployed, copy the
                addresses from <Code>contracts/deployments/amoy.json</Code>:
              </p>
              <Block>{`NEXT_PUBLIC_RECORD_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_ACCESS_CONTROLLER_ADDRESS=0x...
NEXT_PUBLIC_CREDENTIAL_ISSUER_REGISTRY_ADDRESS=0x...`}</Block>
            </Sub>
          </Section>

          {/* ── LIVE MODE ── */}
          <Section id="live-mode" title="Going Live (Polygon Amoy)">
            <Sub title="Step 1 — Get test MATIC">
              <p>
                Visit <Code>faucet.polygon.technology</Code>, connect your wallet, and request Amoy
                MATIC. You need ~0.1 MATIC for deployment gas.
              </p>
            </Sub>
            <Sub title="Step 2 — Set private key">
              <Block>{`# contracts/.env
HARDHAT_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE`}</Block>
              <Warn>Never commit this file. It is in .gitignore.</Warn>
            </Sub>
            <Sub title="Step 3 — Deploy">
              <Block>{`cd contracts
npx hardhat run script/deploy.ts --network amoy`}</Block>
              <p>
                This writes deployed addresses to <Code>contracts/deployments/amoy.json</Code>.
              </p>
            </Sub>
            <Sub title="Step 4 — Configure the web app">
              <Block>{`# apps/web/.env.local
NEXT_PUBLIC_RECORD_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_ACCESS_CONTROLLER_ADDRESS=0x...
NEXT_PUBLIC_CREDENTIAL_ISSUER_REGISTRY_ADDRESS=0x...`}</Block>
            </Sub>
            <Sub title="Step 5 — Grant roles">
              <Block>{`cd contracts
# Grant DOCTOR_ROLE to a doctor wallet
npx hardhat run script/grantRole.ts --network amoy`}</Block>
              <p>
                Or call <Code>proposeCredential</Code> / <Code>approveCredential</Code> directly via
                the app once the deployer wallet is connected.
              </p>
            </Sub>
            <Sub title="Step 6 — Change the landing badge">
              <p>
                In <Code>apps/web/src/app/page.tsx</Code>, update the hero badge from{' '}
                <Code>Prototype — deploy contracts to go live</Code> to{' '}
                <Code>Live on Polygon Amoy Testnet</Code> and change <Code>bg-yellow-400</Code> to{' '}
                <Code>bg-green-400</Code>.
              </p>
            </Sub>
          </Section>

          {/* ── DEBUG ── */}
          <Section id="debug" title="Debugging Guide">
            <Sub title="Browser DevTools — always start here">
              <p>
                Open <Code>F12</Code> → Console tab. Velum surfaces all RPC errors and contract
                revert reasons to the console. Look for lines starting with{' '}
                <Code>ContractFunctionExecutionError</Code> or <Code>UserRejectedRequest</Code>.
              </p>
            </Sub>
            <Sub title="Demo mode vs live mode">
              <p>
                The yellow banner at the top of each page indicates demo mode (no wallet). If you
                connected a wallet but the banner still shows, check that your wallet is on{' '}
                <strong className="text-bone">Polygon Amoy (chain ID 80002)</strong>. RainbowKit
                will prompt a network switch if you&apos;re on mainnet.
              </p>
            </Sub>
            <Sub title="Transaction stuck as 'pending'">
              <ol className="list-decimal list-inside space-y-1.5 text-bone/60">
                <li>Open MetaMask → Activity → check if the tx was rejected or dropped</li>
                <li>
                  If nonce is stuck: MetaMask → Settings → Advanced →{' '}
                  <strong className="text-bone/80">Reset Account</strong> (clears nonce cache, does
                  not remove funds)
                </li>
                <li>
                  If gas price too low: speed up the transaction in MetaMask&apos;s activity tab
                </li>
              </ol>
            </Sub>
            <Sub title="AES-GCM decrypt fails">
              <p>
                The demo uses an ephemeral key that is only valid within the current page load. If
                you reload the page between encrypting and decrypting, the key is gone and
                decryption will fail with <Code>OperationError</Code> in the console. This is
                intentional — it demonstrates that you cannot decrypt without the key.
              </p>
              <p>
                In production, keys would be derived from a wallet-controlled secret (e.g., BIP-32
                child key) and stored encrypted in the patient&apos;s wallet.
              </p>
            </Sub>
            <Sub title="ZK badge not appearing">
              <p>
                The ZK badge runs in a <Code>useEffect</Code> on mount. If it doesn&apos;t appear:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-bone/60">
                <li>
                  Check the console for <Code>@noble/curves</Code> errors — the Ed25519 library must
                  be loaded
                </li>
                <li>Disable browser extensions that block WebAssembly or subtle crypto</li>
                <li>
                  Ensure <Code>isDemo</Code> is true (not connected) — ZK badge only shows in demo
                  mode in the current build
                </li>
              </ol>
            </Sub>
            <Sub title="Contract call returns zero/empty">
              <p>
                If <Code>getRecord</Code> or <Code>hasConsent</Code> returns zeroed data:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-bone/60">
                <li>
                  Check <Code>.env.local</Code> — all three <Code>NEXT_PUBLIC_*_ADDRESS</Code>{' '}
                  variables must be set. A missing variable makes the contract address{' '}
                  <Code>0x0000…0000</Code>, which calls a non-existent contract and returns empty.
                </li>
                <li>
                  Verify the contract is deployed on Amoy:{' '}
                  <Code>amoy.polygonscan.com/address/YOUR_ADDRESS</Code>
                </li>
                <li>
                  Run the Hardhat smoke test:{' '}
                  <Block>{`cd contracts && npx hardhat run script/deploy.ts --network hardhat`}</Block>
                </li>
              </ol>
            </Sub>
            <Sub title="pnpm dev fails to start">
              <Block>{`# Clear Next.js build cache
rm -rf apps/web/.next

# Reinstall deps if lock file is out of sync
pnpm install --frozen-lockfile

# Nuclear option: clear all caches
pnpm clean && pnpm install && pnpm dev`}</Block>
            </Sub>
            <Sub title="ESLint pre-commit hook fails">
              <p>
                The Husky pre-commit hook runs <Code>eslint --fix</Code> and{' '}
                <Code>prettier --write</Code> on staged files. If it fails:
              </p>
              <Block>{`# Check what ESLint says
pnpm lint

# Format everything
pnpm --filter @velum/web exec prettier --write "src/**/*.{ts,tsx}"

# Bypass hook (not recommended — fix the lint error instead)
git commit --no-verify`}</Block>
            </Sub>
            <Sub title="Foundry tests fail">
              <Block>{`# Run Foundry tests directly
~/.foundry/bin/forge.exe test -vvv

# Common issues:
# - Foundry not installed: curl -L https://foundry.paradigm.xyz | bash && foundryup
# - Missing deps: cd contracts && forge install
# - Compilation error: forge build --force`}</Block>
            </Sub>
            <Sub title="Enabling debug logs">
              <Block>{`# Next.js verbose output
DEBUG=* pnpm dev

# wagmi query debugging — add to your browser console:
localStorage.setItem('debug', 'wagmi:*')
# then reload the page`}</Block>
            </Sub>
          </Section>

          {/* ── ERRORS ── */}
          <Section id="errors" title="Error Reference">
            <div className="space-y-4">
              {[
                {
                  code: 'AccessControl: account 0x… is missing role 0x…',
                  cause: 'Wallet does not have the required role on-chain',
                  fix: 'Have the contract owner grant DOCTOR_ROLE or HOSPITAL_ROLE to your wallet',
                },
                {
                  code: 'UserRejectedRequest',
                  cause: 'User dismissed the MetaMask popup',
                  fix: 'Re-submit the transaction and approve in MetaMask',
                },
                {
                  code: 'ChainMismatch',
                  cause: 'Wallet is connected to wrong network',
                  fix: 'Switch MetaMask to Polygon Amoy (chain ID 80002). RainbowKit shows a switch button automatically.',
                },
                {
                  code: 'CID must be exactly 64 hex characters',
                  cause: 'Invalid CID entered in the doctor write-record form',
                  fix: 'Paste the full 64-character SHA-256 hex string (no 0x prefix)',
                },
                {
                  code: 'Invalid patient address',
                  cause: 'Patient address is not a valid Ethereum address',
                  fix: 'Address must be 0x followed by exactly 40 hex characters',
                },
                {
                  code: 'OperationError (AES-GCM decrypt)',
                  cause: 'Attempting to decrypt with a key that does not match the ciphertext',
                  fix: 'Page was reloaded after encrypting; the ephemeral key is gone. Re-encrypt to get a fresh key+IV pair.',
                },
                {
                  code: 'Cannot find module @velum/crypto-lib',
                  cause: 'Package not built or workspace not linked',
                  fix: 'Run pnpm install from the repo root. Turborepo links workspace packages automatically.',
                },
                {
                  code: 'NEXT_PUBLIC_* address is 0x0000000000000000000000000000000000000000',
                  cause: '.env.local is missing or has wrong variable names',
                  fix: 'Copy apps/web/.env.example to apps/web/.env.local and fill in deployed contract addresses.',
                },
              ].map((err) => (
                <div
                  key={err.code}
                  className="bg-bone/5 border border-bone/10 rounded-lg p-4 space-y-1.5"
                >
                  <p className="font-mono text-xs text-red-400 break-all">{err.code}</p>
                  <p className="text-xs text-bone/50">
                    <strong className="text-bone/70">Cause:</strong> {err.cause}
                  </p>
                  <p className="text-xs text-bone/50">
                    <strong className="text-bone/70">Fix:</strong> {err.fix}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── FAQ ── */}
          <Section id="faq" title="FAQ">
            <div className="space-y-6">
              {[
                {
                  q: 'Is my data actually private?',
                  a: 'In production, yes. Record content is encrypted with AES-256-GCM before it leaves your browser. The on-chain data is only the SHA-256 hash of the ciphertext (the CID) — not the content itself. Only someone with both the CID and your encryption key can read the record.',
                },
                {
                  q: 'What happens when a consent grant expires?',
                  a: 'The contract checks block timestamp at the time of the access call. Once the grant expires, hasConsent() returns false and any attempt to access the record is rejected on-chain. No action needed from the patient.',
                },
                {
                  q: 'Can a doctor write records without patient permission?',
                  a: "Yes — writing a record is a doctor action, not a patient action. The patient's permission is only required for a hospital to read a record. Think of it like a doctor filing a chart: the doctor can write it, but you control who gets to read it.",
                },
                {
                  q: 'Why does High severity require two doctors?',
                  a: 'High-severity records (major procedures, diagnoses with significant consequences) carry higher risk of error. The two-signature requirement mirrors real-world medical protocols for critical decisions and adds a layer of fraud resistance.',
                },
                {
                  q: 'What is IPFS-sim?',
                  a: "It's the local IPFS mock — a small Express server that accepts encrypted blobs, computes their SHA-256 hash as the CID, and stores them in memory. In production this would be replaced with a real IPFS node or Pinata. The CID format is identical.",
                },
                {
                  q: 'Can I use this on Polygon mainnet?',
                  a: 'The contracts are standard Solidity and will deploy to any EVM chain. You would need real MATIC for gas. Change the chain config in apps/web/src/providers.tsx from amoy to polygon.',
                },
                {
                  q: 'Where is my data stored?',
                  a: 'Record metadata (CID, severity, doctor, timestamp) lives on Polygon — permanently and publicly. Encrypted content is stored in IPFS (or the local mock). Your encryption key lives only in your wallet/browser — Velum never sees it.',
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p className="font-semibold text-bone mb-1">{q}</p>
                  <p className="text-bone/60 text-sm">{a}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t border-bone/10 pt-8 text-center text-xs text-bone/30">
            <p>
              Velum prototype — built for ZJU pitch demo.{' '}
              <Link href="/" className="hover:text-bone/60 transition-colors underline">
                Return to app
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
