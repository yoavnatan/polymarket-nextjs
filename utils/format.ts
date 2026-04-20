// utils/format.ts

import type { Market } from '@/types';

/**
 * Format currency ($2.5M, $150K, $50)
 */
export function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) {
        return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
        return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
}

/**
 * Format date (Jan 15, 2026)
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Time ago (2 hours ago, 3 days ago)
 */
export function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (const [key, value] of Object.entries(intervals)) {
        const count = Math.floor(seconds / value);
        if (count >= 1) {
            return `${count} ${key}${count > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}

/**
 * Convert price to probability (0.67 → 67)
 */
export function toProbability(price: string | number): number {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return Math.round(num * 100);
}

/**
 * Safe JSON parse
 */
export function parseJSON<T>(jsonString: string, fallback: T): T {
    try {
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
}

/**
 * Format price to percentage string (for display)
 * Price comes as 0-1 (e.g., 0.16 = 16%)
 */
export function formatPrice(price: number | string | undefined | null): string {
    if (price === undefined || price === null) return '0%';

    const numPrice = parseFloat(price.toString());

    if (isNaN(numPrice)) return '0%';

    // Convert from 0-1 to percentage
    const percentage = numPrice * 100;

    if (percentage < 1) return '<1%';
    if (percentage > 99) return '100%';

    return `${Math.round(percentage)}%`;
}

/**
 * Check if market is a sport market (outcomes are not Yes/No/Up/Down)
 */
export function isSportMarket(market: Market): boolean {
    if (!market.outcomes) return false;

    const outcomes = parseJSON<string[]>(market.outcomes, []);
    const firstOutcome = outcomes[0]?.toLowerCase();

    return !!firstOutcome && !['yes', 'up', 'no', 'down'].includes(firstOutcome);
}

/**
 * Get unique name for market by removing common words
 */
export function getUniqueName(
    market: Market,
    allMarkets: Market[],
    eventTitle: string
): string {
    const outcomes = parseJSON<string[]>(market.outcomes, []);
    const questions = allMarkets.map(m => m.question || '');

    // If only one market, return first outcome
    if (questions.length <= 1) {
        return outcomes[0] || 'Market';
    }

    // Extract common words
    const titleWords = eventTitle.toLowerCase().split(' ');
    const wordArrays = questions.map(q =>
        q.toLowerCase().replace(/\?|,/g, '').split(' ')
    );

    const commonWords = wordArrays[0].filter((word: string) => {
        const count = wordArrays.filter(arr => arr.includes(word)).length;
        return count > wordArrays.length / 2 || titleWords.includes(word);
    });

    // Blacklist of common filler words
    const blacklist = [
        'will', 'be', 'win', 'won', 'the', 'a', 'an', 'is', 'to',
        'of', 'in', 'at', 'by', 'on', 'for', 'with', 'and', 'or',
        'but', 'next', 'as', 'who', 'price', 'above'
    ];

    // Extract unique words from question
    const unique = market.question
        .split(' ')
        .filter((word: string) => {
            const cleanWord = word.toLowerCase().replace(/\?|,/g, '');
            return !commonWords.includes(cleanWord) && !blacklist.includes(cleanWord);
        })
        .join(' ')
        .replace(/\?/g, '')
        .trim();

    return unique || market.groupItemTitle || outcomes[0] || 'Market';
}

/**
 * Format price as cents (0.67 → "67¢")
 */
export function formatCents(price: string | number | null | undefined): string {
    if (price === null || price === undefined) return '0¢';
    const num = parseFloat(price.toString());
    if (isNaN(num)) return '0¢';
    return `${Math.round(num * 100)}¢`;
}

/**
 * Get button class based on outcome type
 */
export function getBtnClass(outcome: string): 'yes' | 'no' | 'sport' {
    const text = outcome.toLowerCase();

    if (text === 'yes' || text === 'up') return 'yes';
    if (text === 'no' || text === 'down') return 'no';

    return 'sport';
}

/**
 * Format volume to readable string ($42M, $1.5M, $500K)
 */
export function formatVolume(volume: number): string {
    if (volume >= 1_000_000) {
        return `$${(volume / 1_000_000).toFixed(1)}M`;
    }
    if (volume >= 1_000) {
        return `$${(volume / 1_000).toFixed(0)}K`;
    }
    return `$${volume.toFixed(0)}`;
}