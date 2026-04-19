import { atom } from 'jotai';
import type { Event, EventFilters } from '@/types';

// Main atoms
export const eventsAtom = atom<Event[]>([]);

export const filtersAtom = atom<EventFilters>({
    category: 'all',
    searchQuery: '',
    sortBy: 'volume',
});

// Derived atom - event by ID
export function eventByIdAtom(id: string) {
    return atom((get) => {
        const events = get(eventsAtom);
        return events.find(e => e.id === id) || null;
    });
}

// Derived atom - filtered events
export const filteredEventsAtom = atom((get) => {
    const events = get(eventsAtom);
    const filters = get(filtersAtom);

    let filtered = [...events];

    // Filter by category
    if (filters.category !== 'all') {
        filtered = filtered.filter(event =>
            event.tags.some(tag =>
                tag.slug.toLowerCase() === filters.category.toLowerCase()
            )
        );
    }

    // Filter by search
    if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(event =>
            event.title.toLowerCase().includes(query)
        );
    }

    // Sort
    filtered.sort((a, b) => {
        switch (filters.sortBy) {
            case 'volume':
                return b.volume - a.volume;
            case 'liquidity':
                return b.liquidity - a.liquidity;
            case 'newest':
                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            default:
                return 0;
        }
    });

    return filtered;
});