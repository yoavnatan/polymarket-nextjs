'use client';

import { useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { eventsAtom, pricesAtom } from '@/store/atoms';
import type { Event } from '@/types';

function parseTokenIds(clobTokenIds: string): string[] {
    try {
        return JSON.parse(clobTokenIds) as string[];
    } catch {
        return [];
    }
}

function collectTokenIds(events: Event[], limit = 400): string[] {
    const ids: string[] = [];
    for (const event of events) {
        if (ids.length >= limit) break;
        for (const market of event.markets) {
            if (ids.length >= limit) break;
            for (const tid of parseTokenIds(market.clobTokenIds)) {
                if (tid && ids.length < limit) ids.push(tid);
            }
        }
    }
    return ids;
}

// For binary markets (yes/no), maps each token ID to its complement token ID.
// When we get a price for one, the other is always 1 - price.
function buildComplementMap(events: Event[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const event of events) {
        for (const market of event.markets) {
            const ids = parseTokenIds(market.clobTokenIds);
            if (ids.length === 2) {
                map[ids[0]] = ids[1];
                map[ids[1]] = ids[0];
            }
        }
    }
    return map;
}

function clamp01(n: number): number {
    return Math.max(0, Math.min(1, n));
}

// Single WebSocket hook - accepts an optional specific event (for detail pages).
// Updates pricesAtom only, never eventsAtom, so the event list never re-renders on price ticks.
// Uses best_bid_ask mid-price ((bid+ask)/2) which is stable and matches the REST API outcomePrices.
// Price updates are batched via requestAnimationFrame to cap render frequency.
export function useWebSocket(event?: Event) {
    const allEvents = useAtomValue(eventsAtom);
    const setPrices = useSetAtom(pricesAtom);
    const wsRef = useRef<WebSocket | null>(null);
    const hasInitialized = useRef(false);
    const pendingRef = useRef<Record<string, string>>({});
    const rafRef = useRef<number | null>(null);

    const eventId = event?.id ?? '';
    const eventsLength = allEvents.length;

    useEffect(() => {
        if (hasInitialized.current) return;

        const events = event ? [event] : allEvents;
        if (events.length === 0) return;

        hasInitialized.current = true;

        const assetIds = collectTokenIds(events);
        if (assetIds.length === 0) return;

        const complementMap = buildComplementMap(events);

        const flush = () => {
            const updates = pendingRef.current;
            if (Object.keys(updates).length > 0) {
                setPrices(prev => ({ ...prev, ...updates }));
                pendingRef.current = {};
            }
            rafRef.current = null;
        };

        function queuePrice(assetId: string, price: number) {
            const clamped = clamp01(price);
            pendingRef.current[assetId] = String(clamped);
            // Keep complement in sync so yes+no always sum to 1
            const complement = complementMap[assetId];
            if (complement) {
                pendingRef.current[complement] = String(clamp01(1 - clamped));
            }
            if (rafRef.current === null) {
                rafRef.current = requestAnimationFrame(flush);
            }
        }

        const ws = new WebSocket('wss://ws-subscriptions-clob.polymarket.com/ws/market');
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({
                assets_ids: assetIds,
                type: 'market',
                custom_feature_enabled: true,
            }));
        };

        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);

                // best_bid_ask: mid-price is stable and matches REST API outcomePrices.
                // Prefer this over price_change (last trade) which can be noisy.
                if (data.event_type === 'best_bid_ask') {
                    const bid = parseFloat(data.best_bid);
                    const ask = parseFloat(data.best_ask);
                    if (!isNaN(bid) && !isNaN(ask) && data.asset_id) {
                        queuePrice(data.asset_id, (bid + ask) / 2);
                    }
                    return;
                }

                // Fallback: price_change for assets that haven't sent a best_bid_ask yet
                if (data.event_type === 'price_change' && data.price_changes) {
                    for (const ch of data.price_changes) {
                        const p = parseFloat(ch.price);
                        if (ch.asset_id && !isNaN(p)) {
                            // Only use as fallback if we haven't received a bid/ask for this asset
                            if (pendingRef.current[ch.asset_id] === undefined) {
                                queuePrice(ch.asset_id, p);
                            }
                        }
                    }
                }
            } catch { }
        };

        ws.onerror = () => { };
        ws.onclose = () => { };

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            ws.close();
            wsRef.current = null;
        };
        // Re-run if navigating between pages (eventId changes) or events first load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, eventsLength]);
}
