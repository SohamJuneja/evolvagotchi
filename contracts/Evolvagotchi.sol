// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Evolvagotchi V2
 * @dev Optimized for Somnia's high block production rate (~6 blocks/sec)
 * Each Evolvagotchi is an autonomous NFT with AI-driven stat decay
 */
contract Evolvagotchi is ERC721, ERC721URIStorage, Ownable {
    
    enum EvolutionStage { Egg, Baby, Teen, Adult }
    
    struct Pet {
        string name;
        uint256 birthDate;
        uint256 lastUpdatedBlock;
        EvolutionStage evolutionStage;
        uint8 happiness;
        uint8 hunger;
        uint8 health;
        bool isDead;
        uint256 deathTimestamp;
    }
    
    uint256 private _nextTokenId;
    mapping(uint256 => Pet) public pets;
    
    // BALANCED FOR SOMNIA (~6 blocks/second)
    uint256 public constant BLOCKS_PER_HUNGER_POINT = 500;      // ~78 seconds per hunger point
    uint256 public constant BLOCKS_PER_HAPPINESS_DECAY = 1000;  // ~156 seconds per happiness point
    uint256 public constant FEED_COST = 0.001 ether;
    uint256 public constant MINT_COST = 0.01 ether;
    uint256 public constant REVIVAL_COST = 0.005 ether;         // Cost to revive a dead pet
    
    // Evolution requirements (realistic timings for Somnia)
    uint256 public constant EGG_TO_BABY_BLOCKS = 25000;         // ~1.1 hours
    uint256 public constant BABY_TO_TEEN_BLOCKS = 100000;       // ~4.3 hours
    uint256 public constant TEEN_TO_ADULT_BLOCKS = 300000;      // ~13 hours
    uint8 public constant EVOLUTION_HAPPINESS_THRESHOLD = 60;
    
    event PetMinted(uint256 indexed tokenId, address indexed owner, string name);
    event PetFed(uint256 indexed tokenId, uint8 newHunger, uint8 newHappiness);
    event PetPlayed(uint256 indexed tokenId, uint8 newHappiness);
    event PetEvolved(uint256 indexed tokenId, EvolutionStage newStage);
    event StateUpdated(uint256 indexed tokenId, uint8 hunger, uint8 happiness, uint8 health);
    event PetDied(uint256 indexed tokenId, uint256 timestamp);
    event PetRevived(uint256 indexed tokenId, uint256 timestamp);
    
    constructor() ERC721("Evolvagotchi", "EVOLV") Ownable(msg.sender) {}
    
    function mint(string memory _name) public payable returns (uint256) {
        require(msg.value >= MINT_COST, "Insufficient payment");
        require(bytes(_name).length > 0 && bytes(_name).length <= 20, "Invalid name length");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        pets[tokenId] = Pet({
            name: _name,
            birthDate: block.number,
            lastUpdatedBlock: block.number,
            evolutionStage: EvolutionStage.Egg,
            happiness: 100,
            hunger: 0,
            health: 100,
            isDead: false,
            deathTimestamp: 0
        });
        
        _setTokenURI(tokenId, "ipfs://QmEggMetadata");
        
        emit PetMinted(tokenId, msg.sender, _name);
        return tokenId;
    }
    
    function updateState(uint256 tokenId) public {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        
        Pet storage pet = pets[tokenId];
        
        // Don't update stats if pet is dead
        if (pet.isDead) return;
        
        uint256 blocksPassed = block.number - pet.lastUpdatedBlock;
        
        if (blocksPassed == 0) return;
        
        // Stat decay calculations
        uint256 hungerIncrease = blocksPassed / BLOCKS_PER_HUNGER_POINT;
        uint256 happinessDecrease = blocksPassed / BLOCKS_PER_HAPPINESS_DECAY;
        
        if (hungerIncrease > 0) {
            pet.hunger = uint8(_min(uint256(pet.hunger) + hungerIncrease, 100));
        }
        
        if (happinessDecrease > 0) {
            if (happinessDecrease >= pet.happiness) {
                pet.happiness = 0;
            } else {
                pet.happiness -= uint8(happinessDecrease);
            }
        }
        
        // Health logic
        if (pet.hunger > 80 && pet.health > 0) {
            uint256 healthDecrease = (pet.hunger - 80) / 5;
            if (healthDecrease >= pet.health) {
                pet.health = 0;
            } else {
                pet.health -= uint8(healthDecrease);
            }
        }
        
        if (pet.hunger < 30 && pet.happiness > 70 && pet.health < 100) {
            pet.health = uint8(_min(uint256(pet.health) + 1, 100));
        }
        
        pet.lastUpdatedBlock = block.number;
        
        // Check for death
        _checkDeath(tokenId);
        
        emit StateUpdated(tokenId, pet.hunger, pet.happiness, pet.health);
        
        _checkAndEvolve(tokenId);
    }
    
    function feed(uint256 tokenId) public payable {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        require(msg.value >= FEED_COST, "Insufficient payment");
        
        Pet storage pet = pets[tokenId];
        require(!pet.isDead, "Cannot feed a dead pet");
        
        updateState(tokenId);
        
        pet.hunger = pet.hunger > 40 ? pet.hunger - 40 : 0;
        pet.happiness = uint8(_min(uint256(pet.happiness) + 15, 100));
        
        emit PetFed(tokenId, pet.hunger, pet.happiness);
        
        _checkAndEvolve(tokenId);
    }
    
    function play(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        
        Pet storage pet = pets[tokenId];
        require(!pet.isDead, "Cannot play with a dead pet");
        
        updateState(tokenId);
        
        pet.happiness = uint8(_min(uint256(pet.happiness) + 25, 100));
        
        emit PetPlayed(tokenId, pet.happiness);
        
        _checkAndEvolve(tokenId);
    }
    
    /**
     * @dev Check if pet should die (health reaches 0)
     */
    function _checkDeath(uint256 tokenId) internal {
        Pet storage pet = pets[tokenId];
        if (pet.health == 0 && !pet.isDead) {
            pet.isDead = true;
            pet.deathTimestamp = block.timestamp;
            emit PetDied(tokenId, block.timestamp);
        }
    }
    
    /**
     * @dev Revive a dead pet for a fee
     * @param tokenId The pet to revive
     */
    function revive(uint256 tokenId) public payable {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        require(msg.value >= REVIVAL_COST, "Insufficient revival fee");
        
        Pet storage pet = pets[tokenId];
        require(pet.isDead, "Pet is not dead");
        
        // Revive with partial stats
        pet.isDead = false;
        pet.health = 50;
        pet.happiness = 30;
        pet.hunger = 50;
        pet.deathTimestamp = 0;
        pet.lastUpdatedBlock = block.number;
        
        emit PetRevived(tokenId, block.timestamp);
        emit StateUpdated(tokenId, pet.hunger, pet.happiness, pet.health);
    }
    
    function _checkAndEvolve(uint256 tokenId) internal {
        Pet storage pet = pets[tokenId];
        uint256 age = block.number - pet.birthDate;
        
        if (pet.evolutionStage == EvolutionStage.Egg && age >= EGG_TO_BABY_BLOCKS) {
            pet.evolutionStage = EvolutionStage.Baby;
            _setTokenURI(tokenId, "ipfs://QmBabyMetadata");
            emit PetEvolved(tokenId, EvolutionStage.Baby);
        }
        else if (pet.evolutionStage == EvolutionStage.Baby && 
                 age >= BABY_TO_TEEN_BLOCKS && 
                 pet.happiness >= EVOLUTION_HAPPINESS_THRESHOLD) {
            pet.evolutionStage = EvolutionStage.Teen;
            _setTokenURI(tokenId, "ipfs://QmTeenMetadata");
            emit PetEvolved(tokenId, EvolutionStage.Teen);
        }
        else if (pet.evolutionStage == EvolutionStage.Teen && 
                 age >= TEEN_TO_ADULT_BLOCKS && 
                 pet.happiness >= EVOLUTION_HAPPINESS_THRESHOLD &&
                 pet.health >= 80) {
            pet.evolutionStage = EvolutionStage.Adult;
            _setTokenURI(tokenId, "ipfs://QmAdultMetadata");
            emit PetEvolved(tokenId, EvolutionStage.Adult);
        }
    }
    
    function getPetInfo(uint256 tokenId) public view returns (
        string memory name,
        uint256 birthDate,
        uint256 age,
        EvolutionStage evolutionStage,
        uint8 happiness,
        uint8 hunger,
        uint8 health,
        uint256 blocksSinceUpdate,
        bool isDead,
        uint256 deathTimestamp
    ) {
        require(_ownerOf(tokenId) != address(0), "Pet does not exist");
        Pet memory pet = pets[tokenId];
        
        return (
            pet.name,
            pet.birthDate,
            block.number - pet.birthDate,
            pet.evolutionStage,
            pet.happiness,
            pet.hunger,
            pet.health,
            block.number - pet.lastUpdatedBlock,
            pet.isDead,
            pet.deathTimestamp
        );
    }
    
    function getUserPets(address user) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);
        uint256 counter = 0;
        
        for (uint256 i = 0; i < _nextTokenId; i++) {
            if (_ownerOf(i) == user) {
                tokenIds[counter] = i;
                counter++;
            }
        }
        
        return tokenIds;
    }
    
    function batchUpdateState(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (_ownerOf(tokenIds[i]) != address(0)) {
                updateState(tokenIds[i]);
            }
        }
    }
    
    /**
     * @dev Apply accumulated event effects from frontend
     * @param tokenId The pet to update
     * @param happinessDelta Change in happiness (-100 to +100)
     * @param hungerDelta Change in hunger (-100 to +100)
     * @param healthDelta Change in health (-100 to +100)
     */
    function applyEventEffects(
        uint256 tokenId,
        int8 happinessDelta,
        int8 hungerDelta,
        int8 healthDelta
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        
        Pet storage pet = pets[tokenId];
        require(!pet.isDead, "Cannot apply effects to a dead pet");
        
        // Update state first to get latest stats
        updateState(tokenId);
        
        pet = pets[tokenId];
        
        // Apply happiness delta
        if (happinessDelta != 0) {
            int16 newHappiness = int16(uint16(pet.happiness)) + int16(happinessDelta);
            pet.happiness = uint8(uint16(_clampInt(newHappiness, 0, 100)));
        }
        
        // Apply hunger delta
        if (hungerDelta != 0) {
            int16 newHunger = int16(uint16(pet.hunger)) + int16(hungerDelta);
            pet.hunger = uint8(uint16(_clampInt(newHunger, 0, 100)));
        }
        
        // Apply health delta
        if (healthDelta != 0) {
            int16 newHealth = int16(uint16(pet.health)) + int16(healthDelta);
            pet.health = uint8(uint16(_clampInt(newHealth, 0, 100)));
        }
        
        // Check for death after applying effects
        _checkDeath(tokenId);
        
        emit StateUpdated(tokenId, pet.hunger, pet.happiness, pet.health);
        
        // Check if pet can evolve with new stats
        _checkAndEvolve(tokenId);
    }
    
    /**
     * @dev Update the token URI to point to new NFT metadata on IPFS
     * @param tokenId The pet token ID
     * @param newTokenURI The new IPFS URI (e.g., ipfs://QmHash...)
     */
    function updateTokenURI(uint256 tokenId, string memory newTokenURI) public {
        require(ownerOf(tokenId) == msg.sender, "Not your pet");
        _setTokenURI(tokenId, newTokenURI);
    }
    
    /**
     * @dev Clamp an int16 value between min and max
     */
    function _clampInt(int16 value, int16 min, int16 max) internal pure returns (int16) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}