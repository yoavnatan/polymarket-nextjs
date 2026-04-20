import type { Event } from '@/types';

export async function fetchEvents(): Promise<Event[]> {
  try {
    // בודק אם אנחנו בשרת או בדפדפן
    const isServer = typeof window === 'undefined';

    // אם בשרת, משתמשים בכתובת המלאה של ורסל או localhost
    // אם בדפדפן, משתמשים בנתיב יחסי כרגיל
    const baseUrl = isServer
      ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      : '';

    const response = await fetch(`${baseUrl}/api/events`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}