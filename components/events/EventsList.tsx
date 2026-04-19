import type { Event } from '@/types';
import EventPreview from './EventPreview';

interface EventsListProps {
    events: Event[];
}

function EventsList({ events }: EventsListProps) {
    if (events.length === 0) {
        return (
            <div className="empty-state">
                <p>No events found</p>
            </div>
        );
    }

    return (
        <ul className="event-list">
            {events.map((event) => (
                <li key={event.id}>
                    <EventPreview event={event} />
                </li>
            ))}
        </ul>
    );
}

export default EventsList;