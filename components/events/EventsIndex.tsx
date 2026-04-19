'use client';

import React from 'react';
import { useAtomValue } from 'jotai';
import { filteredEventsAtom } from '@/store/atoms';
import { useEvents } from '@/customHooks/useEvents';
import EventFilter from './EventFilter';
import EventsList from './EventsList';
import { useWebSocket } from '@/customHooks/useWebSockets';

function EventsIndex() {
    // Load events from API
    const { loading, error } = useEvents();

    // Connect to WebSocket for real-time updates
    useWebSocket();

    // Get filtered events from Jotai
    const events = useAtomValue(filteredEventsAtom);

    if (loading) {
        return (
            <div className="events-container">
                <div className="loading-state">Loading events...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="events-container">
                <div className="error-state">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="events-container">
            <EventFilter />
            <EventsList events={events} />
        </div>
    );
}

export default EventsIndex;