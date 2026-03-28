"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { 
  Home, 
  LayoutDashboard, 
  Wallet, 
  Zap, 
  Settings, 
  LogOut, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  User
} from "lucide-react";

import { getProfile, UserProfile, getTips } from "../lib/api";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tipCount, setTipCount] = useState<number>(0);

  useEffect(() => {
    const r = localStorage.getItem("role");
    const e = localStorage.getItem("email");
    setRole(r);
    
    if (e) {
      setProfile({ email: e, displayName: r === "CREATOR" ? "Creator" : "Member" } as any);
    }

    const token = localStorage.getItem("token");
    if (token) {
      // Fetch Profile
      getProfile(token)
        .then(res => setProfile(res.user))
        .catch(err => console.error("Failed to fetch profile", err));

      // Fetch Real Tip Count
      getTips(token)
        .then(res => setTipCount(res.received.length))
        .catch(err => console.error("Failed to fetch tips", err));
    }
  }, []);

  const topLink = role === "CREATOR"
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
      className={`fixed left-0 top-0 bottom-0 m-4 rounded-[2rem] bg-[#12121a]/95 backdrop-blur-3xl border border-white/5 flex flex-col z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl ${
        isCollapsed ? "w-20" : "w-72"
      } ${
        isOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"
      }`}
    >
      {/* Top Header */}
      <div className={`h-20 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-electric-purple to-cyan-accent p-[1px]">
              <div className="w-full h-full bg-[#12121a] rounded-[11px] flex items-center justify-center overflow-hidden p-1">
                <img src="/logo.png" alt="TipJar Logo" className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              TipJar
            </span>
          </Link>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden scrollbar-hide pt-4">
        <div className={`h-6 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center opacity-0' : 'px-4 opacity-100'}`}>
          {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 whitespace-nowrap text-center">Main Menu</span>}
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-2xl transition-all duration-300 group relative border border-transparent ${
                isCollapsed ? "justify-center px-0 py-3" : "px-4 py-3 gap-3"
              } ${
                isActive
                  ? "bg-white/10 text-white border-white/10 shadow-[0_0_20px_rgba(0,240,255,0.05)]"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`flex items-center justify-center transition-all duration-300 ${isActive ? 'text-cyan-accent scale-110' : 'group-hover:scale-110 group-hover:text-white'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              {!isCollapsed && <span className="tracking-wide flex-1 truncate">{item.name}</span>}
              {!isCollapsed && item.badge && (
                <span className="bg-cyan-accent/20 text-cyan-accent text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-[#1c1c28] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 border border-white/10 whitespace-nowrap z-[60] shadow-2xl translate-x-[-10px] group-hover:translate-x-0">
                  {item.name} {item.badge ? `(${item.badge})` : ''}
                </div>
              )}
            </Link>
          );
        })}

        <div className={`h-6 mt-4 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center opacity-0' : 'px-4 opacity-100'}`}>
          {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">Support & Feedback</span>}
        </div>
        <button className={`flex items-center rounded-2xl transition-all duration-300 text-white/40 hover:bg-white/5 hover:text-white group border border-transparent ${isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3 gap-3'}`}>
          <span className="group-hover:scale-110 transition-transform"><Bell size={20} /></span>
          {!isCollapsed && <span>Reporting</span>}
        </button>
      </nav>

      {/* User Profile */}
      <div className={`p-4 mt-auto border-t border-white/5 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center rounded-[1.5rem] bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/10 relative group ${isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-accent to-electric-purple p-[1.5px] shrink-0">
            <div className="w-full h-full bg-[#12121a] rounded-full flex items-center justify-center overflow-hidden">
               {profile?.avatarUrl ? (
                 <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <User className="text-white/60" size={20} />
               )}
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{profile?.displayName || (role === "CREATOR" ? "Creator Account" : "User Account")}</p>
              <p className="text-[10px] text-white/40 truncate">{profile?.email || "TipJar Member"}</p>
            </div>
          )}
          
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("email");
              localStorage.removeItem("role");
              localStorage.removeItem("userId");
              window.location.href = "/signin";
            }}
            className={`text-red-400 font-bold transition-all p-2 rounded-xl group-hover:bg-red-400/10 ${isCollapsed ? 'absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto bg-[#1c1c28] border border-red-400/20 shadow-2xl z-[70] min-w-[50px] flex items-center justify-center' : 'text-red-400/40 hover:text-red-400'}`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}


