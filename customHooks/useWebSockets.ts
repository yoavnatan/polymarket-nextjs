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

// Single WebSocket hook - accepts an optional specific event (for detail pages).
// Updates pricesAtom only, never eventsAtom, so the event list never re-renders on price ticks.
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

        const flush = () => {
            const updates = pendingRef.current;
            if (Object.keys(updates).length > 0) {
                setPrices(prev => ({ ...prev, ...updates }));
                pendingRef.current = {};
            }
            rafRef.current = null;
        };

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
                if (data.event_type === 'price_change' && data.price_changes) {
                    for (const ch of data.price_changes) {
                        if (ch.asset_id && ch.price) {
                            pendingRef.current[ch.asset_id] = ch.price;
                        }
                    }
                    if (rafRef.current === null) {
                        rafRef.current = requestAnimationFrame(flush);
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
