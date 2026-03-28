"use client";

import { useState, useEffect } from "react";
import RequireAuth from "../../../components/RequireAuth";
import { useWallet, useTransactions } from "../../../hooks/wallet";
import { sendSol } from "../../../lib/api";
import ScrollReveal from "../../../components/ScrollReveal";

/* ── tiny helpers ─────────────────────────────────────────── */

function shortAddr(addr: string) {
  return addr.slice(0, 8) + "…" + addr.slice(-4);
}

function fmtTime(unix: number | null) {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function StatusNotification({ kind, message }: { kind: 'success' | 'error' | 'loading' | '', message: string }) {
  if (!message) return null;
  return (
    <div className={`status-bar status-${kind}`}>
      <div className="flex flex-col">
        <span className="font-bold uppercase tracking-wider text-[10px] opacity-70">
          {kind === 'loading' ? 'Processing' : kind}
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}

/* ── sub-components ───────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn btn-ghost text-xs py-1 px-2"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function AccountInfo({ publicKey, balance, network, loading, onRefresh }: {
  publicKey: string; balance: number; network: string; loading: boolean; onRefresh: () => void;
}) {
  return (
    <div className="account-grid" id="account-info">
      <div className="account-cell">
        <div className="flex justify-between items-center">
          <span className="cell-label">Main Account (MPC)</span>
          <button className={`btn btn-ghost p-1 ${loading ? 'spin' : ''}`} onClick={onRefresh} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></svg>
          </button>
        </div>
        <div className="cell-value">{loading ? '────────────────────────' : publicKey}</div>
        <div className="flex gap-2">
          {!loading && <CopyButton text={publicKey} />}
        </div>
      </div>

      <div className="account-cell">
        <span className="cell-label">Available Balance</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white">
            {loading ? '…' : balance.toFixed(6)}
          </span>
          <span className="text-sm font-bold text-teal-400">SOL</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          Network: {network}
        </div>
      </div>
    </div>
  );
}

function SendForm({ onStatus }: { onStatus: (kind: 'success' | 'error' | 'loading' | '', msg: string) => void }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    onStatus('loading', 'Signing and broadcasting transaction...');
    setSending(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const { signature } = await sendSol(token, { to, amount: parseFloat(amount) });
      onStatus('success', `Transaction confirmed! Signature: ${signature.slice(0, 12)}...`);
      setTo(""); setAmount("");
    } catch (err: any) {
      onStatus('error', err?.message || "Transaction failed");
    } finally {
      setSending(false);
      setTimeout(() => onStatus('', ''), 6000);
    }
  }

  return (
    <div className="card mt-6" id="send-sol">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-teal-400/10 flex items-center justify-center border border-teal-400/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </div>
        <h2 className="text-lg font-bold uppercase tracking-widest text-white">Send SOL</h2>
      </div>
      <form onSubmit={handleSend} className="flex flex-col gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Recipient Address</label>
          <input
            className="input"
            placeholder="Solana Public Key"
            value={to}
            onChange={e => setTo(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Amount (SOL)</label>
          <input
            className="input"
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
        <button disabled={sending} className="btn btn-primary w-full mt-2" type="submit">
          {sending ? "Processing..." : "Execute Transfer"}
        </button>
      </form>
    </div>
  );
}

function TransactionList({ transactions, loading }: { transactions: any[]; loading: boolean }) {
  return (
    <div className="card h-full flex flex-col" id="history">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-400/10 flex items-center justify-center border border-indigo-400/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
        </div>
        <h2 className="text-lg font-bold uppercase tracking-widest text-white">History</h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="wallet-skeleton h-12 w-full rouded-lg" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 opacity-50">
          <p className="text-sm">No activity found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx: any) => (
            <a
              key={tx.signature}
              href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="tip-row"
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="font-mono text-xs text-white truncate">{shortAddr(tx.signature)}</span>
                <span className="text-[10px] text-slate-400">{fmtTime(tx.blockTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tx.err ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                  {tx.err ? 'Failed' : 'Success'}
                </span>
                <span className="text-teal-400 opacity-50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg></span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── main page ────────────────────────────────────────────── */

export default function WalletPage() {
  const { wallet, loading: walletLoading, error: walletError, notFound, refresh: refreshWallet } = useWallet();
  const { transactions, loading: txLoading, refresh: refreshTx } = useTransactions();
  const [status, setStatus] = useState({ kind: '' as any, msg: '' });

  function handleRefresh() {
    refreshWallet();
    refreshTx();
  }

  return (
    <RequireAuth>
      <div className="max-w-7xl mx-auto w-full" id="wallet-dashboard">
        {/* Header Section */}
        <header className="text-center mb-12 relative">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl text-white drop-shadow-lg">
            Solana <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-cyan-accent text-glow-staking">Wallet</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Enterprise-grade security across multiple nodes</p>
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-1.5 rounded-full bg-black/40 border border-teal-400/30 backdrop-blur-md shadow-[0_0_20px_rgba(45,212,191,0.1)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Solana Devnet</span>
          </div>
        </header>

        {loadingOrNotFound(walletLoading, notFound, refreshWallet)}

        {walletError && !notFound && (
          <div className="status-bar status-error relative mb-6">
            {walletError}
          </div>
        )}

        {!notFound && !walletLoading && wallet && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="flex flex-col">
              <ScrollReveal>
                <AccountInfo
                  publicKey={wallet.publicKey}
                  balance={wallet.balance}
                  network={wallet.network}
                  loading={false}
                  onRefresh={handleRefresh}
                />
              </ScrollReveal>
              <ScrollReveal>
                <SendForm onStatus={(kind, msg) => setStatus({ kind, msg })} />
              </ScrollReveal>
            </div>
            <div className="h-[600px] lg:h-auto">
              <ScrollReveal className="h-full">
                <TransactionList transactions={transactions} loading={txLoading} />
              </ScrollReveal>
            </div>
          </div>
        )}

        <StatusNotification kind={status.kind} message={status.msg} />
      </div>
    </RequireAuth>
  );
}

function loadingOrNotFound(loading: boolean, notFound: boolean, onRefresh: () => void) {
  if (loading) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-12 h-12 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#00f0ff]">Syncing Nodes...</span>
    </div>
  );

  if (notFound) return (
    <div className="card text-center py-16 flex flex-col items-center gap-6 max-w-lg mx-auto mt-12">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Vault Not Initialized</h2>
        <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">Your MPC key shares haven't been generated yet. Contact an administrator to create your secure vault.</p>
      </div>
      <button className="btn btn-outline px-8" onClick={onRefresh}>Re-verify Identity</button>
    </div>
  );

  return null;
}
