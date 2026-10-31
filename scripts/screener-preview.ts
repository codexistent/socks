/**
 * Purpose: Checker for app data vs live data
 *      node scripts/screener-preview.ts
 */

import {finnhub} from "@/lib/screener/finnhub";
import {fromMetrics, fromProfile, fromQuote} from "@/lib/screener/sync";

const symbol = (process.argv[2] ?? 'AAPL').toUpperCase();

const [profile, metrics, quote] = await Promise.all([finnhub.profile(symbol), finnhub.metrics(symbol), finnhub.quote(symbol)]);
const fields = { ...fromProfile(profile), ...fromMetrics(metrics), ...fromQuote(quote) };

console.table(fields);
const empty = Object.entries(fields).filter(([, v]) => v === undefined).map(([k]) => k);
console.log(empty.length ? `Empty for ${symbol}: ${empty.join(', ')}` : `All fields present for ${symbol}`);