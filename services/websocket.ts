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
            console.log('✅ Connected');
            ws.send(JSON.stringify({
                assets_ids: assetIds,
                type: 'market',
                custom_feature_enabled: true
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Price changes
                if (data.event_type === 'price_change' && data.price_changes) {
                    data.price_changes.forEach((change: any) => {
                        onPriceUpdate({
                            asset_id: change.asset_id,
                            price: change.price,
                            timestamp: data.timestamp,
                        });
                    });
                }

                // Last trade
                if (data.event_type === 'last_trade_price') {
                    onPriceUpdate({
                        asset_id: data.asset_id,
                        price: data.price,
                        timestamp: data.timestamp,
                    });
                }

                // Best bid/ask
                if (data.event_type === 'best_bid_ask') {
                    const mid = ((parseFloat(data.best_bid) + parseFloat(data.best_ask)) / 2).toFixed(4);
                    onPriceUpdate({
                        asset_id: data.asset_id,
                        price: mid,
                        timestamp: data.timestamp,
                    });
                }
            } catch (e) {
                // Ignore
            }
        };

        ws.onerror = () => console.error('❌ WS error');
        ws.onclose = () => console.log('🔌 Disconnected');

        return ws;
    } catch (error) {
        return null;
    }
}