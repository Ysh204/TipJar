const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

async function handle(res: Response) {
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const j = await res.json();
      msg = j?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function signin(body: { email: string; password: string }): Promise<{ token: string, user: { id: string, role: string } }> {
  const res = await fetch(`${BASE}/user/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await handle(res);
  return { token: j.token, user: j.user };
}

/* ── Profile ────────────────────────────────── */

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  publicKey: string | null;
  role: string;
}

export async function getProfile(token: string): Promise<{ user: UserProfile }> {
  const res = await fetch(`${BASE}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function updateProfile(token: string, body: { displayName: string; bio?: string; avatarUrl?: string }) {
  const res = await fetch(`${BASE}/user/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return handle(res);
}

/* ── Creators ───────────────────────────────── */

export interface Creator {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  publicKey: string | null;
  totalTips: number;
  tipCount: number;
}

export interface CreatorDetail extends Creator {
  tipsReceived: {
    id: string;
    amount: number;
    message: string | null;
    signature: string | null;
    createdAt: string;
    fromUser: { displayName: string | null; avatarUrl: string | null };
  }[];
  splits: { label: string; percentage: number; collaboratorAddress: string }[];
}

export async function getCreators(token: string): Promise<{ creators: Creator[] }> {
  const res = await fetch(`${BASE}/user/creators`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function getCreator(token: string, id: string): Promise<{ creator: CreatorDetail }> {
  const res = await fetch(`${BASE}/user/creator/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

/* ── Tips ────────────────────────────────────── */

export interface TipRecord {
  id: string;
  amount: number;
  message: string | null;
  signature: string | null;
  createdAt: string;
  toCreator?: { displayName: string | null; avatarUrl: string | null };
  fromUser?: { displayName: string | null; avatarUrl: string | null };
}

export async function tipCreator(token: string, body: { toCreatorId: string; amount: number; message?: string }) {
  const res = await fetch(`${BASE}/user/tip`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function getTips(token: string): Promise<{ sent: TipRecord[]; received: TipRecord[] }> {
  const res = await fetch(`${BASE}/user/tips`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

/* ── Wallet ─────────────────────────────────── */

export interface WalletInfo {
  publicKey: string;
  balance: number;
  network: string;
}

export async function getWallet(token: string): Promise<WalletInfo> {
  const res = await fetch(`${BASE}/user/wallet`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function sendSol(token: string, body: { to: string; amount: number }): Promise<{ signature: string }> {
  const res = await fetch(`${BASE}/user/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export interface Transaction {
  signature: string;
  slot: number;
  blockTime: number | null;
  confirmationStatus: string;
  err: boolean;
  memo: string | null;
}

export async function getTransactions(token: string): Promise<{ transactions: Transaction[] }> {
  const res = await fetch(`${BASE}/user/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}
