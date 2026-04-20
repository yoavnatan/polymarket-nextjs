import { atom } from 'jotai';
import type { Event, EventFilters } from '@/types';

export const eventsAtom = atom<Event[]>([]);

// Live prices: tokenId -> price (decimal 0-1, e.g. "0.67")
export const pricesAtom = atom<Record<string, string>>({});

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

// Derived atom - filtered + sorted events
export const filteredEventsAtom = atom((get) => {
    const events = get(eventsAtom);
    const filters = get(filtersAtom);

    let result = [...events];

    if (filters.category !== 'all') {
        result = result.filter(event =>
            event.tags.some(tag => tag.slug.toLowerCase() === filters.category.toLowerCase())
        );
    }

    if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(e => e.title.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
        switch (filters.sortBy) {
            case 'volume':    return b.volume - a.volume;
            case 'liquidity': return b.liquidity - a.liquidity;
            case 'newest':    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            default:          return 0;
        }
    });

    return result;
});
