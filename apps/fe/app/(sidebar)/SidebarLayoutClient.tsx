"use client";

import { useState } from "react";

import Sidebar from "../../components/Sidebar";

export default function SidebarLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-transparent">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main
        className={`flex-1 min-h-screen px-4 py-5 transition-all duration-500 sm:px-6 sm:py-7 lg:px-8 lg:py-8 ${
          isCollapsed ? "lg:pl-[120px]" : "lg:pl-[364px]"
        }`}
      >
        <div className="mx-auto min-h-[calc(100vh-2rem)] w-full max-w-[1620px] px-1 sm:px-2">
          {children}
        </div>
      </main>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
