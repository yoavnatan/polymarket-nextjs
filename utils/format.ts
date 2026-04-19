// פורמט כסף ($2.5M, $150K, $50)
export function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) {
        return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
        return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
}

// פורמט תאריך (Jan 15, 2026)
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
//time ago

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

// המרת מחיר לאחוזים (0.67 → 67)
export function toProbability(price: string | number): number {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return Math.round(num * 100);
}

// פרסור JSON בטוח
export function parseJSON<T>(jsonString: string, fallback: T): T {
    try {
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
}