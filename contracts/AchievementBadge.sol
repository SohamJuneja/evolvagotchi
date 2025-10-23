// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AchievementBadge
 * @dev ERC1155 contract for Evolvagotchi achievement NFTs
 * Works alongside the main Evolvagotchi contract to award badges
 */
contract AchievementBadge is ERC1155, Ownable {
    
    // Reference to the main Evolvagotchi contract
    address public evolvagotchiContract;
    
    // Achievement metadata
    struct Achievement {
        uint256 id;
        string name;
        string description;
        string rarity;
        string icon;
        uint256 totalEarned;
    }
    
    // Mappings
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(uint256 => bool)) public hasEarnedBadge; // user => achievementId => earned
    mapping(uint256 => mapping(uint256 => bool)) public petHasBadge; // tokenId => achievementId => earned
    
    // Counters for tracking
    mapping(address => uint256) public feedCount;
    mapping(address => uint256) public playCount;
    mapping(address => bool) public hasFirstPet;
    mapping(address => bool) public hasEvolved;
    mapping(address => bool) public hasRevived;
    mapping(address => mapping(uint256 => bool)) public reachedStage; // user => stage => reached
    
    uint256 public constant TOTAL_ACHIEVEMENTS = 8;
    
    // Events
    event AchievementEarned(address indexed user, uint256 indexed achievementId, uint256 petTokenId, string name);
    event EvolvagotchiContractSet(address indexed contractAddress);
    
    constructor() ERC1155("ipfs://QmAchievementMetadata/{id}.json") Ownable(msg.sender) {
        _initializeAchievements();
    }
    
    /**
     * @dev Initialize all achievement definitions
     */
    function _initializeAchievements() internal {
        achievements[0] = Achievement(0, "First Steps", "Mint your first Evolvagotchi", "Common", unicode"🥚", 0);
        achievements[1] = Achievement(1, "Metamorphosis", "Evolve your pet for the first time", "Rare", unicode"🦋", 0);
        achievements[2] = Achievement(2, "Death Survivor", "Revive a pet from death", "Rare", unicode"💀", 0);
        achievements[3] = Achievement(3, "Triple Evolution", "Reach Teen stage (Level 3)", "Epic", unicode"🌟", 0);
        achievements[4] = Achievement(4, "Perfectionist", "Get all stats to 100", "Epic", unicode"💯", 0);
        achievements[5] = Achievement(5, "Streak Master", "Feed your pet 10 times", "Uncommon", unicode"🔥", 0);
        achievements[6] = Achievement(6, "Active Player", "Play with your pet 10 times", "Uncommon", unicode"🎮", 0);
        achievements[7] = Achievement(7, "Legend", "Reach Adult stage (Level 4)", "Legendary", unicode"👑", 0);
    }
    
    /**
     * @dev Set the Evolvagotchi contract address (only owner)
     */
    function setEvolvagotchiContract(address _contract) external onlyOwner {
        evolvagotchiContract = _contract;
        emit EvolvagotchiContractSet(_contract);
    }
    
    /**
     * @dev Award an achievement badge to a user
     * @param user The address to award the badge to
     * @param achievementId The achievement ID (0-7)
     * @param petTokenId The pet token ID that earned this (for tracking)
     */
    function awardAchievement(address user, uint256 achievementId, uint256 petTokenId) public {
        require(msg.sender == evolvagotchiContract || msg.sender == owner(), "Only Evolvagotchi contract or owner");
        require(achievementId < TOTAL_ACHIEVEMENTS, "Invalid achievement ID");
        require(!hasEarnedBadge[user][achievementId], "Already earned");
        
        hasEarnedBadge[user][achievementId] = true;
        petHasBadge[petTokenId][achievementId] = true;
        achievements[achievementId].totalEarned++;
        
        // Mint the achievement NFT (ERC1155)
        _mint(user, achievementId, 1, "");
        
        emit AchievementEarned(user, achievementId, petTokenId, achievements[achievementId].name);
    }
    
    /**
     * @dev Record that a user minted their first pet
     */
    function recordFirstPet(address user, uint256 petTokenId) external {
        require(msg.sender == evolvagotchiContract || msg.sender == owner(), "Only Evolvagotchi contract or owner");
        
        if (!hasFirstPet[user]) {
            hasFirstPet[user] = true;
            awardAchievement(user, 0, petTokenId); // First Steps
        }
    }
    
    /**
     * @dev Record a feed action
     */
    function recordFeed(address user, uint256 petTokenId) external {
        require(msg.sender == evolvagotchiContract || msg.sender == owner(), "Only Evolvagotchi contract or owner");
        
        feedCount[user]++;
        
        if (feedCount[user] >= 10 && !hasEarnedBadge[user][5]) {
            awardAchievement(user, 5, petTokenId); // Streak Master
        }
    }
    
    /**
     * @dev Record a play action
     */
    function recordPlay(address user, uint256 petTokenId) external {
        require(msg.sender == evolvagotchiContract || msg.sender == owner(), "Only Evolvagotchi contract or owner");
        
        playCount[user]++;
        
        if (playCount[user] >= 10 && !hasEarnedBadge[user][6]) {
            awardAchievement(user, 6, petTokenId); // Active Player
        }
    }
    
    /**
     * @dev Record an evolution
     * @param user The pet owner
     * @param petTokenId The pet token ID
     * @param stage The evolution stage (0=Egg, 1=Baby, 2=Teen, 3=Adult)
     */
    function recordEvolution(address user, uint256 petTokenId, uint256 stage) external {
        require(msg.sender == evolvagotchiContract || msg.sender == owner(), "Only Evolvagotchi contract or owner");
        
        // First evolution (Egg -> Baby)
        if (stage == 1 && !hasEvolved[user]) {
            hasEvolved[user] = true;
            awardAchievement(user, 1, petTokenId); // Metamorphosis
        }
        
        // Reached Teen stage
        if (stage == 2 && !reachedStage[user][2]) {
            reachedStage[user][2] = true;
            awardAchievement(user, 3, petTokenId); // Triple Evolution
        }
        
        // Reached Adult stage
        if (stage == 3 && !reachedStage[user][3]) {
            reachedStage[user][3] = true;
            awardAchievement(user, 7, petTokenId); // Legend
        }
    }
    
    /**
     * @dev Record a revival
     */
    function recordRevival(address user, uint256 petTokenId) external {
        require(msg.sender == evolvagotchiContract || msg.sender == owner(), "Only Evolvagotchi contract or owner");
        
        if (!hasRevived[user]) {
            hasRevived[user] = true;
            awardAchievement(user, 2, petTokenId); // Death Survivor
        }
    }
    
    /**
     * @dev Award Perfectionist achievement (all stats at 100)
     */
    function recordPerfectStats(address user, uint256 petTokenId) external {
        require(msg.sender == evolvagotchiContract || msg.sender == owner(), "Only Evolvagotchi contract or owner");
        
        if (!hasEarnedBadge[user][4]) {
            awardAchievement(user, 4, petTokenId); // Perfectionist
        }
    }
    
    /**
     * @dev Get all achievements earned by a user
     */
    function getUserAchievements(address user) public view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count earned achievements
        for (uint256 i = 0; i < TOTAL_ACHIEVEMENTS; i++) {
            if (hasEarnedBadge[user][i]) {
                count++;
            }
        }
        
        // Build array
        uint256[] memory earnedAchievements = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < TOTAL_ACHIEVEMENTS; i++) {
            if (hasEarnedBadge[user][i]) {
                earnedAchievements[index] = i;
                index++;
            }
        }
        
        return earnedAchievements;
    }
    
    /**
     * @dev Get all achievements for a specific pet token
     */
    function getPetAchievements(uint256 petTokenId) public view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count earned achievements
        for (uint256 i = 0; i < TOTAL_ACHIEVEMENTS; i++) {
            if (petHasBadge[petTokenId][i]) {
                count++;
            }
        }
        
        // Build array
        uint256[] memory earnedAchievements = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < TOTAL_ACHIEVEMENTS; i++) {
            if (petHasBadge[petTokenId][i]) {
                earnedAchievements[index] = i;
                index++;
            }
        }
        
        return earnedAchievements;
    }
    
    /**
     * @dev Get achievement details
     */
    function getAchievementDetails(uint256 achievementId) public view returns (Achievement memory) {
        require(achievementId < TOTAL_ACHIEVEMENTS, "Invalid achievement ID");
        return achievements[achievementId];
    }
    
    /**
     * @dev Get all achievements
     */
    function getAllAchievements() public view returns (Achievement[] memory) {
        Achievement[] memory allAchievements = new Achievement[](TOTAL_ACHIEVEMENTS);
        
        for (uint256 i = 0; i < TOTAL_ACHIEVEMENTS; i++) {
            allAchievements[i] = achievements[i];
        }
        
        return allAchievements;
    }
    
    /**
     * @dev Check if user has earned a specific achievement
     */
    function hasEarned(address user, uint256 achievementId) public view returns (bool) {
        require(achievementId < TOTAL_ACHIEVEMENTS, "Invalid achievement ID");
        return hasEarnedBadge[user][achievementId];
    }
    
    /**
     * @dev Get user's achievement count
     */
    function getUserAchievementCount(address user) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < TOTAL_ACHIEVEMENTS; i++) {
            if (hasEarnedBadge[user][i]) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Update the base URI for metadata (only owner)
     */
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }
}
