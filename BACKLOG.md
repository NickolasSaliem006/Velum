# VELUM — Prioritized Backlog

Format: `[Priority] Task — Why`

---

## P0 — Must have for pitch demo

- [ ] Patient dashboard: view records, grant/revoke consent (Milestone 4)
- [ ] Doctor dashboard: write record, cosign High-severity (Milestone 5)
- [ ] Crypto-lib Vitest tests: verify Ed25519 + AES-GCM correctness
- [ ] IPFS-sim Vitest tests: verify CID dedup + integrity check
- [ ] Hardhat local deploy smoke test: verify all 3 contracts deploy cleanly
- [ ] Demo script walkthrough: patient → doctor → verifier end-to-end
- [ ] README with `npm run dev` quickstart
- [ ] Wallet connect (MetaMask via wagmi) wired to RecordRegistry

## P1 — Strong pitch signal

- [ ] Hospital dashboard: second-sig for High severity (Milestone 6)
- [ ] Audit log page: on-chain event feed (Milestone 7)
- [ ] CI pipeline (GitHub Actions): forge test + vitest on PR
- [ ] ZK claim verification in UI: display proof badge
- [ ] Mobile-responsive landing page polish

## P2 — Nice to have

- [ ] Polygon Amoy testnet deploy + faucet ETH
- [ ] Rainmeter-style dashboard widget JSON export
- [ ] notifications/digest module (daily summary)
- [ ] Husky + lint-staged pre-commit hooks
- [ ] E2E Playwright tests for patient flow

## P3 — Future / post-pitch

- [ ] Replace ZK simulation with real Groth16 circuits (snarkjs)
- [ ] IPFS sim → real IPFS/Pinata integration
- [ ] Multi-sig wallet (Safe) for CredentialIssuerRegistry
- [ ] Access token revocation dashboard for verifiers
- [ ] Mobile app (Expo + wagmi)
