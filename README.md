# AutoUndo

**Reversible AI Automation for a Safer Web**

AutoUndo is a decentralized web application that ensures every AI automation action includes an AI-generated rollback plan. Built on 0G Network for decentralized AI compute and blockchain storage.

## Features

- 🤖 **AI-Powered Decisions** - Uses 0G Compute LLM for intelligent automation decisions
- ↩️ **Reversible Actions** - Every EXECUTE decision includes a detailed undo plan
- 🔗 **On-Chain Audit** - Decisions are stored immutably on 0G blockchain
- 🛡️ **Safety First** - AI prioritizes safety over aggressive automation

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI**: 0G Compute (OpenAI-compatible API)
- **Blockchain**: 0G Testnet (EVM-compatible), ethers.js v6

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# 0G Compute AI
OPENAI_API_KEY=your_0g_api_key
OPENAI_BASE_URL=https://api.0g.ai/v1
AI_MODEL=gpt-3.5-turbo

# 0G Blockchain
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0x_deployed_contract_address
```

### 3. Deploy Smart Contract (Optional)

Deploy `contracts/AutoUndoStorage.sol` to 0G testnet:

```bash
# Using Remix, Hardhat, or Foundry
# Copy the contract address to CONTRACT_ADDRESS in .env.local
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

Navigate to [http://localhost:3000/app](http://localhost:3000/app) to use the dApp.

## Project Structure

```
AutoUndo/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css        # Global styles
│   │   ├── app/
│   │   │   └── page.tsx       # Main dApp
│   │   └── api/
│   │       ├── decide/        # AI decision endpoint
│   │       └── store-proof/   # Blockchain storage endpoint
│   └── lib/
│       ├── types.ts           # TypeScript interfaces
│       ├── ai.ts              # AI/LLM integration
│       └── blockchain.ts      # ethers.js utilities
├── contracts/
│   └── AutoUndoStorage.sol    # Solidity smart contract
├── .env.example               # Environment template
└── README.md                  # This file
```

## How It Works

1. **Input Metric** - Enter a value (0-100) representing system state
2. **AI Analysis** - 0G Compute LLM analyzes the metric and decides EXECUTE or SKIP
3. **Undo Plan** - If EXECUTE, AI generates a detailed rollback plan
4. **On-Chain Storage** - Decision and audit summary stored on 0G blockchain
5. **Undo Action** - Execute the rollback plan if needed

## API Endpoints

### POST /api/decide

Request:
```json
{
  "metricValue": 55
}
```

Response:
```json
{
  "decision": "EXECUTE",
  "reasoning": "Metric value is within safe operating range...",
  "confidence_score": 0.85,
  "risk_assessment": "Low",
  "undo_plan": "1. Log current state...",
  "audit_summary": "EXECUTE: Metric=55, Risk=Low, Confidence=0.85"
}
```

### POST /api/store-proof

Request:
```json
{
  "decision": "EXECUTE",
  "auditSummary": "EXECUTE: Metric=55, Risk=Low, Confidence=0.85"
}
```

Response:
```json
{
  "success": true,
  "txHash": "0x..."
}
```

## Demo Mode

The app works in demo mode without blockchain configuration:
- AI decisions use fallback deterministic logic if API unavailable
- Blockchain storage returns mock transaction hashes

## Production Deployment

```bash
npm run build
npm start
```

## Hackathon Submission

Built for:
- 🏆 Best Vibecoded dApp
- 🧠 Creative Utilization of Decentralized AI Compute + Blockchain

---

Built with ❤️ on 0G Network
