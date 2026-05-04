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
