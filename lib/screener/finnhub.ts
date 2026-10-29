const BASE_URL = 'https://finnhub.io/api/v1';

export type FinnhubQuote = { c?: number, dp?: number };
export type FinnhubProfile = {
    name?: string; exchange?: string; country?: string; logo?: string;
    marketCapitalization?: number;
};
export type FinnhubMetrics = { metric?: Record<string, number | string | null | undefined> };

export class FinnhubError extends Error {
    constructor(readonly status: number, path: string) {
        super(`Finnhub ${status} for ${path}`);
    }
}

const get = async <T>(path: string, params: Record<string, string>): Promise<T> => {
    const token = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if(!token) throw new Error('FINNHUB_API_KEY is not set');

    const url = `${BASE_URL}${path}?${new URLSearchParams({ ...params, token })}}`;

    const res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) throw new FinnhubError(res.status, path);
    return (await res.json()) as T;
};

export const finnhub = {
    quote: (symbol: string) => get<FinnhubQuote>('/quote', { symbol }),
    profile: (symbol: string) => get<FinnhubProfile>('/stock/profile2', { symbol }),
    metrics: (symbol: string) => get<FinnhubMetrics>('/stock/metric', { symbol, metric: 'all' }),
};