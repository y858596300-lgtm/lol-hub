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
