'use client';

import { useEffect, useRef } from 'react';
import '@/styles/cmps/FlashPrice.css';

interface FlashPriceProps {
    value: string;
    children: string;
    className?: string;
}

// Renders children and briefly flashes when `value` changes.
export function FlashPrice({ value, children, className = '' }: FlashPriceProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isFirst = useRef(true);
    const prev = useRef(value);

    useEffect(() => {
        if (isFirst.current) { isFirst.current = false; return; }
        if (prev.current === value) return;
        prev.current = value;

        const el = ref.current;
        if (!el) return;
        el.classList.remove('flash');
        void el.offsetWidth; // force reflow to restart animation
        el.classList.add('flash');
    }, [value]);

    return (
        <span
            ref={ref}
            className={className}
            onAnimationEnd={() => ref.current?.classList.remove('flash')}
        >
            {children}
        </span>
    );
}
