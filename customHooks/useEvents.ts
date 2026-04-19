'use client';

import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { eventsAtom } from '@/store/atoms';
import { fetchEvents } from '@/services/api';

export function useEvents() {
    const setEvents = useSetAtom(eventsAtom);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadEvents() {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchEvents();
                setEvents(data);
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