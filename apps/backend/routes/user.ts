import { Router } from "express";
import { prismaClient } from "db/client";
import jwt from "jsonwebtoken";
import { SignupSchema, TipSchema, ProfileSchema, SendSchema } from "common/inputs";
import { authMiddleware } from "../middleware";
import { cli, MPC_SERVERS, MPC_THRESHOLD } from "./admin";
import axios from "axios";
import { NETWORK } from "common/solana";

const router = Router();

export default router;

// Sign in
router.post("/signin", async (req, res) => {
    const {success, data} = SignupSchema.safeParse(req.body);
    if (!success) {
        res.status(403).json({ message: "Incorrect credentials" })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: { email: data.email }
    });

    if (!user) {
        res.status(403).json({ message: "User not found" })
        return;
    }

    if (user.password !== data.password) {
        res.status(403).json({ message: "Incorrect creds" })
        return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, role: user.role } });
});

// Get current user's profile
router.get("/profile", authMiddleware, async (req, res) => {
    const user = await prismaClient.user.findFirst({
        where: { id: req.userId },
        select: {
            id: true, email: true, displayName: true, bio: true,
            avatarUrl: true, publicKey: true, role: true, createdAt: true
        }
    });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json({ user });
});

// Update profile
router.put("/profile", authMiddleware, async (req, res) => {
    const { success, data } = ProfileSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: "Invalid input" });
        return;
    }

    const user = await prismaClient.user.update({
        where: { id: req.userId },
        data: {
            displayName: data.displayName,
            bio: data.bio,
            avatarUrl: data.avatarUrl
        },
        select: {
            id: true, displayName: true, bio: true, avatarUrl: true
        }
    });
    res.json({ user });
});

// List all creators (public)
router.get("/creators", authMiddleware, async (req, res) => {
    const creators = await prismaClient.user.findMany({
        where: { role: "CREATOR" },
        select: {
            id: true, displayName: true, bio: true, avatarUrl: true, publicKey: true,
            _count: { select: { tipsReceived: true } },
            tipsReceived: { select: { amount: true } }
        }
    });

    res.json({
        creators: creators.map(c => ({
            id: c.id,
            displayName: c.displayName,
            bio: c.bio,
            avatarUrl: c.avatarUrl,
            publicKey: c.publicKey,
            totalTips: c.tipsReceived.reduce((sum, t) => sum + t.amount, 0),
            tipCount: c._count.tipsReceived
        }))
    });
});

// Get a single creator profile
router.get("/creator/:id", authMiddleware, async (req, res) => {
    const creator = await prismaClient.user.findFirst({
        where: { id: req.params.id, role: "CREATOR" },
        select: {
            id: true, displayName: true, bio: true, avatarUrl: true, publicKey: true,
            _count: { select: { tipsReceived: true } },
            tipsReceived: {
                select: { id: true, amount: true, message: true, signature: true, createdAt: true,
                    fromUser: { select: { displayName: true, avatarUrl: true } }
                },
                orderBy: { createdAt: "desc" },
                take: 20
            },
            splits: {
                select: { label: true, percentage: true, collaboratorAddress: true }
            }
        }
    });

    if (!creator) {
        res.status(404).json({ message: "Creator not found" });
        return;
    }

    res.json({
        creator: {
            ...creator,
            totalTips: creator.tipsReceived.reduce((sum, t) => sum + t.amount, 0),
            tipCount: creator._count.tipsReceived
        }
    });
});

