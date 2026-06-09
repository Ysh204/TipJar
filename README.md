# TipJar — Creator Tipping Platform

A creator tipping platform built on Solana, powered by MPC (Multi-Party Computation) wallets. Creators get secure wallets, fans tip in SOL And Can Stake Sol as well.

# [Complete Demo with Old Ui](https://youtu.be/N-0vY6_rnc0)
# [New Ui](https://www.youtube.com/watch?v=-hb0dMIP4Ac)

---

## 🏗️ System Architecture & Data Flow

🏗️ System Architecture & Data Flow

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#1e1e2e,stroke:#b4befe,stroke-width:2px,color:#cdd6f4;
    classDef backend fill:#181825,stroke:#fab387,stroke-width:2px,color:#cdd6f4;
    classDef mpc fill:#11111b,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4;
    classDef blockchain fill:#313244,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4;

    %% Elements
    FE[Next.js Frontend]:::frontend
    BE[Express Gateway Backend]:::backend
    DB[(PostgreSQL school_cms)]:::backend
    Node1[MPC Node 1]:::mpc
    Node2[MPC Node 2]:::mpc
    MDB[(PostgreSQL mpc_db)]:::mpc
    SOL[(Solana Devnet)]:::blockchain
    SC[Custom Anchor Program]:::blockchain

    %% Connections
    FE --> BE
    BE --> DB
    BE --> Node1
    BE --> Node2
    Node1 --> MDB
    MDB --> Node1
    Node2 --> MDB
    MDB --> Node2
    Node1 --> BE
    Node2 --> BE
    BE --> SOL
    FE --> SC
    SC --> SOL
    SOL --> SC

### Transaction Signing (Tipping with Splits)
1. Each MPC node creates a partial nonce commitment.
2. The system calculates the **1% Platform Fee** and any **Collaborator Splits**.
3. Each node creates a partial signature using its key share for the multi-recipient transaction.
4. Backend aggregates partial signatures → broadcasts to Solana.
5. Payouts are distributed to the Platform, Creator, and Collaborators in **one atomic transaction**.

> **Security**: No single node can sign alone. Deploy 3+ nodes in production.

---

## Staking & Yield Generation

TipJar is not only a platform for moving money; it is also designed to help creators and users **grow** idle balances on Solana devnet. Alongside the MPC-powered wallet and tipping flow, the frontend includes a custom staking dashboard powered by a **custom Anchor-based staking program** integrated through the app’s own IDL and React hooks.

**Devnet Staking Program Address**: `9iUwUFHkCsJnBE1D4UYakUcU8DVkthq9mYBV8QsqQSGo`

### Custom Staking Logic
- **Anchor-powered program integration**: The frontend binds directly to the custom staking contract through `apps/fe/lib/idl/staking_contract_solana.json` and the custom `useProgram` / `useStaking` React hooks.
- **Native SOL staking flow**: The staking flow accepts SOL-denominated amounts, converts them into lamports, and submits contract calls from the connected wallet on devnet.
- **Custom treasury experience**: This makes TipJar more than a standard API integration project, because the product includes project-specific on-chain business logic rather than only external wallet calls.

### Core Contract Functions
- **`initialize_pool`**: Initializes the staking pool state, reward configuration, vault PDAs, and reward distribution parameters.
- **`stake`**: Stakes SOL into the pool and updates the user’s on-chain staking state.
- **`request_unstake`**: Starts the unstake flow and records a pending unstake request with a lockup window.
- **`withdraw_unstake`**: Releases previously requested unstaked SOL after the lock period expires.
- **`claim_rewards`**: Claims accrued rewards and creates the user reward ATA when needed.

### Custom React Hook Layer
- **`useProgram`**: Initializes the Anchor provider and binds the app to the staking program ID from the IDL.
- **`useStaking`**: Wraps all staking actions (`stake`, `requestUnstake`, `withdrawUnstake`, `claimRewards`) and fetches pool/user state for the dashboard.
- **State-driven UX**: The hooks drive the staking cards, reward displays, pending-unstake state, and wallet reward-balance logic directly in the frontend.

