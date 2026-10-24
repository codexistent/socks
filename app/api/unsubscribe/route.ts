import {setNewsUnsubscribed, verifyUnsubscribeToken} from "@/lib/unsubscribe";
import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('u') ?? '';
    const token = request.nextUrl.searchParams.get('t') ?? '';

    if(!verifyUnsubscribeToken(userId, token)) {
        return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 });
    }

    await setNewsUnsubscribed(userId, true);
    return NextResponse.json({ success: true });
}