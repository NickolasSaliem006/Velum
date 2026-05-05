# VELUM — Current Build Status

**Cycle:** Milestone 5 — Pitch-Ready  
**Date:** 2026-05-05  
**Agent:** velum-builder (remote CCR)

---

## Completed

| Module                                       | Status | Notes                                                         |
| -------------------------------------------- | ------ | ------------------------------------------------------------- |
| Monorepo scaffold (pnpm + Turborepo)         | ✅     | `package.json`, `pnpm-workspace.yaml`, `turbo.json`           |
| `packages/shared-types`                      | ✅     | All core TS interfaces                                        |
| `packages/crypto-lib`                        | ✅     | Ed25519 keypair, sign/verify, AES-GCM encrypt, ZK sim         |
| `apps/ipfs-sim`                              | ✅     | Express CID store, SHA-256 dedup                              |
| `contracts/src/RecordRegistry.sol`           | ✅     | Doctor-role gated, multi-sig for High severity                |
| `contracts/src/AccessController.sol`         | ✅     | Patient consent, time-window, revocation                      |
| `contracts/src/CredentialIssuerRegistry.sol` | ✅     | Multi-sig proposal/approval flow                              |
| Foundry test suite (39 tests)                | ✅     | All passing; 97.87% line coverage                             |
| `contracts/script/deploy.ts`                 | ✅     | Hardhat deploy → deployments/\*.json                          |
| forge-std + OpenZeppelin v5                  | ✅     | lib/ submodules                                               |
| Vitest tests (22 tests)                      | ✅     | 15 crypto-lib + 7 zk-sim tests                                |
| IPFS-sim tests (9 tests)                     | ✅     | CID dedup + integrity                                         |
| GitHub Actions CI                            | ✅     | 4 jobs: solidity, typescript, e2e, build                      |
| `apps/web` — Next.js 15.5.15                 | ✅     | TypeScript config, App Router, all 8 routes static            |
| `apps/web` — landing page                    | ✅     | Feature grid, 4 role links (+ audit), prototype disclosure    |
| `apps/web` — patient dashboard               | ✅     | Records + grants tabs; live AES-GCM decrypt; ZK badge         |
| `apps/web` — doctor interface                | ✅     | Write record form, pending cosigns, severity selector         |
| `apps/web` — hospital dashboard              | ✅     | Consented records list, expiry countdown badges               |
| `apps/web` — audit trail                     | ✅     | Event feed, filter by type, tx hash search, Polygonscan links |
| wagmi v2 + RainbowKit v2                     | ✅     | Config, providers, dark theme                                 |
| `apps/web/src/lib/contracts.ts`              | ✅     | Inline ABIs, CONTRACT_ADDRESSES from env                      |
| Geist font                                   | ✅     | Via `geist` npm package, next/font class injection            |
| Husky + lint-staged                          | ✅     | Pre-commit: eslint --fix + prettier --write                   |
| ESLint 9 flat config                         | ✅     | @typescript-eslint, globals browser+node, no-undef off        |
| Playwright e2e                               | ✅     | 15 tests across all 5 pages                                   |
| Mobile-responsive polish                     | ✅     | Patient, doctor, hospital, audit — 44px touch targets         |
| README.md                                    | ✅     | Setup, commands, architecture, sim disclosure                 |
| DEMO_SCRIPT.md                               | ✅     | 3-minute pitch script with Q&A prep                           |
| PROGRESS_REPORT.md                           | ✅     | Full audit — 70 tests total                                   |

---

## Active Blockers

| Blocker                             | Impact                                              | Resolution                                                               |
| ----------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| No Polygon Amoy MATIC / private key | Contracts not deployed — demo runs in mock mode     | Get testnet MATIC from faucet, set `HARDHAT_PRIVATE_KEY` in `.env.local` |
| No WalletConnect project ID         | RainbowKit shows console warning (not user-visible) | Register free project at cloud.walletconnect.com                         |

---

## One Remaining P0

1. **Deploy all 3 contracts to Polygon Amoy**
   - Get MATIC: https://faucet.polygon.technology/
   - Set `HARDHAT_PRIVATE_KEY` in `contracts/.env`
   - Run: `cd contracts && npx hardhat run script/deploy.ts --network amoy`
   - Copy deployed addresses → `apps/web/.env.local`
   - Change landing badge to "Live on Polygon Amoy Testnet"

---

## Test Counts

| Suite              | Count  | Status                                                |
| ------------------ | ------ | ----------------------------------------------------- |
| Foundry (Solidity) | 39     | ✅ All passing                                        |
| Vitest crypto-lib  | 22     | ✅ All passing                                        |
| Vitest ipfs-sim    | 9      | ✅ All passing                                        |
| Playwright e2e     | 15     | ✅ Written (run: `pnpm --filter @velum/web test:e2e`) |
| **Total**          | **85** |                                                       |
