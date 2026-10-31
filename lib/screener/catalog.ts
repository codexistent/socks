import {StockSnapshot} from "@/database/models/stock-snapshot.model";

export type Field = keyof StockSnapshot;

export type Format = 'ticker' | 'text' | 'price' | 'cap' | 'pct' | 'signed' | 'ratio' | 'volume';
export type Column = { field: Field; label: string; format: Format };

export const COLUMNS = {
    ticker: { field: 'symbol', label: 'Ticker', format: 'ticker' },
    company: { field: 'name', label: 'Company', format: 'text' },
    sector: { field: 'sector', label: 'Sector', format: 'text' },
    industry: { field: 'industry', label: 'Industry', format: 'text' },
    cap: { field: 'marketCap', label: 'Market Cap', format: 'cap' },
    pe: { field: 'pe', label: 'P/E', format: 'ratio' },
    ps: { field: 'ps', label: 'P/S', format: 'ratio' },
    pb: { field: 'pb', label: 'P/B', format: 'ratio' },
    div: { field: 'dividendYield', label: 'Dividend', format: 'pct' },
    payout: { field: 'payoutRatio', label: 'Payout', format: 'pct' },
    roe: { field: 'roe', label: 'ROE', format: 'pct' },
    roa: { field: 'roa', label: 'ROA', format: 'pct' },
    gm: { field: 'grossMargin', label: 'Gross M.', format: 'pct' },
    om: { field: 'operatingMargin', label: 'Oper. M.', format: 'pct' },
    nm: { field: 'netMargin', label: 'Net M.', format: 'pct' },
    epsg: { field: 'epsGrowth', label: 'EPS Growth', format: 'signed' },
    revg: { field: 'revenueGrowth', label: 'Sales Growth', format: 'signed' },
    de: { field: 'debtToEquity', label: 'Debt/Eq', format: 'ratio' },
    cr: { field: 'currentRatio', label: 'Curr. R.', format: 'ratio' },
    beta: { field: 'beta', label: 'Beta', format: 'ratio' },
    perfw: { field: 'perfWeek', label: 'Perf Week', format: 'signed' },
    perfm: { field: 'perfMonth', label: 'Perf MTD', format: 'signed' },
    perfq: { field: 'perfQuarter', label: 'Perf Quart', format: 'signed' },
    perfh: { field: 'perfHalf', label: 'Perf Half', format: 'signed' },
    perfytd: { field: 'perfYtd', label: 'Perf YTD', format: 'signed' },
    perfy: { field: 'perfYear', label: 'Perf Year', format: 'signed' },
    hi52: { field: 'high52', label: '52W High', format: 'price' },
    lo52: { field: 'low52', label: '52W Low', format: 'price' },
    fromhi: { field: 'fromHigh52', label: 'From High', format: 'signed' },
    fromlo: { field: 'fromLow52', label: 'From Low', format: 'signed' },
    vol: { field: 'avgVolume', label: 'Avg Volume', format: 'volume' },
    price: { field: 'price', label: 'Price', format: 'price' },
    change: { field: 'change', label: 'Change', format: 'signed' },
} as const satisfies Record<string, Column>;

export type ColumnId = keyof typeof COLUMNS;

export const VIEWS = {
    overview: { label: 'Overview', columns: ['ticker', 'company', 'sector', 'industry', 'cap', 'pe', 'price', 'change', 'vol'] },
    valuation: { label: 'Valuation', columns: ['ticker', 'company', 'cap', 'pe', 'ps', 'pb', 'div', 'payout', 'epsg', 'revg', 'price', 'change'] },
    financial: { label: 'Financial', columns: ['ticker', 'company', 'cap', 'roe', 'roa', 'gm', 'om', 'nm', 'de', 'cr', 'price', 'change'] },
    performance: { label: 'Performance', columns: ['ticker', 'company', 'perfw', 'perfm', 'perfq', 'perfh', 'perfytd', 'perfy', 'beta', 'price', 'change'] },
    technical: { label: 'Technical', columns: ['ticker', 'company', 'beta', 'hi52', 'lo52', 'fromhi', 'fromlo', 'vol', 'price', 'change'] },
} as const satisfies Record<string, { label: string; columns: readonly ColumnId[] }>;

export type ViewId = keyof typeof VIEWS;

const compact = (n: number, prefix = '') =>
    n >= 1e12 ? `${prefix}${(n / 1e12).toFixed(2)}T` : n >= 1e9 ? `${prefix}${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${prefix}${(n / 1e6).toFixed(2)}M` : `${prefix}${Math.round(n).toLocaleString('en-US')}`;

export const formatValue = (format: Format, value: unknown): string => {
    if(value === undefined || value === null || value === '') return '-';
    if(format === 'ticker' || format === 'text') return String(value);

    const n = Number(value);
    if(!Number.isFinite(n)) return '-';
    switch(format){
        case 'price':
            return `$${n.toFixed(2)}`;
        case 'cap':
            return compact(n, '$');
        case 'volume':
            return compact(n);
        case 'pct':
            return `${n.toFixed(2)}%`;
        case 'signed':
            return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
        case 'ratio':
            return n.toFixed(2);
    }
    return '-';
};

export const toScreenerMenu = () => ({
    views: Object.entries(VIEWS).map(([id, v]) => ({ id, label: v.label })),
});
export type ScreenerMenu = ReturnType<typeof toScreenerMenu>;