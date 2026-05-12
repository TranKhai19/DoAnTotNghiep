const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const FundChain = await hre.ethers.getContractFactory("FundChain");
  const fundChain = await FundChain.deploy();
  await fundChain.waitForDeployment();

  const address = await fundChain.getAddress();
  console.log("✅ FundChain deployed to:", address);

  // Grant BACKEND_ROLE to the deployer so the server can record donations
  console.log("Granting BACKEND_ROLE to deployer...");
  const tx = await fundChain.addBackendNode(deployer.address);
  await tx.wait();
  console.log("✅ BACKEND_ROLE granted.");

  // Export ABI to server contracts folder
  const artifact = await hre.artifacts.readArtifact("FundChain");
  const outputDir = path.join(__dirname, "../../server/contracts");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "FundChain.json"),
    JSON.stringify({ abi: artifact.abi, address }, null, 2)
  );
  console.log("✅ ABI exported to server/contracts/FundChain.json");
  console.log("\n👉 Update your .env FUNDCHAIN_CONTRACT_ADDRESS =", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
