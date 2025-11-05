# 🐲 Evolvagotchi - AI-Powered NFT Virtual Pet Game

<div align="center">

![Evolvagotchi](https://img.shields.io/badge/Blockchain-Somnia%20Testnet-blue)
![React](https://img.shields.io/badge/React-19.1.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)
![AI](https://img.shields.io/badge/AI-Groq%20LLaMA-green)

**A next-generation blockchain virtual pet game where your NFT pets evolve, play games, and chat with AI!**

[Live Demo](#) | [Video Demo](#) | [Contract Explorer](https://somnia-devnet.socialscan.io/address/0xED174eE36a8027B4F82ebe7B756CDE7bAeae2249)

</div>
## 🚀 The Vision: A Pet, Not a Picture

99% of NFTs are just static, lifeless assets. They're things you *own*, not things you *know*.

We built Evolvagotchi to solve this. It's an autonomous on-chain companion, a living **NFT** on the **Somnia** blockchain that thinks, feels, and evolves. It's a **Crypto-AI** platform for creating a genuine, emotional bond with a digital being.
---

## 🎮 What is Evolvagotchi?

Evolvagotchi is an innovative blockchain-based virtual pet game that combines:
- 🎨 **Dynamic NFTs** - Your pet's metadata evolves on-chain
- 🤖 **AI Personality** - Powered by Groq's LLaMA 3.3 70B model
- 🎯 **Interactive Mini-Games** - Memory, Tic-Tac-Toe, Rock Paper Scissors
- 🏆 **Achievement System** - Earn ERC-1155 badges
- 📈 **Evolution Stages** - Egg → Baby → Teen → Adult
- 💬 **Context-Aware Chat** - AI remembers your interactions

---

## ✨ Key Features

### 🔗 Blockchain Features
- **ERC-721 NFT Pets** - Each pet is a unique, ownable NFT on Somnia Testnet
- **On-Chain Evolution** - Stats and stages stored directly on-chain
- **Dynamic Metadata** - IPFS URIs update as pets evolve
- **ERC-1155 Achievements** - Collectible badges for milestones

### 🎮 Gameplay Features
- **Feed & Play** - Manage hunger and happiness stats
- **Mini-Games** - Win games to boost happiness (+25 points)
  - 🧠 **Memory Game** - Match 6 pairs of emoji cards
  - ❌⭕ **Tic-Tac-Toe** - Beat the AI in classic grid strategy
  - ✊✋✌️ **Rock Paper Scissors** - Quick reflex challenge
- **Evolution System** - Pets evolve through 4 stages with unique personalities
- **Health System** - Hunger, happiness, and health mechanics with death/revival

### 🤖 AI Features
- **Personality-Driven** - Each evolution stage has distinct personality traits
- **Context-Aware Responses** - AI knows if you just fed, played, or won a game
- **Game-Specific Reactions** - Pet references which mini-game you played
- **Emotional Intelligence** - Responds based on hunger, happiness, and health levels

---

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** `0.8.20` - Core contract language
- **OpenZeppelin** - ERC-721, ERC-1155, Ownable standards
- **Hardhat** - Development & testing framework

### Frontend
- **React** `19.1.1` - UI framework
- **TypeScript** `5.9.3` - Type safety
- **Vite** `7.1.7` - Build tool & dev server
- **Wagmi** `2.18.1` - React hooks for Ethereum
- **Viem** `2.38.3` - TypeScript Ethereum library
- **TanStack Query** - Async state management

### AI & Services
- **Groq SDK** `0.34.0` - Fast LLM inference (LLaMA 3.3 70B)
- **Pinata IPFS** - Decentralized metadata storage
- **Canvas API** - Dynamic NFT art generation

### Blockchain
- **Somnia Testnet** - Ultra-fast EVM chain (~6 blocks/second)
- **Chain ID**: `50312`
- **RPC**: `https://dream-rpc.somnia.network`

---

## 📦 Installation

### Prerequisites
- **Node.js** `v18+`
- **npm** or **yarn**
- **MetaMask** wallet
- **Somnia Testnet** configured in MetaMask

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/SohamJuneja/evolvagotchi.git
cd evolvagotchi
```

### 2️⃣ Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd evolvagotchi-frontend
npm install
```

### 3️⃣ Environment Setup

Create `evolvagotchi-frontend/.env`:
```env
# Groq API Key (Get from: https://console.groq.com/keys)
VITE_GROQ_API_KEY=your_groq_api_key_here

# Pinata IPFS (Get from: https://pinata.cloud)
VITE_PINATA_JWT=your_pinata_jwt_here
VITE_PINATA_GATEWAY=your_pinata_gateway_url
```

### 4️⃣ Run the Frontend
```bash
cd evolvagotchi-frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser! 🚀

---

## 🌐 Somnia Testnet Setup

### Add Somnia to MetaMask

1. Open MetaMask
2. Click **Add Network** → **Add Network Manually**
3. Enter the following:

| Field | Value |
|-------|-------|
| **Network Name** | Somnia Testnet |
| **RPC URL** | `https://dream-rpc.somnia.network` |
| **Chain ID** | `50312` |
| **Currency Symbol** | `STT` |
| **Block Explorer** | `https://somnia-devnet.socialscan.io` |

### Get Test Tokens
- Visit the [Somnia Faucet](#) (if available)
- Or ask in the Somnia Discord for testnet STT

---

## 📜 Smart Contracts

### Deployed Addresses (Somnia Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| **Evolvagotchi** | `0xED174eE36a8027B4F82ebe7B756CDE7bAeae2249` | [View](https://somnia-devnet.socialscan.io/address/0xED174eE36a8027B4F82ebe7B756CDE7bAeae2249) |
| **AchievementBadge** | `0x02158149cd9b7ecE0D1dff4E1edA273c098D98f0` | [View](https://somnia-devnet.socialscan.io/address/0x02158149cd9b7ecE0D1dff4E1edA273c098D98f0) |

### Key Functions

#### Evolvagotchi Contract
```solidity
// Mint a new pet (0.01 STT)
function mintPet(string memory name) external payable

// Interact with your pet (FREE)
function feed(uint256 tokenId) external
function play(uint256 tokenId) external

// Evolution (0.015 STT)
function evolve(uint256 tokenId) external payable

// Revival (0.005 STT)
function revivePet(uint256 tokenId) external payable
```

---

## 🎯 How to Play

### 1. **Mint Your Pet** 🥚
- Click **"Mint New Pet"**
- Enter a name (1-20 characters)
- Pay 0.01 STT
- Your pet starts as an **Egg**!

### 2. **Care for Your Pet** 💖
- **Feed** - Reduces hunger, increases happiness
- **Play Game** - Choose from 3 mini-games
  - Win to boost happiness by +25 points
  - AI will react specifically to which game you played!

### 3. **Evolution Journey** 🌱
| Stage | Requirements | Age | Stats |
|-------|-------------|-----|-------|
| 🥚 **Egg** | Starting stage | 0-90K blocks | Mysterious |
| 👶 **Baby** | Age ≥ 90K blocks | 90K-100K | Innocent & playful |
| 😎 **Teen** | Age ≥ 100K, Happiness ≥ 60 | 100K-300K | Moody & energetic |
| 🐲 **Adult** | Age ≥ 300K, Happy ≥ 60, Health ≥ 80 | 300K+ | Wise & loyal |

### 4. **Chat with AI** 💬
- Open any pet's detail page
- Click **"Chat with Pet"**
- Ask questions or just say hi!
- AI responds based on:
  - Evolution stage personality
  - Current stats (hungry, sad, sick)
  - Recent actions (just played Memory Game!)

### 5. **Earn Achievements** 🏆
- First Evolution
- First Revival
- Max Happiness
- *(More coming soon!)*

---

## 🎮 Mini-Games Guide

### 🧠 Memory Game
- **Goal**: Match all 6 pairs of emoji cards
- **How**: Click cards to flip, find matching pairs
- **Win**: Match all pairs to win!

### ❌⭕ Tic-Tac-Toe
- **Goal**: Get 3 in a row before the AI
- **How**: Click grid cells to place your mark (X)
- **Win**: Horizontal, vertical, or diagonal line

### ✊✋✌️ Rock Paper Scissors
- **Goal**: Beat the computer's choice
- **How**: Click Rock, Paper, or Scissors
- **Win**: Rock beats Scissors, Paper beats Rock, Scissors beats Paper

---

## 📁 Project Structure

```
evolvagotchi/
├── contracts/                 # Solidity smart contracts
│   ├── Evolvagotchi.sol      # Main ERC-721 pet contract
│   └── AchievementBadge.sol  # ERC-1155 badge contract
├── evolvagotchi-frontend/    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── EvolvagotchiGame.tsx    # Main game container
│   │   │   ├── PetList.tsx             # Grid of owned pets
│   │   │   ├── PetDetail.tsx           # Individual pet view
│   │   │   ├── GameSelectionModal.tsx  # Mini-game selector
│   │   │   ├── MemoryGame.tsx          # Memory card game
│   │   │   ├── TicTacToe.tsx           # Tic-tac-toe game
│   │   │   ├── RockPaperScissors.tsx   # RPS game
│   │   │   ├── PetChat.tsx             # AI chat interface
│   │   │   └── AchievementGallery.tsx  # Badge collection
│   │   ├── services/         # Business logic
│   │   │   ├── groqService.ts          # AI chat integration
│   │   │   ├── achievementService.ts   # Badge management
│   │   │   ├── ipfsNFTService.ts       # IPFS uploads
│   │   │   └── canvasNFTGenerator.ts   # Dynamic art
│   │   ├── contracts/        # ABIs & addresses
│   │   └── config/           # Wagmi & network config
│   └── server/               # Express API (optional)
├── scripts/                  # Deployment scripts
├── test/                     # Contract tests
└── artifacts/                # Compiled contracts
```

---

## 🔧 Development

### Run Tests
```bash
# Smart contract tests
npx hardhat test

# With gas reporting
REPORT_GAS=true npx hardhat test
```

### Compile Contracts
```bash
npx hardhat compile
```

### Deploy Contracts
```bash
# Deploy to Somnia Testnet
npx hardhat run scripts/deploy.ts --network somnia

# Deploy achievements
npx hardhat run scripts/deployAchievements.ts --network somnia
```

### Verify Contracts
```bash
npx hardhat verify --network somnia <CONTRACT_ADDRESS>
```

---

## 🎨 NFT Art & Metadata

### Dynamic Evolution
Each evolution stage has a unique IPFS metadata URI:
- **Egg**: `ipfs://QmEggMetadata`
- **Baby**: `ipfs://QmBabyMetadata`
- **Teen**: `ipfs://QmTeenMetadata`
- **Adult**: `ipfs://QmAdultMetadata`

### Canvas Generator
The `canvasNFTGenerator.ts` service creates on-the-fly pet artwork using HTML Canvas API based on:
- Evolution stage
- Current stats (happiness, hunger, health)
- Age and name

---

## 🤖 AI Chat System

### Personality Prompts
Each stage has a distinct personality:

| Stage | Personality Traits | Example Response |
|-------|-------------------|------------------|
| 🥚 **Egg** | Mysterious, quiet | *"✨ A presence stirs within ✨"* |
| 👶 **Baby** | Innocent, excitable | *"Yay! That Memory Game was so fun! 🎉"* |
| 😎 **Teen** | Moody, sarcastic | *"Finally! You beat me at Tic-Tac-Toe! 💪"* |
| 🐲 **Adult** | Wise, grateful | *"Your strategic mind in that game honors our bond. ✨"* |

### Context Integration
The AI reads `localStorage.getItem('lastGameWon')` to provide game-specific responses:
```typescript
// After winning Memory Game
"I loved matching all those cards with you! 🧠✨"

// After winning Tic-Tac-Toe  
"You're getting really good at strategy games! ❌⭕"

// After winning Rock Paper Scissors
"You predicted my move perfectly! ✊"
```

---

## 🏆 Achievement System

### Available Badges
- 🌟 **First Evolution** - Evolve from Egg to Baby
- 💀 **First Revival** - Bring a pet back from death
- 😊 **Happiness Master** - Reach 100 happiness
- *(More achievements coming soon!)*

### Integration
Achievements are ERC-1155 tokens minted automatically when conditions are met.

---

## 📊 Game Mechanics

### Stat System
| Stat | Range | Effect |
|------|-------|--------|
| **Hunger** | 0-100 | Increases over time, feed to reduce |
| **Happiness** | 0-100 | Decreases over time, play/feed to increase |
| **Health** | 0-100 | Affected by neglect (high hunger/low happiness) |

### Decay Rates
- **Hunger**: +1 every 500 blocks (~83 seconds on Somnia)
- **Happiness**: -1 every 1000 blocks (~166 seconds)
- **Health**: Decreases if hunger > 50 or happiness < 30

### Death & Revival
- Pet dies if health reaches 0
- Can be revived for 0.005 STT
- Stats reset to 50/50/50 on revival

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd evolvagotchi-frontend
npm run build
# Deploy the 'dist' folder
```

### Contract Deployment
Already deployed on Somnia Testnet! See [Smart Contracts](#-smart-contracts) section.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Somnia Devnet** - Ultra-fast EVM blockchain
- **Groq** - Lightning-fast AI inference
- **OpenZeppelin** - Secure smart contract libraries
- **Pinata** - IPFS pinning service
- **Wagmi & Viem** - Awesome Ethereum React hooks

---

## 📞 Contact & Links

- **GitHub**: [@SohamJuneja](https://github.com/SohamJuneja)
- **Project Repo**: [evolvagotchi](https://github.com/SohamJuneja/evolvagotchi)
- **Demo Video**: [Watch on YouTube](#)
- **Live App**: [evolvagotchi.vercel.app](#)

---

<div align="center">

**Made with ❤️ for the Somnia Hackathon**

*Evolve. Play. Connect.* 🐲✨

</div>
