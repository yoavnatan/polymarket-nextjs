
export interface Event {
    id: string;
    title: string;
    slug: string;
    description: string;
    image: string;
    icon: string;
    markets: Market[];
    volume: number;
    liquidity: number;
    startDate: string;
    endDate: string;
    tags: Tag[];
    active: boolean;
    closed: boolean;
    enableOrderBook: boolean;
    createdAt: string;
}

export interface Market {
    id: string;
    question: string;
    conditionId: string;
    slug: string;
    outcomes: string; // JSON string: '["Yes", "No"]'
    outcomePrices: string; // JSON string: '["0.67", "0.33"]'
    volume: string;
    active: boolean;
    closed: boolean;
    groupItemTitle?: string; // e.g., "December 31, 2025"
    endDate?: string;
    startDate?: string;
    icon?: string;
}

export interface Tag {
    id: string;
    label: string;
    slug: string;
}

export interface EventFilters {
    category: 'all' | 'crypto' | 'sports' | 'politics' | 'finance' | 'business';
    searchQuery: string;
    sortBy: 'volume' | 'liquidity' | 'newest';
}