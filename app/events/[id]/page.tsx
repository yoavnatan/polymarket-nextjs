import { notFound } from 'next/navigation';
import EventDetails from '@/components/events/EventDetails';

interface PageProps {
    params: {
        id: string;
    };
}

async function getEvent(id: string) {
    try {
        const response = await fetch(
            `https://gamma-api.polymarket.com/events?closed=false&active=true&order=volume24hr&ascending=false&limit=50`,
            { next: { revalidate: 60 } }
        );

        if (!response.ok) return null;

        const events = await response.json();
        return events.find((e: any) => e.id === id) ?? null;
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