# VELUM — Architecture Decision Records

---

## ADR-001: Ed25519 over secp256k1 for ZK simulation

**Status:** Accepted  
**Date:** 2026-05-04

**Context:** Need a signing scheme for the ZK access claim simulation.

**Decision:** Use Ed25519 (`@noble/curves/ed25519`) instead of Ethereum's secp256k1.

**Rationale:** Ed25519 is the standard for modern ZK-friendly signature systems (Groth16 circuits use BabyJubJub which is more similar to Ed25519's curve arithmetic). Using Ed25519 now makes a future swap to a real ZK circuit more natural. secp256k1 would over-couple the simulation to Ethereum signing semantics.

**Consequences:** Cannot use `ethers.signMessage` for claim issuance; must use crypto-lib directly.

---

## ADR-002: Content-addressed storage simulation (Express) over real IPFS

**Status:** Accepted  
**Date:** 2026-05-04

**Context:** IPFS requires a running daemon; adds complexity for local dev and CI.

**Decision:** Build `apps/ipfs-sim` — an Express server with SHA-256 CID semantics.

**Rationale:** Preserves the content-addressed storage contract (CID = hash of content). Swapping to real IPFS later is a one-line config change. Avoids daemon management in CI.

**Consequences:** Simulated CIDs are hex SHA-256, not IPFS multihash format. A migration adapter will be needed when switching to real IPFS.

---

## ADR-003: Foundry for tests, Hardhat for deployment

**Status:** Accepted  
**Date:** 2026-05-04

**Context:** Both tools have strengths; need both test quality and TypeScript deployment scripts.

**Decision:** Use Foundry (`forge`) for all Solidity unit tests; use Hardhat with TypeScript for deployment scripts.

**Rationale:** Foundry's `vm.prank` / `vm.warp` / `vm.expectRevert` are superior for Solidity-level testing. Hardhat's TypeScript integration is better for deployment manifests and frontend ABI generation.

**Consequences:** Dual toolchain complexity. Mitigated by clear separation: `contracts/test/` = Foundry only, `contracts/script/` = Hardhat only.

---

## ADR-004: Polygon Amoy over Ethereum Sepolia

**Status:** Accepted  
**Date:** 2026-05-04

**Context:** Need a live testnet for pitch demo.

**Decision:** Deploy to Polygon Amoy (chain ID 80002).

**Rationale:** Amoy is the successor to Mumbai, has a working faucet, and gas costs are negligible compared to Sepolia. Medical records app needs low-cost transactions for viability story.

**Consequences:** Need to configure wagmi for Amoy. MetaMask requires manual network add for Amoy.

---

## ADR-005: AES-GCM over AES-CBC for record encryption

**Status:** Accepted  
**Date:** 2026-05-04

**Context:** Need symmetric encryption for medical record content before IPFS upload.

**Decision:** Use AES-GCM (256-bit key, 96-bit IV) via Web Crypto API.

**Rationale:** AES-GCM provides authenticated encryption — tampering with ciphertext is detectable. AES-CBC requires separate HMAC. Web Crypto API is available in browsers and Node.js 18+ natively.

**Consequences:** IV must be stored alongside ciphertext (included in `EncryptedRecord` type). Decryption will throw on tampered data — treated as a security feature.

---

## ADR-006: Separate RecordRegistry and AccessController contracts

**Status:** Accepted
**Date:** 2026-05-04

**Context:** Could embed consent logic inside RecordRegistry or keep them separate.

**Decision:** Two independent contracts — doctors interact with RecordRegistry, patients interact with AccessController.

**Rationale:** Separation of concerns: the two contracts have different admin roles, different actors, and different upgrade cadences. A patient should never need DOCTOR_ROLE. AccessController can be replaced without touching the immutable record store.

**Consequences:** The frontend must wire two ABIs. The deploy script deploys both independently with no constructor cross-dependency.

---

## ADR-007: High-severity records require doctor cosign

**Status:** Accepted
**Date:** 2026-05-04

**Context:** High-stakes diagnoses (oncology, HIV, major surgery) warrant extra verification.

**Decision:** `Severity.High` records have `finalized = false` until a second doctor calls `cosignRecord`. Low/Medium are immediately finalized.

**Rationale:** Mirrors real clinical peer-review protocol. Demonstrates multi-party smart contract flows in the pitch demo. The `requiresMultiSig` flag is on-chain — hospitals can check finalization status before accessing.

**Consequences:** Doctor UI needs a "Pending Co-Signatures" queue. Second doctor must have DOCTOR_ROLE; cannot be the same address as the original author (enforced on-chain).

---

## ADR-008: pnpm workspaces + Turborepo (not Nx or Lerna)

**Status:** Accepted
**Date:** 2026-05-04

**Context:** Four packages (apps/web, apps/ipfs-sim, packages/crypto-lib, packages/shared-types) need coordinated builds and a shared devDependency graph.

**Decision:** pnpm workspaces for package management, Turborepo for task orchestration.

**Rationale:** pnpm's content-addressed store prevents duplicate node_modules across packages. Turborepo's `build` → `^build` dependency graph orders builds correctly with no config overhead. Nx adds code generation and plugin complexity that isn't needed at this scale.

**Consequences:** `pnpm install` at the root installs all packages. `pnpm build` at the root builds all packages in dependency order. CI uses `pnpm install --frozen-lockfile`.

---

## ADR-009: No server-side API or database in apps/web

**Status:** Accepted
**Date:** 2026-05-04

**Context:** Could add Next.js API routes and a database for caching or session management.

**Decision:** `apps/web` is a purely client-side app — no API routes, no server-side database.

**Rationale:** The blockchain is the backend. Adding a server-side database would re-centralize a system whose core value proposition is decentralization. Next.js server components are used for static pages (`/docs`) but all role-specific pages use client components that call wagmi hooks directly.

**Consequences:** No caching layer — all on-chain reads go through wagmi/viem. In production, a subgraph (The Graph protocol) would replace direct event scanning.

---

## ADR-010: Playwright over Cypress for E2E testing

**Status:** Accepted
**Date:** 2026-05-04

**Context:** Need E2E tests that cover all five pages including the client-side crypto demo.

**Decision:** Playwright with the built-in `webServer` config.

**Rationale:** Playwright's `webServer` block auto-starts the Next.js dev server, making the test suite self-contained. Native TypeScript. `reuseExistingServer: !process.env.CI` allows local reuse of a running dev server. Cypress requires a separate dev server process and a bridge for module types.

**Consequences:** Tests run against the live app (not mocked), so the crypto demo path (`Show encrypted` → `Decrypt`) exercises real Web Crypto API calls in Chromium.
