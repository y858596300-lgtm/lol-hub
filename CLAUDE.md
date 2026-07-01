# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server
npm run dev:clean     # Clean .next then start dev server (use after build)
npm run build         # Static export → out/
npm run lint          # ESLint check
npm run proxy         # Local OP.GG dev proxy (port 8787) — not needed for production
```

## Rules

- **Never run `npm run build` while dev server is running.** Produces "Cannot find module './948.js'" errors.
- **Never include `Co-Authored-By: Claude` or any Claude/AI attribution in git commits.**
- **Never develop without knowing the user's proxy: `http://127.0.0.1:7897`.** Configure git with `http.proxy` and `https.proxy` pointing there.

## Architecture

**Next.js 14 App Router + static export** (`output: "export"`, `basePath: "/lol-hub"` in next.config.mjs). Single HTML file with hash-based client-side SPA. Images use `unoptimized: true`.

### Routing (hash-based SPA)

`src/app/page.tsx` is the single entry point. All views via URL hash:

| Hash | View |
|------|------|
| `#/` | Hero list |
| `#/hero/{id}` | Hero detail (skin gallery) |
| `#/compare` | Skin comparison |
| `#/analytics` | OP.GG champion tier list |
| `#/analytics/{id}` | Champion analysis detail |

`navigate("/", { home: true })` returns to the landing page. `navigate("/")` (no opts) goes to hero list. `entered` state controls landing vs. app.

### Data sources

- **Data Dragon** (`ddragon.leagueoflegends.com`) — champion list, skins, splash/loading art, runes, items, spells. All calls cached 1h in sessionStorage.
- **CommunityDragon** (`raw.communitydragon.org`) — chroma variant images.
- **OP.GG REST API** (`lol-api-champion.op.gg`) — champion analytics: win/pick/ban rates, runes, builds, counters. CORS enabled, no auth needed. `src/lib/opgg.ts` wraps it. URL pattern: `/api/{region}/champions/{mode}?version=16.X&tier=...`.
- **Local splash art** — `public/splash/` contains 173 champion default splash JPEGs downloaded via `scripts/download-splashes.mjs`. `src/lib/cdn.ts` → `getSplashUrl()` maps to `/splash/{id}.jpg`.

### Image loading (SkinCard + SkinViewer)

Three-tier fallback: `errorLevel` 0→1→2
1. ddragon splash/loading URL
2. CommunityDragon chroma image (preloaded via `new window.Image()`)
3. Nearest chroma-base skin (via `getFallbackSkinNum` in `src/lib/utils.ts`)

SkinCard remounts on mode change via `key={`${skinId}-${viewMode}`}`.

### Analytics page

`AnalyticsList.tsx` — mode/region/tier/position selectors, champion grid with win/pick/ban/KDA rates. `AnalyticsDetail.tsx` — skill order, runes (with icons), summoner spells, items, counters. All data from OP.GG REST API. Rune/item/spell icons mapped via `buildGameDataMaps()` in `src/lib/api.ts`.

### Shared utilities

`src/lib/utils.ts` — `getComparePool()`, `saveComparePool()` (localStorage key `"comparePool"`), `getFallbackSkinNum()`.

### Canvas background

`HextechBackground.tsx` — rAF loop: hex grid, crystal nodes, pulse rings, floating particles. `window.__hextechSurge()` triggers energy burst on landing entry.

### Design tokens

- Void: `#040B1A`, Hex-blue: `#0AB4FF`, Hex-light: `#7DD8FF`, Arcane: `#7C3AED`, Gold: `#C8AA6E`, Mist: `#8E9CBA`
- CSS: `.glass-card`, `.glass-card-hover`, `.btn-primary`, `.btn-ghost`, `.hex-btn` (hex clip-path), `.hex-pulse`

## Deployment

GitHub Pages from `gh-pages` branch. Steps:

```bash
npm run build
cd out
git init && git config user.name "ivor-y" && git config user.email "y858596300@gmail.com"
git config http.proxy http://127.0.0.1:7897 && git config https.proxy http://127.0.0.1:7897
git config http.sslVerify false
touch .nojekyll   # CRITICAL: prevents Jekyll from stripping _next/
git add -A && git commit -m "Deploy"
git remote add origin https://github.com/ivor-y/lol-hub.git
git push -f origin HEAD:gh-pages
```

Source on `main` branch. Site at `https://ivor-y.github.io/lol-hub/`.
