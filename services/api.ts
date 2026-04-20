import { getEventsData } from '@/lib/events';
import type { Event } from '@/types';

export async function fetchEvents(): Promise<Event[]> {
  try {
    // אם אנחנו בשרת, נקרא ישירות ללוגיקה בלי fetch
    if (typeof window === 'undefined') {
      return await getEventsData();
    }

    // אם אנחנו בדפדפן, נשתמש ב-fetch הרגיל
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}