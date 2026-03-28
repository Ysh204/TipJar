import { Router } from "express";
import { TSSCli } from 'solana-mpc-tss-lib/mpc';
import axios from "axios";
import { prismaClient } from "db/client";
import jwt from "jsonwebtoken";
import { CreateUserSchema, SignupSchema, RevenueSplitSchema } from "common/inputs";
import { adminAuthMiddleware } from "../middleware";
import { NETWORK } from "common/solana";

export const MPC_SERVERS = [
    "http://localhost:3002",
];

export const MPC_THRESHOLD = Math.max(1, MPC_SERVERS.length - 1);

export const cli = new TSSCli(NETWORK);

const router = Router();

export default router;

router.post("/signin", async (req, res) => {
    const {success, data} = SignupSchema.safeParse(req.body);
    if (!success) {
        res.status(403).json({
            message: "Incorrect credentials"
        })
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

    const token = jwt.sign({ userId: user.id }, process.env.ADMIN_JWT_SECRET!, { expiresIn: "1d" });
    res.json({ token });
});

// Create a user (creator or fan) with MPC wallet
router.post("/create-user", adminAuthMiddleware, async (req, res) => {
    const {success, data} = CreateUserSchema.safeParse(req.body);
    if (!success) {
        res.status(403).json({ message: "Invalid input" })
        return;
    }

    const user = await prismaClient.user.create({
        data: {
            email: data.email,
            password: data.password,
            phone: data.phone,
            role: data.role === "CREATOR" ? "CREATOR" : "FAN",
            displayName: data.displayName || data.email.split("@")[0],
        }
    })

    try {
        const responses = await Promise.all(MPC_SERVERS.map(async (server) => {
            const response = await axios.post(`${server}/create-user`, { userId: user.id })
            return response.data;
        }))

        const aggregatedPublicKey = cli.aggregateKeys(responses.map((r) => r.publicKey), MPC_THRESHOLD);

        await prismaClient.user.update({
            where: {id: user.id},
            data: { publicKey: aggregatedPublicKey.aggregatedPublicKey }
        })

        try {
            await cli.airdrop(aggregatedPublicKey.aggregatedPublicKey, 0.1);
        } catch (airdropError) {
            console.warn("Airdrop failed, wallet still created", airdropError);
        }

        res.json({
            message: "User created",
            user: {
                ...user,
                publicKey: aggregatedPublicKey.aggregatedPublicKey
            }
        })
    } catch (error) {
        console.error("Failed to create user with MPC nodes", error);
        await prismaClient.user.delete({ where: {id: user.id} });
        res.status(500).json({
            message: "Failed to create user's MPC wallet. Rolled back.",
            error: String(error)
        });
    }
})

// List all creators with stats
router.get("/creators", adminAuthMiddleware, async (req, res) => {
    const creators = await prismaClient.user.findMany({
        where: { role: "CREATOR" },
        include: {
            _count: { select: { tipsReceived: true } },
            tipsReceived: { select: { amount: true } }
        }
    });

    res.json({
        creators: creators.map(c => ({
            id: c.id,
            email: c.email,
            displayName: c.displayName,
            publicKey: c.publicKey,
            totalTips: c.tipsReceived.reduce((sum, t) => sum + t.amount, 0),
            tipCount: c._count.tipsReceived
        }))
    });
})

// Manage revenue splits for a creator
router.post("/splits/:creatorId", adminAuthMiddleware, async (req, res) => {
    const { creatorId } = req.params;
    const { success, data } = RevenueSplitSchema.safeParse(req.body);
    if (!success) {
        res.status(400).json({ message: "Invalid input" });
        return;
    }

    const creator = await prismaClient.user.findFirst({
        where: { id: creatorId, role: "CREATOR" }
    });

    if (!creator) {
        res.status(404).json({ message: "Creator not found" });
        return;
    }

    const split = await prismaClient.revenueSplit.upsert({
        where: {
            creatorId_collaboratorAddress: {
                creatorId,
                collaboratorAddress: data.collaboratorAddress
            }
        },
        create: { creatorId, ...data },
        update: { label: data.label, percentage: data.percentage }
    });

    res.json({ split });
})

// Get splits for a creator
router.get("/splits/:creatorId", adminAuthMiddleware, async (req, res) => {
    const splits = await prismaClient.revenueSplit.findMany({
        where: { creatorId: req.params.creatorId }
    });
    res.json({ splits });
})
