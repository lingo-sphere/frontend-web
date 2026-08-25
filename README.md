# LingoSphere Dashboard

React 19 + Vite + TypeScript export of the LingoSphere Academic Light/Dark dashboard.

## Run locally

```bash
npm install
npm run dev
```

The app is available at `http://localhost:5173/`.

## Validate

```bash
npm run build
```

## Included

- Responsive desktop sidebar and mobile off-canvas navigation
- Academic Light/Dark token themes with persisted theme preference
- Continue Learning, Today's Learning, roadmap, rewards and topic sections
- Week/month/year streak leaderboard tabs
- Selectable 90-day Vietnamese heatmap with detail and summary cards
- Mock data boundary in `src/data/dashboard-data.ts`
- Local UI state in `src/store/dashboard-store.ts`
- shadcn v4 Radix primitives, Lucide icons and Motion entrance animation

The dashboard is intentionally mock-data driven. API, authentication and analytics integration are left as the next application layer.
