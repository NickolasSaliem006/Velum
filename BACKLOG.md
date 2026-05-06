# VELUM — Prioritized Backlog

Format: `[Priority] Task — Why`
Last updated: 2026-05-06

---

## P0 — Must have for pitch demo

- [x] Patient dashboard: view records, grant/revoke consent ✅
- [x] Doctor dashboard: write record, cosign High-severity ✅
- [x] Hospital dashboard: consented records list with expiry ✅
- [x] Crypto-lib Vitest tests: Ed25519 + AES-GCM + ZK claims (22 tests) ✅
- [x] IPFS-sim Vitest tests: CID dedup + integrity (9 tests) ✅
- [x] Solidity tests: full coverage 42 tests, 100% lines (all 3 contracts) ✅
- [x] Demo script: 3-minute pitch + Q&A prep ✅
- [x] README with quickstart ✅
- [x] wagmi + RainbowKit wired to all contracts ✅
- [ ] **Deploy contracts to Polygon Amoy** — needs MATIC + private key
      `npx hardhat run contracts/script/deploy.ts --network amoy`

---

## P1 — Strong pitch signal

- [x] Audit trail page: on-chain event feed with filter + search ✅
- [x] Audit trail linked from landing page ✅
- [x] ZK access claim badge in patient UI ✅
- [x] Live AES-GCM encrypt/decrypt demo in browser ✅
- [x] CI pipeline (GitHub Actions): forge + vitest + playwright + build ✅
- [x] Geist font properly injected via next/font ✅
- [x] Playwright e2e config + 14 demo flow tests (15 after audit link) ✅
- [x] Mobile-responsive polish: patient + doctor + hospital + audit ✅
- [x] Husky + lint-staged pre-commit hooks ✅
- [x] Next.js upgraded to 15.5.15 ✅
- [ ] Record backup demo video — must do manually

---

## P2 — Nice to have

- [ ] WalletConnect project ID (suppresses RainbowKit console warning) — register free at cloud.walletconnect.com
- [x] Slither static analysis — added as CI job (`crytic/slither-action`, fail-on: high) ✅
- [ ] Polygonscan contract verification after Amoy deploy

---

## P3 — Future / post-pitch

- [ ] Replace ZK simulation with real Groth16 circuits (snarkjs + Circom)
- [ ] IPFS sim → real IPFS/Pinata integration
- [ ] Real ECIES key wrapping (replace wrappedKey simulation)
- [ ] Multi-sig wallet (Safe) for CredentialIssuerRegistry
- [ ] Mobile app (Expo + wagmi)
- [ ] Slither security audit + formal verification
