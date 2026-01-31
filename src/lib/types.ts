export interface DecisionResult {
    decision: "EXECUTE" | "SKIP";
    reasoning: string;
    confidence_score: number;
    risk_assessment: "Low" | "Medium" | "High";
    undo_plan: string;
    audit_summary: string;
    timestamp?: number;
    txHash?: string;
}

export interface DecisionRequest {
    metricValue: number;
}

export interface StoreProofRequest {
    decision: string;
    auditSummary: string;
}

export interface StoreProofResponse {
    success: boolean;
    txHash?: string;
    error?: string;
}

export interface HistoryItem extends DecisionResult {
    id: string;
    metricValue: number;
    createdAt: number;
    undone?: boolean;
}
