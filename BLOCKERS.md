# VELUM — Active Blockers

---

## BLOCKER-001: No wallet private key for testnet deployment

**Severity:** Medium  
**Blocking:** Polygon Amoy testnet deploy

**Description:** `HARDHAT_PRIVATE_KEY` env var is not set. Cannot deploy to Amoy without a funded wallet.

**Resolution:** 
1. Create a throwaway wallet: `cast wallet generate`
2. Fund it from Polygon Amoy faucet: https://faucet.polygon.technology/
3. Set in `.env`: `HARDHAT_PRIVATE_KEY=0x...`

**Workaround:** All development uses Hardhat localhost (chain 31337). Demo can run fully locally without testnet.

---

## BLOCKER-002: WalletConnect Project ID not set

**Severity:** Low  
**Blocking:** wagmi WalletConnect provider in production

**Description:** `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` not configured.

**Resolution:** Register at https://cloud.walletconnect.com/ (free tier sufficient).

**Workaround:** MetaMask injected provider works without WalletConnect ID for local demo.

---

## BLOCKER-003: pnpm native build scripts pending approval

**Severity:** Low (resolved)  
**Status:** ✅ Resolved by adding `pnpm.onlyBuiltDependencies` to root package.json

---

## BLOCKER-004: forge-std and openzeppelin installed as git submodules

**Severity:** Low  
**Blocking:** Clean CI on fresh checkout without submodule init

**Description:** `forge install` creates git submodules. CI must run `git submodule update --init --recursive` before `forge test`.

**Resolution:** Add to `.github/workflows/ci.yml` (done in current cycle).
