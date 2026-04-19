'use client';

import { useAtom } from 'jotai';
import { filtersAtom } from '@/store/atoms';

const CATEGORIES = [
    { slug: 'all', label: 'All' },
    { slug: 'crypto', label: 'Crypto' },
    { slug: 'politics', label: 'Politics' },
    { slug: 'sports', label: 'Sports' },
    { slug: 'finance', label: 'Finance' },
    { slug: 'business', label: 'Business' },
] as const;

function EventFilter() {
    const [filters, setFilters] = useAtom(filtersAtom);

    function handleCategoryChange(category: string) {
        setFilters((prev) => ({ ...prev, category: category as typeof prev.category }));
    }

    return (
        <div className="filter-container">
            <ul className="filter-carusel">
                {CATEGORIES.map((cat) => (
                    <li
                        key={cat.slug}
                        className={filters.category === cat.slug ? 'active' : ''}
                        onClick={() => handleCategoryChange(cat.slug)}
                    >
                        {cat.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EventFilter;