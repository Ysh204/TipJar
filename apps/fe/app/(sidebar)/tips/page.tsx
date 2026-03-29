"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Inbox, Send } from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import ScrollReveal from "../../../components/ScrollReveal";
import { useTips } from "../../../hooks/tips";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortSig(sig: string) {
  return sig.slice(0, 10) + "..." + sig.slice(-4);
}

export default function TipsPage() {
  const { sent, received, loading } = useTips();
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

  const activeTips = activeTab === "sent" ? sent : received;
  const totals = useMemo(
    () => ({
      sentVolume: sent.reduce((sum: number, tip: any) => sum + tip.amount, 0),
      receivedVolume: received.reduce((sum: number, tip: any) => sum + tip.amount, 0),
    }),
    [sent, received],
  );

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-[1500px]" id="tips-history">
        <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="animate-float-staking">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Tip <span className="landing-gradient">History</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[#8ba2aa]">
              A tighter, more reference-inspired ledger view for outgoing support and incoming earnings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="dashboard-chip">Sent ◎ {totals.sentVolume.toFixed(2)}</div>
            <div className="dashboard-chip">Received ◎ {totals.receivedVolume.toFixed(2)}</div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="grid gap-4">
            <div className="dashboard-panel">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#8b5cf6]/14 bg-[#8b5cf6]/10 text-[#b58cff]">
                  <Send size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
                    Outgoing support
                  </p>
                  <h2 className="text-xl font-extrabold text-white">Tips you sent</h2>
                </div>
              </div>
              <p className="text-4xl font-extrabold tracking-tight text-white">
                ◎ {totals.sentVolume.toFixed(2)}
              </p>
              <p className="mt-3 text-sm text-[#8ba1a9]">{sent.length} transfers recorded.</p>
            </div>

            <div className="dashboard-panel">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#62d6ff]/14 bg-[#62d6ff]/10 text-[#62d6ff]">
                  <Inbox size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
                    Incoming support
                  </p>
                  <h2 className="text-xl font-extrabold text-white">Tips you received</h2>
                </div>
              </div>
              <p className="text-4xl font-extrabold tracking-tight text-white">
                ◎ {totals.receivedVolume.toFixed(2)}
              </p>
              <p className="mt-3 text-sm text-[#8ba1a9]">{received.length} ledger entries tracked.</p>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#71868d]">
                  Transaction monitor
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-white">On-chain tip stream</h2>
              </div>

              <div className="flex gap-2 rounded-[1.1rem] bg-white/[0.03] p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <button
                  onClick={() => setActiveTab("sent")}
                  className={`rounded-[0.9rem] px-5 py-2.5 text-sm font-bold transition ${
                    activeTab === "sent"
                      ? "bg-[#8b5cf6]/12 text-[#b58cff]"
                      : "text-[#81979f] hover:text-white"
                  }`}
                >
                  Sent
                </button>
                <button
                  onClick={() => setActiveTab("received")}
                  className={`rounded-[0.9rem] px-5 py-2.5 text-sm font-bold transition ${
                    activeTab === "received"
                      ? "bg-[#62d6ff]/10 text-[#62d6ff]"
                      : "text-[#81979f] hover:text-white"
                  }`}
                >
                  Received
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="wallet-skeleton h-20 w-full rounded-[1.2rem]" />
                ))}
              </div>
            ) : activeTips.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 py-16 text-center text-sm text-[#8aa0a8]">
                No {activeTab} tip history recorded yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeTips.map((tip: any) => (
                  <ScrollReveal key={tip.id}>
                    <div className="tip-row group flex-col items-stretch md:flex-row md:items-center">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                            activeTab === "sent"
                              ? "border-[#8b5cf6]/14 bg-[#8b5cf6]/10 text-[#b58cff]"
                              : "border-[#62d6ff]/14 bg-[#62d6ff]/10 text-[#62d6ff]"
                          }`}
                        >
                          {activeTab === "sent" ? <Send size={18} /> : <Inbox size={18} />}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-white">
                            {activeTab === "sent"
                              ? `To: ${tip.toCreator.displayName}`
                              : `From: ${tip.fromUser.displayName || "Anonymous contributor"}`}
                          </p>
                          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#758b93]">
                            {shortSig(tip.signature)}
                          </p>
                        </div>
                      </div>

                      <div className="md:ml-auto md:text-right">
                        <p
                          className={`text-lg font-extrabold ${
                            activeTab === "sent" ? "text-white" : "text-[#62d6ff]"
                          }`}
                        >
                          {activeTab === "sent" ? "-" : "+"}◎ {tip.amount.toFixed(4)}
                        </p>
                        <p className="mt-1 text-[11px] text-[#80969e]">{fmtTime(tip.createdAt)}</p>
                      </div>

                      <a
                        href={`https://explorer.solana.com/tx/${tip.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.03] text-white/55 transition hover:text-[#b58cff] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </RequireAuth>
  );
}
