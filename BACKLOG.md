# VELUM — Prioritized Backlog

Format: `[Priority] Task — Why`
Last updated: 2026-05-05

---

## P0 — Must have for pitch demo

- [x] Patient dashboard: view records, grant/revoke consent ✅
- [x] Doctor dashboard: write record, cosign High-severity ✅
- [x] Hospital dashboard: consented records list with expiry ✅
- [x] Crypto-lib Vitest tests: Ed25519 + AES-GCM + ZK claims (22 tests) ✅
- [x] IPFS-sim Vitest tests: CID dedup + integrity (9 tests) ✅
- [x] Solidity tests: full coverage 39 tests, 97.87% lines ✅
- [x] Demo script: 3-minute pitch + Q&A prep ✅
- [x] README with quickstart ✅
- [x] wagmi + RainbowKit wired to all contracts ✅
- [ ] **Deploy contracts to Polygon Amoy** — needs MATIC + private key
      `npx hardhat run contracts/script/deploy.ts --network amoy`

---

## P1 — Strong pitch signal

- [x] Audit trail page: on-chain event feed with filter + search ✅
- [x] ZK access claim badge in patient UI ✅
- [x] Live AES-GCM encrypt/decrypt demo in browser ✅
- [x] CI pipeline (GitHub Actions): forge + vitest + playwright + build ✅
- [x] Geist font properly injected via next/font ✅
- [x] Playwright e2e config + 14 demo flow tests ✅
- [ ] Record backup demo video — must do manually
- [ ] Mobile-responsive polish pass on patient/doctor pages

---

## P2 — Nice to have

- [ ] Patch Next.js to latest 14.x (current: 14.2.29, vuln in older versions)
- [ ] Husky + lint-staged pre-commit hooks
- [ ] Rainmeter desktop widget JSON export
- [ ] Daily digest notifications (notifications/digest.py — wrong project)

---

## P3 — Future / post-pitch

- [ ] Replace ZK simulation with real Groth16 circuits (snarkjs + Circom)
- [ ] IPFS sim → real IPFS/Pinata integration
- [ ] Real ECIES key wrapping (replace wrappedKey simulation)
- [ ] Multi-sig wallet (Safe) for CredentialIssuerRegistry
- [ ] Mobile app (Expo + wagmi)
- [ ] Slither security audit + formal verification
