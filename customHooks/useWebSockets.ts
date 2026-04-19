'use client';

import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { eventsAtom } from '@/store/atoms';
import { connectWebSocket } from '@/services/websocket';

export function useWebSocket() {
    const events = useAtomValue(eventsAtom);
    const setEvents = useSetAtom(eventsAtom);

    useEffect(() => {
        // Collect all market IDs from all events
        const assetIds: string[] = [];

        events.forEach(event => {
            event.markets.forEach(market => {
                if (market.id) {
                    assetIds.push(market.id);
                }
            });
        });

        if (assetIds.length === 0) {
            return; // No markets to subscribe to yet
        }

        // Connect to WebSocket
        const ws = connectWebSocket(assetIds, (update) => {
            // Update the specific market price in events
            setEvents(prev =>
                prev.map(event => {
                    // Check if this event has the updated market
                    const hasMarket = event.markets.some(m => m.id === update.asset_id);

                    if (!hasMarket) {
                        return event; // No change - same reference
                    }

                    // Update the market with new price
                    return {
                        ...event,
                        markets: event.markets.map(market =>
                            market.id === update.asset_id
                                ? { ...market, outcomePrices: update.price }
                                : market
                        ),
                    };
                })
            );
        });

        // Cleanup on unmount
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [events, setEvents]);
}