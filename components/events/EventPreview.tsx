// components/events/EventPreview.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import type { Event } from '@/types';
import { formatPrice, formatVolume, getBtnClass, parseJSON } from '@/utils/format';
import PieChart from '../ui/PieChart';

interface EventPreviewProps {
    event: Event;
}

function EventPreview({ event }: EventPreviewProps) {
    // Filter valid markets
    const validMarkets = event.markets.filter(
        (m) => m.outcomes && m.outcomePrices
    );

    // Sort markets - show most competitive/interesting markets first
    const sortedMarkets = [...validMarkets].sort((a, b) => {
        const aPrices = parseJSON<string[]>(a.outcomePrices, []);
        const bPrices = parseJSON<string[]>(b.outcomePrices, []);

        // Get max price for each market
        const aMax = Math.max(...aPrices.map((p) => parseFloat(p)));
        const bMax = Math.max(...bPrices.map((p) => parseFloat(p)));

        // Calculate "competitiveness" - how close to 50/50 the market is
        // More competitive = closer to 0.5
        const aCompetitiveness = Math.abs(0.5 - aMax);
        const bCompetitiveness = Math.abs(0.5 - bMax);

        // Prioritize markets with odds between 5% and 95% (not nearly certain)
        const aIsCompetitive = aMax >= 0.05 && aMax <= 0.95;
        const bIsCompetitive = bMax >= 0.05 && bMax <= 0.95;

        // Competitive markets first
        if (aIsCompetitive && !bIsCompetitive) return -1;
        if (!aIsCompetitive && bIsCompetitive) return 1;

        // If both competitive or both not competitive, sort by competitiveness
        // (closer to 50/50 comes first)
        return aCompetitiveness - bCompetitiveness;
    });

    if (sortedMarkets.length === 0) return null;

    const mainMarket = sortedMarkets[0];
    const outcomes = parseJSON<string[]>(mainMarket.outcomes, []);
    const prices = parseJSON<string[]>(mainMarket.outcomePrices, []);

    const isBinary = outcomes.includes('Yes') || outcomes.includes('Up');
    const isSingleMarket = sortedMarkets.length === 1;
    const showPie = isBinary && isSingleMarket;

    // Check if it's a sport market (team names, not Yes/No)
    const isSport = !isBinary && isSingleMarket && outcomes.length === 2;

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
                            <PieChart
                                yes={parseFloat(prices[0]) * 100}
                                no={parseFloat(prices[1]) * 100}
                            />
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
                {isSport ? (
                    // Sport market - show teams side by side with logos
                    <div className="sport-teams">
                        {outcomes.slice(0, 2).map((team, idx) => {
                            // Try to get team logo from market icon or use event image
                            const teamLogo = mainMarket.icon || event.image;

                            return (
                                <div key={idx} className="team-option">
                                    <div className="team-info">
                                        <img src={teamLogo} alt={team} className="team-logo" />
                                        <span className="team-name">{team}</span>
                                    </div>
                                    <div className="team-bet">
                                        <span className="team-price">{formatPrice(prices[idx])}</span>
                                        <button className={`action-btn sport sport-${idx === 0 ? 'blue' : 'orange'}`}>
                                            <span className="btn-text">{team}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : sortedMarkets.length > 1 ? (
                    // Multi-market view
                    <div className="multi-options">
                        {sortedMarkets.map((market) => {
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