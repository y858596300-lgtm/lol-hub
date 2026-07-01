import { fetchVersions } from "./api";

const BASE_URL = "https://lol-api-champion.op.gg";
const CACHE_TTL = 1800000; // 30 minutes

function cacheGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try { const raw = sessionStorage.getItem(key); if (!raw) return null; const { data, ts } = JSON.parse(raw); if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(key); return null; } return data as T; } catch { return null; }
}
function cacheSet(key: string, data: unknown) {
  if (typeof window === "undefined") return; try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch { /* ignore */ }
}

export interface OpggChampion {
  id: number;
  is_rotation: boolean;
  is_rip: boolean;
  average_stats: OpggStats;
  positions: OpggPosition[];
}

export interface OpggStats {
  play: number;
  win_rate: number;
  pick_rate: number;
  ban_rate: number;
  kda: number;
  tier: number;
  rank: number;
  tier_data?: { tier: number; rank: number; rank_prev: number; rank_prev_patch: number; };
}

export interface OpggPosition {
  name: string; // "TOP", "JUNGLE", "MID", "ADC", "SUPPORT"
  stats: OpggStats;
}

export interface OpggDetail {
  summary: { id: number; name: string; };
  positions: { name: string; stats: OpggStats; }[];
  runes?: OpggBuild[];
  skills?: OpggSkill[];
  summoner_spells?: OpggBuild[];
  starter_items?: OpggBuild[];
  core_items?: OpggBuild[];
  boots?: OpggBuild[];
  counters?: OpggCounter[];
}
export interface OpggBuild { ids?: number[]; id?: number; primary_rune_ids?: number[]; secondary_rune_ids?: number[]; stat_mod_ids?: number[]; pick_rate: number; win: number; play: number; }
export interface OpggSkill { order: string[]; pick_rate: number; win: number; play: number; }
export interface OpggCounter { champion_id: number; play: number; win: number; }

export const REGIONS: Record<string, string> = { global: "全球", kr: "韩国", na: "北美", euw: "欧西", eune: "欧东北", jp: "日本", oce: "大洋洲", br: "巴西", tr: "土耳其", ru: "俄罗斯", lan: "北拉美", las: "南拉美", sg: "新加坡", th: "泰国", ph: "菲律宾", tw: "台湾", vn: "越南" };

export const TIERS: Record<string, string> = { all: "全分段", gold_plus: "黄金+", platinum_plus: "铂金+", emerald_plus: "翡翠+", diamond_plus: "钻石+", master: "大师", master_plus: "大师+", challenger: "王者" };

export const MODES: Record<string, string> = { ranked: "排位", aram: "大乱斗", arena: "斗魂" };

export const POSITIONS: Record<string, string> = { TOP: "上单", JUNGLE: "打野", MID: "中单", ADC: "ADC", SUPPORT: "辅助" };

async function getVersionShort(): Promise<string> {
  const cached = cacheGet<string>("opgg:versionShort"); if (cached) return cached;
  const version = await fetchVersions(); if (!version) return "16.13";
  const short = version.split(".").slice(0, 2).join(".");
  cacheSet("opgg:versionShort", short); return short;
}

export async function fetchAllChampions(region: string, mode: string, tier: string): Promise<OpggChampion[]> {
  const cacheKey = `opgg:champs:${region}:${mode}:${tier}`;
  const cached = cacheGet<OpggChampion[]>(cacheKey); if (cached) return cached;
  try {
    const version = await getVersionShort();
    const tierParam = mode === "arena" ? undefined : tier;
    const url = `${BASE_URL}/api/${region}/champions/${mode}?version=${version}${tierParam ? `&tier=${tierParam}` : ""}`;
    const res = await fetch(url); if (!res.ok) return [];
    const json: { data: OpggChampion[] } = await res.json();
    cacheSet(cacheKey, json.data); return json.data;
  } catch { return []; }
}

export async function fetchChampionAnalysis(championId: number, region: string, mode: string, tier: string, position: string): Promise<OpggDetail | null> {
  const cacheKey = `opgg:detail:${region}:${mode}:${tier}:${championId}:${position}`;
  const cached = cacheGet<OpggDetail>(cacheKey); if (cached) return cached;
  try {
    const version = await getVersionShort();
    const tierParam = mode === "arena" ? undefined : tier;
    const pos = mode === "ranked" ? position : "none";
    const url = `${BASE_URL}/api/${region}/champions/${mode}/${championId}/${pos}?version=${version}${tierParam ? `&tier=${tierParam}` : ""}`;
    const res = await fetch(url); if (!res.ok) return null;
    const json: { data: OpggDetail } = await res.json();
    cacheSet(cacheKey, json.data); return json.data;
  } catch { return null; }
}
