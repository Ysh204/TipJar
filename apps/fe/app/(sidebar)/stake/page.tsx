"use client";

import { useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import SolanaWalletProvider from '../../../components/SolanaWalletProvider';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { StakeCard } from './components/StakeCard';
import { UnstakeCard } from './components/UnstakeCard';
import { RewardsCard } from './components/RewardsCard';
import RequireAuth from '../../../components/RequireAuth';

export default function StakePage() {
  return (
    <RequireAuth>
      <SolanaWalletProvider>
        <div className="min-h-screen flex flex-col w-full relative selection:bg-electric-purple/30 overflow-hidden rounded-[var(--radius)]">
          <Toaster 
            position="bottom-right" 
            toastOptions={{ 
              style: { 
                backgroundColor: '#12121a', 
                color: '#fff', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)' 
              } 
            }} 
          />
          


          <div className="w-full relative z-10 flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-1 w-full px-4 md:px-8 pb-24 mt-4 flex flex-col items-center">
              
              <div className="text-center mb-10 mt-4 animate-float-staking">
                <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight text-white drop-shadow-lg">
                  Stake your <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-cyan-accent text-glow-staking">SOL</span>
                </h1>
                <p className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                  Participate in the network and earn passive yield with no hidden fees and a secure<br/ >24-hour unstaking process.
                </p>
              </div>

              <div className="relative max-w-6xl mx-auto w-full">


                {/* Main Central Glass Panel */}
                <div className="glass-card-staking rounded-3xl p-6 md:p-10 relative overflow-hidden bg-white/[0.02]">
                  {/* Subtle grid pattern inside panel */}
                  <div className="absolute inset-0 opacity-[0.15] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+PHBhdGggZD0iTTE1IDB2MzB0MTUgMTVIMUMiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')]"></div>
                  
                  <div className="relative z-10">
                    <StatsBar />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
                      <StakeCard />
                      <UnstakeCard />
                      <RewardsCard />
                    </div>
                  </div>
                </div>
              </div>

            </main>
          </div>
        </div>
      </SolanaWalletProvider>
    </RequireAuth>
  );
}
