'use client';

import React from 'react';
import Link from 'next/link';
import type { Event } from '@/types';
import { formatPrice, formatVolume, getBtnClass, parseJSON } from '@/utils/format';

interface EventPreviewProps {
    event: Event;
}

function EventPreview({ event }: EventPreviewProps) {
    // Filter valid markets
    const validMarkets = event.markets.filter(
        (m) => m.outcomes && m.outcomePrices
    );

    // Sort markets - active ones (price 1-99) first
    const sortedMarkets = [...validMarkets].sort((a, b) => {
        const aPrices = parseJSON<string[]>(a.outcomePrices, []);
        const bPrices = parseJSON<string[]>(b.outcomePrices, []);

        const aIsActive = aPrices.some((p) => {
            const price = parseFloat(p);
            return price > 1 && price < 99;
        });

        const bIsActive = bPrices.some((p) => {
            const price = parseFloat(p);
            return price > 1 && price < 99;
        });

        return (bIsActive ? 1 : 0) - (aIsActive ? 1 : 0);
    });

    if (sortedMarkets.length === 0) return null;

    const mainMarket = sortedMarkets[0];
    const outcomes = parseJSON<string[]>(mainMarket.outcomes, []);
    const prices = parseJSON<string[]>(mainMarket.outcomePrices, []);

    const isBinary = outcomes.includes('Yes') || outcomes.includes('Up');
    const isSingleMarket = sortedMarkets.length === 1;
    const showPie = isBinary && isSingleMarket;

    return (
        <article className="event-preview">
            {/* Header */}
            <header>
                <div className="event-info">
                    <img src={event.image} alt={event.title} />
                    <Link href={`/events/${event.slug}`} className="event-title">
                        {event.title}
                    </Link>

                    {showPie && (
                        <div className="odds">
                            {/* Pie chart placeholder - will add PieChart component later */}
                            <div className="odds-info">
                                <span className="number">{formatPrice(prices[0])}</span>
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
                        {sortedMarkets.slice(0, 5).map((market) => {
                            const marketOutcomes = parseJSON<string[]>(market.outcomes, []);
                            const marketPrices = parseJSON<string[]>(market.outcomePrices, []);
                            const displayName = market.groupItemTitle || market.question;

                            return (
                                <div key={market.id} className="option">
                                    <span className="option-name">{displayName}</span>
                                    <div className="market-btns">
                                        {marketOutcomes.slice(0, 2).map((outcome, idx) => {
                                            const btnClass = getBtnClass(outcome);
                                            return (
                                                <div key={idx} className="btn-group">
                                                    {idx === 0 && (
                                                        <span className="price-label">
                                                            {formatPrice(marketPrices[idx])}
                                                        </span>
                                                    )}
                                                    <button className={`action-btn ${btnClass}`}>
                                                        <span className="btn-text">{outcome}</span>
                                                    </button>
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
                            const isSport = btnClass === 'sport';

                            return (
                                <div key={idx} className="btn-group">
                                    {isSport && (
                                        <span className="btn-price">{formatPrice(prices[idx])}</span>
                                    )}
                                    <button className={`action-btn ${btnClass}`}>
                                        <span className="btn-text">{outcome}</span>
                                    </button>
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