# VELUM — Decentralized Medical Records

> Startup pitch prototype: patient-controlled medical data with on-chain consent, ZK-verified access, and content-addressed encrypted storage.

**⚠ PROTOTYPE — For demonstration purposes only. Not for production medical use.**

---

## Quick Start

```bash
# Prerequisites: Node 20+, pnpm 10+, Foundry

# 1. Install dependencies
pnpm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Start local blockchain + deploy contracts
cd contracts
npx hardhat node &
npx hardhat run script/deploy.ts --network localhost

# 4. Start IPFS simulator
pnpm --filter ipfs-sim dev

# 5. Start web app
pnpm --filter web dev

# App runs at http://localhost:3000
```

## Foundry Tests

```bash
cd contracts
forge test --gas-report
```

Expected: **39 tests passing** across 3 contracts.

---

## Architecture

```
apps/
  web/          → Next.js 14 patient/doctor/hospital/audit dashboards
  ipfs-sim/     → Express CID store (SHA-256, simulates IPFS)
packages/
  shared-types/ → TypeScript interfaces shared across apps
  crypto-lib/   → Ed25519 keypairs, AES-GCM encryption, ZK claim sim
contracts/
  src/          → RecordRegistry, AccessController, CredentialIssuerRegistry
  test/         → Foundry test suite (39 tests)
  script/       → Hardhat deployment scripts
```

## Simulations (Not for Production)

| Component | Simulation | Production Replacement |
|-----------|-----------|------------------------|
| ZK proofs | Ed25519-signed JWT-style claims | Groth16 zk-SNARKs (snarkjs) |
| IPFS | SHA-256 Express store | Real IPFS / Pinata |
| Multi-sig | On-chain quorum voting | Safe multi-sig wallet |

## Network

- **Local dev:** Hardhat (chain 31337)
- **Testnet:** Polygon Amoy (chain 80002)

---

## License

MIT — See [LICENSE](LICENSE)
