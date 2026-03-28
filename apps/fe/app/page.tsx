"use client";

import Link from "next/link";

const Icons = {
  Lightning: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Lock: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Heart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  Chart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <main className="max-w-4xl text-center z-10">
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(255,255,255,0.05)]">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">On-Chain Tipping Platform</span>
        </div>

        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-6 landing-gradient leading-tight">
          TipJar
        </h1>
        
        <p className="text-lg sm:text-xl text-[#a0a0b0] max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          Support your favorite creators with instant SOL tips.
          <span className="block mt-2 font-bold text-white/80 italic">Secured by MPC — no seed phrases, no compromise.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
           <Link href="/signin" className="btn btn-primary px-10 py-4 text-base w-full sm:w-auto shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              Get Started
           </Link>
           <Link href="/dashboard" className="btn btn-outline px-10 py-4 text-base w-full sm:w-auto">
              Explore Creators
           </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24">
           {[
             { label: "Fast", icon: Icons.Lightning, text: "Instant SOL transfers" },
             { label: "Secure", icon: Icons.Lock, text: "Multi-party computation" },
             { label: "Direct", icon: Icons.Heart, text: "Peer-to-peer support" },
             { label: "Proven", icon: Icons.Chart, text: "Full on-chain history" }
           ].map((feat, i) => (
             <div key={i} className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                  {feat.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#f8fafc]">{feat.label}</span>
                <span className="text-[10px] text-[#94a3b8] font-medium">{feat.text}</span>
             </div>
           ))}
        </div>
      </main>

      <footer className="absolute bottom-8 text-[10px] uppercase tracking-[0.2em] text-[#606070] font-bold">
        Powered by Solana & Multi-Party Computation
      </footer>
    </div>
  );
}
