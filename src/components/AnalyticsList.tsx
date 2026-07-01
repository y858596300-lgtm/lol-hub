"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchAllChampions, REGIONS, TIERS, MODES, POSITIONS, type OpggChampion } from "@/lib/opgg";
import { fetchVersions, fetchChampions } from "@/lib/api";

const TIER_BADGES: Record<number, { text: string; color: string; bg: string }> = {
  1: { text: "S", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  2: { text: "A", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" },
  3: { text: "B", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  4: { text: "C", color: "text-slate-400", bg: "bg-slate-400/10 border-slate-400/30" },
  5: { text: "D", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
};

interface AnalyticsListProps { navigate: (hash: string) => void; }

async function buildKeyMap(): Promise<Map<number, { id: string; name: string }>> {
  const map = new Map<number, { id: string; name: string }>();
  const ver = await fetchVersions(); if (!ver) return map;
  const champs = await fetchChampions(ver); if (!champs) return map;
  for (const c of champs) map.set(parseInt(c.key), { id: c.id, name: c.name });
  return map;
}

export default function AnalyticsList({ navigate }: AnalyticsListProps) {
  const [region, setRegion] = useState("global");
  const [mode, setMode] = useState("ranked");
  const [tier, setTier] = useState("all");
  const [position, setPosition] = useState("MID");
  const [champions, setChampions] = useState<OpggChampion[]>([]);
  const [keyMap, setKeyMap] = useState<Map<number, { id: string; name: string }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => { buildKeyMap().then(setKeyMap); }, []);
  useEffect(() => { setLoading(true); fetchAllChampions(region, mode, tier).then(d => { setChampions(d || []); setLoading(false); }); }, [region, mode, tier]);

  const filtered = champions
    .filter(c => mode !== "ranked" || (c.positions && c.positions.some(p => p.name === position)))
    .map(c => {
      const pos = mode === "ranked" ? c.positions?.find(p => p.name === position) : null;
      const stats = pos?.stats || c.average_stats;
      return { ...c, displayStats: stats, displayTier: stats.tier_data?.tier ?? stats.tier, displayRank: stats.tier_data?.rank ?? stats.rank };
    })
    .sort((a, b) => (a.displayRank || 999) - (b.displayRank || 999));

  const selClass = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-[#040B1A]/60 border border-[#8E9CBA]/20 text-[#8E9CBA] hover:text-white hover:border-[#8E9CBA]/40 focus:outline-none cursor-pointer";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">英雄分析</h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="h-px w-8 bg-gradient-to-r from-[#0AB4FF]/50 to-transparent" />
          <span className="text-sm text-[#8E9CBA] font-light">数据来源 OP.GG</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select value={mode} onChange={e => setMode(e.target.value)} className={selClass}>
          {Object.entries(MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={region} onChange={e => setRegion(e.target.value)} className={selClass}>
          {Object.entries(REGIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={tier} onChange={e => setTier(e.target.value)} className={selClass}>
          {Object.entries(TIERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {mode === "ranked" && (
          <div className="flex gap-1 ml-2">
            {Object.entries(POSITIONS).map(([k, v]) => (
              <button key={k} onClick={() => setPosition(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  position === k ? "bg-[#0AB4FF]/20 text-[#0AB4FF] border border-[#0AB4FF]/30" : "text-[#8E9CBA] hover:text-white"
                }`}>{v}</button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <div className="w-6 h-4 bg-slate-800 rounded" />
              <div className="w-10 h-10 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-2"><div className="h-4 w-20 bg-slate-800 rounded" /><div className="h-3 w-32 bg-slate-800 rounded" /></div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => {
            const ti = TIER_BADGES[c.displayTier] || TIER_BADGES[5];
            const champ = keyMap.get(c.id);
            return (
              <div key={c.id} onClick={() => champ && navigate(`/analytics/${champ.id}`)}
                className={`glass-card-hover p-4 flex items-center gap-3 cursor-pointer ${!champ ? "opacity-50 pointer-events-none" : ""}`}>
                <span className="text-sm font-bold text-[#8E9CBA] w-6 text-right tabular-nums">{c.displayRank || "-"}</span>
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#040B1A] border border-white/10 shrink-0">
                  {champ && <Image src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`} alt={champ.name} fill className="object-cover object-top" unoptimized />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">{champ?.name || `ID ${c.id}`}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ti.color} ${ti.bg}`}>{ti.text}</span>
                  </div>
                  <div className="flex gap-2.5 mt-1 text-xs text-[#8E9CBA]">
                    <span>胜率 <span className="text-white font-medium">{(c.displayStats.win_rate * 100).toFixed(1)}%</span></span>
                    <span>登场 <span className="text-white font-medium">{(c.displayStats.pick_rate * 100).toFixed(1)}%</span></span>
                    <span>Ban <span className="text-red-400 font-medium">{(c.displayStats.ban_rate * 100).toFixed(1)}%</span></span>
                    <span>KDA <span className="text-[#7DD8FF] font-medium">{c.displayStats.kda?.toFixed(2) || "-"}</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && filtered.length === 0 && <div className="text-center py-20"><p className="text-[#8E9CBA]">暂无数据</p></div>}
    </div>
  );
}
