'use client';

import React from 'react';
import Link from 'next/link';
import { useAtomValue } from 'jotai';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Event, Market } from '@/types';
import { formatPrice, formatCents, formatVolume, parseJSON, getBtnClass } from '@/utils/format';
import { pricesAtom } from '@/store/atoms';
import { useWebSocket } from '@/customHooks/useWebSockets';
import { FlashPrice } from '@/components/ui/FlashPrice';
import '@/styles/cmps/EventDetails.css';

interface EventDetailsProps {
    event: Event;
}

// Returns live prices for a market, falling back to API prices.
// Prices are in 0-1 decimal format.
function getMarketPrices(market: Market, livePrices: Record<string, string>): string[] {
    const tokenIds = parseJSON<string[]>(market.clobTokenIds, []);
    const fallback = parseJSON<string[]>(market.outcomePrices, []);
    if (tokenIds.length === 0) return fallback;
    return tokenIds.map((id, i) =>
        livePrices[id] !== undefined ? livePrices[id] : (fallback[i] ?? '0')
    );
}

export default function EventDetails({ event }: EventDetailsProps) {
    // Subscribe to WebSocket for this specific event's tokens
    useWebSocket(event);

    const livePrices = useAtomValue(pricesAtom);

    const { scrollY } = useScroll();
    const contentScale = useTransform(scrollY, [0, 100], [1, 0.8]);
    const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);
    const tagsOpacity = useTransform(scrollY, [0, 100], [1, 0]);

    const eventDate = new Date(event.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="event-details-container">
            {/* Sticky Header with Motion */}
            <motion.header
                className="event-sticky-header"
                style={{ '--border-opacity': borderOpacity } as any}
            >
                <Link href="/" className="back-link">
                    ← Back
                </Link>

                <motion.div
                    className="header-content-wrapper"
                    style={{ scale: contentScale, transformOrigin: 'top left' }}
                >
                    <div className="event-header-info">
                        <img src={event.image} alt={event.title} className="event-header-image" />
                        <div className="event-header-text">
                            {event.tags && event.tags.length > 0 && (
                                <motion.div
                                    className="event-tags"
                                    style={{ opacity: tagsOpacity }}
                                >
                                    {event.tags.slice(0, 2).map((tag, idx) => (
                                        <React.Fragment key={tag.id}>
                                            <span className="event-tag">{tag.label}</span>
                                            {idx === 0 && event.tags.length > 1 && <span>•</span>}
                                        </React.Fragment>
                                    ))}
                                </motion.div>
                            )}
                            <h1 className="event-header-title">{event.title}</h1>
                        </div>
                    </div>
                </motion.div>
            </motion.header>

            <div className="event-header-meta">
                <span>Vol. {formatVolume(event.volume)}</span>
                <span>•</span>
                <img src="/svg/clock.svg" alt="" />
                <span>{eventDate}</span>
            </div>

            {/* Markets List */}
            <div className="markets-list">
                {event.markets.map((market) => {
                    const outcomes = parseJSON<string[]>(market.outcomes, []);
                    const prices = getMarketPrices(market, livePrices);
                    const displayName = market.groupItemTitle || market.question;

                    if (!outcomes.length || !prices.length) return null;

                    const leadingOutcome = outcomes[0];
                    const leadingPrice = prices[0];

                    return (
                        <div key={market.id} className="market-row">
                            <span className="market-name">{displayName}</span>

                            <div className="market-current">
                                <FlashPrice value={leadingPrice} className="current-price">
                                    {formatPrice(leadingPrice)}
                                </FlashPrice>
                            </div>

                            <div className="market-buttons">
                                {outcomes.slice(0, 2).map((outcome, idx) => {
                                    const btnClass = getBtnClass(outcome);
                                    const priceStr = prices[idx];

                                    if (!priceStr) return null;

                                    return (
                                        <button key={idx} className={`market-btn ${btnClass}`}>
                                            Buy
                                            <span className="btn-outcome">{outcome}</span>
                                            <FlashPrice value={priceStr} className="btn-price">
                                                {formatCents(priceStr)}
                                            </FlashPrice>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
