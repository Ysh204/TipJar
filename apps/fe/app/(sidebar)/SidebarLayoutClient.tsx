"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";

export default function SidebarLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-transparent relative">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="lg:hidden h-16 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <img src="/logo.png" alt="TipJar" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-black tracking-tighter text-white">TipJar</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-white/70 hover:text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>

      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* Main Content Area */}
      {/* padding adjusts based on sidebar width */}
      <main 
        className={`flex-1 transition-all duration-500 min-h-screen relative pt-20 lg:pt-8 p-4 sm:p-8 ${
          isCollapsed ? "lg:pl-28" : "lg:pl-80"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
