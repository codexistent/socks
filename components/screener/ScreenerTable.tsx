import {ColumnId, COLUMNS, formatValue, ViewId, VIEWS} from "@/lib/screener/catalog";
import WatchlistButton from "@/components/WatchlistButton";
import {hrefWith, ScreenerState} from "@/lib/screener/state";
import {ScreenerRow} from "@/lib/screener/repository";
import {effectiveSort} from "@/lib/screener/query";
import Link from "next/link";

const ScreenerTable = ({ state, rows, starred }: { state: ScreenerState; rows: ScreenerRow[]; starred: Set<string> }) => {
    const columns = VIEWS[state.view as ViewId].columns as readonly ColumnId[];
    const sort = effectiveSort(state);

    const sortHref = (id: ColumnId) => {
        const text = COLUMNS[id].format === 'text' || COLUMNS[id].format === 'ticker';
        const desc = sort.column === id ? !sort.desc : !text;
        return hrefWith(state, { sort: `${desc ? '-' : ''}${id}` });
    };

    const tone = (format: string, value: unknown) =>
        format === 'signed' && typeof value === 'number' ? (value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : '') : '';

    return (
        <div className="watchlist-table overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="table-header-row">
                        {columns.map((id, i) => {
                            const col = COLUMNS[id];
                            const active = sort.column === id;
                            const numeric = col.format !== 'text' && col.format !== 'ticker';
                            return (
                                <th key={id} scope="col"
                                    aria-sort={active ? (sort.desc ? 'descending' : 'ascending') : undefined}
                                    className={`px-3 py-2.5 font-medium whitespace-nowrap ${numeric ? 'text-right' : 'text-left'} ${i === 0 ? 'sticky left-0 bg-gray-700 z-10' : ''}`}>
                                    <Link href={sortHref(id)} scroll={false} className={`hover:text-gray-100 ${active ? 'text-yellow-500' : ''}`}>
                                        {col.label}{active ? (sort.desc ? ' ▼' : ' ▲') : ''}
                                    </Link>
                                </th>
                            );
                        })}
                        <th scope="col" className="px-3 py-2.5"><span className="sr-only">Watchlist</span></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.symbol} className="table-row cursor-default">
                            {columns.map((id, i) => {
                                const col = COLUMNS[id];
                                const value = row[col.field];
                                const numeric = col.format !== 'text' && col.format !== 'ticker';
                                return (
                                    <td key={id} className={`px-3 py-2 whitespace-nowrap ${numeric ? 'text-right tabular-nums' : ''} ${tone(col.format, value)} ${i === 0 ? 'sticky left-0 bg-gray-800 z-10' : ''} 
                                        ${id === 'company' || id === 'industry' ? 'max-w-[16rem] truncate' : ''}`} title={id === 'company' || id === 'industry' ? String(value ?? '') : undefined}>
                                        {col.format === 'ticker'
                                            ? <Link href={`/stocks/${encodeURIComponent(row.symbol)}`} className="font-semibold text-yellow-500 hover:underline">{row.symbol}</Link>
                                            : formatValue(col.format, value)
                                        }
                                    </td>
                                );
                            })}
                            <td className="px-3 py-2">
                                <WatchlistButton type="icon" symbol={row.symbol} company={row.name} isInWatchlist={starred.has(row.symbol)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScreenerTable;
