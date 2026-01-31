"use client";

import { useState } from "react";
import Link from "next/link";
import { DecisionResult, HistoryItem } from "@/lib/types";
import PremiumBackground from "@/components/premium-background";

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

function getDecisionColor(decision: string): string {
    return decision === "EXECUTE"
        ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
        : "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]";
}

function getRiskBadge(risk: string) {
    switch (risk) {
        case "Low":
            return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
        case "Medium":
            return "bg-amber-500/20 text-amber-300 border-amber-500/30";
        case "High":
            return "bg-rose-500/20 text-rose-300 border-rose-500/30";
        default:
            return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
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
        <PremiumBackground>
            {/* Font Import */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                body { font-family: 'Space Grotesk', sans-serif; }
            `}</style>

            <div className="min-h-screen flex flex-col font-sans">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Auto</span>Undo
                        </Link>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-xs font-medium text-emerald-100/80">0G Connected</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Left Column - Main Action & Result */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Input Card */}
                            <section className="relative overflow-hidden group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative p-6 sm:p-8 space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-white mb-1">Run Automation</h2>
                                        <p className="text-sm text-white/50">Enter a metric value to simulate an AI decision.</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={metricValue}
                                                onChange={(e) => setMetricValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !loading && metricValue) {
                                                        handleRunAutomation();
                                                    }
                                                }}
                                                placeholder="Metric Value (0-100)"
                                                className="w-full h-14 px-5 bg-black/40 border border-white/10 rounded-xl text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                                                disabled={loading}
                                            />
                                        </div>
                                        <button
                                            onClick={handleRunAutomation}
                                            disabled={loading || !metricValue}
                                            className="h-14 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-nowrap"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <span>Analyze & Execute</span>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {error && <p className="text-rose-400 text-sm">{error}</p>}
                                </div>
                            </section>

                            {/* Result Section */}
                            {currentResult && (
                                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden relative">
                                        {/* Storing indicator */}
                                        {storing && (
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-shimmer" />
                                        )}

                                        <div className="p-6 sm:p-8 space-y-8">
                                            {/* Results Grid */}
                                            <div className="grid sm:grid-cols-3 gap-4">
                                                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                                    <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Decision</p>
                                                    <p className={`text-3xl font-bold ${getDecisionColor(currentResult.decision)} font-mono`}>
                                                        {currentResult.decision}
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                                    <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Confidence</p>
                                                    <p className="text-3xl font-bold text-white font-mono">
                                                        {(currentResult.confidence_score * 100).toFixed(0)}%
                                                    </p>
                                                </div>
                                                <div className={`p-4 rounded-xl border ${getRiskBadge(currentResult.risk_assessment)}`}>
                                                    <p className="text-xs font-medium uppercase tracking-wider mb-1 opacity-70">Risk Level</p>
                                                    <p className="text-3xl font-bold font-mono">
                                                        {currentResult.risk_assessment}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Reasoning */}
                                            <div>
                                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    AI Reasoning
                                                </h3>
                                                <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-white/90 leading-relaxed text-sm sm:text-base">
                                                    {currentResult.reasoning}
                                                </div>
                                            </div>

                                            {/* Undo Plan */}
                                            <div>
                                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Undo Plan
                                                </h3>
                                                <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-white/80 font-mono text-xs sm:text-sm whitespace-pre-wrap">
                                                    {currentResult.undo_plan}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="px-6 sm:px-8 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                                                Proof Stored on 0G Chain
                                            </div>
                                            {currentResult.audit_summary && (
                                                <span className="text-xs text-white/30 hidden sm:block truncate max-w-[200px]">
                                                    hash: {currentResult.audit_summary}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Undo Button */}
                                    {currentResult.decision === "EXECUTE" && (
                                        <div className="text-center pt-2">
                                            <button
                                                onClick={() => history.length > 0 && handleUndo(history[0].id)}
                                                className="w-full py-4 bg-gradient-to-r from-rose-900/80 to-red-900/80 hover:from-rose-800 hover:to-red-800 border border-rose-500/30 text-rose-100 font-semibold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                EMERGENCY UNDO
                                            </button>
                                            <p className="text-xs text-white/30 mt-3 font-medium">
                                                Reverts the AI-initiated action immediately (Audit trail remains immutable on 0G)
                                            </p>
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>

                        {/* Right Column - History (Sticky) */}
                        <div className="lg:col-span-4 mt-8 lg:mt-0">
                            <div className="sticky top-24 space-y-4">
                                <h3 className="text-lg font-semibold text-white px-2">Live History</h3>
                                <div className="space-y-3 max-h-[calc(100vh-160px)] overflow-y-auto pr-2 custom-scrollbar">
                                    {history.length === 0 ? (
                                        <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                                            <p className="text-white/30 text-sm">No actions recorded yet.</p>
                                        </div>
                                    ) : (
                                        history.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`group p-4 rounded-xl border backdrop-blur-md transition-all ${item.undone
                                                    ? "bg-rose-950/20 border-rose-500/20 opacity-70"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-sm font-bold tracking-wider ${getDecisionColor(item.decision)}`}>
                                                        {item.decision}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRiskBadge(item.risk_assessment)}`}>
                                                        {item.risk_assessment}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 my-3">
                                                    <div>
                                                        <p className="text-[10px] text-white/40 uppercase">Metric</p>
                                                        <p className="text-sm font-mono text-white/90">{item.metricValue}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-white/40 uppercase">Confidence</p>
                                                        <p className="text-sm font-mono text-white/90">{(item.confidence_score * 100).toFixed(0)}%</p>
                                                    </div>
                                                </div>

                                                {item.txHash && (
                                                    <div className="mt-2 pt-2 border-t border-white/5">
                                                        <p className="text-[10px] text-white/30 truncate font-mono flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                                                            On-chain proof: {item.txHash.slice(0, 10)}...
                                                        </p>
                                                    </div>
                                                )}

                                                {item.undone ? (
                                                    <div className="mt-2 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581" />
                                                        </svg>
                                                        Action Reverted
                                                    </div>
                                                ) : item.decision === "EXECUTE" && (
                                                    <button
                                                        onClick={() => handleUndo(item.id)}
                                                        className="mt-3 w-full py-1.5 text-xs text-rose-300 hover:text-white hover:bg-rose-500/20 rounded border border-transparent hover:border-rose-500/30 transition-all"
                                                    >
                                                        Rollback Action
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PremiumBackground>
    );
}
