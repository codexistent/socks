import { inngest } from "@/lib/inngest/client";

// Called from two places:
// 1. auth.ts user.create.after hook (email sign-ups where profile is known at creation)
// 2. completeOnboarding action (Google sign-ups where profile is filled in later)
export const sendWelcomeEvent = async (user: { email: string; name: string; country: string; investmentGoals: string; riskTolerance: string; preferredIndustry: string; }) => {
    await inngest.send({
        name: 'app/user.created',
        data: {
            email: user.email,
            name: user.name,
            country: user.country,
            investmentGoals: user.investmentGoals,
            riskTolerance: user.riskTolerance,
            preferredIndustry: user.preferredIndustry,
        },
    });
};