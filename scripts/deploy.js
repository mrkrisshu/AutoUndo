const solc = require("solc");
const { ethers } = require("ethers");
require("dotenv").config({ path: ".env.local" });

// Solidity source code
const sourceCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AutoUndoStorage {
    event DecisionStored(address indexed caller, string decision, string summary, uint256 timestamp);
    
    function storeDecision(string calldata decision, string calldata summary) external {
        emit DecisionStored(msg.sender, decision, summary, block.timestamp);
    }
}
`;

async function main() {
    console.log("=== AutoUndo Contract Deployment ===\n");

    // Step 1: Compile the contract
    console.log("Step 1: Compiling contract...");
    const input = {
        language: "Solidity",
        sources: {
            "AutoUndoStorage.sol": { content: sourceCode },
        },
        settings: {
            outputSelection: {
                "*": { "*": ["abi", "evm.bytecode.object"] },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === "error");
        if (errors.length > 0) {
            console.error("Compilation errors:", errors);
            process.exit(1);
        }
    }

    const contract = output.contracts["AutoUndoStorage.sol"]["AutoUndoStorage"];
    const abi = contract.abi;
    const bytecode = "0x" + contract.evm.bytecode.object;

    console.log("✓ Contract compiled successfully!");
    console.log("  ABI functions:", abi.map(x => x.name || x.type).join(", "));
    console.log("  Bytecode length:", bytecode.length, "chars\n");

    // Step 2: Connect to 0G network
    console.log("Step 2: Connecting to 0G Galileo Testnet...");
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("ERROR: PRIVATE_KEY not found in .env.local");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = await wallet.getAddress();

    console.log("✓ Connected!");
    console.log("  Wallet address:", address);

    const balance = await provider.getBalance(address);
    console.log("  Balance:", ethers.formatEther(balance), "0G\n");

    if (balance === 0n) {
        console.error("ERROR: No balance! Get tokens from https://faucet.0g.ai");
        process.exit(1);
    }

    // Step 3: Deploy contract
    console.log("Step 3: Deploying contract...");
    console.log("  Please wait, this may take 30-60 seconds...\n");

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const deployedContract = await factory.deploy();

    console.log("  Transaction hash:", deployedContract.deploymentTransaction().hash);
    console.log("  Waiting for confirmation...");

    await deployedContract.waitForDeployment();
    const contractAddress = await deployedContract.getAddress();

    console.log("\n========================================");
    console.log("✅ CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("========================================");
    console.log("Contract Address:", contractAddress);
    console.log("\nExplorer URL:");
    console.log(`https://chainscan-galileo.0g.ai/address/${contractAddress}`);
    console.log("\n📋 Copy this to .env.local:");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
    console.log("========================================\n");

    // Step 4: Test the contract
    console.log("Step 4: Testing contract...");
    const testContract = new ethers.Contract(contractAddress, abi, wallet);
    const testTx = await testContract.storeDecision("EXECUTE", "Deployment test");
    console.log("  Test TX sent:", testTx.hash);
    const testReceipt = await testTx.wait();
    console.log("✓ Test transaction confirmed!");
    console.log("  Block:", testReceipt.blockNumber);
    console.log("\n🎉 Your contract is ready for real on-chain transactions!");
}

main().catch(console.error);
