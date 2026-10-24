import {createHmac, timingSafeEqual} from "node:crypto";
import {connectToDatabase} from "@/database/mongoose";
import {ObjectId} from "mongodb";

const getSecret = () => {
    const secret = process.env.BETTER_AUTH_SECRET;
    if(!secret) throw new Error('BETTR_AUTH_SECRET must be set');
    return secret;
};

const sign = (userId: string) =>
    (createHmac('sha256', getSecret()).update(`unsubscribe:${userId}`).digest('base64url'));

export const verifyUnsubscribeToken = (userId: string, token: string) => {
    const expected = Buffer.from(sign(userId));
    const given = Buffer.from(token);

    return expected.length === given.length && timingSafeEqual(expected, given);
};

export const getUnsubscribeUrl = (userId: string, path: '/unsubscribe' | '/api/unsubscribe' = '/unsubscribe') => {
    const base = process.env.BETTER_AUTH_URL;
    if(!base) throw new Error('BETTER_AUTH_URL must be set');

    const url = new URL(path, base);
    url.searchParams.set('u', userId);
    url.searchParams.set('t', sign(userId));
    return url.toString();
};

const getUserCollection = async () => {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if(!db) throw new Error('MongoDB connection not found');
    return db.collection('user');
};

const toObjectId = (userId: string) => (ObjectId.isValid(userId) ? new ObjectId(userId) : null);

export const getNewsUnsubscribed = async (userId: string) => {
    const _id = toObjectId(userId);
    if(!_id) return null;

    const users = await getUserCollection();
    const user = await users.findOne({ _id }, { projection: { newsUnsubscribed: 1} } );
    if(!user) return null;
    return user.newsUnsubscribed === true;
};

export const setNewsUnsubscribed = async (userId: string, unsubscribed: boolean) => {
    const _id = toObjectId(userId);
    if(!_id) return false;

    const users = await getUserCollection();
    const result = await users.updateOne({ _id }, { $set: { newsUnsubscribed: unsubscribed } });
    return result.matchedCount === 1;
}