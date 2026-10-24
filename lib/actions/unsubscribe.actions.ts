'use server';

import {setNewsUnsubscribed, verifyUnsubscribeToken} from "@/lib/unsubscribe";
import {redirect} from "next/navigation";

export const updateNewsSubscription = async (userId: string, token: string, unsubscribed: boolean) => {
    if(!verifyUnsubscribeToken(userId, token)) return;

    await setNewsUnsubscribed(userId, unsubscribed);

    redirect(`/unsubscribe?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(token)}`);
};