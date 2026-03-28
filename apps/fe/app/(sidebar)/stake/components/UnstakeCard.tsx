"use client";

import { useState, useEffect } from 'react';
import { useStaking } from '../../../../hooks/staking/useStaking';
import { useWallet } from '@solana/wallet-adapter-react';

export function UnstakeCard() {
  const [amount, setAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { requestUnstake, withdrawUnstake, loading, userStake } = useStaking();
  const { connected } = useWallet();

  const stakedBalance = userStake ? (userStake.stakedAmount.toNumber() / 1e9).toFixed(2) : "0.00";
  const pendingUnstake = userStake ? (userStake.pendingUnstakeAmount.toNumber() / 1e9).toFixed(2) : "0.00";
  const hasPending = userStake && userStake.pendingUnstakeAmount.toNumber() > 0;

  useEffect(() => {
    if (!userStake || userStake.pendingUnstakeAmount.toNumber() === 0) {
      setTimeLeft('');
      setIsUnlocked(false);
      return;
    }

    const updateTimer = () => {
      const unlockTimeStr = userStake.unstakeUnlockTime.toString();
      const unlockTime = parseInt(unlockTimeStr) * 1000;
      const now = Date.now();
      
      if (now >= unlockTime) {
        setTimeLeft('Unlocked & Ready!');
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
        const diff = unlockTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`Unlocking in: ${hours}h ${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [userStake]);

  const handleAction = async () => {
    if (hasPending && isUnlocked) {
      await withdrawUnstake();
    } else if (!hasPending && amount && !isNaN(Number(amount))) {
      await requestUnstake(Number(amount));
      setAmount('');
    }
  };

  return (
    <div className="flex flex-col relative text-left bg-black/20 border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-black/30 transition-colors duration-300 h-full justify-between">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Unstake SOL</h2>
        <p className="text-text-secondary text-sm">Staked Balance: <span className="text-white font-mono">{stakedBalance} SOL</span></p>
      </div>

      <div className="relative mb-8 flex-grow">
        {!hasPending ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 hover:opacity-100 transition-opacity"></div>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#12121a]/80 border border-white/10 rounded-xl py-4 pl-6 pr-16 text-2xl text-white font-mono outline-none focus:border-pink-500/50 focus:shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all relative z-10"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
               <span className="text-text-secondary font-bold text-sm">SOL</span>
            </div>
            <p className="text-text-secondary text-xs mt-3 flex items-center gap-1.5 opacity-75">
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               24-hour lockup applies
            </p>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full py-2">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">Pending Unstake</p>
            <p className="text-4xl font-mono font-bold text-white mb-2">{pendingUnstake} <span className="text-lg">SOL</span></p>
            <p className={`text-sm font-medium px-3 py-1 rounded-full ${isUnlocked ? 'text-green-400 bg-green-400/10' : 'text-pink-400 bg-pink-400/10'}`}>
              {timeLeft}
            </p>
          </div>
        )}
      </div>

      <button 
        onClick={handleAction}
        disabled={!connected || loading || (!hasPending && !amount)}
        className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 ${
          hasPending && isUnlocked 
            ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]'
            : 'bg-gradient-to-r from-[#8a426f] to-[#5c2b53] text-white/90 shadow-[0_0_15px_rgba(138,66,111,0.2)] hover:shadow-[0_0_25px_rgba(138,66,111,0.4)] hover:text-white'
        }`}
      >
        {loading ? 'Processing...' : hasPending && isUnlocked ? 'Withdraw SOL' : hasPending ? 'Locked' : 'Request Unstake'}
      </button>
    </div>
  );
}
