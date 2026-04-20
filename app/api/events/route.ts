import { NextResponse } from 'next/server';

const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

export async function GET() {
    try {
        // Fetch active markets sorted by 24h volume
        const response = await fetch(
            `${GAMMA_API_URL}/events?closed=false&active=true&order=volume24hr&ascending=false&limit=50`,
            {
                next: { revalidate: 60 }, // Cache for 60 seconds
            }
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}

