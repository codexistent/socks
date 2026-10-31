import { Schema, model, models, type Model } from 'mongoose';

export interface StockSnapshot {
    symbol: string;

    // from the universe list
    name: string;
    sector: string;
    industry: string;

    // from /stock/profile2 (fetched weekly)
    exchange?: string;
    country?: string;
    logo?: string;
    marketCap?: number;

    // from /quote (fetched every 30 min)
    price?: number;
    change?: number;

    // from /stock/metric (fetched daily)
    pe?: number;
    ps?: number;
    pb?: number;
    dividendYield?: number;
    payoutRatio?: number;
    roe?: number;
    roa?: number;
    grossMargin?: number;
    operatingMargin?: number;
    netMargin?: number;
    epsGrowth?: number;
    revenueGrowth?: number;
    debtToEquity?: number;
    currentRatio?: number;
    beta?: number;
    high52?: number;
    low52?: number;
    avgVolume?: number;
    perfWeek?: number;
    perfMonth?: number;
    perfQuarter?: number;
    perfHalf?: number;
    perfYtd?: number;
    perfYear?: number;

    // derived on every write from price (see sync.ts)
    fromHigh52?: number;
    fromLow52?: number;

    // when each source last succeeded
    profileAt?: Date;
    metricsAt?: Date;
    quoteAt?: Date;
}

const num = { type: Number };

const StockSnapshotSchema = new Schema<StockSnapshot>(
    {
        symbol: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        sector: { type: String, required: true, index: true },
        industry: { type: String, required: true, index: true },
        exchange: String, country: String, logo: String,
        marketCap: { type: Number, index: true },
        price: num, change: num,
        pe: num, ps: num, pb: num, dividendYield: num, payoutRatio: num,
        roe: num, roa: num, grossMargin: num, operatingMargin: num, netMargin: num,
        epsGrowth: num, revenueGrowth: num, debtToEquity: num, currentRatio: num,
        beta: num, high52: num, low52: num, avgVolume: num,
        perfWeek: num, perfMonth: num, perfQuarter: num, perfHalf: num, perfYtd: num, perfYear: num,
        fromHigh52: num, fromLow52: num,
        profileAt: Date, metricsAt: Date, quoteAt: Date,
    },
    { collection: 'stock_snapshots', versionKey: false }
);

export const StockSnapshotModel: Model<StockSnapshot> =
    (models?.StockSnapshot as Model<StockSnapshot>) || model<StockSnapshot>('StockSnapshot', StockSnapshotSchema);