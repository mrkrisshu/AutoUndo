"use client";

import React from "react";

export default function PremiumBackground({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white selection:bg-emerald-500/30 font-sans">
            {/* Static Premium Background */}

            {/* 1. Base dark background is already set on the div (bg-[#0a0a0a]) */}

            {/* 2. Subtle Gradient Orbs for depth (Static) - Emerald & Teal */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />

            {/* 3. Noise texture for texture (optional, subtle) */}
            <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none mix-blend-overlay" />

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
