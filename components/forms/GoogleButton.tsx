'use client';

import {useState} from "react";
import {toast} from "sonner";
import {authClient} from "@/lib/better-auth/client";

const GoogleButton = ({ label = 'Continue with Google' } : { label?: string }) => {
    const [loading, setLoading] = useState(false);

    const onClick = async () => {
        setLoading(true);

        const { error } = await authClient.signIn.social({
            provider: 'google',
            callbackURL: '/',
            newUserCallbackURL: '/onboarding',
            errorCallbackURL: '/sign-in',
        });

        if(error){
            toast.error('Google sign-in failed', { description: error.message });
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className="w-full h-12 rounded-lg border border-gray-600 bg-transparent text-gray-100 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
            {loading ? 'Redirecting to Google' : label}
        </button>
    );
};

export default GoogleButton;