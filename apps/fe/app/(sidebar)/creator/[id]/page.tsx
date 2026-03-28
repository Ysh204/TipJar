"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "../../../../components/RequireAuth";
import { useCreator } from "../../../../hooks/creators";
import { tipCreator } from "../../../../lib/api";

function shortSig(sig: string) {
  return sig.slice(0, 12) + "…" + sig.slice(-4);
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function StatusNotification({ kind, message }: { kind: 'success' | 'error' | 'loading' | '', message: string }) {
  if (!message) return null;
  return (
    <div className={`status-bar status-${kind}`}>
      <div className="flex flex-col">
        <span className="font-bold uppercase tracking-wider text-[10px] opacity-70">
          {kind === 'loading' ? 'Processing' : kind}
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { creator, loading, error, refresh } = useCreator(id);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ kind: '' as any, msg: '' });

  async function handleTip(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: 'loading', msg: 'Signing and broadcasting tip...' });
    setSending(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await tipCreator(token, { toCreatorId: id, amount: parseFloat(amount), message: message || undefined });
      setStatus({ kind: 'success', msg: 'Tip sent successfully! 🎉' });
      setAmount(""); setMessage("");
      refresh();
    } catch (err: any) {
      setStatus({ kind: 'error', msg: err?.message || "Tip failed" });
    } finally {
      setSending(false);
      setTimeout(() => setStatus({ kind: '', msg: '' }), 6000);
    }
  }

  if (loading) return (
      <RequireAuth>
        <div className="flex flex-col items-center py-24 gap-4">
           <div className="w-12 h-12 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
           <span className="text-xs uppercase tracking-[0.2em] font-bold text-teal-400">Loading Profile...</span>
        </div>
      </RequireAuth>
  );

  if (error || !creator) return (
    <RequireAuth>
      <div className="card text-center py-20 flex flex-col items-center gap-4">
         <span className="text-4xl opacity-50">😕</span>
         <h3 className="text-xl font-bold">Profile Not Found</h3>
         <p className="text-[#a0a0b0]">{error || "This creator details could not be retrieved."}</p>
      </div>
    </RequireAuth>
  );

  const initials = (creator.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <RequireAuth>
      <div className="max-w-5xl mx-auto" id="creator-profile">
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-indigo-400 p-1 shadow-[0_0_30px_rgba(45,212,191,0.2)]">
               <div className="w-full h-full rounded-full bg-[#09090b] flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                  {creator.avatarUrl ? (
                    <img src={creator.avatarUrl} alt={creator.displayName || ""} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-white">{initials}</span>
                  )}
               </div>
            </div>
            <div className="text-center md:text-left flex-1">
               <h1 className="text-4xl font-black landing-gradient mb-2">{creator.displayName}</h1>
               <p className="text-slate-400 max-w-xl line-clamp-2">{creator.bio || "No bio description provided."}</p>
               <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                  <div className="flex flex-col bg-black/30 shadow-inner rounded-xl px-5 py-3 border border-white/5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Total Received</span>
                    <span className="text-lg font-bold text-white">◎ {creator.totalTips.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex flex-col bg-black/30 shadow-inner rounded-xl px-5 py-3 border border-white/5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Support Count</span>
                    <span className="text-lg font-bold text-white">{creator.tipCount} Tips</span>
                  </div>
               </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8">
          {/* Tip Form */}
          <div className="card h-fit sticky top-6">
            <div className="flex items-center gap-3 mb-6">
               <svg className="text-teal-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
               <h2 className="text-lg font-bold uppercase tracking-widest">Support</h2>
            </div>
            <form onSubmit={handleTip} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Amount (SOL)</label>
                <input className="input bg-black/30 shadow-inner border border-white/5" type="number" step="any" min="0" placeholder="0.05" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Message (Optional)</label>
                <textarea className="input bg-black/30 shadow-inner border border-white/5 min-h-[100px] resize-none" placeholder="Leave a nice comment..." value={message} onChange={e => setMessage(e.target.value)} maxLength={280} />
              </div>
              <button disabled={sending} className="btn btn-primary w-full mt-2" type="submit">
                {sending ? "Processing..." : `Send Tip to ${(creator.displayName || "Creator").split(' ')[0]}`}
              </button>
            </form>
          </div>

          {/* Activity Feed */}
          <div className="card">
             <div className="flex items-center gap-3 mb-6">
                <svg className="text-indigo-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <h2 className="text-lg font-bold uppercase tracking-widest">Activity Feed</h2>
             </div>
             {creator.tipsReceived.length === 0 ? (
               <div className="text-center py-20 opacity-30">
                  <p className="text-sm">Be the first to support this creator!</p>
               </div>
             ) : (
               <div className="flex flex-col gap-4">
                 {creator.tipsReceived.map((tip) => (
                   <div key={tip.id} className="tip-row flex-col items-stretch gap-3">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                              {tip.fromUser.avatarUrl ? (
                                <img src={tip.fromUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-black text-white">{(tip.fromUser.displayName || 'A').slice(0, 1).toUpperCase()}</span>
                              )}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-white hover:text-teal-400 transition-colors">{tip.fromUser.displayName || "Anonymous contributor"}</span>
                              <span className="text-[10px] text-slate-500">{fmtTime(tip.createdAt)}</span>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-sm font-black text-emerald-400">◎ {tip.amount.toFixed(4)}</span>
                           {tip.signature && (
                             <a href={`https://explorer.solana.com/tx/${tip.signature}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                               VIEW TX <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                             </a>
                           )}
                        </div>
                     </div>
                     {tip.message && (
                       <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                          <p className="text-xs text-[#d1d5db] italic line-clamp-3">"{tip.message}"</p>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        <StatusNotification kind={status.kind} message={status.msg} />
      </div>
    </RequireAuth>
  );
}
