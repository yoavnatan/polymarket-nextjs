// components/events/EventPreview.tsx

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAtomValue } from 'jotai';
import type { Event, Market } from '@/types';
import { formatPrice, formatVolume, getBtnClass, parseJSON } from '@/utils/format';
import { pricesAtom } from '@/store/atoms';
import { FlashPrice } from '@/components/ui/FlashPrice';
import PieChart from '../ui/PieChart';

interface EventPreviewProps {
    event: Event;
}

// Returns live prices for a market, falling back to API prices if WS hasn't arrived yet.
// Prices are in 0-1 decimal format.
function getMarketPrices(market: Market, livePrices: Record<string, string>): string[] {
    const tokenIds = parseJSON<string[]>(market.clobTokenIds, []);
    const fallback = parseJSON<string[]>(market.outcomePrices, []);
    if (tokenIds.length === 0) return fallback;
    return tokenIds.map((id, i) =>
        livePrices[id] !== undefined ? livePrices[id] : (fallback[i] ?? '0')
    );
}

function EventPreview({ event }: EventPreviewProps) {
    const livePrices = useAtomValue(pricesAtom);

    // Sort once using static API prices — never re-sort on live price ticks
    const sortedMarkets = useMemo(() => {
        const valid = event.markets.filter((m) => m.outcomes && m.outcomePrices);
        return valid.sort((a, b) => {
            const aPrices = parseJSON<string[]>(a.outcomePrices, []);
            const bPrices = parseJSON<string[]>(b.outcomePrices, []);

            const aMax = Math.max(...aPrices.map((p) => parseFloat(p)));
            const bMax = Math.max(...bPrices.map((p) => parseFloat(p)));

            const aIsCompetitive = aMax >= 0.05 && aMax <= 0.95;
            const bIsCompetitive = bMax >= 0.05 && bMax <= 0.95;

            if (aIsCompetitive && !bIsCompetitive) return -1;
            if (!aIsCompetitive && bIsCompetitive) return 1;

            return Math.abs(0.5 - aMax) - Math.abs(0.5 - bMax);
        });
    }, [event.markets]);

    if (sortedMarkets.length === 0) return null;

    const mainMarket = sortedMarkets[0];
    const outcomes = parseJSON<string[]>(mainMarket.outcomes, []);
    const prices = getMarketPrices(mainMarket, livePrices);

    const isBinary = outcomes.includes('Yes') || outcomes.includes('Up');
    const isSingleMarket = sortedMarkets.length === 1;
    const showPie = isBinary && isSingleMarket;

    return (
        <article className="event-preview">
            {/* Header */}
            <header>
                <div className="event-info">
                    <img src={event.image} alt={event.title} />
                    <Link href={`/events/${event.id}`} className="event-title">
                        {event.title}
                    </Link>

                    {showPie && (
                        <div className="odds">
                            <PieChart
                                yes={parseFloat(prices[0]) * 100}
                                no={parseFloat(prices[1]) * 100}
                            />
                            <div className="odds-info">
                                <FlashPrice value={prices[0]} className="number">
                                    {formatPrice(prices[0])}
                                </FlashPrice>
                                <span className="text">chance</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Options */}
            <main className="options">
                {sortedMarkets.length > 1 ? (
                    // Multi-market view
                    <div className="multi-options">
                        {sortedMarkets.map((market) => {
                            const marketOutcomes = parseJSON<string[]>(market.outcomes, []);
                            const marketPrices = getMarketPrices(market, livePrices);
                            const displayName = market.groupItemTitle || market.question;

                            return (
                                <div key={market.id} className="option">
                                    <Link href={`/events/${event.id}`} className="option-name">{displayName}</Link>
                                    <div className="market-btns">
                                        {marketOutcomes.slice(0, 2).map((outcome, idx) => {
                                            const btnClass = getBtnClass(outcome);
                                            return (
                                                <div key={idx} className="btn-group">
                                                    {idx === 0 && (
                                                        <FlashPrice value={marketPrices[idx]} className="price-label">
                                                            {formatPrice(marketPrices[idx])}
                                                        </FlashPrice>
                                                    )}
                                                    <Link href={`/events/${event.id}`} className={`action-btn ${btnClass}`}>
                                                        <span className="btn-text">{outcome}</span>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Binary/single market view
                    <div className="binary-options">
                        {outcomes.slice(0, 2).map((outcome, idx) => {
                            const btnClass = getBtnClass(outcome);
                            return (
                                <div key={idx} className="btn-group">
                                    <Link href={`/events/${event.id}`} className={`action-btn ${btnClass}`}>
                                        <span className="btn-text">{outcome}</span>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer>
                <div className="event-footer">
                    <div className="volume-info">
                        <span className="label">Vol.</span>
                        <span className="value"> {formatVolume(event.volume)}</span>
                    </div>
                </div>
            </footer>
        </article>
    );
}

export default React.memo(EventPreview);