import { PLATFORM_WALLET, PLATFORM_FEE_PERCENT } from "common/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// Tip a creator (MPC signing with Splits and Platform Fee)
router.post("/tip", authMiddleware, async (req, res) => {
    const { success, data } = TipSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: "Invalid input" });
        return;
    }

    const [user, creator] = await Promise.all([
        prismaClient.user.findFirst({ where: { id: req.userId } }),
        prismaClient.user.findFirst({ 
            where: { id: data.toCreatorId, role: "CREATOR" },
            include: { splits: true }
        })
    ]);

    if (!user || !user.publicKey) {
        res.status(403).json({ message: "Your wallet is not set up" });
        return;
    }
    if (!creator || !creator.publicKey) {
        res.status(404).json({ message: "Creator not found or has no wallet" });
        return;
    }

    try {
        const blockhash = await cli.recentBlockHash();
        const totalAmount = data.amount;

        // --- Calculate Distribution (Lamport Precision) ---
        const totalLamports = Math.round(data.amount * LAMPORTS_PER_SOL);
        const platformFeeLamports = Math.round(totalLamports * PLATFORM_FEE_PERCENT);
        const remainingForSplits = totalLamports - platformFeeLamports;
        
        const recipients: { to: string; amount: number; lamports: number }[] = [
            { 
                to: PLATFORM_WALLET, 
                amount: platformFeeLamports / LAMPORTS_PER_SOL, 
                lamports: platformFeeLamports 
            }
        ];

        if (creator.splits.length > 0) {
            let distributedSplitsLamports = 0;
            creator.splits.forEach(s => {
                const shareLamports = Math.floor((s.percentage / 100) * remainingForSplits);
                recipients.push({ 
                    to: s.collaboratorAddress, 
                    amount: shareLamports / LAMPORTS_PER_SOL, 
                    lamports: shareLamports 
                });
                distributedSplitsLamports += shareLamports;
            });
            // Remaining absolute dust goes to creator
            const creatorShareLamports = remainingForSplits - distributedSplitsLamports;
            recipients.push({ 
                to: creator.publicKey, 
                amount: creatorShareLamports / LAMPORTS_PER_SOL, 
                lamports: creatorShareLamports 
            });
        } else {
            // No splits, creator gets everything after fee
            recipients.push({ 
                to: creator.publicKey, 
                amount: remainingForSplits / LAMPORTS_PER_SOL, 
                lamports: remainingForSplits 
            });
        }

        // --- MPC Signing Multi-Recipient ---

        // Step 1
        const step1Responses = await Promise.all(MPC_SERVERS.map(async (server) => {
            const response = await axios.post(`${server}/send-multi/step-1`, {
                recipients,
                userId: req.userId,
                from: user.publicKey,
                recentBlockhash: blockhash,
                memo: data.message
            })
            return response.data.response;
        }))

        // Step 2
        const step2Responses = await Promise.all(MPC_SERVERS.map(async (server, index) => {
            const response = await axios.post(`${server}/send-multi/step-2`, {
                recipients,
                userId: req.userId,
                from: user.publicKey,
                recentBlockhash: blockhash,
                step1Response: JSON.stringify(step1Responses[index]),
                allPublicNonces: step1Responses.map((r) => r.publicNonce),
                memo: data.message
            })
            return response.data;
        }))

        const partialSignatures = step2Responses.map((r) => r.response);
        const transactionDetails = {
            amount: totalAmount,
            lamports: totalLamports,
            to: creator.publicKey, // Legacy field, keeping for compatibility
            from: user.publicKey,
            network: NETWORK,
            memo: data.message || undefined,
            recentBlockhash: blockhash,
            recipients // The new multi-recipient field
        };

        const signature = await cli.aggregateSignaturesAndBroadcast(
            JSON.stringify(partialSignatures),
            JSON.stringify(transactionDetails),
            JSON.stringify({
                aggregatedPublicKey: user.publicKey,
                participantKeys: step2Responses.map((r) => r.publicKey),
                threshold: MPC_THRESHOLD
            })
        );

        // Record the tip in the database
        const tip = await prismaClient.tip.create({
            data: {
                amount: data.amount,
                message: data.message,
                signature,
                fromUserId: req.userId!,
                toCreatorId: data.toCreatorId
            }
        });

        res.json({ tip, signature });
    } catch (e: any) {
        console.error("Tip transaction failed", e);
        res.status(500).json({ message: "Transaction failed: " + (e?.message || "Unknown error") });
    }
});


