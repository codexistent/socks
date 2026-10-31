import {parseState} from "@/lib/screener/query";
import {findScreen, getPricesAsOf} from "@/lib/screener/repository";
import {getCurrentUserWatchlistSymbols} from "@/lib/actions/watchlist.actions";
import {toScreenerMenu} from "@/lib/screener/catalog";
import ScreenerControls from "@/components/screener/ScreenerControls";
import ScreenerTable from "@/components/screener/ScreenerTable";
import ScreenerPagination from "@/components/screener/ScreenerPagination";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const ScreenerPage = async ({ searchParams }: Props) => {
    const state = parseState(await searchParams);

    const [{ rows, total }, pricesAsOf, watchlist] = await Promise.all([
        findScreen(state),
        getPricesAsOf(),
        getCurrentUserWatchlistSymbols(),
    ]);

    const asOf = pricesAsOf && new Date(pricesAsOf).toLocaleString('en-US', {
        timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });

    return (
        <section className="flex flex-col gap-6">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h1 className="watchlist-title">Stock Screener</h1>
                <p className="text-sm text-gray-500">
                    S&amp;P 500{asOf ? ` ~ prices as of ${asOf} ET, refreshed every 30 minutes in market hours`: ''}
                </p>
            </header>

            <ScreenerControls state={state} menu={toScreenerMenu()}/>

            {!pricesAsOf? (
                <div className="watchlist-empty-container">
                    <p className="empty-title">Screener data is on its way</p>
                    <p className="empty-description">Stock data is collected in the background. Check back in a few minutes</p>
                </div>
            ) : rows.length === 0 ? (
                <div className="watchlist-empty-container">
                    <p className="empty-title">No stocks match</p>
                    <p className="empty-description">Remove a filter or two to widen the screen</p>
                </div>
            ) : (
                <>
                    <ScreenerTable state={state} rows={rows} starred={new Set(watchlist)}/>
                    <ScreenerPagination state={state} total={total}/>
                </>
            )}
        </section>
    );
};

export default ScreenerPage;