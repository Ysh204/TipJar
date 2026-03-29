"use client";

import { useState } from "react";
import { ArrowUpRight, Coins } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { useStaking } from "../../../../hooks/staking/useStaking";

export function StakeCard() {
  const [amount, setAmount] = useState("");
  const { stake, loading, userStake } = useStaking();
  const { connected } = useWallet();

  const stakedBalance = userStake ? (userStake.stakedAmount.toNumber() / 1e9).toFixed(2) : "0.00";

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount))) return;
    await stake(Number(amount));
    setAmount("");
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-[1.8rem] border border-white/[0.03] bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.003)),rgba(16,16,26,0.18)] p-8 backdrop-blur-[26px] shadow-[inset_0_1px_0_rgba(255,255,255,0.012)]">
      <div>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#49f0dd]/14 bg-[#49f0dd]/10 text-[#49f0dd]">
              <Coins size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
                Stake module
              </p>
              <h2 className="text-xl font-extrabold text-white">Stake SOL</h2>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-[#49f0dd]" />
        </div>

        <div className="rounded-[1.35rem] bg-white/[0.025] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#71868d]">
            Active stake
          </p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            {stakedBalance} <span className="text-sm text-[#7f959d]">SOL</span>
          </p>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#71868d]">
            Amount to stake
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
        </div>
      </div>

      <button
        onClick={handleStake}
        disabled={!connected || loading || !amount}
        className="btn btn-primary mt-8 w-full"
      >
        {loading ? "Processing..." : "Stake now"}
      </button>
    </div>
  );
}
