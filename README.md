# Polymarket — Next.js Client

A real-time prediction markets browser built on top of the [Polymarket](https://polymarket.com) public API.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| State management | Jotai |
| Animations | Framer Motion |
| Real-time prices | Polymarket WebSocket (`wss://ws-subscriptions-clob.polymarket.com`) |
| Data source | Gamma API (`https://gamma-api.polymarket.com`) |

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000].

### Other commands

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

No environment variables are required — all data is fetched from public Polymarket endpoints.

---

## Architecture

### Project map

```
app/
├── layout.tsx                  # Root layout — mounts Providers (Jotai + WebSocket + TopLoader)
├── page.tsx                    # Home — renders EventsIndex
└── events/[id]/
    └── page.tsx                # Detail — server-fetches event, renders EventDetails

components/
├── Providers.tsx               # Jotai Provider + global WebSocket + TopLoader
├── events/
│   ├── EventsIndex.tsx         # Orchestrates filter + list
│   ├── EventFilter.tsx         # Category pills — reads/writes filtersAtom + sessionStorage
│   ├── EventsList.tsx          # Grid wrapper
│   ├── EventPreview.tsx        # Market card with live prices + flash animation
│   ├── EventDetails.tsx        # Full event view, own WS connection for its tokens
│   └── EventPreviewSkeleton.tsx# Shimmer placeholder shown while events load
└── ui/
    ├── TopLoader.tsx           # Thin progress bar on navigation to /events/*
    ├── FlashPrice.tsx          # Span that plays a flash animation on value change
    └── PieChart.tsx            # Yes/No probability donut

customHooks/
├── useEvents.ts                # Fetches events from API, populates eventsAtom
└── useWebSockets.ts            # WebSocket connection — batches updates via rAF → pricesAtom

store/
└── atoms.ts                    # eventsAtom · pricesAtom · filtersAtom · filteredEventsAtom

styles/
├── main.css                    # Single entry point — @imports everything in order
├── setup/
│   ├── var.css                 # Design tokens (CSS custom properties)
│   └── fonts.css               # Custom font faces
├── basics/
│   └── base.css                # Reset + global element defaults
└── cmps/
    ├── EventPreview.css
    ├── EventDetails.css
    ├── EventFilter.css
    ├── EventsList.css
    ├── EventsIndex.css
    ├── EventPreviewSkeleton.css
    ├── FlashPrice.css
    └── TopLoader.css
```

### Data flow

```
                      ┌─────────────────────────────────────────┐
                      │               Jotai Provider              │
                      │                                           │
  Gamma API ─fetch──► │ eventsAtom ──► filteredEventsAtom        │
                      │                        │                  │
  sessionStorage ────►│ filtersAtom ───────────┘                  │
                      │                                           │
  WebSocket ──rAF───► │ pricesAtom                                │
                      └──────────────┬────────────────────────────┘
                                     │
                      ┌──────────────┼────────────────────────────┐
                      │              ▼                            │
                      │  EventsIndex (filteredEventsAtom)         │
                      │    └── EventPreview × N (pricesAtom)      │
                      │                                           │
                      │  EventDetails (pricesAtom)                │
                      └───────────────────────────────────────────┘
```

### CSS architecture

Styles follow a **layered import model** — `main.css` is the single entry point imported in the root layout. No CSS Modules or CSS-in-JS; scoping is done by class naming convention.

| Layer | Files | Purpose |
|---|---|---|
| **Setup** | `var.css`, `fonts.css` | Design tokens and font faces — loaded first so everything below can reference them |
| **Base** | `base.css` | Minimal reset (box-sizing, margin, link colour) |
| **Components** | `cmps/*.css` | One file per component, imported on-demand |

Design tokens (defined in `var.css`) cover colours, button variants and spacing. All interactive colours have explicit hover and active states. Components never hardcode colour values — they always reference a token.

### Real-time updates

The WebSocket connects once globally (in `Providers`) and additionally per-event inside `EventDetails`. Price updates are batched with `requestAnimationFrame` — at most one React state update per frame — then merged into `pricesAtom`. Keeping prices in a separate atom from events means the filtered/sorted event list never re-renders on price ticks. Price displays flash briefly via `FlashPrice.css` when their value changes.

### Navigation

- **Main → Details** — standard Next.js `<Link>`. `TopLoader` shows only on this transition (detected by checking if the clicked `href` starts with `/events/`).
- **Back → Main** — filter state is preserved by the global `filtersAtom` (never unmounted) and by `sessionStorage` for hard refreshes.

---

## Known limitations

### Dynamic URL for the active filter

The filter state (e.g. `?category=crypto`) cannot be reliably reflected in the URL with Next.js App Router. Several approaches were attempted:

| Approach | Problem |
|---|---|
| `router.replace` | Does not reliably preserve query params in browser history — back navigation strips them |
| `window.history.replaceState` | Updates the address bar but overwrites Next.js's internal history state, breaking back navigation |
| `window.history.pushState` | Same — Next.js does not recognise the injected entry on `popstate` |
| `useSearchParams` + two-way sync | Creates circular effect updates; still relies on `router.replace` under the hood |

**Current behaviour:** filter state lives entirely in Jotai + `sessionStorage`. The URL does not change when a filter is selected.

A clean fix would require either a custom server-side redirect on filter change, or migrating to the Next.js Pages Router where `router.push` / `router.replace` handle query strings predictably.
