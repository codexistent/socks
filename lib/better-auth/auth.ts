import { sendWelcomeEvent } from "@/lib/inngest/events";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";
import type { Db } from 'mongodb';

const profileField = { type: "string", required: false, input: true } as const;

const createAuth = (db: Db) =>
    betterAuth({
        database: mongodbAdapter(db),
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                prompt: "select_account",
            },
        },
        account:{
            accountLinking: {
                enabled: true,
                trustedProviders: ["google"],
            },
        },
        databaseHooks: {
            user: {
                create: {
                    after: async (user) => {
                        const u = user as typeof user & Partial<OnboardingFormData>;
                        if(!u.country || !u.investmentGoals || !u.riskTolerance || !u.preferredIndustry) return;

                        try {
                            await sendWelcomeEvent({
                                email: u.email,
                                name: u.name,
                                country: u.country,
                                investmentGoals: u.investmentGoals,
                                riskTolerance: u.riskTolerance,
                                preferredIndustry: u.preferredIndustry,
                            });
                        } catch (e) {
                            console.error('Failed to queue welcome email', e);
                        }
                    },
                },
            },
        },

        plugins: [nextCookies()],
    });

let authInstance: ReturnType<typeof createAuth> | null = null;

export const getAuth = async () => {
    if(authInstance) return authInstance;

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if(!db) throw new Error('MongoDB connection not found');

    authInstance = createAuth(db);

    return authInstance;
}

export const auth = await getAuth();