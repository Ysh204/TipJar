"use client";

import { useState } from "react";
import { signin } from "../../lib/api";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token, user } = await signin({ email, password });
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("email", email);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030005] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#7000ff]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#00f0ff]/10 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
           <Link href="/" className="inline-block mb-8">
              <div className="w-16 h-16 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] rounded-2xl">
                <img src="/logo.png" alt="TipJar Logo" className="w-full h-full object-cover" />
              </div>
           </Link>
           <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Welcome Back</h1>
           <p className="text-[#a0a0b0] font-medium">Securely sign in to your creator portal</p>
        </div>

        <div className="card">
          <form onSubmit={handleSignIn} className="flex flex-col gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#a0a0b0] font-bold block mb-2">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#a0a0b0] font-bold block mb-2">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="py-3 px-4 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 text-xs font-bold animate-pulse">
                {error}
              </div>
            )}

            <button disabled={loading} className="btn btn-primary w-full py-3.5 mt-2" type="submit">
              {loading ? "Authenticating..." : "Sign In to TipJar"}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-[#606070] font-bold uppercase tracking-widest">
           Protected by Multi-Party Computation
        </p>
      </div>
    </div>
  );
}
