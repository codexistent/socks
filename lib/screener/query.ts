import {DEFAULT_VIEW, type ScreenerState} from "@/lib/screener/state";
import {COLUMNS, VIEWS, type ColumnId} from "@/lib/screener/catalog";
import {FILTERS_BY_ID, SIGNALS_BY_ID} from "@/lib/screener/filters";

type Raw = Record<string, string | string[] | undefined>;
const first = (v: Raw[string]) => (typeof v === 'string' ? v : Array.isArray(v) && typeof v[0] === 'string' ? v[0] : undefined);
const DEFAULT_SORT = '-cap';

export const parseState = (raw: Raw): ScreenerState => {
    const filters: Record<string, string> = {};
    for(const token of (first(raw.f) ?? '').split(',')){
        const i = token.indexOf('_');
        const filter = FILTERS_BY_ID.get(token.slice(0, i));
        const value = token.slice(i + 1);
        if(filter && filter.options.some((o) => o.value === value)) filters[filter.id] = value;
    }
    const signal = first(raw.s);
    const view = first(raw.v);
    const sort = first(raw.o);
    const page = Number(first(raw.p));
    const q = first(raw.q)?.trim().slice(0, 30);

    return {
        filters,
        signal: signal && SIGNALS_BY_ID.has(signal) ? signal : undefined,
        view: view && Object.hasOwn(VIEWS, view) ? view : DEFAULT_VIEW,
        sort: sort && Object.hasOwn(COLUMNS, sort.replace(/^-/, '')) ? sort : undefined,
        page: Number.isInteger(page) && page >= 1 && page <= 100 ? page : 1,
        q: q || undefined,
    };
};

export const effectiveSort = (state: ScreenerState) => {
    const raw = state.sort ?? (state.signal && SIGNALS_BY_ID.get(state.signal)?.sort) ?? DEFAULT_SORT;
    const column = raw.replace(/^-/, '') as ColumnId;
    return { column, field: COLUMNS[column].field, desc: raw.startsWith('-') };
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const toMongo = (state: ScreenerState) => {
    // rows without price set (before first quote sync) are left out
    const and: Record<string, unknown>[] = [{ price: {$gt: 0}}];

    for(const [id, value] of Object.entries(state.filters)) {
        const filter = FILTERS_BY_ID.get(id)!;
        and.push({ [filter.field]: filter.options.find((o) => o.value === value)!.match });
    }

    const signal = state.signal && SIGNALS_BY_ID.get(state.signal);
    if(signal) for(const [field, match] of Object.entries(signal.match)) and.push({ [field]: match });

    if(state.q){
        const q = escapeRegex(state.q);
        and.push({ $or: [{ symbol: { $regex: `^${q}`, $options: 'i'}}, { name: { $regex: q, $options: 'i'}}] });
    }

    return { $and: and };
};