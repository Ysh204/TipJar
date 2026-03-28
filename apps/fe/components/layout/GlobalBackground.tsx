"use client";

import { AnimatedWaves } from "./AnimatedWaves";

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none">
      {/* ── The SVG Wave Animation ── */}
      <div className="absolute inset-0 opacity-40">
        <AnimatedWaves />
      </div>

      {/* ── Background Micro-Particles (Subtle Grid) ── */}
      <div 
        className="absolute inset-0 opacity-[0.03] text-white" 
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />

      {/* ── Global Radial Glows ── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 blur-[150px] translate-y-1/2 -translate-x-1/4" />
    </div>
  );
}
