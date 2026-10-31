import type { Field, ColumnId } from '@/lib/screener/catalog';
import {INDUSTRIES, SECTORS} from "@/lib/screener/universe";

type Condition = Record<string, number | string>;

export type FilterOption = { value: string; label: string; match: Condition };
export type FilterGroup = 'descriptive' | 'fundamental' | 'technical';
export type Filter = { id: string; label: string; group: FilterGroup; field: Field; options: FilterOption[] };

const opt = (value: string, label: string, match: Condition): FilterOption => ({ value, label, match });
const over = (n: number, unit = '') => opt(`o${n}`, `Over ${n}${unit}`, { $gt: n });
const under = (n: number, unit = '') => opt(`u${n}`, `Under ${n}${unit}`, { $lt: n });
const down = (n: number) => opt(`d${n}`, `Down ${n}%+`, { $lte: -n });
const up = (n: number) => opt(`o${n}`, `Up ${n}%+`, { $gte: n });
const usd = (dir: 'u' | 'o', n: number) => opt(`${dir}${n}`, `${dir === 'u' ? 'Under' : 'Over'} $${n}`, { [dir === 'u' ? '$lt' : '$gt']: n});
const POS = opt('pos', 'Positive', { $gt: 0 });
const NEG = opt('neg', 'Negative', { $lt: 0 });
const B = 1e9;

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const choices = (names: string[]) => names.map((n) => opt(slug(n), n, { $eq: n }));

const perf = (id: string, label: string, field: Field, steps: number[]): Filter => ({
    id, label, group: 'technical', field,
    options: [opt('up', 'Up', { $gt: 0 }), opt('down', 'Down', { $lt: 0 }), ...steps.flatMap((n) => [up(n), down(n)])],
});

// Filters
export const FILTERS: Filter[] = [
    // descriptive
    {
        id: 'sec',
        label: 'Sector',
        group: 'descriptive',
        field: 'sector',
        options: choices(SECTORS)
    },
    {
        id: 'ind',
        label: 'Industry',
        group: 'descriptive',
        field: 'industry',
        options: choices(INDUSTRIES)
    },
    {
        id: 'cap',
        label: 'Market Cap',
        group: 'descriptive',
        field: 'marketCap',
        options: [
            opt('mega', 'Mega ($200B+)', { $gte: 200 * B }),
            opt('large', 'Large ($10B–$200B)', { $gte: 10 * B, $lt: 200 * B }),
            opt('mid', 'Mid ($2B–$10B)', { $gte: 2 * B, $lt: 10 * B }),
            opt('largeover', '+Large (over $10B)', { $gte: 10 * B }),
            opt('midover', '+Mid (over $2B)', { $gte: 2 * B }),
            opt('under10', 'Under $10B', { $lt: 10 * B }),
        ],
    },
    {
        id: 'div',
        label: 'Dividend Yield',
        group: 'descriptive',
        field: 'dividendYield',
        options: [opt('none', 'None (0%)', { $eq: 0 }), POS, ...[1, 2, 3, 4, 5].map((n) => over(n, '%'))] },
    {
        id: 'vol',
        label: 'Avg Volume',
        group: 'descriptive',
        field: 'avgVolume',
        options: [
            opt('u1m', 'Under 1M', { $lt: 1e6 }), opt('o1m', 'Over 1M', { $gt: 1e6 }), opt('o2m', 'Over 2M', { $gt: 2e6 }),
            opt('o5m', 'Over 5M', { $gt: 5e6 }), opt('o10m', 'Over 10M', { $gt: 10e6 }), opt('o20m', 'Over 20M', { $gt: 20e6 }),
        ],
    },
    {
        id: 'price',
        label: 'Price',
        group: 'descriptive',
        field: 'price',
        options: [...[20, 50, 100].map((n) => usd('u', n)), ...[50, 100, 200, 500].map((n) => usd('o', n))]
    },
    {
        id: 'beta',
        label: 'Beta',
        group: 'descriptive',
        field: 'beta',
        options: [under(0.5), under(1), over(1), over(1.5), over(2)]
    },

    // fundamental
    {
        id: 'pe',
        label: 'P/E',
        group: 'fundamental',
        field: 'pe',
        options: [opt('profitable', 'Profitable (>0)', { $gt: 0 }), ...[10, 15, 20, 25, 30].map((n) => under(n)), ...[20, 30, 50].map((n) => over(n))]
    },
    {
        id: 'ps',
        label: 'P/S',
        group: 'fundamental',
        field: 'ps',
        options: [...[1, 2, 3, 5].map((n) => under(n)), over(5), over(10)]
    },
    {
        id: 'pb',
        label: 'P/B',
        group: 'fundamental',
        field: 'pb',
        options: [...[1, 2, 3, 5].map((n) => under(n)), over(5), over(10)]
    },
    {
        id: 'roe',
        label: 'ROE',
        group: 'fundamental',
        field: 'roe',
        options: [POS, NEG, ...[10, 15, 20, 30].map((n) => over(n, '%'))]
    },
    {
        id: 'roa',
        label: 'ROA',
        group: 'fundamental',
        field: 'roa',
        options: [POS, NEG, ...[5, 10, 15].map((n) => over(n, '%'))]
    },
    {
        id: 'gm',
        label: 'Gross Margin',
        group: 'fundamental',
        field: 'grossMargin',
        options: [POS, ...[20, 40, 60].map((n) => over(n, '%'))]
    },
    {
        id: 'om',
        label: 'Operating Margin',
        group: 'fundamental',
        field: 'operatingMargin',
        options: [POS, NEG, ...[10, 20, 30].map((n) => over(n, '%'))]
    },
    {
        id: 'nm',
        label: 'Net Margin',
        group: 'fundamental',
        field: 'netMargin',
        options: [POS, NEG, ...[10, 20].map((n) => over(n, '%'))]
    },
    {
        id: 'epsg',
        label: 'EPS Growth (TTM)',
        group: 'fundamental',
        field: 'epsGrowth',
        options: [POS, NEG, ...[10, 20, 30].map((n) => over(n, '%'))]
    },
    {
        id: 'revg',
        label: 'Sales Growth (TTM)',
        group: 'fundamental',
        field: 'revenueGrowth',
        options: [POS, NEG, ...[10, 20, 30].map((n) => over(n, '%'))]
    },
    {
        id: 'de',
        label: 'Debt/Equity',
        group: 'fundamental',
        field: 'debtToEquity',
        options: [under(0.5), under(1), over(1), over(2)]
    },
    {
        id: 'cr',
        label: 'Current Ratio',
        group: 'fundamental',
        field: 'currentRatio',
        options: [under(1), over(1), over(1.5), over(2)]
    },
    {
        id: 'payout',
        label: 'Payout Ratio',
        group: 'fundamental',
        field: 'payoutRatio',
        options: [opt('none', 'None (0%)', { $eq: 0 }), POS, under(50, '%'), over(50, '%'), over(100, '%')]
    },

    // technical
    perf('chg', 'Change Today', 'change', [2, 5]),
    perf('perfw', 'Perf Week', 'perfWeek', [5, 10]),
    perf('perfm', 'Perf Month (MTD)', 'perfMonth', [5, 10, 20]),
    perf('perfq', 'Perf Quarter', 'perfQuarter', [10, 20, 30]),
    perf('perfytd', 'Perf YTD', 'perfYtd', [10, 20, 30]),
    perf('perfy', 'Perf Year', 'perfYear', [20, 50, 100]),
    {
        id: 'hi52',
        label: '52W High',
        group: 'technical',
        field: 'fromHigh52',
        options: [
            opt('nh', 'New high (within 1%)', { $gte: -1 }), opt('b5', 'Within 5%', { $gte: -5 }), opt('b10', 'Within 10%', { $gte: -10 }),
            opt('d10', '10%+ below', { $lte: -10 }), opt('d20', '20%+ below', { $lte: -20 }), opt('d50', '50%+ below', { $lte: -50 }),
        ],
    },
    {
        id: 'lo52',
        label: '52W Low',
        group: 'technical',
        field: 'fromLow52',
        options: [
            opt('nl', 'New low (within 1%)', { $lte: 1 }), opt('a5', 'Within 5%', { $lte: 5 }), opt('a10', 'Within 10%', { $lte: 10 }),
            opt('o30', '30%+ above', { $gte: 30 }), opt('o50', '50%+ above', { $gte: 50 }), opt('o100', '100%+ above', { $gte: 100 }),
        ],
    },
];

