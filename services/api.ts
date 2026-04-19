import type { Event } from '@/types';

export async function fetchEvents(): Promise<Event[]> {
  try {
    const response = await fetch('/api/events', {
      cache: 'no-store', // Let the API route handle caching
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data: Event[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}