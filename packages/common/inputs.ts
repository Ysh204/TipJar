import z from "zod";

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().min(7).max(15),
    role: z.enum(["CREATOR", "FAN"]).optional().default("FAN"),
    displayName: z.string().optional(),
});

export const ProfileSchema = z.object({
    displayName: z.string().min(1).max(50),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
});

export const TipSchema = z.object({
    toCreatorId: z.string(),
    amount: z.number().positive(),
    message: z.string().max(280).optional(),
});

export const RevenueSplitSchema = z.object({
    collaboratorAddress: z.string(),
    label: z.string().min(1).max(50),
    percentage: z.number().min(0).max(100),
});

export const SendSchema = z.object({
    to: z.string(),
    amount: z.number().positive(),
});