export const FILTERS_BY_ID = new Map(FILTERS.map((f) => [f.id, f]));
export const FILTER_GROUPS: { id: FilterGroup; label: string }[] = [
    {id: 'descriptive', label: 'Descriptive' },
    { id: 'fundamental', label: 'Fundamental' },
    { id: 'technical', label: 'Technical' },
];

// Signals
export type Signal = { id: string; label: string; match: Partial<Record<Field, Condition>>; sort: `${'' | '-'}${ColumnId}`};

export const SIGNALS: Signal[] = [
    {
        id: 'gainers',
        label: 'Top Gainers',
        match: { change: { $gt: 0 } },
        sort: '-change'
    },
    {
        id: 'losers',
        label: 'Top Losers',
        match: { change: { $lt: 0 } },
        sort: 'change'
    },
    {
        id: 'newhigh',
        label: 'New 52W High',
        match: { fromHigh52: { $gte: -1 } },
        sort: '-fromhi'
    },
    {
        id: 'newlow',
        label: 'New 52W Low',
        match: { fromLow52: { $lte: 1 } },
        sort: 'fromlo'
    },
    {
        id: 'volatile',
        label: 'Most Volatile',
        match: { beta: { $gt: 1.5 } },
        sort: '-beta'
    },
    {
        id: 'value',
        label: 'Value (P/E < 15, ROE > 15%)',
        match: { pe: { $gt: 0, $lt: 15 }, roe: { $gt: 15 } },
        sort: 'pe'
    },
    {
        id: 'growth',
        label: 'Growth (EPS > 25%, Sales > 15%)',
        match: { epsGrowth: { $gt: 25 }, revenueGrowth: { $gt: 15 } },
        sort: '-epsg'
    },
    {
        id: 'income',
        label: 'High Dividend (> 4%)',
        match: { dividendYield: { $gt: 4 } },
        sort: '-div'
    },
];

export const SIGNALS_BY_ID = new Map(SIGNALS.map((s) => [s.id, s]));