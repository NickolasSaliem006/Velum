import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "MATIC"
  );

  // ── 1. RecordRegistry ────────────────────────────────────────────────────
  const RecordRegistry = await ethers.getContractFactory("RecordRegistry");
  const registry = await RecordRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("RecordRegistry deployed to:", registryAddr);

  // ── 2. AccessController ──────────────────────────────────────────────────
  const AccessController = await ethers.getContractFactory("AccessController");
  const access = await AccessController.deploy();
  await access.waitForDeployment();
  const accessAddr = await access.getAddress();
  console.log("AccessController deployed to:", accessAddr);

  // ── 3. CredentialIssuerRegistry ─────────────────────────────────────────
  // Quorum: deployer is sole admin in demo mode; set quorum = 1
  const CredentialIssuerRegistry = await ethers.getContractFactory(
    "CredentialIssuerRegistry"
  );
  const issuerReg = await CredentialIssuerRegistry.deploy(
    [deployer.address],
    1
  );
  await issuerReg.waitForDeployment();
  const issuerRegAddr = await issuerReg.getAddress();
  console.log("CredentialIssuerRegistry deployed to:", issuerRegAddr);

  // ── Write deployment manifest ────────────────────────────────────────────
  const network = await ethers.provider.getNetwork();
  const manifest = {
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      RecordRegistry: registryAddr,
      AccessController: accessAddr,
      CredentialIssuerRegistry: issuerRegAddr,
    },
  };

  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2));
  console.log("Deployment manifest written to:", outFile);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