// Send SOL (General transfer from wallet page)
router.post("/send", authMiddleware, async (req, res) => {
    const { success, data } = SendSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: "Invalid input" });
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: { id: req.userId }
    });

    if (!user || !user.publicKey) {
        res.status(403).json({ message: "Your wallet is not set up" });
        return;
    }

    try {
        const blockhash = await cli.recentBlockHash();

        // MPC signing - Step 1
        const step1Responses = await Promise.all(MPC_SERVERS.map(async (server) => {
            const response = await axios.post(`${server}/send/step-1`, {
                to: data.to,
                amount: data.amount,
                userId: req.userId,
                recentBlockhash: blockhash
            })
            return response.data.response;
        }))

        // MPC signing - Step 2
        const step2Responses = await Promise.all(MPC_SERVERS.map(async (server, index) => {
            const response = await axios.post(`${server}/send/step-2`, {
                to: data.to,
                amount: data.amount,
                userId: req.userId,
                recentBlockhash: blockhash,
                step1Response: JSON.stringify(step1Responses[index]),
                allPublicNonces: step1Responses.map((r) => r.publicNonce)
            })
            return response.data;
        }))

        const partialSignatures = step2Responses.map((r) => r.response);
        const transactionDetails = {
            amount: data.amount,
            to: data.to,
            from: user.publicKey,
            network: NETWORK,
            memo: undefined,
            recentBlockhash: blockhash
        };

        const signature = await cli.aggregateSignaturesAndBroadcast(
            JSON.stringify(partialSignatures),
            JSON.stringify(transactionDetails),
            JSON.stringify({
                aggregatedPublicKey: user.publicKey,
                participantKeys: step2Responses.map((r) => r.publicKey),
                threshold: MPC_THRESHOLD
            })
        );

        res.json({ signature });
    } catch (e: any) {
        console.error("Send transaction failed", e);
        res.status(500).json({ message: "Transaction failed: " + (e?.message || "Unknown error") });
    }
});


// Get tip history
router.get("/tips", authMiddleware, async (req, res) => {
    const [sent, received] = await Promise.all([
        prismaClient.tip.findMany({
            where: { fromUserId: req.userId },
            include: { toCreator: { select: { displayName: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
            take: 50
        }),
        prismaClient.tip.findMany({
            where: { toCreatorId: req.userId },
            include: { fromUser: { select: { displayName: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
            take: 50
        })
    ]);

    res.json({ sent, received });
});

// Wallet info
router.get("/wallet", authMiddleware, async (req, res) => {
    const user = await prismaClient.user.findFirst({
        where: { id: req.userId }
    });

    if (!user || !user.publicKey) {
        res.status(404).json({ message: "Wallet not found" });
        return;
    }

    try {
        const balance = await cli.balance(user.publicKey);
        res.json({ publicKey: user.publicKey, balance, network: NETWORK });
    } catch (e) {
        console.error("Failed to fetch balance", e);
        res.json({ publicKey: user.publicKey, balance: 0, network: NETWORK });
    }
});

// Transactions
router.get("/transactions", authMiddleware, async (req, res) => {
    const user = await prismaClient.user.findFirst({
        where: { id: req.userId }
    });

    if (!user || !user.publicKey) {
        res.status(404).json({ message: "Wallet not found" });
        return;
    }

    try {
        const { Connection, PublicKey, clusterApiUrl } = await import("@solana/web3.js");
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const pubkey = new PublicKey(user.publicKey);
        const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 20 });

        const transactions = signatures.map((sig) => ({
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            confirmationStatus: sig.confirmationStatus,
            err: sig.err ? true : false,
            memo: sig.memo || null
        }));

        res.json({ transactions });
    } catch (e) {
        console.error("Failed to fetch transactions", e);
        res.json({ transactions: [] });
    }
});