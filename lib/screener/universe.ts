import sp500 from '@/data/sp500.json'

export type UniverseStock = { symbol: string; name: string; sector: string; industry: string };

export const UNIVERSE: readonly UniverseStock[] = sp500;
export const UNIVERSE_SYMBOLS = UNIVERSE.map((s) => s.symbol);

const unique = (values: string[]) => [...new Set(values)].sort();
export const SECTORS = unique(UNIVERSE.map((s) => s.sector));
export const INDUSTRIES = unique(UNIVERSE.map((s) => s.industry));