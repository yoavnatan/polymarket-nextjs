export async function getEventsData() {
    const GAMMA_API_URL = 'https://gamma-api.polymarket.com';
    const response = await fetch(
        `${GAMMA_API_URL}/events?closed=false&active=true&order=volume24hr&ascending=false&limit=20`,
        { cache: 'no-store' }
    );

    if (!response.ok) throw new Error('Failed to fetch from Gamma');
    return response.json();
}