"use client";

import { useEffect, useState } from "react";
import { Clock3, Unlock } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { useStaking } from "../../../../hooks/staking/useStaking";

export function UnstakeCard() {
  const [amount, setAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { requestUnstake, withdrawUnstake, loading, userStake } = useStaking();
  const { connected } = useWallet();

  const stakedBalance = userStake ? (userStake.stakedAmount.toNumber() / 1e9).toFixed(2) : "0.00";
  const pendingUnstake = userStake ? (userStake.pendingUnstakeAmount.toNumber() / 1e9).toFixed(2) : "0.00";
  const hasPending = !!userStake && userStake.pendingUnstakeAmount.toNumber() > 0;

  useEffect(() => {
    if (!userStake || userStake.pendingUnstakeAmount.toNumber() === 0) {
      setTimeLeft("");
      setIsUnlocked(false);
      return;
    }

    const updateTimer = () => {
      const unlockTime = parseInt(userStake.unstakeUnlockTime.toString(), 10) * 1000;
      const now = Date.now();

      if (now >= unlockTime) {
        setTimeLeft("Unlocked and ready");
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
        const diff = unlockTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`Unlocking in ${hours}h ${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [userStake]);

  const handleAction = async () => {
    if (hasPending && isUnlocked) {
      await withdrawUnstake();
    } else if (!hasPending && amount && !isNaN(Number(amount))) {
      await requestUnstake(Number(amount));
      setAmount("");
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-[1.8rem] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.003)),rgba(16,16,26,0.18)] p-8 backdrop-blur-[26px] shadow-[inset_0_1px_0_rgba(255,255,255,0.012)]">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
            {hasPending ? <Unlock size={18} /> : <Clock3 size={18} />}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
              Exit module
            </p>
            <h2 className="text-xl font-extrabold text-white">Unstake SOL</h2>
          </div>
        </div>

        <div className="rounded-[1.35rem] bg-white/[0.025] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#71868d]">
            Staked balance
          </p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            {stakedBalance} <span className="text-sm text-[#7f959d]">SOL</span>
          </p>
        </div>

        {!hasPending ? (
          <div className="mt-5">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
              Amount to unstake
            </label>
            <div className="rounded-[1.25rem] border border-white/8 bg-[#071116]/55 p-1 backdrop-blur-xl">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="dashboard-input border-0 bg-transparent text-3xl"
              />
            </div>
            <p className="mt-3 text-sm text-[#8399a1]">A 24-hour unlock period applies after request.</p>
          </div>
        ) : (
          <div className="mt-5 rounded-[1.35rem] border border-white/[0.04] bg-white/[0.022] p-5 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#71868d]">
              Pending unstake
            </p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              {pendingUnstake} <span className="text-sm text-[#7f959d]">SOL</span>
            </p>
            <p
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                isUnlocked ? "bg-emerald-400/10 text-emerald-400" : "bg-white/6 text-[#d4e0e4]"
              }`}
            >
              {timeLeft}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleAction}
        disabled={!connected || loading || (!hasPending && !amount)}
        className={`btn mt-8 w-full ${
          hasPending && isUnlocked
            ? "bg-gradient-to-r from-emerald-400 to-[#b4ff4d] text-[#041014]"
            : "border border-white/8 bg-white/[0.04] text-white"
        }`}
      >
        {loading
          ? "Processing..."
          : hasPending && isUnlocked
            ? "Withdraw SOL"
            : hasPending
              ? "Await unlock"
              : "Request unstake"}
      </button>
    </div>
  );
}
