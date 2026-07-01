# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server (may have stale cache)
npm run dev:clean     # Clean .next then start dev server (use after build)
npm run build         # Clean .next then static export → out/
npm run lint          # ESLint check
```

**Never run `npm run build` while dev server is running** — it pollutes `.next/` with production artifacts, causing "Cannot find module './948.js'" errors. Use `npm run dev:clean` to restart dev cleanly after a build.

## Architecture

**Next.js 14 App Router + static export** (`output: "export"` in next.config.mjs). The entire app is a single HTML file with hash-based client-side routing. All images use `unoptimized: true` (required for static export).

### Routing (hash-based SPA)

`src/app/page.tsx` is the single entry point. All views are client-rendered via URL hash:

| Hash | View |
|------|------|
| `#/` | Hero list |
| `#/hero/{id}` | Hero detail (skin gallery) |
| `#/compare` | Skin comparison |

`navigate("/")` returns to the **landing page** (Hextech splash screen), not the hero list. Any other hash navigates within the app.

### Landing → App flow

`entered` state controls whether the landing page (Hextech background + crystal button) or main app (nav + content) is shown. The `navigate("/")` function resets `entered` to false.

### Data sources

- **Riot Data Dragon** (`ddragon.leagueoflegends.com`) — champion list, skins, splash/loading art. For chroma color variants, splash art returns 403.
- **CommunityDragon** (`raw.communitydragon.org`) — chroma variant images. URL pattern: `/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-chroma-images/{championKey}/{fullSkinId}.png` where `fullSkinId = championKey * 1000 + skinNum`.

### Image loading strategy (SkinCard + SkinViewer)

Three-tier fallback: `errorLevel` 0→1→2
1. Primary: ddragon splash/loading URL
2. Chroma: CommunityDragon chroma image (preloaded via `new window.Image()` in useEffect)
3. Fallback: nearest chroma-base skin's splash art (found via `getFallbackSkinNum`)

SkinCard remounts on mode change via `key={`${skinId}-${viewMode}`}` to reset errorLevel.

### API caching

`src/lib/api.ts` wraps all ddragon calls with a 1-hour sessionStorage cache. All functions return `null` on error (never throw). The champion `key` field (e.g., "266") is included in `ChampionDetail` for building chroma URLs.

### Shared utilities

`src/lib/utils.ts` — `getComparePool()`, `saveComparePool()`, `getFallbackSkinNum()`. Used by HeroDetail, ComparePage, and SkinViewer. Compare pool is stored in localStorage under key `"comparePool"`.

### Canvas background

`HextechBackground.tsx` runs a requestAnimationFrame loop drawing hex grids, crystal nodes, pulse rings, and floating particles. Exposes `window.__hextechSurge()` for energy burst animation triggered on landing page entry. Component is pure canvas — no React re-renders during animation.

### Design tokens

Defined in `globals.css` and `tailwind.config.ts`:
- `--void` (#040B1A) — deepest background
- Hex-blue (#0AB4FF) — primary accent, active states
- Hex-light (#7DD8FF) — bright blue
- Arcane (#7C3AED) — purple, secondary
- Gold (#C8AA6E) — prestige moments
- Mist (#8E9CBA) — muted text/borders

CSS utilities: `.glass-card`, `.glass-card-hover`, `.btn-primary`, `.btn-ghost`, `.hex-btn` (hexagonal clip-path), `.hex-pulse` (glow animation).
