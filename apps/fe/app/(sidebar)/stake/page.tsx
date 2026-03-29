"use client";

import { Toaster } from "react-hot-toast";
import { Sparkles } from "lucide-react";

import RequireAuth from "../../../components/RequireAuth";
import SolanaWalletProvider from "../../../components/SolanaWalletProvider";
import { AnimatedWaves } from "../../../components/layout/AnimatedWaves";
import { Navbar } from "./components/Navbar";
import { RewardsCard } from "./components/RewardsCard";
import { StakeCard } from "./components/StakeCard";
import { StatsBar } from "./components/StatsBar";
import { UnstakeCard } from "./components/UnstakeCard";

export default function StakePage() {
  return (
    <RequireAuth>
      <SolanaWalletProvider>
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden rounded-[var(--radius)] selection:bg-electric-purple/30">
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                backgroundColor: "#091318",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(18px)",
              },
            }}
          />

          <div className="relative z-10 flex min-h-screen w-full flex-col">
            <Navbar />

            <main className="mt-6 flex flex-1 flex-col px-0 pb-10">
              <header className="mb-6">
                <div className="dashboard-chip dashboard-chip-strong mb-4">
                  <Sparkles size={14} />
                  Staking terminal
                </div>
                <div className="animate-float-staking">
                  <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
                    Stake your{" "}
                    <span className="bg-gradient-to-r from-electric-purple to-cyan-accent bg-clip-text text-transparent text-glow-staking">
                      SOL
                    </span>
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[#8aa0a8] md:text-base">
                    Stake your SOL and earn rewards with our secure and user-friendly staking terminal, designed to maximize your returns while keeping your assets safe.
                  </p>
                </div>
              </header>

              <section className="glass-card-staking relative isolate overflow-hidden rounded-[2rem] p-4 md:p-6">
                <div className="absolute inset-0 opacity-[0.2] pointer-events-none">
                  <AnimatedWaves />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.06),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(98,214,255,0.04),transparent_35%)] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:30px_30px] pointer-events-none" />

                <div className="relative z-10">
                  <StatsBar />

                  <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <StakeCard />
                    <UnstakeCard />
                    <RewardsCard />
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </SolanaWalletProvider>
    </RequireAuth>
  );
}
