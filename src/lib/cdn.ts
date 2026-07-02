// ============================================================
// Centralized URL construction for all image sources.
// All paths returned are absolute HTTPS URLs where possible,
// except getSplashUrl which returns a relative path for local
// public/ files (no leading / — breaks GitHub Pages basePath).
// ============================================================

/** Local splash art (relative path — MUST NOT have leading /).
 *  Root-relative paths like `/splash/x.jpg` break on GitHub Pages
 *  because the site is served at `/lol-hub/`, not `/`. */
export function getSplashUrl(championId: string): string {
  const clean = championId.replace(/^\/+/, "");
  return `splash/${clean}.jpg`;
}

/** DDragon champion splash art (full resolution) */
export function getDdragonSplashUrl(championId: string, skinNum: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
}

/** DDragon champion loading screen art */
export function getDdragonLoadingUrl(championId: string, skinNum: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_${skinNum}.jpg`;
}

/** DDragon champion square icon — ultimate fallback when splash/loading fail */
export function getDdragonIconUrl(version: string, championId: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`;
}

/** CommunityDragon chroma image (high-res render) */
export function getCommunityDragonChromaUrl(championKey: string, skinNum: number): string {
  const fullSkinId = parseInt(championKey) * 1000 + skinNum;
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-chroma-images/${championKey}/${fullSkinId}.png`;
}
