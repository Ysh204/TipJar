"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  User,
  Wallet,
  Zap,
} from "lucide-react";

import { getProfile, getTips, UserProfile } from "../lib/api";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tipCount, setTipCount] = useState<number>(0);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");

    setRole(storedRole);

    if (storedEmail) {
      setProfile({
        email: storedEmail,
        displayName: storedRole === "CREATOR" ? "Creator" : "Member",
      } as UserProfile);
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    getProfile(token)
      .then((res) => setProfile(res.user))
      .catch((err) => console.error("Failed to fetch profile", err));

    getTips(token)
      .then((res) => setTipCount(res.received.length))
      .catch((err) => console.error("Failed to fetch tips", err));
  }, []);

  const topLink =
    role === "CREATOR"
      ? { name: "My Stats", href: "/dashboard", icon: LayoutDashboard }
      : { name: "Discover", href: "/dashboard", icon: Home };

  const navItems: { name: string; href: string; icon: any; badge?: number | null }[] = [
    topLink,
    { name: "My Tips", href: "/tips", icon: Bell, badge: tipCount > 0 ? tipCount : null },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Stake", href: "/stake", icon: Zap },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-50 m-5 flex flex-col rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.003))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isCollapsed ? "w-[74px]" : "w-[316px]"
      } ${isOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"}`}
    >
      {!isCollapsed && (
        <div className="absolute inset-y-6 right-0 hidden w-px bg-white/[0.04] pointer-events-none lg:block" />
      )}

      <div
        className={`relative z-10 mb-6 flex min-h-[72px] items-center transition-all duration-300 ${
          isCollapsed ? "flex-col justify-center gap-3 px-0" : "justify-between px-3"
        }`}
      >
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f1822] shadow-[0_0_24px_rgba(139,92,246,0.1)]">
              <img src="/logo.png" alt="TipJar Logo" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.34em] text-[#5f7a80]">
                Solana Suite
              </p>
              <span className="text-[1.15rem] font-extrabold tracking-tight text-white">
                TipJar
              </span>
            </div>
          </Link>
        )}

        {isCollapsed && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f1822] shadow-[0_0_24px_rgba(139,92,246,0.1)]">
            <img src="/logo.png" alt="TipJar Logo" className="h-7 w-7 object-contain" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-2xl bg-white/[0.03] p-2 text-white/55 transition hover:bg-white/[0.05] hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div
        className={`mb-5 rounded-[1.5rem] bg-white/[0.02] px-4 py-4 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${
          isCollapsed ? "hidden" : "block"
        }`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#60767d]">
          Menu
        </p>
        <p className="mt-1 text-sm text-white/75">
          Wallet, staking, creators, and recent support in one place.
        </p>
      </div>

      <nav className="relative z-10 flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-1 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group relative flex items-center rounded-[20px] transition-all duration-300 ${
                isCollapsed ? "justify-center px-0 py-3.5" : "gap-3 px-4 py-4"
              } ${
                isActive
                  ? "bg-[linear-gradient(135deg,rgba(139,92,246,0.14),rgba(98,214,255,0.05))] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                  : "text-white/42 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <span
                className={`flex items-center justify-center rounded-xl transition ${
                  isActive ? "text-[#b58cff]" : "group-hover:text-white"
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2.1} />
              </span>

              {!isCollapsed && (
                <span className="flex-1 truncate text-sm font-semibold tracking-wide">
                  {item.name}
                </span>
              )}

              {!isCollapsed && item.badge ? (
                <span className="rounded-full bg-[#8b5cf6]/12 px-2 py-1 text-[10px] font-bold text-[#b58cff]">
                  {item.badge}
                </span>
              ) : null}

              {isCollapsed ? (
                <div className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-xl bg-[#0b171d] px-3 py-2 text-xs text-white opacity-0 shadow-2xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  {item.name}
                </div>
              ) : null}
            </Link>
          );
        })}

        <div className={`mt-6 ${isCollapsed ? "px-0" : "px-2"}`}>
          <div
            className={`rounded-[20px] bg-white/[0.02] transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${
              isCollapsed ? "p-2" : "p-4"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a1430] text-[#b58cff]">
                <LifeBuoy size={18} />
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-bold text-white">Support Desk</p>
                  <p className="text-xs text-[#7e959d]">Reporting and feedback</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className={`relative z-10 mt-4 ${isCollapsed ? "px-1" : "px-2"}`}>
        <div
          className={`rounded-[1.5rem] bg-white/[0.024] transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${
            isCollapsed ? "p-2" : "p-3"
          }`}
        >
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0f1822]">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <User className="text-white/65" size={19} />
              )}
            </div>

            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {profile?.displayName || (role === "CREATOR" ? "Creator Account" : "User Account")}
                  </p>
                  <p className="truncate text-[11px] text-[#6e868e]">
                    {profile?.email || "Member profile"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("email");
                    localStorage.removeItem("role");
                    localStorage.removeItem("userId");
                    window.location.href = "/signin";
                  }}
                  className="rounded-xl p-2 text-white/35 transition hover:bg-red-400/10 hover:text-red-400"
                >
                  <LogOut size={17} />
                </button>
              </>
            )}
          </div>

          {isCollapsed && (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("email");
                localStorage.removeItem("role");
                localStorage.removeItem("userId");
                window.location.href = "/signin";
              }}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-red-400/6 p-2 text-red-400 transition hover:bg-red-400/10"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
