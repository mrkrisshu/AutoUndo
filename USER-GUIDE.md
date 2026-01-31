# 0G Code to Coin - User Guide

> A complete guide to using decentralized AI inference with Claude Code

This guide takes you from zero to using all available tools with 0G's decentralized compute network.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration Reference](#configuration-reference)
3. [Using the Tools](#using-the-tools)
4. [Common Workflows](#common-workflows)
5. [Cost Savings](#cost-savings)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/claude-code) installed
- Node.js 18+ (for local development)
- (Optional) 0G wallet with testnet/mainnet tokens

### Installation

**Option 1: From npm (Recommended)**

```bash
# Install globally
npm install -g @0gfoundation/0g-cc

# Add to Claude Code
claude mcp add --scope user 0g-cc npx @0gfoundation/0g-cc
```

**Option 2: From source**

```bash
# Clone and build
git clone https://github.com/0g-axion/0g-cc.git
cd 0g-cc
npm install && npm run build

# Add to Claude Code (replace with your actual path)
claude mcp add --scope user 0g-cc node /path/to/0g-cc/dist/index.js
```

### Minimal Setup (Free Tier)

Start using 0G without any configuration - uses free testnet providers:

```bash
claude mcp add --scope user 0g-cc npx @0gfoundation/0g-cc
```

That's it! You can now ask Claude to run inference on 0G.

### Full Setup (With Wallet & Fallback)

For production use with paid providers and cloud fallback:

```bash
claude mcp add --scope user 0g-cc npx @0gfoundation/0g-cc \
  -e ZEROG_NETWORK=mainnet \
  -e ZEROG_PRIVATE_KEY=0x_your_private_key_here \
  -e OPENROUTER_API_KEY=sk-or-v1-_your_key_here \
  -e OPENROUTER_MODEL=deepseek/deepseek-chat
```

> **⚠️ Security Note**:
> - **Never share or commit your private key** to version control or public repositories.
> - **Use a dedicated wallet** for 0G services only — do not use your main wallet.
> - **Keep balances minimal** — only deposit what you need for inference (testnet or mainnet).
> - Consider using environment files (`.env`) or secret managers for production deployments.

> **Note**: Start a new claude code session after changing mcp config
> **Note**: Run `claude mcp remove 0g-cc` if there's "MCP server 0g-cc already exists"

---

## Configuration Reference

### Required vs Optional

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ZEROG_NETWORK` | No | `testnet` | Network to use (`testnet` or `mainnet`) |
| `ZEROG_PRIVATE_KEY` | No | - | Your wallet private key (enables paid features) |
| `OPENROUTER_API_KEY` | No | - | OpenRouter API key (enables cloud fallback) |
| `OPENROUTER_MODEL` | No | - | Model for cloud fallback (required if API key set) |

### Network Configuration

```bash
# Testnet (free, for development)
-e ZEROG_NETWORK=testnet

# Mainnet (paid, for production)
-e ZEROG_NETWORK=mainnet
```

**Testnet Details:**
- Chain ID: 16602
- Currency: A0GI (test tokens)
- Faucet: https://faucet.0g.ai (0.1 A0GI/day)
- Explorer: https://chainscan-galileo.0g.ai

**Mainnet Details:**
- Chain ID: 16661
- Currency: 0G
- Explorer: https://chainscan.0g.ai

### Wallet Configuration

Your wallet enables:
- Checking balances
- Depositing funds to compute ledger
- Paying for inference on paid providers
- Verifying provider TEE attestations

```bash
# Add your wallet (64 hex characters after 0x)
-e ZEROG_PRIVATE_KEY=0x_your_64_character_hex_key_here
```

**Getting Testnet Tokens:**
1. Visit https://faucet.0g.ai
2. Connect your wallet or paste your address
3. Receive 0.1 A0GI daily

### Cloud Fallback Configuration

When 0G providers are unavailable, fall back to cloud providers via OpenRouter:

```bash
# Both are required for fallback to work
-e OPENROUTER_API_KEY=sk-or-v1-your_key_here
-e OPENROUTER_MODEL=deepseek/deepseek-chat
```

**Popular OpenRouter Models:**

| Model | Cost | Best For |
|-------|------|----------|
| `deepseek/deepseek-chat` | $0.14/MTok | General coding, cheap |
| `anthropic/claude-3-haiku` | $0.25/MTok | Fast responses |
| `openai/gpt-4o-mini` | $0.15/MTok | Balanced |
| `meta-llama/llama-3-70b-instruct` | $0.59/MTok | Open source |

Get your API key at: https://openrouter.ai

### Advanced Configuration

```bash
# Deposit thresholds
-e ZEROG_LARGE_DEPOSIT_THRESHOLD=10   # Require confirmation above this amount
-e ZEROG_GAS_BUFFER=0.01              # Reserved for transaction fees

# Balance management
-e ZEROG_MIN_BALANCE=0.1              # Minimum ledger balance
-e ZEROG_INITIAL_DEPOSIT=3            # Initial deposit for new ledgers

# Fallback behavior
-e ZEROG_DISABLE_FALLBACK=false       # Set true to disable cloud fallback
-e ZEROG_DISABLE_SIMULATION=false     # Set true to disable simulation mode
```

---

## Using the Tools

The MCP server exposes tools that Claude can use. You don't need to call tools by name - just describe what you want in natural language.

### Available Tools

| Tool | Requires Wallet | Description |
|------|-----------------|-------------|
| `compute_inference` | No | Run AI inference via 0G or cloud |
| `compute_list_providers` | No | List available AI providers |
| `compute_get_balance` | Yes | Check wallet and ledger balances |
| `compute_deposit` | Yes | Deposit funds to compute ledger |
| `compute_verify_provider` | Yes | Verify provider TEE attestation |
| `storage_info` | No | Get file info from 0G Storage (partial) |
| `system_ping` | No | Health check |

### Inference (AI Completion)

**What you can say:**

```
"Run this code review using 0G compute"

"Ask the decentralized AI to explain this function"

"Use 0G to generate a TypeScript interface for this data"

"Get an AI response using the cheapest available provider"

"Run inference with TEE verification for this sensitive prompt"
```

**What happens behind the scenes:**

Claude calls `compute_inference` which:
1. Routes to the best available 0G provider
2. Falls back to cloud if 0G unavailable
3. Returns the response with cost and usage info

**Example conversation:**

```
You: Use 0G to explain what this regex does: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

Claude: I'll use 0G's decentralized compute to explain this.

[Calls compute_inference internally]

This regex validates email addresses:
- ^[a-zA-Z0-9._%+-]+ matches the local part (before @)
- @ matches the @ symbol
- [a-zA-Z0-9.-]+ matches the domain name
- \.[a-zA-Z]{2,}$ matches the TLD (.com, .org, etc.)

Provider: qwen-2.5-7b-instruct (0G) | Tokens: 165 | Cost: ~0.00002 A0GI
```

### List Providers

**What you can say:**

```
"What AI providers are available on 0G?"

"Show me all the models I can use"

"List TEE-verified providers"

"Which providers support DeepSeek?"
```

**Example conversation:**

```
You: What AI providers are available on the 0G network?

Claude: Let me check the available providers.

[Calls compute_list_providers internally]

Available providers on 0G-Galileo-Testnet:

| Model | Price (In/Out per MTok) | TEE |
|-------|------------------------|-----|
| qwen-2.5-7b-instruct | 0.05 / 0.10 A0GI | Yes |
| gpt-oss-20b | 0.05 / 0.10 A0GI | Yes |
| gemma-3-27b-it | 0.15 / 0.40 A0GI | Yes |

Total: 3 providers (all TEE-verified)
```

> **Note:** By default, only TEE-verified providers are shown. To include unverified providers, ask for "all providers including unverified ones".

### Check Balance

> **Requires Wallet**: This tool requires a configured wallet (`ZEROG_PRIVATE_KEY`).

**What you can say:**

```
"What's my 0G balance?"

"Do I have enough funds for inference?"

"Check my wallet and ledger balance"

"Am I ready to run paid inference?"
```

**Example conversation:**

```
You: What's my current 0G balance?

Claude: Let me check your balances.

[Calls compute_get_balance internally]

Your 0G Account (testnet):

Wallet: 5.0 A0GI
Ledger: 2.0 A0GI (available for inference)

Status: Ready for inference
Estimated calls remaining: ~80,000 (based on cheapest provider)
```

### Deposit Funds

> **Requires Wallet**: This tool requires a configured wallet (`ZEROG_PRIVATE_KEY`).

**What you can say:**

```
"Deposit 1 A0GI to my compute ledger"

"Add funds for running inference"

"Transfer 0.5 0G to my ledger"

"I need to fund my compute account"
```

**Example conversation:**

```
You: Deposit 1 A0GI to my compute ledger

Claude: I'll deposit 1 A0GI to your compute ledger.

[Calls compute_deposit internally]

Deposit successful!

Amount: 1.0 A0GI
New ledger balance: 3.0 A0GI
New wallet balance: 4.0 A0GI
Estimated calls: ~120,000
```

**Large deposit protection:**

```
You: Deposit 15 A0GI to my ledger

Claude: This is a large deposit (15 A0GI, above the 10 A0GI threshold).
Do you want me to proceed with confirmation?

You: Yes, proceed

Claude: [Calls compute_deposit with confirm: true]

Deposit successful! 15.0 A0GI added to your ledger.
```

### Verify Provider TEE

> **Requires Wallet**: This tool requires a configured wallet (`ZEROG_PRIVATE_KEY`).

**What you can say:**

```
"Verify this provider's TEE attestation"

"Is this provider running in a secure enclave?"

"Check if provider 0x1234... is TEE-verified"

"Validate the security of this AI provider"
```

**Example conversation:**

```
You: Verify that provider 0x1234...5678 is running in a TEE

Claude: I'll verify the provider's TEE attestation.

[Calls compute_verify_provider internally]

TEE Verification: PASSED

Provider: 0x1234...5678
TEE Type: dstack
Target Separated: Yes
Reports generated: attestation-report.json, quote.bin

This provider is running in a trusted execution environment.
Your data is processed in an isolated hardware enclave.
```

### Storage Info (Partial)

> **Status:** This tool is partially implemented (mock mode).

**What you can say:**

```
"Get info about this storage hash"

"Check if file 0x1234... exists on 0G Storage"
```

**Example conversation:**

```
You: Check if file 0x0001234567890abcdef... exists on 0G Storage

Claude: [Calls storage_info internally]

File found on 0G Storage:
- Size: 51,200 bytes
- Finalized: Yes
- Explorer: https://storagescan-galileo.0g.ai/file/0x0001234...
```

> **Coming Soon:** Full storage upload/download functionality.

---

### System Health Check

**What you can say:**

```
"Is the 0G server running?"

"Check the MCP server status"

"Ping the 0G service"
```

**Example conversation:**

```
You: Is the 0G MCP server working?

Claude: Let me check the server status.

[Calls system_ping internally]

Server Status: OK
Network: 0G-Galileo-Testnet
Wallet: Connected
Session: abc123xyz
```

---

## Common Workflows

### Workflow 1: First-Time Setup

```
You: I want to start using 0G for AI inference. What do I need?

Claude: Let me help you get set up with 0G.

1. First, let me check available providers...
   [Lists 3 providers on testnet]

2. Checking your wallet status...
   [Shows wallet not configured]

To get started:
1. Get testnet tokens from https://faucet.0g.ai
2. Add your wallet: claude mcp add --scope user 0g-cc npx @0gfoundation/0g-cc -e ZEROG_PRIVATE_KEY=0x...
3. Then ask me to deposit funds to your ledger

Or use free mode now - some providers don't require payment!

You: Let's try free mode. Explain what a closure is in JavaScript.

Claude: [Uses 0G inference]
A closure is a function that remembers variables from its outer scope...
```

### Workflow 2: Cost-Conscious Development

```
You: I want to use the cheapest option for code reviews

Claude: Let me check the provider costs...

[Lists providers sorted by price]

The cheapest is qwen-2.5-7b-instruct at 0.05/0.10 A0GI per MTok.
I'll use this for your code reviews.

You: Great, review this function for bugs [paste code]

Claude: [Uses cheapest 0G provider]
I found 2 potential issues:
1. Missing null check on line 5
2. Array index could be out of bounds on line 12

Cost: ~0.00003 A0GI (significantly cheaper than cloud alternatives)
```

### Workflow 3: Security-Sensitive Work

```
You: I need to process some sensitive code. Use TEE verification.

Claude: I'll use TEE-verified providers for security.

First, let me verify the provider...
[Verifies TEE attestation - PASSED]

Now processing your request in a secure enclave...
[Runs inference with requireTEE: true]

Your code was processed in a TEE. The provider cannot see your data.
```

### Workflow 4: Production Deployment

```
You: I'm ready to use 0G in production. Help me set it up.

Claude: For production, you'll want mainnet with cloud fallback.

Recommended configuration:
claude mcp add --scope user 0g-cc npx @0gfoundation/0g-cc \
  -e ZEROG_NETWORK=mainnet \
  -e ZEROG_PRIVATE_KEY=0x_your_key \
  -e OPENROUTER_API_KEY=sk-or-v1-_your_key \
  -e OPENROUTER_MODEL=deepseek/deepseek-chat

This gives you:
- 0G as primary (significantly cheaper than cloud)
- Cloud fallback for reliability
- Full wallet features

You: Done. Now deposit 5 0G to start.

Claude: [Deposits 5 0G]
Your production account is ready with 5.0 0G.
Estimated calls: ~100,000 (based on current provider pricing)
```

> **Note:** On mainnet, the currency is 0G (not A0GI). Make sure your wallet has sufficient 0G tokens.

---

## Cost Savings

### 0G vs Cloud Comparison

Typical savings when using 0G decentralized compute vs cloud providers:

| Provider | Input Price | Output Price | vs Claude Sonnet |
|----------|-------------|--------------|------------------|
| 0G Qwen 7B | 0.05 A0GI/MTok | 0.10 A0GI/MTok | ~90% cheaper |
| 0G GPT-OSS 20B | 0.05 A0GI/MTok | 0.10 A0GI/MTok | ~90% cheaper |
| 0G Gemma 27B | 0.15 A0GI/MTok | 0.40 A0GI/MTok | ~85% cheaper |
| Claude Sonnet (cloud) | $3.00/MTok | $15.00/MTok | baseline |

> **Note:** A0GI is the testnet token. On mainnet, pricing is in 0G tokens. Actual savings depend on current token prices.

### Routing Priority

The router automatically selects providers in this order:

1. **0G (Preferred)** - Cheapest, decentralized
2. **Cloud Fallback** - If 0G unavailable
3. **Simulation** - Development only (no network)

### Check Your Balance

```
You: How much do I have left for inference?

Claude: Let me check your balance...

[Calls compute_get_balance internally]

Current ledger: 1.85 A0GI
Estimated calls remaining: ~74,000
Cost per call: ~0.000025 A0GI

Your balance is sufficient for inference.
```

---

## Troubleshooting

### "No wallet configured"

**Problem:** Tools requiring wallet access fail.

**Solution:**
```bash
# Add your private key
claude mcp add --scope user 0g-cc npx @0gfoundation/0g-cc \
  -e ZEROG_PRIVATE_KEY=0x_your_key_here
```

### "Insufficient funds"

**Problem:** Not enough balance for deposit or inference.

**Solution:**
1. Check your balance: "What's my 0G balance?"
2. Get testnet tokens: https://faucet.0g.ai
3. Or reduce deposit amount

### "No providers available"

**Problem:** No 0G providers responding.

**Solution:**
1. Check network status: https://chainscan-galileo.0g.ai
2. Try again in a few minutes
3. If urgent, add cloud fallback:
   ```bash
   -e OPENROUTER_API_KEY=your_key
   -e OPENROUTER_MODEL=deepseek/deepseek-chat
   ```

### "Cloud fallback failed"

**Problem:** OpenRouter not working.

**Solution:**
1. Verify both env vars are set:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`
2. Check your API key at https://openrouter.ai
3. Ensure the model name is correct

### "Large deposit requires confirmation"

**Problem:** Deposits >10 A0GI/0G are blocked.

**Solution:** This is a safety feature. Confirm with:
```
"Yes, deposit 15 A0GI with confirmation"
```

Or adjust threshold:
```bash
-e ZEROG_LARGE_DEPOSIT_THRESHOLD=20
```

### "Transaction failed due to gas"

**Problem:** Not enough gas for blockchain transaction.

**Solution:**
1. Ensure wallet has native tokens (A0GI/0G) for gas
2. Increase gas buffer:
   ```bash
   -e ZEROG_GAS_BUFFER=0.05
   ```

### Viewing Logs

For debugging, check MCP server logs:

```bash
# View Claude Code logs
cat ~/.claude/logs/mcp-*.log | grep 0g-cc
```

---

## Quick Reference Card

### Natural Language Cheatsheet

| Want to... | Say... |
|------------|--------|
| Run AI inference | "Use 0G to [describe task]" |
| Check providers | "What providers are available?" |
| Check balance | "What's my 0G balance?" |
| Deposit funds | "Deposit [amount] to my ledger" |
| Verify security | "Verify this provider's TEE" |
| Check status | "Is the 0G server running?" |

### Configuration Cheatsheet

```bash
# Minimal (free testnet)
claude mcp add --scope user 0g-cc npx @0gfoundation/0g-cc

# With wallet
claude mcp add --scope user 0g-cc npx @0gfoundation/0g-cc \
  -e ZEROG_PRIVATE_KEY=0x...

# Full production
claude mcp add --scope user 0g-cc npx @0gfoundation/0g-cc \
  -e ZEROG_NETWORK=mainnet \
  -e ZEROG_PRIVATE_KEY=0x... \
  -e OPENROUTER_API_KEY=sk-or-v1-... \
  -e OPENROUTER_MODEL=deepseek/deepseek-chat
```

---

## Getting Help

- **GitHub Issues**: https://github.com/0g-axion/0g-cc/issues
- **0G Documentation**: https://docs.0g.ai
- **0G Discord**: https://discord.gg/0glabs

---

*Built with 0G - Decentralized AI for Everyone*
