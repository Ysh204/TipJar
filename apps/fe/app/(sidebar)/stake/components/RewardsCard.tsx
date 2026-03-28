"use client";

import { useStaking } from '../../../../hooks/staking/useStaking';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useRef } from 'react';

export function RewardsCard() {
  const { userStake, claimRewards, loading, poolState, walletBalance } = useStaking();
  const { connected } = useWallet();
  const [liveReward, setLiveReward] = useState<number>(0);
  const startTimeRef = useRef<number>(Date.now());

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
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsedSinceUpdate = Date.now() / 1000 - lastUpdateSec;
      const projectedReward = baseRewardLamports + (stakedLamports * rate * Math.max(0, elapsedSinceUpdate)) / 1e9;
      setLiveReward(projectedReward / 1e9);
    }, 50);

    return () => clearInterval(interval);
  }, [userStake, poolState, stakedLamports, rate]);

  return (
    <div className="flex flex-col relative text-left bg-black/20 border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-black/30 transition-colors duration-300 h-full justify-between">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Your Rewards</h2>
        <p className="text-text-secondary text-sm">Tokens earned from your active stake</p>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center py-4">
        <p className="text-text-secondary text-xs uppercase tracking-widest mb-3 opacity-70">PENDING CLAIM</p>
        <p className="text-[2.2rem] font-mono font-black text-cyan-accent text-glow mb-1 leading-none tracking-tighter">
          {liveReward.toFixed(8)}
        </p>
        <p className="text-cyan-accent/60 text-xs mt-2 font-mono font-medium">
          {rewardPerSec > 0 ? `+${(rewardPerSec / 1e9).toExponential(2)} RTK/sec` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <div className="w-full flex justify-between items-end px-1 pb-1">
          <span className="text-text-secondary/70 tracking-widest uppercase text-[10px] font-bold shadow-sm">In Wallet</span>
          <span className="text-white font-mono font-bold text-sm tracking-wide">{(walletBalance || 0).toFixed(2)} <span className="text-text-secondary text-xs">RTK</span></span>
        </div>
        <button 
          onClick={claimRewards}
          disabled={!connected || loading || liveReward === 0}
          className="w-full py-4 rounded-xl bg-cyan-accent/10 border border-cyan-accent/30 hover:bg-cyan-accent/20 text-cyan-accent font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_25px_rgba(0,240,255,0.3)]"
        >
          {loading ? 'Processing...' : 'Claim Rewards'}
        </button>
      </div>
    </div>
  );
}
