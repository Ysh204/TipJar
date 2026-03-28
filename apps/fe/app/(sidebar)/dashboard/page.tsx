"use client";

import { useEffect, useState } from "react";
import RequireAuth from "../../../components/RequireAuth";
import { useCreators, useCreator } from "../../../hooks/creators";
import Link from "next/link";
import ScrollReveal from "../../../components/ScrollReveal";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function CreatorCard({ creator }: { creator: any }) {
  const initials = (creator.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <ScrollReveal>
      <Link href={`/creator/${creator.id}`} className="creator-card group block h-full">
        <div className="flex items-start justify-between">
          <div className="creator-card-avatar">
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">{initials}</span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-teal-400 font-bold">Creator</span>
            <span className="text-xs text-slate-400 opacity-70">#{creator.id.slice(0, 4)}</span>
          </div>
        </div>

      <div className="mt-2">
        <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
          {creator.displayName || "Unnamed"}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mt-1 min-h-[40px]">
          {creator.bio || "No bio description available for this creator."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 mt-2">
        <div className="flex flex-col bg-black/30 shadow-inner rounded-xl p-3 border border-white/5">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Earnings</span>
          <span className="text-sm font-bold text-white">{creator.totalTips.toFixed(2)} SOL</span>
        </div>
        <div className="flex flex-col items-end bg-black/30 shadow-inner rounded-xl p-3 border border-white/5">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Tips</span>
          <span className="text-sm font-bold text-white">{creator.tipCount || 0}</span>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </ScrollReveal>
  );
}

function DiscoverFeed() {
  const { creators, loading } = useCreators();

  return (
    <div id="feed-page" className="max-w-[1600px] mx-auto w-full">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl landing-gradient">
          Discover Creators
        </h1>
        <p className="text-slate-400 mt-2 font-medium text-lg">Support the community with instant devnet SOL tips</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="creator-card opacity-50">
               <div className="wallet-skeleton w-12 h-12 rounded-full mb-4" />
               <div className="wallet-skeleton h-6 w-3/4 mb-2" />
               <div className="wallet-skeleton h-4 w-full mb-4" />
            </div>
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="card text-center py-20 flex flex-col items-center gap-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 mb-2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <h3 className="text-xl font-bold text-white">No creators found</h3>
          <p className="text-slate-400">The platform is currently waiting for the first wave of creators.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {creators.map((c) => <CreatorCard key={c.id} creator={c} />)}
        </div>
      )}
    </div>
  );
}

function CreatorAnalytics({ userId }: { userId: string }) {
  const { creator, loading, error } = useCreator(userId);
  const [copied, setCopied] = useState(false);

  if (loading) return (
     <div className="flex flex-col items-center py-24 gap-4">
        <div className="w-12 h-12 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-teal-400">Loading Stats...</span>
     </div>
  );

  if (error || !creator) return (
    <div className="card text-center py-20 flex flex-col items-center gap-4">
       <span className="text-4xl opacity-50">😕</span>
       <h3 className="text-xl font-bold">Stats Not Found</h3>
       <p className="text-slate-400">Could not retrieve your creator profile.</p>
    </div>
  );

  const profileUrl = `${window.location.origin}/creator/${userId}`;

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto w-full" id="creator-analytics">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl landing-gradient">
          My Stats
        </h1>
        <p className="text-slate-400 mt-2 font-medium text-lg">Track your earnings and supporters</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.8fr] gap-6 mb-8">
         <ScrollReveal>
           <div className="card h-full flex flex-col justify-center border-t-2 border-t-teal-400/50">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total SOL Earned</span>
              <h2 className="text-5xl font-black text-white">◎ {creator.totalTips.toFixed(4)}</h2>
           </div>
         </ScrollReveal>
         
         <ScrollReveal>
           <div className="card h-full flex flex-col justify-center border-t-2 border-t-indigo-400/50">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Supporters</span>
              <h2 className="text-5xl font-black text-white">{creator.tipCount} Tips</h2>
           </div>
         </ScrollReveal>
      </div>

      <ScrollReveal>
         <div className="card mb-8">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Share Your Profile</h3>
                <p className="text-sm text-slate-400">Drop this link to allow fans to send you tips instantly.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                 <div className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm font-mono text-teal-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-[300px]">
                    {profileUrl}
                 </div>
                 <button onClick={handleCopy} className="btn flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-3 font-bold transition-colors">
                    {copied ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    )}
                 </button>
              </div>
           </div>
         </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="card">
           <div className="flex items-center gap-3 mb-6">
              <svg className="text-indigo-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <h2 className="text-lg font-bold uppercase tracking-widest">Recent Supporters</h2>
           </div>
           {creator.tipsReceived.length === 0 ? (
             <div className="text-center py-10 opacity-30">
                <p className="text-sm">No tips received yet.</p>
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
                            <span className="text-sm font-bold text-white">{tip.fromUser.displayName || "Anonymous contributor"}</span>
                            <span className="text-[10px] text-slate-500">{fmtTime(tip.createdAt)}</span>
                         </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-sm font-black text-emerald-400">+◎ {tip.amount.toFixed(4)}</span>
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
      </ScrollReveal>
    </div>
  );
}

export default function DashboardClientSwitcher() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setUserId(localStorage.getItem("userId"));
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <RequireAuth>
      {role === "CREATOR" && userId ? (
        <CreatorAnalytics userId={userId} />
      ) : (
        <DiscoverFeed />
      )}
    </RequireAuth>
  );
}
