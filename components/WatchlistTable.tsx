'use client';

import {useRouter} from "next/navigation";
import {useState} from "react";
import WatchlistButton from "@/components/WatchlistButton";
import {getChangeColorClass} from "@/lib/utils";

const COLUMNS = ['Company', 'Symbol', 'Price', 'Change', 'Market Cap', 'P/E Ratio', ''];

const WatchlistTable = ({ watchlist }: WatchlistTableProps) => {
    const router = useRouter();

    const [rows, setRows] = useState(watchlist);

    const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
        if(!isAdded) setRows((prev) => prev.filter((r) => r.symbol !== symbol));
    };

    return (
        <div className="watchlist-table overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="table-header-row">
                        {COLUMNS.map((label) => (
                            <th key={label || 'actions'} className="table-header px-4 py-3">{label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((item) => (
                        <tr
                            key={item.symbol}
                            className="table-row"
                            onClick={() => router.push(`/stocks/${encodeURIComponent(item.symbol)}`)}
                        >
                            <td className="table-cell px-4 py-3">{item.company}</td>
                            <td className="table-cell px-4 py-3">{item.symbol}</td>
                            <td className="table-cell px-4 py-4">{item.priceFormatted ?? 'N/A'}</td>
                            <td className={`table-cell px-4 py-3 ${getChangeColorClass(item.changePercent)}`}>
                                {item.changeFormatted ?? 'N/A'}
                            </td>
                            <td className="table-cell px-4 py-3">{item.marketCap ?? 'N/A'}</td>
                            <td className="table-cell px-4 py-3">{item.peRatio ?? 'N/A'}</td>
                            <td className="table-cell px-4 py-3">
                                <WatchlistButton
                                    type="icon"
                                    symbol={item.symbol}
                                    company={item.company}
                                    isInWatchlist={true}
                                    onWatchlistChange={handleWatchlistChange}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WatchlistTable;