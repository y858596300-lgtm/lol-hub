import type { ComparePoolItem } from "./types";

export function getComparePool(): ComparePoolItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("comparePool");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveComparePool(pool: ComparePoolItem[]) {
  localStorage.setItem("comparePool", JSON.stringify(pool));
}

export function getFallbackSkinNum(
  skins: { num: number; chromas: boolean }[],
  num: number
): number {
  let fallback = 0;
  for (const s of skins) {
    if (s.num < num && s.chromas && s.num > fallback) {
      fallback = s.num;
    }
  }
  return fallback;
}

/** Build a Map<skinNum, fallbackNum> for O(1) lookup.
 *  Chroma-bearing skins fall back to themselves; others fall back
 *  to the nearest lower skinNum that has chromas (or 0 if none). */
export function buildFallbackMap(
  skins: { num: number; chromas: boolean }[]
): Map<number, number> {
  const map = new Map<number, number>();
  for (const skin of skins) {
    if (skin.chromas) {
      map.set(skin.num, skin.num);
    } else {
      let fb = 0;
      for (const s of skins) {
        if (s.num < skin.num && s.chromas && s.num > fb) fb = s.num;
      }
      map.set(skin.num, fb);
    }
  }
  return map;
}
