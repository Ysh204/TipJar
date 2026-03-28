"use client";

import { useState } from 'react';
import { useStaking } from '../../../../hooks/staking/useStaking';
import { useWallet } from '@solana/wallet-adapter-react';

export function StakeCard() {
  const [amount, setAmount] = useState('');
  const { stake, loading, userStake } = useStaking();
  const { connected } = useWallet();

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount))) return;
    await stake(Number(amount));
    setAmount('');
  };

  const stakedBalance = userStake ? (userStake.stakedAmount.toNumber() / 1e9).toFixed(2) : "0.00";

  return (
    <div className="flex flex-col relative text-left bg-black/20 border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-black/30 transition-colors duration-300 h-full justify-between">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Stake SOL</h2>
        <p className="text-text-secondary text-sm">Your Active Stake: <span className="text-white font-mono">{stakedBalance} SOL</span></p>
      </div>

      <div className="relative mb-8 flex-grow">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-purple/10 to-cyan-accent/10 rounded-xl blur-xl opacity-0 hover:opacity-100 transition-opacity"></div>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-[#12121a]/80 border border-white/10 rounded-xl py-4 pl-6 pr-16 text-2xl text-white font-mono outline-none focus:border-cyan-accent/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all relative z-10"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <span className="text-text-secondary font-bold text-sm">SOL</span>
        </div>
      </div>

      <button 
        onClick={handleStake}
        disabled={!connected || loading || !amount}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-purple to-cyan-accent text-white font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(170,59,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
      >
        {loading ? 'Processing...' : 'Stake Now'}
      </button>
    </div>
  );
}
