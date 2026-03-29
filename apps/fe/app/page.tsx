"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <main className="relative z-10 mx-auto w-full max-w-5xl">
        <section className="dashboard-panel mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="dashboard-chip dashboard-chip-strong mx-auto mb-6">Welcome</p>
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Welcome to <span className="landing-gradient">TipJar</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#9aa3b2]">
              Tip creators, manage your wallet, and stake SOL from one clean dashboard.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signin" className="btn btn-primary min-w-[180px] justify-center px-8">
                Sign In
              </Link>
              <Link href="/dashboard" className="btn btn-outline min-w-[180px] justify-center px-8">
                Explore
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
              {[
                {
                  title: "Instant creator tipping",
                  detail: "Send support in seconds with a simple on-chain flow built for fans and creators.",
                },
                {
                  title: "Secure wallet access",
                  detail: "Manage balances and transfers through a protected MPC-backed wallet experience.",
                },
                {
                  title: "Solana staking support",
                  detail: "Stake SOL, track rewards, and manage unstaking from the same workspace.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.2rem] bg-white/[0.02] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
                >
                  <p className="text-sm font-semibold text-white/90">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#97a1b1]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
