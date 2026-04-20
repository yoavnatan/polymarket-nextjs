# Polymarket — Next.js Client

A real-time prediction markets browser built on the public Polymarket API.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| State | Jotai |
| Data | Gamma API |
| Real-time | Polymarket CLOB WebSocket |

## Getting started

```bash
npm install
npm run dev
```

No environment variables required.

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

## Project structure

```
app/
├── layout.tsx              # Root layout — Jotai Provider + WebSocket + TopLoader
├── page.tsx                # Home
└── events/[id]/page.tsx    # Detail (server component)

components/
├── Providers.tsx
├── events/
│   ├── EventsIndex.tsx     # Filter + paginated list
│   ├── EventFilter.tsx     # Category pills
│   ├── EventsList.tsx      # Grid wrapper
│   ├── EventPreview.tsx    # Market card — live prices + flash animation
│   ├── EventDetails.tsx    # Full event view
│   └── EventPreviewSkeleton.tsx
└── ui/
    ├── TopLoader.tsx       # Progress bar on /events/* navigation
    ├── FlashPrice.tsx      # Animated price ticker
    └── PieChart.tsx        # Yes/No donut

customHooks/
├── useEvents.ts            # Fetch + cache events → eventsAtom
└── useWebSockets.ts        # WS connection, RAF-batched → pricesAtom

store/atoms.ts              # eventsAtom · pricesAtom · filtersAtom · filteredEventsAtom

styles/
├── main.css                # Single entry point
├── setup/                  # var.css · fonts.css
├── basics/                 # base.css
└── cmps/                   # One file per component
```

## How it works

**Prices** — WebSocket connects once globally (and again per event in `EventDetails`). Updates use `best_bid_ask` mid-price `(bid + ask) / 2`, which matches the REST API and avoids last-trade noise. Updates are batched with `requestAnimationFrame` (max one React update per frame) and stored in a separate `pricesAtom`. This means the event list never re-renders on price ticks — only the individual price spans do.

**Filters** — state lives in `filtersAtom` (Jotai Provider is in root layout and never unmounts, so it persists across navigations). `sessionStorage` restores the last category on hard refresh. The URL is not updated — Next.js App Router does not reliably preserve query params through `<Link>` back navigation.

**Caching** — events are cached in memory for 60 seconds. Navigating back from a detail page within that window is instant, with no loading state.

**Pagination** — 12 events shown initially. "Show more" switches to infinite scroll (IntersectionObserver on a sentinel element).
