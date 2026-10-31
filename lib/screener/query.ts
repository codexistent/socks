import {DEFAULT_VIEW, type ScreenerState} from "@/lib/screener/state";
import {COLUMNS, VIEWS, type ColumnId} from "@/lib/screener/catalog";

type Raw = Record<string, string | string[] | undefined>;
const first = (v: Raw[string]) => (typeof v === 'string' ? v : Array.isArray(v) && typeof v[0] === 'string' ? v[0] : undefined);
const DEFAULT_SORT = '-cap';

export const parseState = (raw: Raw): ScreenerState => {
    const view = first(raw.v);
    const sort = first(raw.o);
    const page = Number(first(raw.p));
    const q = first(raw.q)?.trim().slice(0, 30);

    return {
        view: view && Object.hasOwn(VIEWS, view) ? view : DEFAULT_VIEW,
        sort: sort && Object.hasOwn(COLUMNS, sort.replace(/^-/, '')) ? sort : undefined,
        page: Number.isInteger(page) && page >= 1 && page <= 100 ? page : 1,
        q: q || undefined,
    };
};

export const effectiveSort = (state: ScreenerState) => {
    const raw = state.sort ?? DEFAULT_SORT;
    const column = raw.replace(/^-/, '') as ColumnId;
    return { column, field: COLUMNS[column].field, desc: raw.startsWith('-') };
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const toMongo = (state: ScreenerState) => {
    // rows without price set (before first quote sync) are left out
    const and: Record<string, unknown>[] = [{ price: {$gt: 0}}];

    if(state.q){
        const q = escapeRegex(state.q);
        and.push({ $or: [{ symbol: { $regex: `^${q}`, $options: 'i'}}, { name: { $regex: q, $options: 'i'}}] });
    }

    return { $and: and };
};