import Link from "next/link";
import {hrefWith, ScreenerState} from "@/lib/screener/state";
import {ScreenerMenu} from "@/lib/screener/catalog";
import {useEffect, useState, useTransition} from "react";
import {useRouter} from "next/navigation";

const ScreenerControls = ({ state, menu }: { state: ScreenerState; menu: ScreenerMenu }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [q, setQ] = useState(state.q ?? '');

    const go = (patch: Partial<ScreenerState>) =>
        startTransition(() => router.replace(hrefWith(state, patch), { scroll: false }));

    useEffect(() => {
        if(q === (state.q ?? '')) return;
        const t = setTimeout(() => go({ q: q.trim() || undefined }), 300);
        return () => clearTimeout(t);
    }, [q]);

    const inputClass = "h-9 w-full min-w-0 rounded-md border border-gray-600 bg-gray-800 px-2 text-sm text-gray-100 focus:border-yellow-500 focus:outline-none";

    return (
        <div className="flex flex-col gap-4" aria-busy={isPending}>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                <label className="flex flex-col gap-1.5 text-sm text-gray-500">
                    Ticker or company
                    <input id="screener-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. NVDA or bank" className={inputClass} />
                </label>
                <Link href="/screener" className="h-9 inline-flex items-center rounded-md border border-gray-600 px-3 text-sm text-gray-300 hover:border-yellow-500 hover:text-yellow-500">
                    Reset all
                </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <nav aria-label="Column views" className="flex flex-wrap gap-1">
                    {menu.views.map((v) => (
                        <Link key={v.id} href={hrefWith(state, { view: v.id })} scroll={false} aria-current={state.view === v.id ? 'page' : undefined} className={`rounded-md px-3 py-1.5 text-sm ${state.view === v.id ? 'bg-gray-700 text-gray-100' : 'text-gray-500 hover:text-gray-300'}`}>
                            {v.label}
                        </Link>
                    ))}
                </nav>
                {isPending && <span className="text-sm text-gray-500">Updating...</span>}
            </div>
        </div>
    );
};

export default ScreenerControls;