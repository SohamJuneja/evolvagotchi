import { ethers } from "hardhat";

async function main() {
  console.log("🏆 Deploying AchievementBadge contract...\n");

  // Get the existing Evolvagotchi contract address
  const EVOLVAGOTCHI_ADDRESS = "0xED174eE36a8027B4F82ebe7B756CDE7bAeae2249";
  
  console.log("📝 Evolvagotchi Contract:", EVOLVAGOTCHI_ADDRESS);

  // Deploy AchievementBadge
  const AchievementBadge = await ethers.getContractFactory("AchievementBadge");
  const achievementBadge = await AchievementBadge.deploy();

  await achievementBadge.waitForDeployment();

  const achievementAddress = await achievementBadge.getAddress();
  console.log("✅ AchievementBadge deployed to:", achievementAddress);

  // Set the Evolvagotchi contract address
  console.log("\n🔗 Linking to Evolvagotchi contract...");
  const tx = await achievementBadge.setEvolvagotchiContract(EVOLVAGOTCHI_ADDRESS);
  await tx.wait();
  console.log("✅ Contracts linked successfully!");

  // Display achievement list
  console.log("\n🎖️  Available Achievements:");
  const achievements = await achievementBadge.getAllAchievements();
  
  for (let i = 0; i < achievements.length; i++) {
    const achievement = achievements[i];
    console.log(`   ${achievement.icon} ${achievement.name} (${achievement.rarity})`);
    console.log(`      ${achievement.description}`);
  }

  console.log("\n✨ Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Evolvagotchi:     ", EVOLVAGOTCHI_ADDRESS);
  console.log("AchievementBadge: ", achievementAddress);
  console.log("Network:          ", "Somnia Devnet");
  console.log("Total Achievements:", achievements.length);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📋 Next Steps:");
  console.log("1. Update frontend with AchievementBadge address");
  console.log("2. Copy ABI to frontend: contracts/AchievementBadge.json");
  console.log("3. Implement achievement service and UI components");
  console.log("4. Test achievement awarding!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