### Why This Matters
The MPC architecture is the security backbone of TipJar, but the custom staking contract is the missing crown jewel that shows the platform goes beyond basic wallet plumbing. It demonstrates that the project includes:
- custom Solana program logic,
- custom Anchor integration,
- custom React hook orchestration,
- and a product vision that covers both **payments** and **yield generation**.

---

## Getting Started

### 1. Database Setup (Docker)
```bash
docker run -d --name postgres-db --restart unless-stopped -e POSTGRES_PASSWORD=password -p 5432:5432 -v pgdata:/var/lib/postgresql postgres

# Do this to stop the db and restart
docker stop postgres-db
docker rm postgres-db
docker volume rm pgdata
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
Use the bootstrap script instead of Prisma Studio:

```bash
bun run create-admin --email admin@example.com --password password123 --phone 1234567890 --display-name "Admin"
```

> This avoids Prisma Studio-only issues and gives you a clearer error if the email or phone is already in use.

### Step 2: Sign In as Admin
```text
POST http://localhost:3000/admin/signin
{ "email": "admin@example.com", "password": "your_password" }
```

### Step 3: Create a Creator
```text
POST http://localhost:3000/admin/create-user
Headers: Authorization: Bearer <admin_token>
{ "email": "creator@example.com", "password": "password123", "phone": "1234567890", "role": "CREATOR", "displayName": "Artist Name" }
```

This creates the user + generates their MPC wallet + airdrops devnet SOL.

### Step 4: Create a Fan
```text
POST http://localhost:3000/admin/create-user
Headers: Authorization: Bearer <admin_token>
{ "email": "fan@example.com", "password": "password123", "phone": "9876543210", "role": "FAN" }
```

### Step 5: Manage Revenue Splits (Admin Only)
Set up automated collaborator payouts for any creator.

```text
POST http://localhost:3000/admin/splits/<creator_id>
Headers: "Authorization: Bearer <admin_token>"
{
  "collaboratorAddress": "SolanaPublicKeyHere",
  "percentage": 30,
  "label": "Manager Commission"
}
```

- **Calculations**: The system automatically deducts a **1% platform fee**, then splits the remaining 99% according to these rules. If a manager gets 30%, the creator automatically gets the remaining 70%.
- **Atomic**: All payouts (Platform + Creator + Collaborators) happen in a single, secure Solana transaction.

### Step 6: Use the Platform
1. Sign in at `http://localhost:4000/signin`
2. **Discover** — Browse creator cards on the feed
3. **Tip** — Click a creator → enter amount + message → send SOL via MPC
4. **Stake** — Open the staking dashboard to stake SOL, request unstake, withdraw, and claim rewards
5. **My Tips** — View sent/received tip history with tx links
6. **Wallet** — Check balance, send SOL, view on-chain transactions

---

## 🛠 Troubleshooting

### "Wallet Not Found"
The user must be created via the **Admin API** (`POST /admin/create-user`) for the MPC wallet to be initialized. Users created manually in Prisma Studio will not have an MPC wallet.

### Prisma `P2002` on `phone`
That means the phone number already exists in the `User` table. Use a different phone number, or query/delete the existing row before retrying.

### "Signature verification failed"
- **Precision Error**: Ensure you are sending a valid SOL amount. The system uses high-precision lamport math to prevent rounding errors.
- **Memo Mismatch**: If you include a message with your tip, ensure the MPC nodes are running the latest code that supports memo signing.
- **Platform Wallet**: Ensure `PLATFORM_WALLET` in `packages/common/solana.ts` is a valid, reachable Solana address.

### Staking transactions not appearing
- Ensure the connected wallet is on **Solana devnet**.
- Ensure the staking program configured in the frontend IDL matches the deployed devnet program you want to demonstrate.
- If reward claiming fails, check whether the associated token account had to be created first for the reward mint.
