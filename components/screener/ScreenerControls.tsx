'use client';

import Link from "next/link";
import {hrefWith, type ScreenerState, toSearch} from "@/lib/screener/state";
import {type ScreenerMenu} from "@/lib/screener/catalog";
import {useEffect, useRef, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {Download, X} from "lucide-react";

const ScreenerControls = ({ state, menu }: { state: ScreenerState; menu: ScreenerMenu }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [group, setGroup] = useState(menu.groups[0].id);
    const [q, setQ] = useState(state.q ?? '');

    const go = (patch: Partial<ScreenerState>) =>
        startTransition(() => router.replace(hrefWith(state, patch), { scroll: false }));

    const setFilter = (id: string, value: string) => {
        const filters = { ...state.filters };
        if(value) filters[id] = value;
        else delete filters[id];
        go({ filters });
    };

    const sent = useRef(state.q ?? '');

    useEffect(() => {
        if(q === (state.q ?? '')) return;
        const t = setTimeout(() => {
            sent.current = q.trim();
            go({q: q.trim() || undefined});
        }, 300);
        return () => clearTimeout(t);
    }, [q]);

    useEffect(() => {
        if((state.q ?? '') === sent.current) return;
        sent.current = state.q ?? '';
        setQ(state.q ?? '');
    }, [state.q]);

    const labelOf = (id: string, value: string) => {
        const filter = menu.groups.flatMap((g) => g.filters).find((f) => f.id === id);
        return `${filter?.label}: ${filter?.options.find((o) => o.value === value)?.label}`;
    };
    const active = Object.entries(state.filters);
    const selectClass = "h-9 w-full min-w-0 rounded-md border border-gray-600 bg-gray-800 px-2 text-sm text-gray-100 focus:border-yellow-500 focus:outline-none";

    const inputClass = "h-9 w-full min-w-0 rounded-md border border-gray-600 bg-gray-800 px-2 text-sm text-gray-100 focus:border-yellow-500 focus:outline-none";

    return (
        <div className="flex flex-col gap-4" aria-busy={isPending}>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <label className="flex flex-col gap-1.5 text-sm text-gray-500">
                    Signal
                    <select id="screener-signal" className={selectClass} value={state.signal ?? ''} onChange={(e) => go({ signal: e.target.value || undefined, sort: undefined})}>
                        <option value="">None (all stocks)</option>
                        {menu.signals.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-gray-500">
                    Ticker or company
                    <input id="screener-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. NVDA or bank" className={inputClass} />
                </label>
                <Link href="/screener" className="h-9 inline-flex items-center rounded-md border border-gray-600 px-3 text-sm text-gray-300 hover:border-yellow-500 hover:text-yellow-500">
                    Reset all
                </Link>
            </div>

            <div className="rounded-lg border border-gray-600 bg-gray-800/40">
                <div role="tablist" aria-label="Filter groups" className="flex border-b border-gray-600 overflow-x-auto">
                    {menu.groups.map((g) => {
                       const count = g.filters.filter((f) => state.filters[f.id]).length;
                       return (
                           <button key={g.id} role="tab" type="button" aria-selected={group === g.id} onClick={() => setGroup(g.id)}
                                    className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px cursor-pointer ${group === g.id ? 'border-yellow-500 text-gray-100' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                           >
                               {g.label}{count > 0 && <span className="ml-1.5 text-yellow-500">{count}</span>}
                           </button>
                       );
                    })}
                </div>
                {menu.groups.filter((g) => g.id === group).map((g) => (
                    <div key={g.id} role="tabpanel" className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 p-4">
                        {g.filters.map((f) => (
                            <label key={f.id} className="flex flex-col gap-1.5 text-xs text-gray-500 min-w-0">
                                {f.label}
                                <select id={`screener-f-${f.id}`} value={state.filters[f.id] ?? ''} onChange={(e) => setFilter(f.id, e.target.value)}
                                        className={`${selectClass} ${state.filters[f.id] ? '!border-yellow-500/70' : ''}`}>
                                    <option value="">Any</option>
                                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </label>
                        ))}
                    </div>
                ))}
            </div>

            {active.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Active filters">
                    {active.map(([id, value]) => (
                        <li key={id}>
                            <button type="button" onClick={() => setFilter(id, '')}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-500 hover:bg-yellow-500/20 cursor-pointer">
                                {labelOf(id, value)} <X className="h-3 w-3" aria-label="Remove filter"/>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <nav aria-label="Column views" className="flex flex-wrap gap-1">
                    {menu.views.map((v) => (
                        <Link key={v.id} href={hrefWith(state, { view: v.id })} scroll={false}
                              aria-current={state.view === v.id ? 'page' : undefined}
                                className={`rounded-md px-3 py-1.5 text-sm ${state.view === v.id ? 'bg-gray-700 text-gray-100' : 'text-gray-500 hover:text-gray-300'}`}>
                            {v.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-3 text-sm">
                    {isPending && <span className="text-gray-500">Updating...</span>}
                    <a href={`/api/screener/export?${toSearch(state)}`} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-yellow-500">
                        <Download className="h-4 w-4"/> Export CSV
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ScreenerControls;