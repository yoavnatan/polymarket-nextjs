'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Event } from '@/types';
import { formatPrice, formatVolume, parseJSON, getBtnClass } from '@/utils/format';
import '@/styles/cmps/EventDetails.css';
import { useWebSocket } from '@/customHooks/useWebSockets';

interface EventDetailsProps {
    event: Event;
}

export default function EventDetails({ event }: EventDetailsProps) {
    useWebSocket();

    const { scrollY } = useScroll();
    const contentScale = useTransform(scrollY, [0, 100], [1, 0.8]);
    const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);
    const tagsOpacity = useTransform(scrollY, [0, 100], [1, 0]);

    // Format event date
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
                {/* Back button - outside scale wrapper */}
                <Link href="/" className="back-link">
                    ← Back
                </Link>

                {/* Scalable content with white background */}
                <motion.div
                    className="header-content-wrapper"
                    style={{ scale: contentScale, transformOrigin: 'top left' }}
                >
                    <div className="event-header-info">
                        <img src={event.image} alt={event.title} className="event-header-image" />
                        <div className="event-header-text">
                            {/* Event tags - fade out on scroll */}
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

                {/* Meta info - OUTSIDE scale wrapper */}

            </motion.header>

            <div className="event-header-meta">
                <span>Vol. {formatVolume(event.volume)}</span>
                <span>•</span>
                <span>{eventDate}</span>
            </div>

            {/* Markets List */}
            <div className="markets-list">
                {event.markets.map((market) => {
                    const outcomes = parseJSON<string[]>(market.outcomes, []);
                    const prices = parseJSON<string[]>(market.outcomePrices, []);
                    const displayName = market.groupItemTitle || market.question;

                    if (!outcomes.length || !prices.length) return null;

                    // Get leading outcome (first outcome)
                    const leadingOutcome = outcomes[0];
                    const leadingPrice = prices[0];

                    return (
                        <div key={market.id} className="market-row">
                            <span className="market-name">{displayName}</span>

                            {/* Current outcome display */}
                            <div className="market-current">
                                <span className="current-price">{formatPrice(leadingPrice)}</span>
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
                                            <span className="btn-price">{formatPrice(priceStr)}</span>
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