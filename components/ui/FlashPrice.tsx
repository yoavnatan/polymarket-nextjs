'use client';

import { useEffect, useRef, useState } from 'react';
import '@/styles/cmps/FlashPrice.css';

interface FlashPriceProps {
    value: string;
    children: string;
    className?: string;
}

export function FlashPrice({ value, children, className = '' }: FlashPriceProps) {
    const [displayed, setDisplayed] = useState(children);
    const [outgoing, setOutgoing] = useState<string | null>(null);
    const [animIn, setAnimIn] = useState(false);
    const prevValue = useRef(value);
    const isFirst = useRef(true);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isFirst.current) { isFirst.current = false; return; }
        if (prevValue.current === value) return;

        const old = displayed;
        prevValue.current = value;

        if (timer.current) clearTimeout(timer.current);

        setOutgoing(old);
        setDisplayed(children);
        setAnimIn(true);

        timer.current = setTimeout(() => {
            setOutgoing(null);
            setAnimIn(false);
        }, 250);
    }, [value, children]);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    return (
        <span className={`ticker-wrap ${className}`}>
            {outgoing !== null && (
                <span className="ticker-out" aria-hidden="true">{outgoing}</span>
            )}
            <span className={animIn ? 'ticker-in' : ''}>{displayed}</span>
        </span>
    );
}
