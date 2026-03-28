"use client";

import { useStaking } from '../../../../hooks/staking/useStaking';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

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
    <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8 w-full">
      <div className="bg-black/30 border border-white/5 rounded-full px-6 py-3 flex items-center gap-3 backdrop-blur-md">
        <svg className="w-5 h-5 text-electric-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">TOTAL VALUE STAKED</span>
        <span className="text-white font-mono font-bold text-lg">{totalStaked}</span><span className="text-text-secondary text-xs">SOL</span>
      </div>
      
      <div className="bg-black/30 border border-white/5 rounded-full px-6 py-3 flex items-center gap-3 backdrop-blur-md">
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">CURRENT APR</span>
        <span className="text-cyan-accent font-bold text-lg text-glow">{apy}</span>
      </div>

      <div className="bg-black/30 border border-white/5 rounded-full px-6 py-3 flex items-center gap-3 backdrop-blur-md">
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">NETWORK STATUS</span>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse' : 'bg-red-500'}`}></div>
           <span className="text-white font-bold text-sm">{connected ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
    </div>
  );
}
