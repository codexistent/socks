'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {revalidatePath} from "next/cache";
import {getStocksDetails} from "@/lib/actions/finnhub.actions";

const getCurrentUserId = async () => {
    const session  = await auth.api.getSession({ headers: await headers() });
    return session?.user.id ?? null;
};

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}

export async function addToWatchlist(symbol: string, company: string) {
    try{
        const userId = await getCurrentUserId();
        if(!userId) return { success: false, error: 'Not signed in' };

        await connectToDatabase();

        await Watchlist.updateOne(
            { userId, symbol: symbol.toUpperCase() },
            { $setOnInsert: { userId, symbol: symbol.toUpperCase(), company: company.trim(), addedAt: new Date() } },
            { upsert: true }
        );

        revalidatePath('/watchlist');
        return { success: true };
    } catch (err) {
        console.error('addToWatchlist error:', err);
        return { success: false, error: 'Could not add to watchlist' };
    }
}

export async function removeFromWatchlist(symbol: string) {
    try {
        const userId = await getCurrentUserId();
        if(!userId) return { success: false, error: 'Not signed in' };

        await connectToDatabase();
        await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });

        revalidatePath('/watchlist');
        return { success: true };
    } catch (err) {
        console.error('removeFromWatchlist error:', err);
        return { success: false, error: 'Could not remove from watchlist' };
    }
}

export async function getCurrentUserWatchlistSymbols(): Promise<string[]> {
    try{
        const userId = await getCurrentUserId();
        if(!userId) return [];

        await connectToDatabase();
        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    }catch(err){
        console.error('getCurrentUserWatchlistSymbols error:', err);
        return [];
    }
}

export async function getWatchlistWithData(): Promise<StockWithData[]> {
    try {
        const userId = await getCurrentUserId();
        if(!userId) return [];

        await connectToDatabase();
        const items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();

        return await Promise.all(
            items.map(async(item) => {
                const base: StockWithData = {
                    userId: item.userId,
                    symbol: item.symbol,
                    company: item.company,
                    addedAt: item.addedAt,
                };

                try {
                    const details = await getStocksDetails(item.symbol);
                    return { ...base, ...details, company: details.company || item.company };
                } catch (err) {
                    console.error('getWatchlistWithData error: details failed for', item.symbol, err);
                    return base;
                }
            })
        );
    } catch (err) {
        console.error('getWatchlistWithData error:', err);
        return [];
    }
}