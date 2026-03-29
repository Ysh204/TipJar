"use client";

import { Shield } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Navbar() {
  return (
    <nav className="w-full px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f1822] shadow-[0_0_30px_rgba(139,92,246,0.12)]">
            <img src="/logo2.png" alt="SOLStake Logo" className="h-8 w-8 object-contain" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6d848b]">
              Staking Desk
            </p>
            <span className="text-2xl font-black tracking-tight text-white">
              SOL
              <span className="bg-gradient-to-r from-violet-400 to-sky-300 bg-clip-text text-transparent">
                Stake
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-full bg-[#151729] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#b58cff] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            <Shield size={14} />
            Devnet
          </div>

          <div className="wallet-button-container">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
