# AutoUndo

**Reversible AI Automation for a Safer Web**

AutoUndo is a decentralized web application that ensures every AI automation action includes an AI-generated rollback plan. Built on 0G Network for decentralized AI compute and blockchain storage.

## 🏆 Hackathon Entry

- **₹15,000** - Best dApp vibecoded during the event
- **₹5,000** - Creative utilization of 0G CC

## Features

- 🤖 **0G Decentralized AI** - Uses 0G Compute Network for AI inference
- ↩️ **Reversible Actions** - Every EXECUTE decision includes a detailed undo plan
- 🔗 **On-Chain Audit** - Decisions stored immutably on 0G Galileo Testnet
- 🛡️ **Safety First** - AI prioritizes safety over aggressive automation
- 🔄 **Fallback Support** - OpenRouter cloud fallback for reliability

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 (dark theme) |
| **AI (Primary)** | 0G Compute Network (qwen-2.5-7b-instruct) |
| **AI (Fallback)** | OpenRouter (google/gemini-2.5-flash-lite) |
| Blockchain | 0G Galileo Testnet (Chain ID: 16602), ethers.js v6 |
| Contract | Solidity 0.8.19 |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# 0G Compute Network (Decentralized AI)
ZEROG_API_KEY=optional_if_using_free_testnet

# OpenRouter Fallback
OPENROUTER_API_KEY=your_openrouter_api_key

# 0G Blockchain
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0x_deployed_contract
```

### 3. Run Development Server

```bash
npm run dev
```

- Landing page: http://localhost:3000
- Main dApp: http://localhost:3000/app

## How It Works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Input │ ──► │ 0G Compute (AI)  │ ──► │ Decision Result │
│  (Metric)   │     │ Decentralized    │     │ + Undo Plan     │
└─────────────┘     └──────────────────┘     └─────────────────┘
                            │                         │
                            ▼                         ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │ OpenRouter       │     │ 0G Blockchain   │
                    │ (Fallback)       │     │ (Immutable Log) │
                    └──────────────────┘     └─────────────────┘
```

1. **Input Metric** - Enter a value (0-100) representing system state
2. **0G AI Analysis** - Decentralized AI decides EXECUTE or SKIP
3. **Undo Plan** - AI generates detailed rollback steps
4. **On-Chain Storage** - Decision stored on 0G blockchain
5. **Undo Action** - Execute rollback if needed

## API Endpoints

### POST /api/decide
AI decision with undo plan generation.

### POST /api/store-proof
Store decision proof on 0G blockchain.

## 0G Network Details

| Parameter | Value |
|-----------|-------|
| Network | 0G-Galileo-Testnet |
| Chain ID | 16602 |
| RPC | https://evmrpc-testnet.0g.ai |
| Explorer | https://chainscan-galileo.0g.ai |
| Faucet | https://faucet.0g.ai |

## Project Structure

```
AutoUndo/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── app/page.tsx       # Main dApp
│   │   └── api/               # API routes
│   └── lib/
│       ├── ai.ts              # 0G + OpenRouter AI
│       └── blockchain.ts      # ethers.js
├── contracts/
│   └── AutoUndoStorage.sol    # Smart contract
└── README.md
```

## License

MIT License - See [LICENSE](LICENSE)

---

Built with ❤️ on **0G Network** for decentralized AI compute + blockchain
