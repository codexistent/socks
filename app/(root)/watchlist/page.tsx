import React from 'react'
import {Star} from "lucide-react";
import SearchCommand from "@/components/SearchCommand";
import {getWatchlistWithData} from "@/lib/actions/watchlist.actions";
import {searchStocks} from "@/lib/actions/finnhub.actions";
import WatchlistTable from "@/components/WatchlistTable";

const WatchlistPage = async () => {
    const [watchlist, initialStocks] = await Promise.all([
        getWatchlistWithData(),
        searchStocks(),
    ]);

    if(watchlist.length === 0){
        return (
            <section className="watchlist-empty-container">
                <div className="watchlist-empty">
                    <Star className="watchlist-star"/>
                    <h2 className="empty-title">Your watchlist is empty</h2>
                    <p className="empty-description">
                        Search for stocks and star them to follow their prices here.
                    </p>
                </div>
                <SearchCommand initialStocks={initialStocks}/>
            </section>
        );
    }

    return (
        <section className="watchlist">
            <div className="flex items-center justify-between">
                <h2 className="watchlist-title">Watchlist</h2>
                <SearchCommand initialStocks={initialStocks} />
            </div>
            <WatchlistTable watchlist={watchlist}/>
        </section>
    )
}
export default WatchlistPage
