# TipJar — Creator Tipping Platform

A creator tipping platform built on Solana, powered by MPC (Multi-Party Computation) wallets. Creators get secure wallets, fans tip in SOL, and revenue splits automatically distribute to collaborators and the platform — all with on-chain transparency in a single, atomic transaction.

## Demo

[Watch Demo Here](./demo.mp4)

---


## Project Structure

### Apps
- **`apps/backend`** (Port `3000`): Express API for auth, creator management, tipping, and MPC orchestration.
- **`apps/mpc-backend`** (Port `3002`): MPC Node that holds key shares and participates in threshold signing.
- **`apps/fe`** (Port `4000`): Next.js frontend for creators and fans — discover, tip, track history.

### Packages
- **`packages/solana-mpc-tss-lib`**: TSS cryptographic library for Solana MPC key generation and signing.
- **`packages/db`**: Prisma schema for the main PostgreSQL DB (Users, Tips, Revenue Splits, w/ indices & timestamps).
- **`packages/mpc-db`**: Prisma schema for MPC nodes — key shares.
- **`packages/common`**: Shared Zod validation schemas (strict email, password, and phone validation) and Solana network config.

---

## 🎨 UI & UX Improvements
- **Collapsible Sidebar**: Fully responsive navigation; top mobile navbar with a hamburger menu, and fixed side-nav for desktop.
- **Scroll-Reveal Animations**: Intersection Observer-based smooth fade-up animations on cards, wallets, and tip history rows.
- **Modern Glassmorphism**: Premium deep-space aesthetic, fluid gradients, frosted glass (`backdrop-blur`), and active button micro-interactions (`active:scale-95`).
- **Revenue Distribution**: Built-in 1% platform fee and custom creator revenue splits (e.g., 70/30) handled atomically on-chain.

---

## 🔒 Security & Schema Specifications
- **JWT Expiration**: User tokens expire in `7d`, Admin tokens expire in `1d`.
- **Database Optimizations**: `updatedAt` on users/tips. `@@index` on `fromUserId`, `toCreatorId`, and `createdAt` for high performance querying.
- **Strict Validations**: Enforced Zod `.email()`, `.min(6)` password, and required unique phone lengths.

---

## MPC Key Architecture

**No single complete private key ever exists.** Keys are split into shares across MPC nodes using threshold signatures.

| Database | Table | What's Stored |
|---|---|---|
| `school_cms` (`packages/db`) | `User.publicKey` | Aggregated public key (wallet address) |
| `mpc_db` (`packages/mpc-db`) | `KeyShare.secretKey` | One key share per node per user |

### Key Generation Flow
```
Admin calls POST /admin/create-user
        │
        ├──► MPC Node 1 → generates key share → stores in its mpc_db
        ├──► MPC Node 2 → generates key share → stores in its mpc_db
        └──► MPC Node N → generates key share → stores in its mpc_db
        │
        ▼
Backend aggregates public keys → stores combined publicKey on User model
```

### Transaction Signing (Tipping with Splits)
1. Each MPC node creates a partial nonce commitment.
2. The system calculates the **1% Platform Fee** and any **Collaborator Splits**.
3. Each node creates a partial signature using its key share for the multi-recipient transaction.
4. Backend aggregates partial signatures → broadcasts to Solana.
5. Payouts are distributed to the Platform, Creator, and Collaborators in **one atomic transaction**.

> **Security**: No single node can sign alone. Deploy 3+ nodes in production.

---

## Getting Started

### 1. Database Setup (Docker)
```bash
docker run -d --name postgres-db --restart unless-stopped -e POSTGRES_PASSWORD=password -p 5432:5432 -v pgdata:/var/lib/postgresql postgres

#Do this to stop the db and restart
# stops db
docker stop postgres-db 

# removes db
docker rm postgres-db
# remove volume
docker volume rm pgdata
# then to restarts db
docker run -d --name postgres-db --restart unless-stopped -e POSTGRES_PASSWORD=password -p 5432:5432 -v pgdata:/var/lib/postgresql postgres
```

> ⚠️ The `-v pgdata:/var/lib/postgresql` flag persists data across container restarts. Without it, data is lost when the container is removed. PostgreSQL 18+ requires the mount at `/var/lib/postgresql` (not `/data`).

Create the databases:
```bash
docker exec -it postgres-db psql -U postgres -c "CREATE DATABASE school_cms;"
docker exec -it postgres-db psql -U postgres -c "CREATE DATABASE mpc_db;"
```

### 2. Configure Environment Variables

**`apps/backend/.env`**:
```env
PORT=3000
JWT_SECRET="super_secret_user_jwt"
ADMIN_JWT_SECRET="super_secret_admin_jwt"
```

**`packages/db/.env`**:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_cms?schema=public"
```

**`packages/mpc-db/.env`**:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mpc_db?schema=public"
```

### 3. Generate Prisma Schemas
```bash
bun install

cd packages/db
bunx prisma generate
bunx prisma db push

cd ../mpc-db
bunx prisma generate
bunx prisma db push
```

### 4. Start the Application
```bash
cd ../../
bun turbo run dev
```

---

## How to Use

### Step 1: Create the First Admin
Open Prisma Studio: `bunx prisma studio` inside `packages/db`. Create a user with role `ADMIN`.

### Step 2: Sign In as Admin
```
POST http://localhost:3000/admin/signin
{ "email": "admin@example.com", "password": "your_password" }
```

### Step 3: Create a Creator
```
POST http://localhost:3000/admin/create-user
Headers: Authorization: Bearer <admin_token>
{ "email": "creator@example.com", "password": "password123", "phone": "1234567890", "role": "CREATOR", "displayName": "Artist Name" }
```
This creates the user + generates their MPC wallet + airdrops devnet SOL.

### Step 4: Create a Fan
```
POST http://localhost:3000/admin/create-user
Headers: Authorization: Bearer <admin_token>
{ "email": "fan@example.com", "password": "password123", "phone": "9876543210", "role": "FAN" }
```

### Step 5: Manage Revenue Splits (Admin Only)
Set up automated collaborator payouts for any creator.
```bash
POST http://localhost:3000/admin/splits/<creator_id>
Headers: "Authorization: Bearer <admin_token>"
{
  "collaboratorAddress": "SolanaPublicKeyHere",
  "percentage": 30,
  "label": "Manager Commission"
}
```
*   **Calculations**: The system automatically deducts a **1% platform fee**, then splits the remaining 99% according to these rules. If a manager gets 30%, the creator automatically gets the remaining 70%.
*   **Atomic**: All payouts (Platform + Creator + Collaborators) happen in a single, secure Solana transaction.

### Step 6: Use the Platform
1. Sign in at `http://localhost:4000/signin`
2. **Discover** — Browse creator cards on the feed
3. **Tip** — Click a creator → enter amount + message → send SOL via MPC
4. **My Tips** — View sent/received tip history with tx links
5. **Wallet** — Check balance, send SOL, view on-chain transactions

---

## 🛠 Troubleshooting

### "Wallet Not Found"
The user must be created via the **Admin API** (`POST /admin/create-user`) for the MPC wallet to be initialized. Users created manually in Prisma Studio will not have an MPC wallet.

### "Signature verification failed"
*   **Precision Error**: Ensure you are sending a valid SOL amount. The system uses high-precision lamport math to prevent rounding errors.
*   **Memo Mismatch**: If you include a message with your tip, ensure the MPC nodes are running the latest code that supports memo signing.
*   **Platform Wallet**: Ensure `PLATFORM_WALLET` in `packages/common/solana.ts` is a valid, reachable Solana address.


