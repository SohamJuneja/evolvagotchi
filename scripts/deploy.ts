import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Evolvagotchi to Somnia Devnet...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "STT\n");

  // Deploy contract
  console.log("📦 Deploying Evolvagotchi contract...");
  const Evolvagotchi = await ethers.getContractFactory("Evolvagotchi");
  const evolvagotchi = await Evolvagotchi.deploy();
  
  await evolvagotchi.waitForDeployment();
  const contractAddress = await evolvagotchi.getAddress();

  console.log("✅ Evolvagotchi deployed to:", contractAddress);
  console.log("\n📋 Contract Details:");
  console.log("   Name:", await evolvagotchi.name());
  console.log("   Symbol:", await evolvagotchi.symbol());
  console.log("   Owner:", await evolvagotchi.owner());

  // Save deployment info
  const deploymentInfo = {
    network: "Somnia Devnet",
    contractAddress: contractAddress,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment complete!");
  console.log("🔗 View on Explorer: https://somniascan.io/address/" + contractAddress);
  console.log("\n📝 Next steps:");
  console.log("   1. Save the contract address:", contractAddress);
  console.log("   2. Update your frontend with this address");
  console.log("   3. Start building the dApp!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });