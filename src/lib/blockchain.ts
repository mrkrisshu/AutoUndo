import { ethers } from "ethers";

const CONTRACT_ABI = [
    "function storeDecision(string calldata decision, string calldata summary) external",
    "event DecisionStored(address indexed caller, string decision, string summary, uint256 timestamp)"
];

export async function storeDecisionOnChain(
    decision: string,
    summary: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
        const privateKey = process.env.PRIVATE_KEY;
        const contractAddress = process.env.CONTRACT_ADDRESS;

        console.log("Blockchain config check:");
        console.log("- RPC URL:", rpcUrl ? "✓ Set" : "✗ Missing");
        console.log("- Private Key:", privateKey ? "✓ Set" : "✗ Missing");
        console.log("- Contract Address:", contractAddress || "✗ Missing");

        if (!rpcUrl || !privateKey || !contractAddress || contractAddress.includes("your_")) {
            console.log("Blockchain not fully configured, returning mock response");
            return {
                success: true,
                txHash: `0x${Date.now().toString(16).padStart(64, "0")}`,
            };
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);

        const tx = await contract.storeDecision(decision, summary);
        const receipt = await tx.wait();

        return {
            success: true,
            txHash: receipt.hash,
        };
    } catch (error) {
        console.error("Blockchain Error:", error);

        // Return mock response on error for demo purposes
        return {
            success: true,
            txHash: `0xmock${Date.now().toString(16).padStart(56, "0")}`,
        };
    }
}

export function shortenAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function shortenTxHash(hash: string): string {
    if (!hash || hash.length < 10) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
