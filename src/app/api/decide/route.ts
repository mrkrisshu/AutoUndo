import { NextResponse } from "next/server";
import { generateDecision } from "@/lib/ai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { metricValue } = body;

        if (typeof metricValue !== "number" || isNaN(metricValue)) {
            return NextResponse.json(
                { error: "Invalid metric value. Must be a number." },
                { status: 400 }
            );
        }

        if (metricValue < 0 || metricValue > 100) {
            return NextResponse.json(
                { error: "Metric value must be between 0 and 100." },
                { status: 400 }
            );
        }

        const decision = await generateDecision(metricValue);

        return NextResponse.json(decision);
    } catch (error) {
        console.error("API Error - /api/decide:", error);
        return NextResponse.json(
            { error: "Failed to generate decision" },
            { status: 500 }
        );
    }
}
