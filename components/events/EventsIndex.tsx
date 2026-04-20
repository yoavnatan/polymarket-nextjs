'use client';

import { useAtomValue } from 'jotai';
import { filteredEventsAtom } from '@/store/atoms';
import { useEvents } from '@/customHooks/useEvents';
import EventFilter from './EventFilter';
import EventsList from './EventsList';
import { EventPreviewSkeletonGrid } from './EventPreviewSkeleton';

function EventsIndex() {
    const { loading, error } = useEvents();
    const events = useAtomValue(filteredEventsAtom);

    if (loading) {
        return (
            <div className="events-container">
                <EventPreviewSkeletonGrid count={12} />
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
