import { notFound } from 'next/navigation';
import EventDetails from '@/components/events/EventDetails';

interface PageProps {
    params: {
        id: string;
    };
}

async function getEvent(id: string) {
    try {
        // Use absolute URL for server-side fetch
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const response = await fetch(
            `${baseUrl}/api/events`,
            {
                next: { revalidate: 60 }, // Respect the cache
            }
        );

        if (!response.ok) {
            return null;
        }

        const events = await response.json();

        // Find event by ID
        const event = events.find((e: any) => e.id === id);

        return event || null;
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
}

export default async function EventPage({ params }: PageProps) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    return <EventDetails event={event} />;
}