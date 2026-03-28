"use client";

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Navbar() {
  return (
    <nav className="w-full flex justify-center py-6 px-4 z-50">
      <div className="w-full max-w-6xl glass-module rounded-full px-6 py-3 flex justify-between items-center bg-black/40 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-cyan-500/30 blur-xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />

            <img
              src="/logo2.png"
              alt="SOLStake Logo"
              className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_12px_rgba(170,59,255,0.6)]"
            />
          </div>

          <span className="text-2xl font-black tracking-tighter text-white bg-clip-text">
            SOL<span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">Stake</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse"></span>
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