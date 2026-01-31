import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--secondary)] border border-[var(--border)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-slow"></span>
            <span className="text-sm text-[var(--muted)]">Powered by 0G Network</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Reversible AI Automation
            <br />
            <span className="text-[var(--primary)]">for a Safer Web</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-[var(--muted)] mb-12 max-w-2xl mx-auto">
            AutoUndo ensures every AI action includes an AI-generated rollback plan using decentralized compute and blockchain.
          </p>

          {/* 3-Step Flow */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold">1</div>
              <span className="text-[var(--foreground)]">AI decides</span>
            </div>
            <div className="hidden md:block w-8 h-px bg-[var(--border)]"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold">2</div>
              <span className="text-[var(--foreground)]">Undo plan generated</span>
            </div>
            <div className="hidden md:block w-8 h-px bg-[var(--border)]"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold">3</div>
              <span className="text-[var(--foreground)]">Stored immutably</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold rounded-lg transition-colors text-lg"
          >
            Launch App
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-[var(--border)]">
        <p className="text-sm text-[var(--muted)]">
          Built on <span className="text-[var(--primary)]">0G</span> • Hackathon Project
        </p>
      </footer>
    </main>
  );
}
