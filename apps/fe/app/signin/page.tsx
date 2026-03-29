"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";

import { signin } from "../../lib/api";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <section className="dashboard-panel mx-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#0d1017] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <img src="/logo.png" alt="TipJar Logo" className="h-10 w-10 object-contain" />
          </Link>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-white">Sign in</h1>
          <p className="mt-2 text-[#9aa3b2]">Access your TipJar dashboard.</p>
        </div>

        <form onSubmit={handleSignIn} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#7d8796]">
              Email address
            </label>
            <input
              className="dashboard-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#7d8796]">
              Password
            </label>
            <input
              className="dashboard-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? (
            <div className="rounded-[1rem] border border-red-400/18 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-400">
              {error}
            </div>
          ) : null}

          <button disabled={loading} className="btn btn-primary mt-2 w-full" type="submit">
            <LockKeyhole size={16} />
            {loading ? "Authenticating..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-[0.24em] text-[#66707f]">
          Protected by multi-party computation
        </p>
      </section>
    </div>
  );
}
