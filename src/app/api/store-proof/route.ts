import { NextResponse } from "next/server";
import { storeDecisionOnChain } from "@/lib/blockchain";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { decision, auditSummary } = body;

        if (!decision || !auditSummary) {
            return NextResponse.json(
                { error: "Missing required fields: decision and auditSummary" },
                { status: 400 }
            );
        }

        if (typeof decision !== "string" || typeof auditSummary !== "string") {
            return NextResponse.json(
                { error: "decision and auditSummary must be strings" },
                { status: 400 }
            );
        }

        const result = await storeDecisionOnChain(decision, auditSummary);

        return NextResponse.json(result);
    } catch (error) {
        console.error("API Error - /api/store-proof:", error);
        return NextResponse.json(
            { success: false, error: "Failed to store proof on chain" },
            { status: 500 }
        );
    }
}
