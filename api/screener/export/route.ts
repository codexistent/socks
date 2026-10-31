/**
 * Purpose: Handles the action for the 'Export as CSV' button
 */
import {NextRequest, NextResponse} from "next/server";
import {headers} from "next/headers";
import {auth} from "@/lib/better-auth/auth";
import {COLUMNS, formatValue} from "@/lib/screener/catalog";
import {parseState} from "@/lib/screener/query";
import {findScreenForExport} from "@/lib/screener/repository";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });
    if(!session?.user) return NextResponse.json({ error: 'Sign in to export' }, { status: 401 });

    const state = parseState(Object.fromEntries(request.nextUrl.searchParams));
    const {rows} = await findScreenForExport(state);

    const columns = Object.values(COLUMNS);
    const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [
        columns.map((c) => cell(c.label)).join(','),
        ...rows.map((r) => columns.map((c) => cell(formatValue(c.format, r[c.field]).replace(/^-$/, ''))).join(',')),
    ].join('\r\n');

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="screener-${date}.csv"`,
            'Cache-Control': 'private, no-store',
        },
    });
}