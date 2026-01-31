import { DecisionResult } from "./types";

// 0G Compute Network Configuration
const ZEROG_COMPUTE_API = "https://inference-api.0g.ai/v1";
const ZEROG_MODEL = "qwen-2.5-7b-instruct"; // Available on 0G Galileo Testnet

// Fallback to OpenRouter if 0G is unavailable
const OPENROUTER_API = "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL = "google/gemini-2.5-flash-lite";

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

interface AIResponse {
    decision: string;
    reasoning: string;
    confidence_score: number;
    risk_assessment: string;
    undo_plan: string;
    audit_summary: string;
}

// Try 0G Compute Network first
async function callZeroGCompute(metricValue: number): Promise<AIResponse | null> {
    try {
        console.log("Attempting 0G Compute Network...");

        const response = await fetch(`${ZEROG_COMPUTE_API}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.ZEROG_API_KEY || ""}`,
            },
            body: JSON.stringify({
                model: ZEROG_MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: USER_PROMPT_TEMPLATE(metricValue) },
                ],
                temperature: 0.3,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            console.log("0G Compute unavailable, status:", response.status);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return null;
        }

        // Extract JSON from response (handle markdown code blocks)
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        return JSON.parse(jsonStr.trim()) as AIResponse;
    } catch (error) {
        console.log("0G Compute error:", error);
        return null;
    }
}

// Fallback to OpenRouter
async function callOpenRouter(metricValue: number): Promise<AIResponse | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.log("OpenRouter API key not configured");
        return null;
    }

    try {
        console.log("Falling back to OpenRouter...");

        const response = await fetch(`${OPENROUTER_API}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
                "X-Title": "AutoUndo",
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: USER_PROMPT_TEMPLATE(metricValue) },
                ],
                temperature: 0.3,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            console.log("OpenRouter error, status:", response.status);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return null;
        }

        // Extract JSON from response
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        return JSON.parse(jsonStr.trim()) as AIResponse;
    } catch (error) {
        console.log("OpenRouter error:", error);
        return null;
    }
}

export async function generateDecision(metricValue: number): Promise<DecisionResult> {
    // Try 0G Compute first (decentralized AI)
    let aiResponse = await callZeroGCompute(metricValue);
    let provider = "0G Compute";

    // Fallback to OpenRouter if 0G unavailable
    if (!aiResponse) {
        aiResponse = await callOpenRouter(metricValue);
        provider = "OpenRouter";
    }

    // If both fail, use deterministic fallback
    if (!aiResponse) {
        console.log("All AI providers unavailable, using fallback logic");
        return generateFallbackDecision(metricValue);
    }

    console.log(`AI response from ${provider}:`, aiResponse);

    // Validate and sanitize response
    return {
        decision: aiResponse.decision === "EXECUTE" ? "EXECUTE" : "SKIP",
        reasoning: aiResponse.reasoning || "No reasoning provided",
        confidence_score: Math.min(1, Math.max(0, aiResponse.confidence_score || 0.5)),
        risk_assessment: ["Low", "Medium", "High"].includes(aiResponse.risk_assessment)
            ? aiResponse.risk_assessment as "Low" | "Medium" | "High"
            : "Medium",
        undo_plan: aiResponse.undo_plan || "No undo plan provided",
        audit_summary: aiResponse.audit_summary || `Decision: ${aiResponse.decision} for metric ${metricValue}`,
        timestamp: Date.now(),
    };
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
