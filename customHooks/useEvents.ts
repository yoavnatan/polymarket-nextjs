'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { eventsAtom } from '@/store/atoms';
import { fetchEvents } from '@/services/api';

export function useEvents() {
    const [events, setEvents] = useAtom(eventsAtom);
    const [loading, setLoading] = useState(events.length === 0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadEvents() {
            try {
                setError(null);

                const data = await fetchEvents();
                setEvents(data);

                // Preload all event images in the background so filter switches are instant
                for (const event of data) {
                    if (event.image) {
                        const img = new window.Image();
                        img.src = event.image;
                    }
                }
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch events');
            } finally {
                setLoading(false);
            }
        }

        loadEvents();
    }, [setEvents]);

    return { loading, error };
}