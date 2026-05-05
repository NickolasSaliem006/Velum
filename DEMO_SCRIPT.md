# Velum Demo Script — 3-Minute Pitch

> Audience: judges/investors unfamiliar with blockchain. Lead with the problem, not the tech.

---

## Setup (30s before you start)

1. Open browser at `http://localhost:3000`
2. Open a second tab at `http://localhost:3001` (IPFS sim health check — should return `{"status":"ok"}`)
3. Have MetaMask installed, connected to Hardhat local network (chain 31337) or Polygon Amoy (80002)
4. Have 3 accounts ready in MetaMask: Patient, Doctor, Hospital
5. If running locally without deploy: demo mode works without a wallet — just open the pages

---

## Act 1 — The Problem (30 seconds)

**Say:** "Today, your medical records live in hospital databases. You have no copy, no control, and no way to know who accessed them. If Hospital A needs records from Hospital B, it's a phone call and a fax. In 2025."

**Show:** Landing page at `/`

**Say:** "Velum flips this. The patient owns the data. Hospitals and doctors only see what you explicitly permit — and every access is logged permanently on a public blockchain."

---

## Act 2 — Doctor Writes a Record (45 seconds)

**Navigate to:** `/doctor`

**Say:** "Here's the doctor interface. When a doctor writes a medical record, it's not stored in their system. The content is encrypted and content-addressed — think IPFS. Only a SHA-256 hash goes on-chain."

**Show in the form:**
1. Paste a patient wallet address (use the demo patient: `0xCaFe1234567890CaFe1234567890CaFe12345678`)
2. Paste a 64-char hex CID (use: `a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2`)
3. Select "High" severity — point to the co-sign warning that appears

**Say:** "High-severity records require a second doctor to co-sign before they're finalized. This is a multi-sig pattern — no single doctor can unilaterally write a critical record."

**If wallet connected:** Click "Write Record On-Chain" — show MetaMask popup, confirm, wait for "Confirming…" → success.
**If demo mode:** Show the pending co-signature panel on the right with the demo record.

---

## Act 3 — Patient Controls Access (60 seconds)

**Navigate to:** `/patient`

**Say:** "Now from the patient's perspective. These are your records — their severity, which doctor wrote them, when."

**Show:** Medical Records tab with the 3 demo records (Low/High/Medium)

**Say:** "Nobody can read the content without your permission. When you want a hospital to see a specific record, you grant time-limited consent."

**Click:** "Grant access →" on any record — switches to Grants tab with the record ID pre-filled.

**Fill the form:**
- Verifier address: any hospital address
- Duration: 7 days

**Say:** "This writes a consent grant on-chain. The hospital can now verify cryptographically that they're allowed to decrypt this record. When the 7 days expire — or if you revoke it — the access is gone. No asking a database admin. No paper forms."

**If wallet connected:** Submit and show MetaMask. **If demo mode:** Show the active grant in the list with the expiry badge.

**Show:** Revoke button. "One click. Immediate. Permanent on-chain revocation."

---

## Act 4 — Hospital View (30 seconds)

**Navigate to:** `/hospital`

**Say:** "The hospital dashboard shows only records where consent was granted to this hospital's address. Nothing else is visible — not even existence of other records."

**Show:** The 3 demo records with their expiry badges (green/yellow/red based on time remaining).

**Click one record to expand:** "The content CID is here. In production, the hospital uses this to fetch the encrypted blob from IPFS and decrypt it with the patient's access key. We can't show that part live without the full key ceremony — but the on-chain enforcement is real and testable."

---

## Act 5 — The Trust Model (15 seconds, closing)

**Navigate back to:** `/`

**Say:** "Three things make this different from a normal database: first, the patient holds the keys — we literally cannot grant access on their behalf. Second, every action is auditable by anyone on Polygon. Third, there's no central server to subpoena, hack, or sell. The math owns the data."

**Point to:** The prototype disclosure footer. "We're honest about what's simulated — ZK proofs, threshold encryption. The smart contracts, the consent enforcement, the on-chain audit trail — those are real and test-covered."

---

## Q&A Prep

**"What if the patient loses their private key?"**
→ Social recovery multisig (e.g. Safe) or guardian keys — this is a UX layer on top of the consent model, not a flaw in it.

**"How does the hospital actually decrypt the record?"**
→ The patient encrypts each record with a symmetric key, then wraps that key with the verifier's public key (ECIES). The on-chain grant is a pointer; the key is off-chain. In this prototype, wrapping is simulated — real ECIES is the P1 item.

**"Is this HIPAA compliant?"**
→ HIPAA is a US law; our target market is emerging markets with weaker health data infrastructure. The architecture is HIPAA-compatible (patient consent, audit log, encryption at rest) but we haven't done a formal assessment.

**"What's the gas cost per record?"**
→ ~80k gas on writeRecord (~$0.01 on Polygon). Consent grant is ~50k gas. Negligible at scale.

**"Why not just use a permissioned blockchain like Hyperledger?"**
→ Permissioned chains require someone to control the validator set. The threat model we're solving is the hospital or government *itself* being the bad actor. Public chain removes that trust assumption.

---

## Fallback (if nothing works)

Open the pages without connecting a wallet. Demo mode shows realistic data on all three pages. The core UX story is fully demonstrable without any live blockchain interaction.
