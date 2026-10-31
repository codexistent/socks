/**
 * Purpose: Refreshes data/sp500.json, a list of exactly 503 stocks for which our screener covers
 *      node scripts/update-sp500.mjs
 */

import { writeFileSync } from 'node:fs';

const SOURCE = 'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv';

const parseLine = (line) => [...line.matchAll(/("([^"]*(?:""[^"]*)*)"|[^,]*)(,|$)/g)]
    .slice(0, -1)
    .map((m) => (m[2] !== undefined ? m[2].replace(/""/g, '"') : m[1]));

const res = await fetch(SOURCE);
if(!res.ok) throw new Error(`Download failed: ${res.status}`);
const [header, ...lines] = (await res.text()).trim().split(/\r?\n/);
const col = Object.fromEntries(parseLine(header).map((name, i) => [name, i]));

const stocks = lines
    .map(parseLine)
    .map((f) => ({
        symbol: f[col['Symbol']].trim().toUpperCase(),
        name: f[col['Security']].trim(),
        sector: f[col['GICS Sector']].trim(),
        industry: f[col['GICS Sub-Industry']].trim(),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

if(stocks.length < 490) throw new Error(`Expected ~500 stocks, got ${stocks.length}`);
writeFileSync('data/sp500.json', JSON.stringify(stocks, null, 1) + '\n');
console.log(`Wrote ${stocks.length} stocks to data/sp500.json`);