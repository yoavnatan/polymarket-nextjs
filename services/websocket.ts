
const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';

export interface PriceUpdate {
    asset_id: string;
    price: string;
    timestamp?: string;
}

export function connectWebSocket(
    assetIds: string[],
    onPriceUpdate: (update: PriceUpdate) => void
): WebSocket | null {
    if (assetIds.length === 0) return null;

    try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('WebSocket connected');

            // Subscribe to markets
            const subscribeMessage = {
                assets_ids: assetIds,
                type: 'market',
            };

            ws.send(JSON.stringify(subscribeMessage));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Check if it's a price update
                if (data.asset_id && data.price !== undefined) {
                    onPriceUpdate({
                        asset_id: data.asset_id,
                        price: data.price,
                        timestamp: data.timestamp,
                    });
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return ws;
    } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        return null;
    }
}