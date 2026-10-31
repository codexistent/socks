import {StockSnapshot, StockSnapshotModel} from "@/database/models/stock-snapshot.model";
import {finnhub, FinnhubError, FinnhubMetrics, FinnhubProfile, FinnhubQuote} from "@/lib/screener/finnhub";
import {UNIVERSE} from '@/lib/screener/universe';
import {connectToDatabase} from "@/database/mongoose";

export const SYNC_KINDS = ['profiles', 'metrics', 'quotes' ] as const;
export type SyncKind = (typeof SYNC_KINDS)[number];

type Fields = Partial<StockSnapshot>;

// Mappers
const finite = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const pick = (m: Record<string, unknown>, ...keys: string[]) => keys.map((k) => finite(m[k])).find((v) => v !== undefined);
const positive = (v?: number) => (v !== undefined && v > 0 ? v : undefined);
const millions = (v?: number) => (v !== undefined ? Math.round(v * 1e6) : undefined);

export const fromProfile = (p: FinnhubProfile): Fields => ({
    exchange: p.exchange || undefined,
    country: p.country || undefined,
    logo: p.logo || undefined,
    marketCap: positive(millions(finite(p.marketCapitalization))),
});

export const fromMetrics = ({ metric: m = {} }: FinnhubMetrics): Fields => ({
    pe: positive(pick(m, 'peTTM', 'peBasicExclExtraTTM', 'peNormalizedAnnual')),
    ps: positive(pick(m, 'psTTM', 'psAnnual')),
    pb: positive(pick(m, 'pbQuarterly', 'pbAnnual')),
    dividendYield: pick(m, 'dividendYieldIndicatedAnnual', 'currentDividendYieldTTM') ?? 0,
    payoutRatio: pick(m, 'payoutRatioTTM', 'payoutRatioAnnual'),
    roe: pick(m, 'roeTTM', 'roeRfy'),
    roa: pick(m, 'roaTTM', 'roaRfy'),
    grossMargin: pick(m, 'grossMarginTTM', 'grossMarginAnnual'),
    operatingMargin: pick(m, 'operatingMarginTTM', 'operatingMarginAnnual'),
    netMargin: pick(m, 'netProfitMarginTTM', 'netProfitMarginAnnual'),
    epsGrowth: pick(m, 'epsGrowthTTMYoy'),
    revenueGrowth: pick(m, 'revenueGrowthTTMYoy'),
    debtToEquity: pick(m, 'totalDebt/totalEquityQuarterly', 'totalDebt/totalEquityAnnual'),
    currentRatio: pick(m, 'currentRatioQuarterly', 'currentRatioAnnual'),
    beta: pick(m, 'beta'),
    high52: positive(pick(m, '52WeekHigh')),
    low52: positive(pick(m, '52WeekLow')),
    avgVolume: millions(pick(m, '10DayAverageTradingVolume')),
    perfWeek: pick(m, '5DayPriceReturnDaily'),
    perfMonth: pick(m, 'monthToDatePriceReturnDaily'),
    perfQuarter: pick(m, '13WeekPriceReturnDaily'),
    perfHalf: pick(m, '26WeekPriceReturnDaily'),
    perfYtd: pick(m, 'yearToDatePriceReturnDaily'),
    perfYear: pick(m, '52WeekPriceReturnDaily'),
});

export const fromQuote = (q: FinnhubQuote): Fields =>
    positive(finite(q.c)) ? { price: q.c, change: finite(q.dp) ?? 0 } : {};

const SOURCES = {
    profiles: { fetch: finnhub.profile, map: fromProfile, stamp: 'profileAt' },
    metrics: { fetch: finnhub.metrics, map: fromMetrics, stamp: 'metricsAt' },
    quotes: { fetch: finnhub.quote, map: fromQuote, stamp: 'quoteAt' },
} as const;

// Writing
const pctFrom = (ref: string) => ({
    $cond: [
        { $and: [{ $gt: ['$price', 0]}, { $gt: [ref, 0] }] },
        { $multiply: [{ $subtract: [{ $divide: ['$price', ref] }, 1] }, 100] },
        '$$REMOVE',
    ],
});
const DERIVED = { $set: { fromHigh52: pctFrom('$high52'), fromLow52: pctFrom('$low52') } };

const literal = (fields: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined).map(([k, v]) => [k, { $literal: v}]));

const byUniverseSymbol = new Map(UNIVERSE.map((s) => [s.symbol, s]));

export const buildUpdate = (symbol: string, fields: Fields, stamp: keyof StockSnapshot, now: Date) => {
    const base = byUniverseSymbol.get(symbol);
    if(!base) throw new Error(`${symbol} is not in the screener universe`);
    return {
        updateOne: {
            filter: { symbol },
            update: [{ $set: literal({ ...base, ...fields, [stamp]: now }) }, DERIVED ],
            upsert: true
        },
    };
};

export const syncBatch = async(kind: SyncKind, symbols: string[]) => {
    const source = SOURCES[kind];
    const now = new Date();
    const settled = await Promise.allSettled(symbols.map(async (s) => ({ s, fields: source.map(await source.fetch(s)) })));

    if(settled.some((r) => r.status === 'rejected' && r.reason instanceof FinnhubError && r.reason.status == 429)) {
        throw new Error(`Finnhub rate limit hit while syncing ${kind}`);
    }

    const ops = settled.flatMap((r) => {
        if(r.status === 'rejected'){
            console.error(`screener ${kind} sync failed:`, r.reason);
            return [];
        }
        return Object.keys(r.value.fields).length ? [buildUpdate(r.value.s, r.value.fields, source.stamp, now)] : [];
    });

    if(ops.length){
        await connectToDatabase();
        await StockSnapshotModel.collection.bulkWrite(ops, { ordered: false });
    }
    return { kind, requested: symbols.length, saved: ops.length };
};