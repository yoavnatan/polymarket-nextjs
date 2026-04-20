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

### Data flow

```
Gamma API ──► eventsAtom ──► filteredEventsAtom ──► EventsIndex
                                                         │
WebSocket ──► pricesAtom ──────────────────────────────► EventPreview / EventDetails
```

- **`eventsAtom`** — raw list of events fetched once on load.
- **`filteredEventsAtom`** — derived atom applying search, category filter and sort. Never recomputes on price ticks.
- **`pricesAtom`** — flat `tokenId → price` map updated by the WebSocket. Kept separate from events so price ticks never re-render the full event list.
- **`filtersAtom`** — category, search query and sort order. Persists across navigation because the Jotai `Provider` lives in the root layout.

### Real-time updates

The WebSocket connects once globally (in `Providers`) and additionally per-event inside `EventDetails`. Price updates are batched with `requestAnimationFrame` — at most one React state update per frame — then merged into `pricesAtom`. Price displays flash briefly via a CSS animation when their value changes.

### Navigation

- **Main → Details** — standard Next.js `<Link>`. A thin top progress bar appears only on this transition, not on Back.
- **Back → Main** — the active category filter is preserved because `filtersAtom` is never unmounted. It is also written to `sessionStorage` so it survives a hard refresh.

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
