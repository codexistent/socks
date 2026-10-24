'use client';

import {toast} from "sonner";
import {authClient} from "@/lib/better-auth/client";

const LinkGoogleButton = () => {
    const onClick = async () => {
        const { error } = await authClient.linkSocial({
            provider: 'google',
            callbackURL: '/',
        });
        if(error) toast.error('Could not link Google', { description: error.message });
    };

    return <button type="button" onClick={onClick}>Link Google account</button>
};

export default LinkGoogleButton;