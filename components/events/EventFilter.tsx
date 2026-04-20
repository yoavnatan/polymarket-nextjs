'use client';

import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { filtersAtom } from '@/store/atoms';

const CATEGORIES = [
    { slug: 'all', label: 'All' },
    { slug: 'crypto', label: 'Crypto' },
    { slug: 'politics', label: 'Politics' },
    { slug: 'sports', label: 'Sports' },
    { slug: 'finance', label: 'Finance' },
    { slug: 'business', label: 'Business' },
] as const;

const SESSION_KEY = 'pm_filter_category';

function EventFilter() {
    const [filters, setFilters] = useAtom(filtersAtom);

    // Restore from sessionStorage on mount (survives hard refresh, not cross-tab)
    useEffect(() => {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved && saved !== filters.category) {
            setFilters(prev => ({ ...prev, category: saved as typeof prev.category }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleCategoryChange(category: string) {
        setFilters(prev => ({ ...prev, category: category as typeof prev.category }));
        sessionStorage.setItem(SESSION_KEY, category);
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
