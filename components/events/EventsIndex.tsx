'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { filteredEventsAtom, filtersAtom } from '@/store/atoms';
import { useEvents } from '@/customHooks/useEvents';
import EventFilter from './EventFilter';
import EventsList from './EventsList';
import { EventPreviewSkeletonGrid } from './EventPreviewSkeleton';

const PAGE_SIZE = 12;

function EventsIndex() {
    const { loading, error } = useEvents();
    const events = useAtomValue(filteredEventsAtom);
    const filters = useAtomValue(filtersAtom);

    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [infiniteMode, setInfiniteMode] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Reset pagination whenever filters change
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
        setInfiniteMode(false);
    }, [filters.category, filters.searchQuery, filters.sortBy]);

    // Infinite scroll — activates only after the first "Show more" click
    useEffect(() => {
        if (!infiniteMode) return;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, events.length));
                }
            },
            { rootMargin: '300px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [infiniteMode, events.length]);

    const visibleEvents = useMemo(() => events.slice(0, visibleCount), [events, visibleCount]);
    const hasMore = visibleCount < events.length;

    function handleShowMore() {
        setVisibleCount(prev => prev + PAGE_SIZE);
        setInfiniteMode(true);
    }

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
            <EventsList events={visibleEvents} />

            {hasMore && !infiniteMode && (
                <button className="show-more-btn" onClick={handleShowMore}>
                    Show more
                </button>
            )}

            {/* Dots act as both the loading indicator and the IntersectionObserver sentinel */}
            {infiniteMode && hasMore && (
                <div ref={sentinelRef} className="loading-dots">
                    <span /><span /><span />
                </div>
            )}
        </div>
    );
}

export default EventsIndex;
