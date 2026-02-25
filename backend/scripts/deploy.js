import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying SecureVoting contract...");

  // Get the contract factory
  const SecureVoting = await hre.ethers.getContractFactory("SecureVoting");
  
  // Deploy the contract
  const voting = await SecureVoting.deploy();
  
  await voting.waitForDeployment();
  
  const address = await voting.getAddress();
  
  console.log("✅ SecureVoting deployed to:", address);
  console.log("\n📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update frontend/src/services/blockchainService.ts");
  console.log("   - Replace CONTRACT_ADDRESS with:", address);
  console.log("\n3. Verify the contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${address}`);
  console.log("\n4. Start the election:");
  console.log("   - Call startElection() from the deployer address");
  console.log("   - Duration: 86400 seconds (24 hours) or as needed");
  
  // Optional: Start election immediately (7 days)
  console.log("\n⏳ Starting election for 7 days...");
  const tx = await voting.startElection(7 * 24 * 60 * 60); // 7 days
  await tx.wait();
  console.log("✅ Election started!");
  
  const [active, startTime, endTime] = await voting.getElectionStatus();
  console.log("\n📊 Election Status:");
  console.log("Active:", active);
  console.log("Start Time:", new Date(Number(startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(endTime) * 1000).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
