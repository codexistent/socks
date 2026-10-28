'use client';

import {useEffect, useState} from "react";
import { Command, CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command"
import {Button} from "@base-ui/react";
import Link from "next/link";
import {Loader2, TrendingUp} from "lucide-react";
import {searchStocks} from "@/lib/actions/finnhub.actions";
import {useDebounce} from "@/hooks/useDebounce";
import WatchlistButton from "@/components/WatchlistButton";

export default function SearchCommand({ renderAs = 'button', label = 'Add stock' }: SearchCommandProps) {
    const [ open, setOpen ] = useState(false)
    const [ searchTerm, setSearchTerm ] = useState('')
    const [ searching, setSearching ] = useState(false)

    const [ popular, setPopular ] = useState<StockWithWatchlistStatus[] | null>(null)
    const [ results, setResults ] = useState<StockWithWatchlistStatus[]>([])

    const isSearchMode = !!searchTerm.trim();
    const displayStocks = isSearchMode ? results : (popular ?? []).slice(0, 10);
    const loading = searching || (open && !isSearchMode && popular === null);

    //
    useEffect(() => {
        if(!open || popular) return;
    }, [open, popular]);

    useEffect(()=>{
        const onKeyDown = (e: KeyboardEvent) => {
            if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
                e.preventDefault()
                setOpen(v => !v)
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    const handleSearch = async () => {
        if(!isSearchMode) return setResults([]);

        setSearching(true)
        try {
            setResults(await searchStocks(searchTerm.trim()))
        } catch {
            setResults([]);
        } finally {
            setSearching(false)
        }
    }

    const debouncedSearch = useDebounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [searchTerm]);

    const handleSelectStock = () => {
        setOpen(false);
        setSearchTerm('');
    }

    const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
        const update = (list: StockWithWatchlistStatus[]) =>
            list.map((s) => (s.symbol === symbol ? { ...s, isInWatchlist: isAdded } : s));
        setResults(update);
        setPopular((prev) => prev && update(prev));
    };

    return(
        <>
            {renderAs === 'text' ? (
                <span onClick={() => setOpen(true)} className="search-text">
                    {label}
                </span>
            ): (
                <Button onClick={() => setOpen(true)} className="search-btn">
                    {label}
                </Button>
            )}

            <CommandDialog open={open} onOpenChange={setOpen} className="search-dialog">
                <div className="search-field">
                    <Command>
                        <CommandInput value={searchTerm} onValueChange={setSearchTerm} placeholder="Search stocks... " className="search-input"/>
                        { loading && <Loader2 className="search-loader" /> }
                    </Command>
                </div>
                <Command>
                    <CommandList className="search-list">
                        {loading? (
                            <CommandEmpty className="search-list-empty">Loading stocks...</CommandEmpty>
                        ) : displayStocks?.length === 0 ? (
                            <div className="search-list-indicator">
                                {isSearchMode ? 'No results found' : 'No stocks available'}
                            </div>
                          ) : (
                              <ul>
                                  <div className="search-count">
                                      { isSearchMode ? 'Search results' : 'Popular stocks' }
                                      {` `}({ displayStocks?.length || 0})
                                  </div>

                                  {displayStocks?.map((stock, i) => (
                                      <li key={stock.symbol} className="search-item">
                                        <Link
                                            href={`/stocks/${stock.symbol}`}
                                            onClick={handleSelectStock}
                                            className="search-item-link"
                                        >
                                            <TrendingUp className="h-4 w-4 text-gray-500"/>
                                            <div className="flex-1">
                                                <div className="search-item-name">
                                                    {stock.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {stock.symbol} | {stock.exchange} | {stock.type}
                                                </div>
                                            </div>
                                        </Link>
                                        <WatchlistButton
                                            type="icon"
                                            symbol={stock.symbol}
                                            company={stock.name}
                                            isInWatchlist={stock.isInWatchlist}
                                            onWatchlistChange={handleWatchlistChange}
                                        />
                                      </li>
                                  ))}
                              </ul>
                          )
                        }
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    )
}