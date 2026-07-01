export interface ChampionListEntry {
  id: string; // "Aatrox"
  key: string; // "266"
  name: string; // "暗裔剑魔"
  title: string; // "亚托克斯"
  image: { full: string }; // "Aatrox.png"
  blurb: string;
  tags: string[];
}

export interface ChampionDetail {
  id: string;
  key: string; // "266"
  name: string;
  title: string;
  lore: string;
  blurb: string;
  image: { full: string };
  skins: Skin[];
  spells: Spell[];
}

export interface Skin {
  id: string; // "266000" → last 3 digits = skin number
  num: number; // 0 = default skin
  name: string; // "腥红之月 亚托克斯"
  chromas: boolean;
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  image: { full: string };
}

export interface SkinData {
  championId: string;
  championName: string;
  skinNum: number;
  skinName: string;
  splashUrl: string;
  loadingUrl: string;
}

export interface ComparePoolItem {
  championId: string;
  championName: string;
  skinNum: number;
  skinName: string;
}

export interface RatingsMap {
  [key: string]: number; // "Aatrox_0": 4
}
