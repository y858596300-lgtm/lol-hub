# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server at http://localhost:3000/lol-hub
npm run dev:clean     # Remove .next then start dev server (use after failed build)
npm run build         # Static export → out/
npm run lint          # ESLint check
npm run proxy         # Legacy: local OP.GG MCP proxy on port 8787 (not used by app)
```

## Rules

- **Never run `npm run build` while dev server is running.** Produces "Cannot find module './948.js'" errors.
- **Never include `Co-Authored-By: Claude` or any Claude/AI attribution in git commits.**
- **Splash art paths in `cdn.ts` must be relative (no leading `/`).** Root-relative paths like `/splash/x.jpg` break on GitHub Pages because the site is served at `/lol-hub/`, not `/`. Always write `splash/x.jpg`.
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

`navigate("/", { home: true })` returns to the landing page (`entered=false`). `navigate("/")` (no opts) goes to hero list. `entered` state controls landing vs. app.

### Data sources

- **Data Dragon** (`ddragon.leagueoflegends.com`) — champion list, skins, splash/loading art, runes, items, spells. All calls cached 1h in sessionStorage (`ddragon:*` keys).
- **CommunityDragon** (`raw.communitydragon.org`) — chroma variant images. Used as tier-2 fallback when Data Dragon lacks chroma splash art.
- **OP.GG REST API** (`lol-api-champion.op.gg`) — champion analytics: win/pick/ban rates, runes, builds, counters. CORS enabled, no auth needed. `src/lib/opgg.ts` wraps it. URL pattern: `/api/{region}/champions/{mode}/{id}/{position}?version=16.X&tier=...`. Cached 30min in sessionStorage (`opgg:*` keys).
- **Local splash art** — `public/splash/` contains 173 champion default splash JPEGs downloaded via `scripts/download-splashes.mjs`. `src/lib/cdn.ts` → `getSplashUrl()` maps to `splash/{id}.jpg` (relative path — see Rules).

### SessionStorage caching

Two-tier caching to avoid rate limiting and speed up repeat visits:

- **Data Dragon** (`src/lib/api.ts`): 1-hour TTL. Keys: `ddragon:version`, `ddragon:champions:{ver}`, `ddragon:champion:{ver}:{id}`, `ddragon:runes:{ver}`, `ddragon:items:{ver}`, `ddragon:spells:{ver}`.
- **OP.GG** (`src/lib/opgg.ts`): 30-minute TTL. Keys: `opgg:versionShort`, `opgg:champs:{region}:{mode}:{tier}`, `opgg:detail:{region}:{mode}:{tier}:{id}:{pos}`.

Data evicted on expiry on next access. `fetchVersions()` has an additional in-memory cache (`cachedVersion`) that never expires within a session.

### Image loading (SkinCard + SkinViewer)

Three-tier fallback: `errorLevel` 0→1→2
1. ddragon splash/loading URL
2. CommunityDragon chroma image (preloaded via `new window.Image()`)
3. Nearest chroma-base skin (via `getFallbackSkinNum` in `src/lib/utils.ts`)

SkinCard remounts on mode change via `key={`${skinId}-${viewMode}`}`. Chroma images use `object-contain` within `aspect-[16/9]` containers to avoid size inconsistency.

### Analytics page

`AnalyticsList.tsx` — mode/region/tier/position selectors, champion grid with win/pick/ban/KDA rates. Filters by position client-side from single `fetchAllChampions()` call.

`AnalyticsDetail.tsx` — skill order (top 3, pipe-separated), runes (top 3 with icons), summoner spells (top 3 with icons), core items (top 6 numbered), starter items + boots (side-by-side, top 5 each), counters with champion avatars (clickable to navigate). Uses `buildGameDataMaps()` from `src/lib/api.ts` for rune/item/spell name → icon → Chinese name mapping.

### Shared utilities

`src/lib/utils.ts` — `getComparePool()`, `saveComparePool()` (localStorage key `"comparePool"`), `getFallbackSkinNum()`.

### Canvas background

`HextechBackground.tsx` — rAF loop: hex grid, crystal nodes, pulse rings, floating particles. `window.__hextechSurge()` triggers energy burst on landing entry.

### GitHub Pages SPA fallback

Three files ensure client-side routing works on GitHub Pages:
- **`_redirects`** — `/* /index.html 200` catches all paths → SPA (primary mechanism).
- **`404.html`** — Copy of `index.html` with SPA bootstrap; fallback for paths where `_redirects` doesn't fire.
- **`index.txt`** — Empty file; forces GitHub Pages to skip Jekyll processing (alternative to `.nojekyll`).

### Worker directory (legacy)

`worker/` contains a Cloudflare Worker (`opgg-proxy.js` + `wrangler.toml`) and a local Node.js proxy (`dev-proxy.mjs`, port 8787) that both wrap OP.GG's MCP API (JSON-RPC at `mcp-api.op.gg`). **Neither is used in production** — the app talks to OP.GG's REST API (`lol-api-champion.op.gg`) directly from the browser. These files remain from the initial MCP exploration and can be safely ignored or deleted.

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
