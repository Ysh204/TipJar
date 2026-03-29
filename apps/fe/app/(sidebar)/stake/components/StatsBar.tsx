"use client";

import { useMemo } from "react";
import { Activity, Coins, Signal } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { useStaking } from "../../../../hooks/staking/useStaking";

function StatCard({
  label,
  value,
  suffix,
  icon,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(255,255,255,0.008),rgba(255,255,255,0.002)),rgba(16,16,24,0.14)] p-4 backdrop-blur-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.01)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#70868d]">
          {label}
        </span>
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-3xl font-extrabold tracking-tight ${accent}`}>{value}</span>
        {suffix ? <span className="mb-1 text-xs font-bold text-[#7e949c]">{suffix}</span> : null}
      </div>
    </div>
  );
}

export function StatsBar() {
  const { poolState } = useStaking();
  const { connected } = useWallet();

  const totalStaked = useMemo(() => {
    if (!poolState) return "0.00";
    return (poolState.totalStaked.toNumber() / 1e9).toFixed(2);
  }, [poolState]);

  const apy = useMemo(() => {
    if (!poolState) return "0%";
    const ratePerSec = poolState.rewardRate.toNumber();
    const yearlyRate = ratePerSec * 86400 * 365;
    const apyValue = (yearlyRate / 1e9) * 100;
    return `${apyValue.toFixed(0)}%`;
  }, [poolState]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <StatCard
        label="Total value staked"
        value={totalStaked}
        suffix="SOL"
        icon={<Coins size={18} />}
        accent="text-white"
      />
      <StatCard
        label="Current APR"
        value={apy}
        icon={<Activity size={18} />}
        accent="text-[#49f0dd]"
      />
      <div className="rounded-[1.4rem] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(255,255,255,0.008),rgba(255,255,255,0.002)),rgba(16,16,24,0.14)] p-4 backdrop-blur-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.01)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
            <Signal size={18} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#70868d]">
            Network status
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${
              connected ? "bg-[#49f0dd] shadow-[0_0_14px_#49f0dd]" : "bg-red-500"
            }`}
          />
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {connected ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
}
