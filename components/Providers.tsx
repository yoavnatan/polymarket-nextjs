'use client';

import { Provider } from 'jotai';
import { useWebSocket } from '@/customHooks/useWebSockets';
import { TopLoader } from '@/components/ui/TopLoader';

function WebSocketManager() {
    useWebSocket();
    return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider>
            <TopLoader />
            <WebSocketManager />
            {children}
        </Provider>
    );
}
