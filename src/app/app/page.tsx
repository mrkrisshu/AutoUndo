"use client";

import { useState } from "react";
import Link from "next/link";
import { DecisionResult, HistoryItem } from "@/lib/types";

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

function getRiskColor(risk: string): string {
    switch (risk) {
        case "Low": return "text-[var(--accent)]";
        case "Medium": return "text-[var(--warning)]";
        case "High": return "text-[var(--danger)]";
        default: return "text-[var(--muted)]";
    }
}

function getRiskBgColor(risk: string): string {
    switch (risk) {
        case "Low": return "bg-[var(--accent)]/10 border-[var(--accent)]/30";
        case "Medium": return "bg-[var(--warning)]/10 border-[var(--warning)]/30";
        case "High": return "bg-[var(--danger)]/10 border-[var(--danger)]/30";
        default: return "bg-[var(--muted)]/10 border-[var(--muted)]/30";
    }
}

function getDecisionColor(decision: string): string {
    return decision === "EXECUTE" ? "text-[var(--accent)]" : "text-[var(--warning)]";
}

export default function AppPage() {
    const [metricValue, setMetricValue] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [storing, setStoring] = useState(false);
    const [currentResult, setCurrentResult] = useState<DecisionResult | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleRunAutomation = async () => {
        const value = parseFloat(metricValue);
        if (isNaN(value) || value < 0 || value > 100) {
            setError("Please enter a valid number between 0 and 100");
            return;
        }

        setLoading(true);
        setError(null);
        setCurrentResult(null);

        try {
            const response = await fetch("/api/decide", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ metricValue: value }),
            });

            if (!response.ok) {
                throw new Error("Failed to get decision");
            }

            const decision: DecisionResult = await response.json();
            setCurrentResult(decision);

            // Store proof on chain
            setStoring(true);
            const storeResponse = await fetch("/api/store-proof", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    decision: decision.decision,
                    auditSummary: decision.audit_summary,
                }),
            });

            const storeResult = await storeResponse.json();

            const historyItem: HistoryItem = {
                id: generateId(),
                metricValue: value,
                createdAt: Date.now(),
                ...decision,
                txHash: storeResult.txHash,
            };

            setHistory((prev) => [historyItem, ...prev]);
            setStoring(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
            setStoring(false);
        }
    };

    const handleUndo = (id: string) => {
        setHistory((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, undone: true } : item
            )
        );
    };

    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold flex items-center gap-2">
                        <span className="text-[var(--primary)]">Auto</span>Undo
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-slow"></span>
                        <span className="text-sm text-[var(--muted)]">0G Connected</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Input & Result */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Input Section */}
                        <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4">Run Automation</h2>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label htmlFor="metric" className="block text-sm text-[var(--muted)] mb-2">
                                        Metric Value (0-100)
                                    </label>
                                    <input
                                        id="metric"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={metricValue}
                                        onChange={(e) => setMetricValue(e.target.value)}
                                        placeholder="Enter metric value..."
                                        className="w-full px-4 py-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleRunAutomation}
                                        disabled={loading || !metricValue}
                                        className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--muted)] disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>Run Automation</>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>
                            )}
                        </section>

                        {/* Result Section */}
                        {currentResult && (
                            <section className="animate-fade-in space-y-4">
                                {/* Decision Card */}
                                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold">Decision Result</h2>
                                        {storing && (
                                            <span className="text-sm text-[var(--muted)] flex items-center gap-2">
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Storing on chain...
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                                        {/* Decision */}
                                        <div className="bg-[var(--secondary)] rounded-lg p-4">
                                            <p className="text-sm text-[var(--muted)] mb-1">Decision</p>
                                            <p className={`text-2xl font-bold ${getDecisionColor(currentResult.decision)}`}>
                                                {currentResult.decision}
                                            </p>
                                        </div>

                                        {/* Confidence */}
                                        <div className="bg-[var(--secondary)] rounded-lg p-4">
                                            <p className="text-sm text-[var(--muted)] mb-1">Confidence</p>
                                            <p className="text-2xl font-bold text-[var(--foreground)]">
                                                {(currentResult.confidence_score * 100).toFixed(0)}%
                                            </p>
                                        </div>

                                        {/* Risk Level */}
                                        <div className={`rounded-lg p-4 border ${getRiskBgColor(currentResult.risk_assessment)}`}>
                                            <p className="text-sm text-[var(--muted)] mb-1">Risk Level</p>
                                            <p className={`text-2xl font-bold ${getRiskColor(currentResult.risk_assessment)}`}>
                                                {currentResult.risk_assessment}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Reasoning */}
                                    <div className="mb-4">
                                        <p className="text-sm text-[var(--muted)] mb-2">AI Reasoning</p>
                                        <p className="text-[var(--foreground)] bg-[var(--secondary)] rounded-lg p-4">
                                            {currentResult.reasoning}
                                        </p>
                                    </div>

                                    {/* Undo Plan */}
                                    <div className="mb-4">
                                        <p className="text-sm text-[var(--muted)] mb-2">Undo Plan</p>
                                        <div className="text-[var(--foreground)] bg-[var(--secondary)] rounded-lg p-4 whitespace-pre-line">
                                            {currentResult.undo_plan}
                                        </div>
                                    </div>

                                    {/* Audit Summary */}
                                    <div className="p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-lg">
                                        <p className="text-sm text-[var(--muted)] mb-1">Audit Summary (On-Chain)</p>
                                        <p className="text-[var(--foreground)] font-mono text-sm">
                                            {currentResult.audit_summary}
                                        </p>
                                    </div>
                                </div>

                                {/* Undo Button */}
                                {currentResult.decision === "EXECUTE" && (
                                    <div className="text-center">
                                        <button
                                            onClick={() => {
                                                if (history.length > 0) {
                                                    handleUndo(history[0].id);
                                                }
                                            }}
                                            className="w-full py-4 bg-[var(--danger)] hover:bg-[var(--danger)]/80 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                            UNDO ACTION
                                        </button>
                                        <p className="text-xs text-[var(--muted)] mt-2">
                                            Reverts the AI-initiated action (audit trail remains on-chain)
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Right Column - History */}
                    <div className="lg:col-span-1">
                        <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-4">Decision History</h2>

                            {history.length === 0 ? (
                                <p className="text-[var(--muted)] text-sm text-center py-8">
                                    No decisions yet. Run an automation to see history.
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {history.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`p-4 rounded-lg border transition-all ${item.undone
                                                ? "bg-[var(--danger)]/10 border-[var(--danger)]/30 opacity-60"
                                                : "bg-[var(--secondary)] border-[var(--border)]"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`font-semibold ${getDecisionColor(item.decision)}`}>
                                                    {item.decision}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${getRiskBgColor(item.risk_assessment)} ${getRiskColor(item.risk_assessment)}`}>
                                                    {item.risk_assessment}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--muted)] mb-1">
                                                Metric: <span className="text-[var(--foreground)]">{item.metricValue}</span>
                                            </p>
                                            <p className="text-sm text-[var(--muted)] mb-2">
                                                Confidence: <span className="text-[var(--foreground)]">{(item.confidence_score * 100).toFixed(0)}%</span>
                                            </p>
                                            {item.txHash && (
                                                <p className="text-xs font-mono text-[var(--muted)] truncate">
                                                    On-chain proof: {item.txHash.slice(0, 16)}...
                                                </p>
                                            )}
                                            {item.undone && (
                                                <p className="text-xs text-[var(--danger)] mt-2 font-medium">
                                                    ↩ Action Undone
                                                </p>
                                            )}
                                            {!item.undone && item.decision === "EXECUTE" && (
                                                <button
                                                    onClick={() => handleUndo(item.id)}
                                                    className="mt-2 text-xs text-[var(--danger)] hover:underline"
                                                >
                                                    Undo this action
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-4 text-center border-t border-[var(--border)]">
                <p className="text-sm text-[var(--muted)]">
                    AutoUndo • Built on <span className="text-[var(--primary)]">0G</span>
                </p>
            </footer>
        </main>
    );
}
