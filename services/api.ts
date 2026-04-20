import { getEventsData } from '@/lib/events';
import type { Event } from '@/types';

const CACHE_TTL = 60_000; // 1 minute
let cache: { data: Event[]; at: number } | null = null;

export async function fetchEvents(): Promise<Event[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL) return cache.data;

  try {
    if (typeof window === 'undefined') {
      return await getEventsData();
    }

    const response = await fetch('/api/events');
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data: Event[] = await response.json();
    cache = { data, at: Date.now() };
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}