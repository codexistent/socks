import {ColumnId, COLUMNS, ViewId, VIEWS} from "@/lib/screener/catalog";
import {PAGE_SIZE, ScreenerState} from "@/lib/screener/state";
import {effectiveSort, toMongo} from "@/lib/screener/query";
import {connectToDatabase} from "@/database/mongoose";
import {StockSnapshotModel} from "@/database/models/stock-snapshot.model";

export type ScreenerRow = Record<string, string | number | undefined> & { symbol: string; name: string };

const fieldsOf = (columns: readonly ColumnId[]) => [...new Set(['symbol', 'name', ...columns.map((c) => COLUMNS[c].field)])];

const runScreen = async (state: ScreenerState, columns: readonly ColumnId[], skip: number, limit: number) => {
    await connectToDatabase();

    const { field, desc } = effectiveSort(state);

    const [result] = await StockSnapshotModel.aggregate<{ rows: ScreenerRow[]; total: {n: number}[] }>([
        { $match: toMongo(state) },
        { $addFields: { _missing: { $cond: [{ $eq: [{ $type: `$${field}` }, 'missing'] }, 1, 0] } } },
        { $sort: { _missing: 1, [field]: desc ? -1 : 1, symbol: 1 } },
        {
            $facet: {
                rows: [{ $skip: skip }, { $limit: limit }, { $project: Object.fromEntries([['_id', 0], ...fieldsOf(columns).map((f) => [f, 1])]) }],
                total: [{ $count: 'n' }],
            },
        },
    ]);

    return { rows: result?.rows ?? [], total: result?.total[0]?.n ?? 0 };
};

export const findScreen = (state: ScreenerState) =>
    runScreen(state, VIEWS[state.view as ViewId].columns, (state.page - 1) * PAGE_SIZE, PAGE_SIZE);

export const findScreenForExport = (state: ScreenerState) =>
    runScreen(state, Object.keys(COLUMNS) as ColumnId[], 0, 1000);

export const getPricesAsOf = async () => {
    await connectToDatabase();

    const latest = await StockSnapshotModel.findOne({}, { quoteAt: 1 }).sort({ quoteAt: -1 }).lean();
    return latest?.quoteAt ?? null;
};