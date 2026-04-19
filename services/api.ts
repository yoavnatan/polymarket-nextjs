import type { Event } from '@/types';

const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

export async function fetchEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${GAMMA_API_URL}/events?closed=false`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
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