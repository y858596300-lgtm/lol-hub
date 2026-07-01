import { ChampionListEntry, ChampionDetail } from "./types";

const BASE_URL = "https://ddragon.leagueoflegends.com";
const CACHE_TTL = 3600000; // 1 hour

function cacheGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

function cacheSet(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // quota exceeded, ignore
  }
}

let cachedVersion: string | null = null;

export async function fetchVersions(): Promise<string | null> {
  if (cachedVersion) return cachedVersion;

  const cached = cacheGet<string>("ddragon:version");
  if (cached) {
    cachedVersion = cached;
    return cached;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/versions.json`);
    if (!res.ok) return null;
    const versions: string[] = await res.json();
    cachedVersion = versions[0];
    cacheSet("ddragon:version", cachedVersion);
    return cachedVersion;
  } catch {
    return null;
  }
}

export async function fetchChampions(
  version: string
): Promise<ChampionListEntry[] | null> {
  const cacheKey = `ddragon:champions:${version}`;
  const cached = cacheGet<ChampionListEntry[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${BASE_URL}/cdn/${version}/data/zh_CN/champion.json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const champs = Object.values(data.data) as ChampionListEntry[];
    cacheSet(cacheKey, champs);
    return champs;
  } catch {
    return null;
  }
}

export async function fetchChampionDetail(
  id: string,
  version: string
): Promise<ChampionDetail | null> {
  const cacheKey = `ddragon:champion:${version}:${id}`;
  const cached = cacheGet<ChampionDetail>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${BASE_URL}/cdn/${version}/data/zh_CN/champion/${id}.json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const detail = data.data[id] as ChampionDetail;
    cacheSet(cacheKey, detail);
    return detail;
  } catch {
    return null;
  }
}

// --- Rune / Item / Spell data for OP.GG mapping ---

interface RuneTree {
  id: number; key: string; name: string;
  slots: { runes: { id: number; key: string; name: string; icon: string; }[] }[];
}

export async function fetchRunes(version: string): Promise<RuneTree[] | null> {
  const cacheKey = `ddragon:runes:${version}`;
  const cached = cacheGet<RuneTree[]>(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(`${BASE_URL}/cdn/${version}/data/zh_CN/runesReforged.json`);
    if (!res.ok) return null;
    const data: RuneTree[] = await res.json();
    cacheSet(cacheKey, data);
    return data;
  } catch { return null; }
}

export async function fetchItems(version: string) {
  const cacheKey = `ddragon:items:${version}`;
  const cached = cacheGet<Record<string, { name: string }>>(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(`${BASE_URL}/cdn/${version}/data/zh_CN/item.json`);
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data as Record<string, { name: string }>;
    cacheSet(cacheKey, data);
    return data;
  } catch { return null; }
}

export async function fetchSpells(version: string) {
  const cacheKey = `ddragon:spells:${version}`;
  const cached = cacheGet<Record<string, { key: string; name: string }>>(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(`${BASE_URL}/cdn/${version}/data/zh_CN/summoner.json`);
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data as Record<string, { key: string; name: string }>;
    cacheSet(cacheKey, data);
    return data;
  } catch { return null; }
}

export interface GameDataMaps {
  runeMap: Map<number, { name: string; icon: string }>;
  itemMap: Map<number, { name: string; icon: string }>;
  spellMap: Map<number, { name: string; icon: string }>;
}

let gameMapsCache: GameDataMaps | null = null;

export async function buildGameDataMaps(): Promise<GameDataMaps> {
  if (gameMapsCache) return gameMapsCache;
  const empty = { runeMap: new Map<number, { name: string; icon: string }>(), itemMap: new Map<number, { name: string; icon: string }>(), spellMap: new Map<number, { name: string; icon: string }>() };
  const ver = await fetchVersions(); if (!ver) { gameMapsCache = empty; return empty; }
  const [runes, items, spells] = await Promise.all([fetchRunes(ver), fetchItems(ver), fetchSpells(ver)]);
  const runeMap = new Map<number, { name: string; icon: string }>();
  if (runes) for (const tree of runes) for (const slot of tree.slots) for (const r of slot.runes) runeMap.set(r.id, { name: r.name, icon: `https://ddragon.leagueoflegends.com/cdn/img/${r.icon}` });
  const itemMap = new Map<number, { name: string; icon: string }>();
  if (items) Object.keys(items).forEach(id => { const it = items[id]; if (it) itemMap.set(parseInt(id), { name: it.name, icon: `https://ddragon.leagueoflegends.com/cdn/${ver}/img/item/${id}.png` }); });
  const spellMap = new Map<number, { name: string; icon: string }>();
  if (spells) Object.keys(spells).forEach(k => { const s = spells[k]; if (s) spellMap.set(parseInt(s.key), { name: s.name, icon: `https://ddragon.leagueoflegends.com/cdn/${ver}/img/spell/${k}.png` }); });
  gameMapsCache = { runeMap, itemMap, spellMap };
  return gameMapsCache;
}
