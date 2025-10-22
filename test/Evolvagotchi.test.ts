import { expect } from "chai";
import { ethers } from "hardhat";
import { Evolvagotchi } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Evolvagotchi - Complete Test Suite", function () {
  let evolvagotchi: Evolvagotchi;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const MINT_COST = ethers.parseEther("0.01");
  const FEED_COST = ethers.parseEther("0.001");

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const EvolvagotchiFactory = await ethers.getContractFactory("Evolvagotchi");
    evolvagotchi = await EvolvagotchiFactory.deploy();
    await evolvagotchi.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await evolvagotchi.name()).to.equal("Evolvagotchi");
      expect(await evolvagotchi.symbol()).to.equal("EVOLV");
    });

    it("Should set the deployer as owner", async function () {
      expect(await evolvagotchi.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint a new pet with correct initial stats", async function () {
      const tx = await evolvagotchi.connect(user1).mint("Sparky", { value: MINT_COST });
      await tx.wait();

      const petInfo = await evolvagotchi.getPetInfo(0);
      
      expect(petInfo.name).to.equal("Sparky");
      expect(petInfo.evolutionStage).to.equal(0); // Egg stage
      expect(petInfo.happiness).to.equal(100);
      expect(petInfo.hunger).to.equal(0);
      expect(petInfo.health).to.equal(100);
    });

    it("Should fail if payment is insufficient", async function () {
      await expect(
        evolvagotchi.connect(user1).mint("Sparky", { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail if name is empty", async function () {
      await expect(
        evolvagotchi.connect(user1).mint("", { value: MINT_COST })
      ).to.be.revertedWith("Invalid name length");
    });

    it("Should fail if name is too long", async function () {
      const longName = "a".repeat(21);
      await expect(
        evolvagotchi.connect(user1).mint(longName, { value: MINT_COST })
      ).to.be.revertedWith("Invalid name length");
    });

    it("Should emit PetMinted event", async function () {
      await expect(evolvagotchi.connect(user1).mint("Sparky", { value: MINT_COST }))
        .to.emit(evolvagotchi, "PetMinted")
        .withArgs(0, user1.address, "Sparky");
    });

    it("Should allow multiple users to mint", async function () {
      await evolvagotchi.connect(user1).mint("Pet1", { value: MINT_COST });
      await evolvagotchi.connect(user2).mint("Pet2", { value: MINT_COST });

      expect(await evolvagotchi.ownerOf(0)).to.equal(user1.address);
      expect(await evolvagotchi.ownerOf(1)).to.equal(user2.address);
    });
  });

  describe("Autonomous State Updates (AI Agent Logic)", function () {
    beforeEach(async function () {
      // Mint a pet for testing
      await evolvagotchi.connect(user1).mint("TestPet", { value: MINT_COST });
    });

    it("Should increase hunger over time", async function () {
      // Mine 100 blocks
      await ethers.provider.send("hardhat_mine", ["0x64"]); // 100 blocks in hex

      await evolvagotchi.updateState(0);
      const petInfo = await evolvagotchi.getPetInfo(0);

      // After 100 blocks, hunger should increase by 10 (100 / BLOCKS_PER_HUNGER_POINT)
      expect(petInfo.hunger).to.equal(10);
    });

    it("Should decrease happiness over time", async function () {
      // Mine 200 blocks
      await ethers.provider.send("hardhat_mine", ["0xc8"]); // 200 blocks in hex

      await evolvagotchi.updateState(0);
      const petInfo = await evolvagotchi.getPetInfo(0);

      // After 200 blocks, happiness should decrease by 10 (200 / BLOCKS_PER_HAPPINESS_DECAY)
      expect(petInfo.happiness).to.equal(90);
    });

    it("Should decrease health when hunger is very high", async function () {
      // Mine enough blocks to make hunger go very high
      await ethers.provider.send("hardhat_mine", ["0x3e8"]); // 1000 blocks

      await evolvagotchi.updateState(0);
      let petInfo = await evolvagotchi.getPetInfo(0);

      // Hunger should be capped at 100
      expect(petInfo.hunger).to.equal(100);
      
      // Health should have decreased because hunger > 80
      expect(petInfo.health).to.be.lessThan(100);
    });

    it("Should not update if no blocks have passed", async function () {
      const initialInfo = await evolvagotchi.getPetInfo(0);
      
      await evolvagotchi.updateState(0);
      const updatedInfo = await evolvagotchi.getPetInfo(0);

      expect(updatedInfo.hunger).to.equal(initialInfo.hunger);
      expect(updatedInfo.happiness).to.equal(initialInfo.happiness);
    });

    it("Should cap hunger at 100", async function () {
      // Mine a huge number of blocks
      await ethers.provider.send("hardhat_mine", ["0x7d0"]); // 2000 blocks

      await evolvagotchi.updateState(0);
      const petInfo = await evolvagotchi.getPetInfo(0);

      expect(petInfo.hunger).to.equal(100);
      expect(petInfo.hunger).to.not.be.greaterThan(100);
    });

    it("Should allow anyone to call updateState", async function () {
      await ethers.provider.send("hardhat_mine", ["0x64"]); // 100 blocks

      // user2 updates user1's pet - this should work
      await expect(evolvagotchi.connect(user2).updateState(0)).to.not.be.reverted;
    });
  });

  describe("Feeding", function () {
    beforeEach(async function () {
      await evolvagotchi.connect(user1).mint("TestPet", { value: MINT_COST });
    });

    it("Should decrease hunger and increase happiness", async function () {
      // Make pet hungry first
      await ethers.provider.send("hardhat_mine", ["0x64"]); // 100 blocks
      await evolvagotchi.updateState(0);

      await evolvagotchi.connect(user1).feed(0, { value: FEED_COST });
      const petInfo = await evolvagotchi.getPetInfo(0);

      expect(petInfo.hunger).to.equal(0); // Was 10, decreased by 30, floored at 0
      expect(petInfo.happiness).to.equal(100); // Was 90, increased by 10
    });

    it("Should fail if not called by owner", async function () {
      await expect(
        evolvagotchi.connect(user2).feed(0, { value: FEED_COST })
      ).to.be.revertedWith("Not your pet");
    });

    it("Should fail if payment is insufficient", async function () {
      await expect(
        evolvagotchi.connect(user1).feed(0, { value: ethers.parseEther("0.0001") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should emit PetFed event", async function () {
      await ethers.provider.send("hardhat_mine", ["0x64"]);
      await evolvagotchi.updateState(0);

      await expect(evolvagotchi.connect(user1).feed(0, { value: FEED_COST }))
        .to.emit(evolvagotchi, "PetFed");
    });
  });

  describe("Playing", function () {
    beforeEach(async function () {
      await evolvagotchi.connect(user1).mint("TestPet", { value: MINT_COST });
    });

    it("Should increase happiness", async function () {
      // Decrease happiness first
      await ethers.provider.send("hardhat_mine", ["0xc8"]); // 200 blocks
      await evolvagotchi.updateState(0);

      const beforePlay = await evolvagotchi.getPetInfo(0);
      await evolvagotchi.connect(user1).play(0);
      const afterPlay = await evolvagotchi.getPetInfo(0);

      expect(afterPlay.happiness).to.be.greaterThan(beforePlay.happiness);
    });

    it("Should cap happiness at 100", async function () {
      // Pet starts at 100 happiness
      await evolvagotchi.connect(user1).play(0);
      const petInfo = await evolvagotchi.getPetInfo(0);

      expect(petInfo.happiness).to.equal(100);
    });

    it("Should fail if not called by owner", async function () {
      await expect(
        evolvagotchi.connect(user2).play(0)
      ).to.be.revertedWith("Not your pet");
    });

    it("Should emit PetPlayed event", async function () {
      await expect(evolvagotchi.connect(user1).play(0))
        .to.emit(evolvagotchi, "PetPlayed");
    });
  });

  describe("Evolution", function () {
    beforeEach(async function () {
      await evolvagotchi.connect(user1).mint("TestPet", { value: MINT_COST });
    });

    it("Should evolve from Egg to Baby after sufficient blocks", async function () {
      // Mine half of BABY_TO_TEEN_BLOCKS (500 blocks for Egg -> Baby)
      await ethers.provider.send("hardhat_mine", ["0x1f4"]); // 500 blocks

      await evolvagotchi.updateState(0);
      const petInfo = await evolvagotchi.getPetInfo(0);

      expect(petInfo.evolutionStage).to.equal(1); // Baby stage
    });

    it("Should evolve from Baby to Teen with time and happiness", async function () {
      // First, evolve to Baby
      await ethers.provider.send("hardhat_mine", ["0x1f4"]); // 500 blocks
      await evolvagotchi.updateState(0);

      // Keep feeding and playing to maintain high happiness
      await evolvagotchi.connect(user1).feed(0, { value: FEED_COST });
      await evolvagotchi.connect(user1).play(0);
      
      // Mine enough blocks to reach Teen age requirement (1000 total blocks from birth)
      await ethers.provider.send("hardhat_mine", ["0x1f4"]); // 500 more blocks
      
      // Feed and play again to ensure happiness stays high
      await evolvagotchi.connect(user1).feed(0, { value: FEED_COST });
      await evolvagotchi.connect(user1).play(0);
      
      await evolvagotchi.updateState(0);
      const petInfo = await evolvagotchi.getPetInfo(0);

      expect(petInfo.evolutionStage).to.equal(2); // Teen stage
    });

    it("Should NOT evolve if happiness is too low", async function () {
      // Evolve to Baby first
      await ethers.provider.send("hardhat_mine", ["0x1f4"]); // 500 blocks
      await evolvagotchi.updateState(0);

      // Mine blocks to decrease happiness below threshold
      await ethers.provider.send("hardhat_mine", ["0x7d0"]); // 2000 blocks
      await evolvagotchi.updateState(0);

      const petInfo = await evolvagotchi.getPetInfo(0);
      expect(petInfo.evolutionStage).to.equal(1); // Still Baby
      expect(petInfo.happiness).to.be.lessThan(60);
    });

    it("Should emit PetEvolved event on evolution", async function () {
      await ethers.provider.send("hardhat_mine", ["0x1f4"]); // 500 blocks

      await expect(evolvagotchi.updateState(0))
        .to.emit(evolvagotchi, "PetEvolved")
        .withArgs(0, 1); // Token 0, evolved to stage 1 (Baby)
    });
  });

  describe("Batch Operations", function () {
    it("Should update multiple pets in one transaction", async function () {
      // Mint 3 pets
      await evolvagotchi.connect(user1).mint("Pet1", { value: MINT_COST });
      await evolvagotchi.connect(user1).mint("Pet2", { value: MINT_COST });
      await evolvagotchi.connect(user2).mint("Pet3", { value: MINT_COST });

      // Mine blocks
      await ethers.provider.send("hardhat_mine", ["0x64"]); // 100 blocks

      // Batch update all pets
      await evolvagotchi.batchUpdateState([0, 1, 2]);

      // Check all pets were updated
      const pet1 = await evolvagotchi.getPetInfo(0);
      const pet2 = await evolvagotchi.getPetInfo(1);
      const pet3 = await evolvagotchi.getPetInfo(2);

      expect(pet1.hunger).to.equal(10);
      expect(pet2.hunger).to.equal(10);
      expect(pet3.hunger).to.equal(10);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to withdraw funds", async function () {
      // Mint some pets to generate revenue
      await evolvagotchi.connect(user1).mint("Pet1", { value: MINT_COST });
      await evolvagotchi.connect(user2).mint("Pet2", { value: MINT_COST });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(await evolvagotchi.getAddress());

      const tx = await evolvagotchi.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.equal(initialBalance + contractBalance - gasCost);
    });

    it("Should not allow non-owner to withdraw", async function () {
      await evolvagotchi.connect(user1).mint("Pet1", { value: MINT_COST });

      await expect(
        evolvagotchi.connect(user1).withdraw()
      ).to.be.revertedWithCustomError(evolvagotchi, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return correct pet info", async function () {
      await evolvagotchi.connect(user1).mint("ViewTest", { value: MINT_COST });
      
      // Mine a block so age is > 0
      await ethers.provider.send("hardhat_mine", ["0x1"]);
      
      const petInfo = await evolvagotchi.getPetInfo(0);
      
      expect(petInfo.name).to.equal("ViewTest");
      expect(petInfo.age).to.be.greaterThan(0);
      expect(petInfo.blocksSinceUpdate).to.be.greaterThan(0);
    });

    it("Should fail for non-existent token", async function () {
      await expect(
        evolvagotchi.getPetInfo(999)
      ).to.be.revertedWith("Pet does not exist");
    });
  });
});