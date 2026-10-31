import {hrefWith, PAGE_SIZE, ScreenerState} from "@/lib/screener/state";
import Link from "next/link";

const ScreenerPagination = ({ state, total }: { state: ScreenerState; total: number }) => {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(state.page, pages);
    const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);

    const shown = [...new Set([1, page - 2, page - 1, page, page + 1, page + 2, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);

    const cell = "min-w-9 h-9 inline-flex items-center justify-center rounded-md px-2 text-sm";
    return (
        <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500 tabular-nums">{from}-{to} of {total}</p>
            {pages > 1 && (
                <div className="flex items-center gap-1">
                    {page > 1 ? <Link href={hrefWith(state, { page: page - 1})} scroll={false} className={`${cell} text-gray-400 hover:text-yellow-500`}>Previous</Link> : <span className={`${cell} text-gray-600}`}>Previous</span>}
                    {shown.map((p, i) => (
                        <span key={p} className="flex items-center gap-1">
                            {i>0 && p-shown[i-1] > 1 && <span className="text-gray-600">...</span>}
                            <Link href={hrefWith(state, { page: p })} scroll={false} aria-current={p === page ? 'page' : undefined}
                                    className={`${cell} tabular-nums ${p === page ? 'bg-gray-700 text-gray-100' : 'text-gray-400 hover:text-yellow-500'}`}>{p}</Link>
                        </span>
                    ))}
                    {page < pages ? <Link href={hrefWith(state, { page: page + 1 })} scroll={false} className={`${cell} text-gray-400 hover:text-yellow-500`}>Next</Link> : <span className={`${cell} text-gray-600`}>Next</span>}
                </div>
            )}
        </nav>
    );
};

export default ScreenerPagination;