'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import '@/styles/cmps/TopLoader.css';

type Phase = 'idle' | 'loading' | 'done';

export function TopLoader() {
    const pathname = usePathname();
    const prevPathname = useRef(pathname);
    const [phase, setPhase] = useState<Phase>('idle');
    const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Detect navigation start via clicks on internal links
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#') || /^https?:/.test(href)) return;
            // Only show for forward navigation into a detail page, not for Back links
            if (href.startsWith('/events/')) {
                if (doneTimer.current) clearTimeout(doneTimer.current);
                setPhase('loading');
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname]);

    // Detect navigation complete — only finish if we actually started loading
    useEffect(() => {
        if (pathname === prevPathname.current) return;
        prevPathname.current = pathname;

        setPhase(prev => {
            if (prev !== 'loading') return 'idle';
            doneTimer.current = setTimeout(() => setPhase('idle'), 500);
            return 'done';
        });
        return () => {
            if (doneTimer.current) clearTimeout(doneTimer.current);
        };
    }, [pathname]);

    if (phase === 'idle') return null;

    return <div className={`top-loader top-loader--${phase}`} />;
}
