import { ethers } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Grant DOCTOR_ROLE on RecordRegistry to one or more wallet addresses.
 *
 * Usage:
 *   npx hardhat run script/grantRole.ts --network amoy
 *
 * Configure the addresses to credential below, or pass them via env:
 *   GRANT_DOCTOR=0xA,0xB npx hardhat run script/grantRole.ts --network amoy
 */

async function main() {
  const [admin] = await ethers.getSigners()
  const network = await ethers.provider.getNetwork()

  // ── Load deployment manifest ─────────────────────────────────────────────
  const manifestPath = path.join(__dirname, '..', 'deployments', `${network.name}.json`)
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `No deployment manifest found for network "${network.name}". ` +
        `Run deploy.ts first: npx hardhat run script/deploy.ts --network ${network.name}`
    )
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
    contracts: { RecordRegistry: string }
  }
  const registryAddr = manifest.contracts.RecordRegistry

  // ── Target addresses ────────────────────────────────────────────────────
  const envDoctors = process.env['GRANT_DOCTOR']
  const doctorAddresses: string[] = envDoctors
    ? envDoctors.split(',').map((a) => a.trim())
    : [
        // Add doctor wallet addresses here for a one-off grant:
        // '0xYOUR_DOCTOR_WALLET',
      ]

  if (doctorAddresses.length === 0) {
    console.log(
      'No addresses specified. Set GRANT_DOCTOR=0xAddr1,0xAddr2 or edit the array in the script.'
    )
    return
  }

  // ── Connect to contract ──────────────────────────────────────────────────
  const registry = await ethers.getContractAt('RecordRegistry', registryAddr, admin)
  const DOCTOR_ROLE: string = await (
    registry as unknown as { DOCTOR_ROLE(): Promise<string> }
  ).DOCTOR_ROLE()

  console.log(`Network:         ${network.name} (chain ${network.chainId})`)
  console.log(`Admin:           ${admin.address}`)
  console.log(`RecordRegistry:  ${registryAddr}`)
  console.log(`DOCTOR_ROLE:     ${DOCTOR_ROLE}`)
  console.log()

  // ── Grant role to each address ───────────────────────────────────────────
  for (const addr of doctorAddresses) {
    if (!ethers.isAddress(addr)) {
      console.warn(`  SKIP — invalid address: ${addr}`)
      continue
    }

    const already = await (
      registry as unknown as {
        hasRole(role: string, account: string): Promise<boolean>
      }
    ).hasRole(DOCTOR_ROLE, addr)

    if (already) {
      console.log(`  SKIP — ${addr} already has DOCTOR_ROLE`)
      continue
    }

    console.log(`  Granting DOCTOR_ROLE → ${addr} ...`)
    const tx = await (
      registry as unknown as {
        grantRole(role: string, account: string): Promise<{ hash: string; wait(): Promise<void> }>
      }
    ).grantRole(DOCTOR_ROLE, addr)
    await tx.wait()
    console.log(`  ✓ tx: ${tx.hash}`)
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
