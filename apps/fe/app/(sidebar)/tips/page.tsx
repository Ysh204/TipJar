"use client";

import { useState } from "react";
import RequireAuth from "../../../components/RequireAuth";
import { useTips } from "../../../hooks/tips";
import ScrollReveal from "../../../components/ScrollReveal";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function shortSig(sig: string) {
  return sig.slice(0, 10) + "…" + sig.slice(-4);
}

export default function TipsPage() {
  const { sent, received, loading } = useTips();
  const tips = { sent, received };
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

  return (
    <RequireAuth>
      <div className="max-w-7xl mx-auto w-full" id="tips-history">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl landing-gradient">
            Tip History
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Track your community support and earnings</p>
        </header>

        <div className="flex gap-4 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit mb-8 backdrop-blur-xl">
           <button
             onClick={() => setActiveTab("sent")}
             className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === "sent" ? "bg-teal-400/10 text-teal-400 border border-teal-400/20 shadow-[0_0_20px_rgba(45,212,191,0.05)]" : "text-slate-400 hover:text-white"}`}
           >
             Sent
           </button>
           <button
             onClick={() => setActiveTab("received")}
             className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === "received" ? "bg-indigo-400/10 text-indigo-400 border border-indigo-400/20 shadow-[0_0_20px_rgba(129,140,248,0.05)]" : "text-slate-400 hover:text-white"}`}
           >
             Received
           </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="wallet-skeleton h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="card">
            {tips[activeTab].length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <p className="text-lg">No history recorded yet</p>
                <p className="text-sm">Tips will appear here after the first transaction</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {tips[activeTab].map((tip: any) => (
                  <ScrollReveal key={tip.id}>
                    <div className="tip-row group">
                      <div className="flex items-center gap-4 flex-1">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${activeTab === "sent" ? "border-teal-400/20 bg-teal-400/10 text-teal-400" : "border-indigo-400/20 bg-indigo-400/10 text-indigo-400"}`}>
                            {activeTab === "sent" ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            )}
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                              {activeTab === "sent" ? `To: ${tip.toCreator.displayName}` : `From: ${tip.fromUser.displayName || 'Anonymous contributor'}`}
                            </span>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 opacity-70">
                              {shortSig(tip.signature)}
                            </span>
                         </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                         <span className={`text-lg font-black ${activeTab === "sent" ? "text-white" : "text-emerald-400"}`}>
                            {activeTab === "sent" ? "-" : "+"} {tip.amount.toFixed(4)} SOL
                         </span>
                         <span className="text-[10px] text-slate-400">{fmtTime(tip.createdAt)}</span>
                      </div>

                      <a
                        href={`https://explorer.solana.com/tx/${tip.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-4 p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
