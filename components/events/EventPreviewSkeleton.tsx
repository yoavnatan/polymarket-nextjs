import '@/styles/cmps/EventPreviewSkeleton.css';

function EventPreviewSkeleton() {
    return (
        <article className="event-preview skeleton-card">
            <header>
                <div className="event-info">
                    <div className="sk sk-thumb" />
                    <div className="sk-lines">
                        <div className="sk sk-line sk-line--long" />
                        <div className="sk sk-line sk-line--short" />
                    </div>
                </div>
            </header>

            <main className="options">
                <div className="sk-buttons">
                    <div className="sk sk-btn" />
                    <div className="sk sk-btn" />
                </div>
            </main>

            <footer>
                <div className="sk sk-line sk-line--xshort" />
            </footer>
        </article>
    );
}

const FILTER_WIDTHS = [32, 52, 68, 56, 56, 64];

function FilterSkeleton() {
    return (
        <div className="filter-container">
            <ul className="filter-carusel sk-filter-row">
                {FILTER_WIDTHS.map((w, i) => (
                    <li key={i}>
                        <div className="sk sk-filter-pill" style={{ width: w }} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function EventPreviewSkeletonGrid({ count = 12 }: { count?: number }) {
    return (
        <>
            <FilterSkeleton />
            <ul className="event-list">
                {Array.from({ length: count }, (_, i) => (
                    <li key={i}>
                        <EventPreviewSkeleton />
                    </li>
                ))}
            </ul>
        </>
    );
}
