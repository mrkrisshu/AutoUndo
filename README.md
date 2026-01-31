# AutoUndo

**Reversible AI Automation for a Safer Web**

![Landing Page](image1)

AutoUndo is a decentralized AI automation dApp that enforces a critical safety rule:

**No AI action should execute without a verifiable way to undo it.**

Before any automated decision is executed, AutoUndo:

- Uses **0G Compute Network** for decentralized AI reasoning
- Generates an **AI-produced rollback (undo) plan**
- Stores the decision **immutably on 0G Blockchain** for full auditability

This makes AI automation safer, reversible, and trustworthy.

## 🏆 Hackathon Tracks — Built to Win

### 🥇 Best dApp Vibecoded During the Event

✅ Built entirely during the hackathon  
✅ Fully functional live dApp with end-to-end flow  
✅ No mocks, no placeholders — judges can test it live  
✅ Clean UI, real-time feedback, on-chain proofs visible  

**What you can do:**

- Enter metric values (0–100)
- Trigger AI-powered decisions
- View confidence, risk, and reasoning
- See on-chain transaction hashes
- Trigger rollback actions

### 🎨 Creative Utilization of 0G Compute + Chain

AutoUndo uses both **0G Compute** AND **0G Chain** in a meaningful, non-trivial way:

#### ✅ 0G Compute Network (Decentralized AI)

- AI decision-making runs on **0G Compute** (`qwen-2.5-7b-instruct`)
- AI evaluates:
  - **Risk level** (Low / Medium / High)
  - **Confidence score** (0–100%)
  - **Decision** (EXECUTE / SKIP)
- AI generates **human-readable reasoning**
- AI generates a **structured rollback (undo) plan**
- **Not just inference** — this is AI governance + policy generation.

#### ✅ 0G Blockchain (Immutable Proof Layer)

- Every decision is **stored on-chain** (0G Galileo Testnet)
- Decision metadata includes:
  - Decision type (EXECUTE / SKIP)
  - Confidence & risk level
  - Timestamp
  - Transaction hash for verification
- Enables **auditing, accountability, and rollback verification**

**Together:** This demonstrates creative integration of **decentralized AI + blockchain** for a safety-critical use case.

## 🚀 Live Demo

| Link | Purpose |
|------|---------|
| [Landing Page](https://auto-undo.vercel.app) | Project overview |
| [Main dApp](https://auto-undo.vercel.app/app) | Live interactive demo |

**No setup required. Works directly in the browser.**

## 🧠 The Problem AutoUndo Solves

Modern AI automation is:

❌ **Irreversible** — once executed, no way back  
❌ **Opaque** — users don't know why AI acted  
❌ **Risky** — no safety checks for edge cases  
❌ **Unauditable** — no record of past decisions  

AutoUndo fixes this:

✅ AI must **explain every decision**  
✅ AI must **generate an undo plan before executing**  
✅ Every decision is **stored immutably on-chain**  
✅ **High-risk actions** are automatically skipped  

This makes AI automation safe for real-world production systems.

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🤖 Decentralized AI Reasoning | Powered by 0G Compute Network |
| ↩️ AI-Generated Undo Plans | Every EXECUTE decision includes rollback steps |
| 🔗 On-Chain Auditability | Decisions stored immutably on 0G Galileo Testnet |
| 🛡️ Safety-First Logic | High risk → SKIP, uncertain → SKIP, safe → EXECUTE |
| 📜 Live Decision History | Real-time UI with confidence, risk, and on-chain proof links |
| 🔄 Reliability Fallback | Auto-fallback to OpenRouter if 0G Compute unavailable |

## 🎯 How It Works

![App Screenshot](image2)

```
User Input (0–100)
        ↓
0G Compute Network (AI Inference)
        ↓
Decision Engine (EXECUTE / SKIP)
        ↓
AI-Generated Undo Plan
        ↓
On-Chain Storage (0G Blockchain)
        ↓
Live UI + Rollback Action
```

## 🧪 Example Decisions

| Input Metric | Decision | Risk | Confidence | Reasoning |
|--------------|----------|------|------------|-----------|
| 10 | SKIP | Medium | 90% | Value too low, caution required |
| 50 | EXECUTE | Low | 100% | Within safe range (30–70) |
| 100 | SKIP | High | 100% | Extreme outlier, high risk |

This demonstrates predictable, explainable, and safety-aligned AI behavior.

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS (dark cyber theme) |
| AI (Primary) | 0G Compute Network (qwen-2.5-7b-instruct) |
| AI (Fallback) | OpenRouter |
| Blockchain | 0G Galileo Testnet |
| Smart Contract | Solidity ^0.8.19 |
| Web3 | ethers.js v6 |
| Hosting | Vercel |

## 🛠️ Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Add your keys:

```env
# 0G Compute (optional for testnet)
ZEROG_API_KEY=

# OpenRouter fallback
OPENROUTER_API_KEY=your_key_here

# Blockchain
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=deployed_contract_address
```

### 3. Run Locally

```bash
npm run dev
```

- http://localhost:3000 → Landing page
- http://localhost:3000/app → Main dApp

## 🧠 Why AutoUndo Matters

AI automation today is:

- Irreversible
- Opaque
- Risky at scale

AutoUndo introduces a missing safety primitive:

**No AI action should exist without a verified way to undo it.**

This project demonstrates how decentralized AI + blockchain can enforce that principle in practice.

## 🔗 0G Network Details

| Parameter | Value |
|-----------|-------|
| Network | 0G Galileo Testnet |
| Chain ID | 16602 |
| RPC | https://evmrpc-testnet.0g.ai |
| Explorer | https://chainscan-galileo.0g.ai |
| Faucet | https://faucet.0g.ai |

## 📂 Project Structure

```
AutoUndo/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── app/page.tsx      # Main dApp
│   │   └── api/
│   │       ├── decide/       # AI decision logic (0G Compute)
│   │       └── store-proof/  # On-chain storage (0G Chain)
│   ├── lib/
│   │   ├── ai.ts             # 0G AI + fallback logic
│   │   └── blockchain.ts     # ethers.js utilities
├── contracts/
│   └── AutoUndoStorage.sol   # Smart contract
└── README.md
```

## 🔐 Smart Contract Design

**Purpose:** Immutable proof storage, not payload.

```solidity
event DecisionStored(
  address indexed caller,
  string decision,
  string summary,
  uint256 timestamp
);
```

- Stores decision summaries only
- No sensitive data on-chain
- Gas-efficient & event-based logging
- Enables auditing and rollback verification

## 👤 Author

**Krishna Bantola**  
Built solo during the hackathon

## 📜 License

MIT License

## ✅ What Makes AutoUndo Different

✅ **Real, working dApp** — not a mock, not UI-only  
✅ **Decentralized AI** — powered by 0G Compute  
✅ **On-chain proofs** — immutable storage on 0G Chain  
✅ **Safety-first design** — explainable, reversible, auditable  
✅ **Creative integration** — meaningful use of both 0G pillars  

AutoUndo demonstrates how decentralized AI + blockchain can make automation safer, accountable, and reversible.

Built with 🚀 on **0G Network**

## 🎯 Quick Links

- **Live Demo:** https://auto-undo.vercel.app/app
- **Landing Page:** https://auto-undo.vercel.app
- **0G Compute:** Decentralized AI inference
- **0G Chain:** Immutable proof storage

---

*Copy-paste ready. Professional. Winning.* 🏆
