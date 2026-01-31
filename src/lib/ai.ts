import OpenAI from "openai";
import { DecisionResult } from "./types";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    baseURL: process.env.OPENAI_BASE_URL || "https://api.0g.ai/v1",
});

const SYSTEM_PROMPT = `You are an AI safety auditor for automated systems. Your role is to analyze metrics and decide whether to EXECUTE or SKIP an automated action.

CRITICAL RULES:
1. ALWAYS prefer safety over aggressiveness
2. Explicitly state uncertainty when present
3. If decision is EXECUTE, you MUST provide a detailed undo plan
4. Your output must be suitable for immutable on-chain storage
5. Be conservative - when in doubt, SKIP

You must respond with valid JSON only, no additional text.`;

const USER_PROMPT_TEMPLATE = (metricValue: number) => `
Analyze the following metric value and decide if an automated action should be executed.

METRIC VALUE: ${metricValue}

Consider:
- Values significantly above or below normal ranges may indicate anomalies
- Normal range is typically 30-70
- Values outside 10-90 require extra caution
- Extreme values (<5 or >95) should almost always result in SKIP

Respond with this exact JSON structure:
{
  "decision": "EXECUTE" or "SKIP",
  "reasoning": "Detailed explanation of your decision process",
  "confidence_score": <number between 0.0 and 1.0>,
  "risk_assessment": "Low" or "Medium" or "High",
  "undo_plan": "Detailed step-by-step plan to reverse this action (required if EXECUTE, can be 'N/A - Action skipped' if SKIP)",
  "audit_summary": "One-line summary suitable for blockchain storage"
}`;

export async function generateDecision(metricValue: number): Promise<DecisionResult> {
    try {
        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || "gpt-3.5-turbo",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: USER_PROMPT_TEMPLATE(metricValue) },
            ],
            temperature: 0.3,
            max_tokens: 500,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from AI");
        }

        const parsed = JSON.parse(content) as DecisionResult;

        // Validate and sanitize response
        return {
            decision: parsed.decision === "EXECUTE" ? "EXECUTE" : "SKIP",
            reasoning: parsed.reasoning || "No reasoning provided",
            confidence_score: Math.min(1, Math.max(0, parsed.confidence_score || 0.5)),
            risk_assessment: ["Low", "Medium", "High"].includes(parsed.risk_assessment)
                ? parsed.risk_assessment
                : "Medium",
            undo_plan: parsed.undo_plan || "No undo plan provided",
            audit_summary: parsed.audit_summary || `Decision: ${parsed.decision} for metric ${metricValue}`,
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error("AI Decision Error:", error);

        // Fallback deterministic logic if AI fails
        return generateFallbackDecision(metricValue);
    }
}

function generateFallbackDecision(metricValue: number): DecisionResult {
    const isInSafeRange = metricValue >= 30 && metricValue <= 70;
    const isInCautionRange = metricValue >= 10 && metricValue <= 90;

    let decision: "EXECUTE" | "SKIP";
    let reasoning: string;
    let confidence: number;
    let risk: "Low" | "Medium" | "High";
    let undoPlan: string;

    if (isInSafeRange) {
        decision = "EXECUTE";
        reasoning = `Metric value ${metricValue} is within the safe operating range (30-70). System analysis indicates stable conditions for automated action.`;
        confidence = 0.85;
        risk = "Low";
        undoPlan = `1. Log current state before action\n2. Execute action with transaction ID\n3. If issues detected, revert to logged state\n4. Notify monitoring systems of rollback\n5. Generate incident report`;
    } else if (isInCautionRange) {
        decision = "SKIP";
        reasoning = `Metric value ${metricValue} is outside the safe range (30-70) but within caution boundaries (10-90). Recommending skip for safety.`;
        confidence = 0.7;
        risk = "Medium";
        undoPlan = "N/A - Action skipped for safety";
    } else {
        decision = "SKIP";
        reasoning = `Metric value ${metricValue} is in the extreme range (outside 10-90). High risk of system instability. Action must be skipped.`;
        confidence = 0.95;
        risk = "High";
        undoPlan = "N/A - Action skipped due to extreme values";
    }

    return {
        decision,
        reasoning,
        confidence_score: confidence,
        risk_assessment: risk,
        undo_plan: undoPlan,
        audit_summary: `${decision}: Metric=${metricValue}, Risk=${risk}, Confidence=${confidence}`,
        timestamp: Date.now(),
    };
}
