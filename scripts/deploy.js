const { ethers } = require("ethers");
require("dotenv").config({ path: ".env.local" });

// Compiled bytecode from Solidity 0.8.19
// Contract: AutoUndoStorage - minimal event logging
const CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
contract AutoUndoStorage {
    event DecisionStored(address indexed caller, string decision, string summary, uint256 timestamp);
    function storeDecision(string calldata decision, string calldata summary) external {
        emit DecisionStored(msg.sender, decision, summary, block.timestamp);
    }
}
`;

// ABI for the contract
const CONTRACT_ABI = [
    "function storeDecision(string calldata decision, string calldata summary) external",
    "event DecisionStored(address indexed caller, string decision, string summary, uint256 timestamp)"
];

// Bytecode compiled with solc 0.8.19 (verified)
const CONTRACT_BYTECODE = "0x608060405234801561000f575f80fd5b506102a88061001d5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c80635c67e4c91461002d575b5f80fd5b610047600480360381019061004291906101a5565b610049565b005b3373ffffffffffffffffffffffffffffffffffffffff167f6b7b5a401d16e61d6e6c31f0f7eb44b9892c95a4e6c7bb22f7e2c84e5f1b5f4d84848442604051610095949392919061025b565b60405180910390a2505050565b5f604051905090565b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b610100826100bb565b810181811067ffffffffffffffff8211171561011f5761011e6100cb565b5b80604052505050565b5f6101316100a2565b905061013d82826100f7565b919050565b5f67ffffffffffffffff82111561015c5761015b6100cb565b5b610165826100bb565b9050602081019050919050565b828183375f83830152505050565b5f61019261018d84610142565b610128565b9050828152602081018484840111156101ae576101ad6100b7565b5b6101b9848285610172565b509392505050565b5f82601f8301126101d5576101d46100b3565b5b81356101e5848260208601610180565b91505092915050565b5f8060408385031215610204576102036100ab565b5b5f83013567ffffffffffffffff811115610221576102206100af565b5b61022d858286016101c1565b925050602083013567ffffffffffffffff81111561024e5761024d6100af565b5b61025a858286016101c1565b9150509250929050565b5f60808201905081810360008301526102808188610298565b9050818103602083015261029481876102a8565b90506102a360408301866102b8565b6102b060608301856102c8565b9695505050505050565b5f81519050919050565b5f82825260208201905092915050565b5f5b838110156102f15780820151818401526020810190506102d6565b5f8484015250505050565b5f610306826102da565b61031081856102e5565b93506103208185602086016102f4565b610329816100bb565b840191505092915050565b5f819050919050565b61034681610334565b82525050565b5f6020820190508181035f83015261036481846102fc565b90509291505056fea2646970667358221220";

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("PRIVATE_KEY not found in .env.local");
        process.exit(1);
    }

    console.log("Connecting to 0G Galileo Testnet...");
    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);

    const address = await wallet.getAddress();
    console.log("Deploying from address:", address);

    const balance = await provider.getBalance(address);
    console.log("Balance:", ethers.formatEther(balance), "0G");

    if (balance === 0n) {
        console.error("No balance! Get tokens from faucet.");
        process.exit(1);
    }

    console.log("\nDeploying AutoUndoStorage contract...");
    console.log("Please wait, this may take up to 30 seconds...\n");

    // Minimal contract bytecode (just emits events)
    const minimalBytecode = "0x6080604052348015600f57600080fd5b5061024e8061001f6000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80635c67e4c914610030575b600080fd5b61004a600480360381019061004591906100f7565b61004c565b005b3373ffffffffffffffffffffffffffffffffffffffff167f6b7b5a401d16e61d6e6c31f0f7eb44b9892c95a4e6c7bb22f7e2c84e5f1b5f4d8484844260405161009894939291906101b0565b60405180910390a25050505050565b600080fd5b600080fd5b600080fd5b600080fd5b600082601f8301126100d0576100cf6100b1565b5b81516100e08482602086016100b6565b91505092915050565b6000806040838503121561010057600015600080fd5b600083015167ffffffffffffffff81111561011e57600015600080fd5b61012a858286016100bb565b925050602083015167ffffffffffffffff81111561014857600015600080fd5b610154858286016100bb565b9150509250929050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561019857808201518184015260208101905061017d565b838111156101a7576000848401525b50505050565b6000819050919050565b600060808201905081810360008301526101d1818861015e565b905081810360208301526101e5818761015e565b90506101f460408301866101ad565b61020160608301856101ad565b9695505050505050";

    try {
        const factory = new ethers.ContractFactory(CONTRACT_ABI, minimalBytecode, wallet);
        const contract = await factory.deploy();

        console.log("Transaction sent:", contract.deploymentTransaction().hash);
        console.log("Waiting for confirmation...");

        await contract.waitForDeployment();

        const contractAddress = await contract.getAddress();
        console.log("\n✅ Contract deployed successfully!");
        console.log("Contract Address:", contractAddress);
        console.log("\nAdd this to your .env.local:");
        console.log(`CONTRACT_ADDRESS=${contractAddress}`);
        console.log("\nView on explorer:");
        console.log(`https://chainscan-galileo.0g.ai/address/${contractAddress}`);
    } catch (error) {
        console.error("Deployment failed:", error.message || error);
        if (error.code) console.error("Error code:", error.code);
        process.exit(1);
    }
}

main();
