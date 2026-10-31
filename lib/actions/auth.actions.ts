'use server';

import {auth} from "@/lib/better-auth/auth";
import {sendWelcomeEvent} from "@/lib/inngest/events";
import {INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS} from "@/lib/constants";
import {headers} from "next/headers";

const isOneOf = (value: string, options: readonly Option[]) => options.some((o) => o.value === value);

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({
            body: { email, password, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry },
        })

        return { success: true, data: response }
    } catch(e) {
        console.log('Sign up failed', e)
        return { success: false, error: e instanceof Error ? e.message : 'Sign up failed' }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({
            body: { email, password }
        })

        return { success: true, data: response }
    } catch(e) {
        console.log('Sign in failed', e)
        return { success: false, error: e instanceof Error ? e.message : 'Sign in failed' }
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (e) {
        console.log('Sign out failed', e)
        return { success: false, error: 'Sign out failed' }
    }
}

// saves profile for Google user and sends welcome email
// afterwards, session.user.country is set and (root) lets them in
export const completeOnboarding = async (data: OnboardingFormData) => {
    try {
        const h = await headers();
        const session = await auth.api.getSession({ headers: h });
        if(!session?.user) return { success: false, error: 'You are not signed in' };

        // already onboarded
        if(session.user.country) return { success: true };

        const { country, investmentGoals, riskTolerance, preferredIndustry } = data;
        if(
            !country ||
            !isOneOf(investmentGoals, INVESTMENT_GOALS) ||
            !isOneOf(riskTolerance, RISK_TOLERANCE_OPTIONS) ||
            !isOneOf(preferredIndustry, PREFERRED_INDUSTRIES)
        ) {
            return { success: false, error: 'Please choose a value for every field' };
        }

        await auth.api.updateUser({
            body: { country, investmentGoals, riskTolerance, preferredIndustry },
            headers: h,
        });

        try{
            await sendWelcomeEvent({ email: session.user.email, name: session.user.name, ...data });
        }catch(e) {
            console.error('Failed to queue welcome email', e);
        }

        return { success: true};
    }catch(e) {
        console.log('Onboarding failed', e)
        return { success: false, error: 'Could not save your profile' }
    }
}