# VELUM — Decentralized Medical Records

> Startup pitch prototype: patient-controlled medical data with on-chain consent,
> ZK-verified access, and content-addressed encrypted storage.

[![CI](https://github.com/NickolasSaliem006/Velum/actions/workflows/ci.yml/badge.svg)](https://github.com/NickolasSaliem006/Velum/actions/workflows/ci.yml)

**⚠ PROTOTYPE — For demonstration purposes only. Not for production medical use.**

---

## Quick Start

```bash
# Prerequisites: Node 20+, pnpm 10+, Foundry

# 1. Install dependencies
pnpm install

# 2. Copy env files
cp apps/web/.env.example apps/web/.env.local
cp contracts/.env.example contracts/.env
# Fill in HARDHAT_PRIVATE_KEY (needs Polygon Amoy MATIC)
# Get free test MATIC: https://faucet.polygon.technology/

# 3. Deploy contracts to Polygon Amoy
cd contracts
npx hardhat run script/deploy.ts --network amoy
# → writes contracts/deployments/amoy.json
# → copy deployed addresses into apps/web/.env.local

# 4. Start IPFS simulator
pnpm --filter @velum/ipfs-sim dev

# 5. Start web app
pnpm --filter @velum/web dev

# App runs at http://localhost:3000
```

**Demo mode (no wallet, no deploy needed):**

```bash
pnpm install
pnpm --filter @velum/web dev
# All pages work with simulated data
```

---

## Tests

```bash
# All unit tests (Foundry + Vitest)
pnpm test
# → 39 Foundry + 22 Vitest crypto-lib + 9 Vitest ipfs-sim = 70 tests

# Playwright e2e (requires dev server)
pnpm --filter @velum/web test:e2e
# → 19 tests across all 5 pages

# Type-check all packages
pnpm type-check

# Solidity tests with gas report
cd contracts && forge test --gas-report
```

Expected: **42 Solidity tests passing, 100% line coverage (all 3 contracts).**

---

## Architecture

```
apps/
  web/          → Next.js 15 — patient/doctor/hospital/audit/docs dashboards
  ipfs-sim/     → Express CID store (SHA-256, simulates IPFS on port 4001)
packages/
  shared-types/ → TypeScript interfaces shared across apps
  crypto-lib/   → Ed25519 keypairs, AES-GCM encryption, ZK claim simulation
contracts/
  src/          → RecordRegistry, AccessController, CredentialIssuerRegistry
  test/         → Foundry test suite (39 tests, 97.87% line coverage)
  script/       → deploy.ts, grantRole.ts (Hardhat)
```

**Monorepo:** pnpm workspaces + Turborepo  
**Chain:** Polygon Amoy testnet (chain ID 80002)  
**Wallet:** wagmi v2 + RainbowKit v2

---

## Simulations (Clearly Labeled)

| Component    | Simulation              | Production Replacement               |
| ------------ | ----------------------- | ------------------------------------ |
| ZK proofs    | Ed25519-signed claims   | Groth16 zk-SNARKs (snarkjs + Circom) |
| IPFS         | In-memory SHA-256 store | Real IPFS / Pinata                   |
| Key wrapping | Raw AES key in base64   | ECIES / threshold encryption         |

Real components: Solidity smart contracts, AES-256-GCM, Ed25519 signatures, on-chain consent enforcement.

---

## Go Live (Polygon Amoy)

1. Get testnet MATIC: `https://faucet.polygon.technology/`
2. Set `HARDHAT_PRIVATE_KEY` in `contracts/.env`
3. `cd contracts && npx hardhat run script/deploy.ts --network amoy`
4. Copy deployed addresses into `apps/web/.env.local`
5. Grant `DOCTOR_ROLE` to doctor wallets: `npx hardhat run script/grantRole.ts --network amoy`

See [`/docs`](http://localhost:3000/docs) for the full user manual.

---

## License

MIT
