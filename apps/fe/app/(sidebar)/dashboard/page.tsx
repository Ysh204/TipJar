"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Copy,
  LineChart,
  Users,
} from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import ScrollReveal from "../../../components/ScrollReveal";
import { useCreator, useCreators } from "../../../hooks/creators";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MetricCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent: "teal" | "lime";
}) {
  const accentClasses =
    accent === "teal"
      ? "bg-[#8b5cf6]/[0.08] text-[#b58cff] shadow-[inset_0_0_0_1px_rgba(139,92,246,0.14)]"
      : "bg-[#62d6ff]/[0.08] text-[#62d6ff] shadow-[inset_0_0_0_1px_rgba(98,214,255,0.14)]";

  return (
    <div className="dashboard-soft-panel rounded-[1.4rem] p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#70868d]">
          {label}
        </span>
        <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${accentClasses}`}>
          Live
        </div>
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-white">{value}</div>
      <p className="mt-2 text-sm text-[#7f969d]">{detail}</p>
    </div>
  );
}

function CreatorCard({ creator }: { creator: any }) {
  const initials = (creator.displayName || "?").slice(0, 2).toUpperCase();

  return (
    <ScrollReveal>
      <Link href={`/creator/${creator.id}`} className="creator-card group block h-full">
        <div className="flex items-start justify-between gap-4">
          <div className="creator-card-avatar">
            {creator.avatarUrl ? (
              <img
                src={creator.avatarUrl}
                alt={creator.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-extrabold text-white">{initials}</span>
            )}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8f88a6]">
            Creator
          </div>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white transition-colors group-hover:text-[#b58cff]">
            {creator.displayName || "Unnamed Creator"}
          </h3>
          <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#96a0b1] line-clamp-2">
            {creator.bio || "Support this creator with fast devnet SOL tips and track their on-chain activity."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1rem] bg-white/[0.015] p-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#727c8f]">
              Earned
            </p>
            <p className="mt-2 text-base font-extrabold text-white">
              ◎ {creator.totalTips.toFixed(2)}
            </p>
          </div>
          <div className="rounded-[1rem] bg-white/[0.015] p-3.5 text-right shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#727c8f]">
              Supporters
            </p>
            <p className="mt-2 text-base font-extrabold text-white">
              {creator.tipCount || 0}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/[0.04] pt-4">
          <span className="text-xs font-semibold text-[#99a4b5]">Open profile</span>
          <ArrowUpRight size={16} className="text-[#b58cff]" />
        </div>
      </Link>
    </ScrollReveal>
  );
}

function DiscoverFeed() {
  const { creators, loading } = useCreators();

  const metrics = useMemo(() => {
    const totalVolume = creators.reduce((sum, creator) => sum + creator.totalTips, 0);
    const totalTips = creators.reduce((sum, creator) => sum + (creator.tipCount || 0), 0);
    const topCreator = creators.reduce(
      (best, creator) => (creator.totalTips > (best?.totalTips ?? -1) ? creator : best),
      creators[0],
    );

    return {
      totalVolume,
      totalTips,
      totalCreators: creators.length,
      topCreator,
    };
  }, [creators]);

  return (
    <div className="mx-auto w-full max-w-[1500px]" id="feed-page">
      <header className="mb-10">
        <div className="animate-float-staking">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Discover <span className="landing-gradient">Creators</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#97a1b1]">
            Browse creator profiles, compare support totals, and open any profile to send a tip.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="wallet-skeleton h-[220px] w-full rounded-[2rem]" />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-20 text-center">
          <Activity size={42} className="text-white/35" />
          <h3 className="text-2xl font-extrabold text-white">No creators found</h3>
          <p className="max-w-md text-sm text-[#8aa0a8]">
            The dashboard is ready, but the first creator profiles have not been added yet.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="Creators"
              value={String(metrics.totalCreators).padStart(2, "0")}
              detail="Profiles available to browse."
              accent="teal"
            />
            <MetricCard
              label="Total tipped"
              value={`◎ ${metrics.totalVolume.toFixed(2)}`}
              detail="Visible support volume across profiles."
              accent="lime"
            />
            <MetricCard
              label="Support actions"
              value={metrics.totalTips.toString()}
              detail="Tip events recorded so far."
              accent="teal"
            />
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#768092]">
                  Creator list
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-white">Available creators</h2>
              </div>
              <div className="dashboard-chip">
                <Users size={14} />
                {metrics.topCreator?.displayName || "Top creator available"}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function CreatorAnalytics({ userId }: { userId: string }) {
  const { creator, loading, error } = useCreator(userId);
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#8b5cf6] border-t-transparent" />
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#b58cff]">
          Loading creator analytics
        </span>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="card flex flex-col items-center gap-4 py-20 text-center">
        <Activity size={42} className="text-white/35" />
        <h3 className="text-2xl font-extrabold text-white">Stats not found</h3>
        <p className="max-w-md text-sm text-[#8aa0a8]">
          Your creator analytics could not be loaded right now.
        </p>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/creator/${userId}`;
  const latestTip = creator.tipsReceived[0];

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]" id="creator-analytics">
      <header className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="animate-float-staking">
          <div className="dashboard-chip dashboard-chip-strong mb-4">
            Creator Command View
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Your creator <span className="landing-gradient">performance board</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[#8ba2aa]">
            Monitor earnings, supporter activity, and your public profile from a more polished dashboard layout.
          </p>
        </div>

        <div className="dashboard-chip">
          <Users size={14} />
          {creator.tipCount} supporters tracked
        </div>
      </header>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="dashboard-panel dashboard-grid-bg min-h-[280px]">
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#71868d]">
                Total volume earned
              </p>
              <h2 className="mt-4 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                ◎ {creator.totalTips.toFixed(4)}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#8399a1]">
                A cleaner creator analytics hero with the same data, but aligned with the dark dashboard from the image reference.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard
                label="Total supporters"
                value={String(creator.tipCount)}
                detail="Distinct support events recorded."
                accent="teal"
              />
              <MetricCard
                label="Latest support"
                value={latestTip ? `◎ ${latestTip.amount.toFixed(2)}` : "◎ 0.00"}
                detail={latestTip ? fmtTime(latestTip.createdAt) : "No incoming tips yet."}
                accent="lime"
              />
              <MetricCard
                label="Creator ID"
                value={`#${creator.id.slice(0, 4)}`}
                detail="Your public profile identifier."
                accent="teal"
              />
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#8b5cf6]/14 bg-[#8b5cf6]/10 text-[#b58cff]">
              <Copy size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
                Share your profile
              </p>
              <h2 className="text-xl font-extrabold text-white">Public tip link</h2>
            </div>
          </div>

          <div className="rounded-[1.3rem] bg-[#071116] p-4 font-mono text-sm text-[#62d6ff] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
            {profileUrl}
          </div>

          <button onClick={handleCopy} className="btn btn-primary mt-4 w-full">
            {copied ? "Copied to clipboard" : "Copy profile link"}
          </button>

          <div className="mt-6 rounded-[1.3rem] bg-white/[0.02] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
              Profile summary
            </p>
            <p className="mt-3 text-lg font-extrabold text-white">
              {creator.displayName || "Unnamed Creator"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#8aa0a8]">
              {creator.bio || "Add a bio in settings to make your public profile more compelling."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="dashboard-panel">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#71868d]">
                Recent supporters
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-white">Incoming tip activity</h2>
            </div>
            <div className="dashboard-chip">
              <LineChart size={14} />
              Live queue
            </div>
          </div>

          {creator.tipsReceived.length === 0 ? (
            <div className="rounded-[1.5rem] bg-white/[0.015] py-14 text-center text-sm text-[#8aa0a8] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
              No supporters yet. Your incoming tips will appear here.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {creator.tipsReceived.map((tip) => (
                <ScrollReveal key={tip.id}>
                  <div className="tip-row flex-col items-stretch md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
                        {tip.fromUser.avatarUrl ? (
                          <img
                            src={tip.fromUser.avatarUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-extrabold text-white">
                            {(tip.fromUser.displayName || "A").slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {tip.fromUser.displayName || "Anonymous contributor"}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#748a92]">
                          {fmtTime(tip.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="md:ml-auto md:text-right">
                      <p className="text-sm font-extrabold text-[#62d6ff]">
                        +◎ {tip.amount.toFixed(4)}
                      </p>
                      {tip.message ? (
                        <p className="mt-1 max-w-xl text-sm text-[#8ba1a9]">
                          "{tip.message}"
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-[#6c838b]">No note attached</p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
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
      {role === "CREATOR" && userId ? <CreatorAnalytics userId={userId} /> : <DiscoverFeed />}
    </RequireAuth>
  );
}
