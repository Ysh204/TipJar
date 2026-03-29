"use client";

import { useEffect, useState } from "react";
import { Gift, TrendingUp } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { useStaking } from "../../../../hooks/staking/useStaking";

export function RewardsCard() {
  const { userStake, claimRewards, loading, poolState, walletBalance } = useStaking();
  const { connected } = useWallet();
  const [liveReward, setLiveReward] = useState<number>(0);

  const stakedLamports = userStake ? userStake.stakedAmount.toNumber() : 0;
  const rate = poolState ? poolState.rewardRate.toNumber() : 0;
  const rewardPerSec = (stakedLamports * rate) / 1e9;

  useEffect(() => {
    if (!userStake || stakedLamports === 0) {
      setLiveReward(0);
      return;
    }

    const baseRewardLamports = userStake.pendingReward.toNumber();
    const lastUpdateSec = userStake.lastUpdateTime.toNumber();

    const interval = setInterval(() => {
      const elapsedSinceUpdate = Date.now() / 1000 - lastUpdateSec;
      const projectedReward =
        baseRewardLamports + (stakedLamports * rate * Math.max(0, elapsedSinceUpdate)) / 1e9;
      setLiveReward(projectedReward / 1e9);
    }, 100);

    return () => clearInterval(interval);
  }, [userStake, stakedLamports, rate]);

  return (
    <div className="flex h-full flex-col justify-between rounded-[1.8rem] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.003)),rgba(16,16,26,0.18)] p-8 backdrop-blur-[26px] shadow-[inset_0_1px_0_rgba(255,255,255,0.012)]">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#49f0dd]/14 bg-[#49f0dd]/10 text-[#49f0dd]">
            <Gift size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
              Rewards module
            </p>
            <h2 className="text-xl font-extrabold text-white">Your rewards</h2>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-white/[0.08] bg-[radial-gradient(circle_at_top,rgba(98,214,255,0.08),transparent_55%),rgba(7,17,22,0.38)] p-5 text-center backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
            Pending claim
          </p>
          <p className="mt-4 text-[2.6rem] font-black tracking-tight text-[#49f0dd] text-glow-staking">
            {liveReward.toFixed(8)}
          </p>
          <p className="mt-2 text-xs font-mono text-[#7feee0]">
            {rewardPerSec > 0 ? `+${(rewardPerSec / 1e9).toExponential(2)} RTK/sec` : "No active emissions"}
          </p>
        </div>

        <div className="mt-5 rounded-[1.3rem] bg-white/[0.025] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]">
          <div className="mb-2 flex items-center gap-3">
            <TrendingUp size={16} className="text-white/70" />
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
              In wallet
            </p>
          </div>
          <p className="text-xl font-extrabold text-white">
            {(walletBalance || 0).toFixed(2)} <span className="text-sm text-[#7f959d]">RTK</span>
          </p>
        </div>
      </div>

      <button
        onClick={claimRewards}
        disabled={!connected || loading || liveReward === 0}
        className="btn btn-outline mt-8 w-full border-[#49f0dd]/20 text-[#49f0dd] hover:bg-[#49f0dd]/10"
      >
        {loading ? "Processing..." : "Claim rewards"}
      </button>
    </div>
  );
}
