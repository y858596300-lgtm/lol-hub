"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchChampionAnalysis, type OpggDetail, type OpggBuild } from "@/lib/opgg";
import { fetchVersions, fetchChampionDetail as fetchDdragonDetail, fetchChampions, buildGameDataMaps } from "@/lib/api";
import { getSplashUrl } from "@/lib/cdn";
import type { ChampionDetail } from "@/lib/types";

interface Props { id: string; navigate: (hash: string) => void; }

async function buildCounterData(ids: number[]): Promise<Map<number, { name: string; id: string }>> {
  const map = new Map<number, { name: string; id: string }>();
  if (!ids.length) return map;
  const ver = await fetchVersions(); if (!ver) return map;
  const champs = await fetchChampions(ver); if (!champs) return map;
  for (const c of champs) {
    const key = parseInt(c.key);
    if (ids.includes(key)) map.set(key, { name: c.name, id: c.id });
  }
  return map;
}

async function getChampionKey(id: string): Promise<number | null> {
  const ver = await fetchVersions(); if (!ver) return null;
  const champs = await fetchChampions(ver); if (!champs) return null;
  const found = champs.find(c => c.id === id); return found ? parseInt(found.key) : null;
}

type MapWithIcons = Map<number, { name: string; icon: string }>;

function BuildRow({ build, index, label, nameMap }: { build: OpggBuild; index?: number; label?: string; nameMap: MapWithIcons }) {
  const wr = (build.win / (build.play || 1) * 100).toFixed(1);
  return (
    <div className="flex items-center gap-2 text-sm py-1.5">
      {index != null && <span className="text-[#8E9CBA] w-5 text-xs text-right shrink-0">{index}</span>}
      {label && <span className="text-[#8E9CBA] text-xs shrink-0">{label}</span>}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {build.ids?.map((id, i) => {
          const d = nameMap.get(id);
          return (
            <span key={id} className="flex items-center gap-1">
              {i > 0 && <span className="text-[#8E9CBA]/40 text-xs">&gt;</span>}
              <span className="flex items-center gap-1 bg-[#040B1A] rounded px-1.5 py-0.5 border border-white/5">
                {d?.icon && <img src={d.icon} alt="" className="w-5 h-5 rounded" loading="lazy" />}
                <span className="text-white text-xs">{d?.name || `#${id}`}</span>
              </span>
            </span>
          );
        })}
      </div>
      <span className="text-[#8E9CBA] text-xs shrink-0">{(build.pick_rate * 100).toFixed(1)}%</span>
      <span className={`text-xs font-medium shrink-0 w-12 text-right ${parseFloat(wr) >= 50 ? "text-green-400" : "text-red-400"}`}>{wr}%</span>
    </div>
  );
}

export default function AnalyticsDetail({ id, navigate }: Props) {
  const [champion, setChampion] = useState<ChampionDetail | null>(null);
  const [version, setVersion] = useState("");
  const [analysis, setAnalysis] = useState<OpggDetail | null>(null);
  const [gameMaps, setGameMaps] = useState<import("@/lib/api").GameDataMaps | null>(null);
  const [loading, setLoading] = useState(true);

  // Build champion key → name map for counters
  const [counterData, setCounterData] = useState<Map<number, { name: string; id: string }>>(new Map());
  useEffect(() => {
    if (!analysis || !analysis.counters) return;
    buildCounterData(analysis.counters.map(c => c.champion_id)).then(setCounterData);
  }, [analysis]);

  useEffect(() => {
    async function load() {
      const ver = await fetchVersions(); if (!ver) { setLoading(false); return; }
      setVersion(ver);
      const [detail, maps] = await Promise.all([fetchDdragonDetail(id, ver), buildGameDataMaps()]);
      if (!detail) { setLoading(false); return; }
      setChampion(detail);
      setGameMaps(maps);
      const key = await getChampionKey(id);
      if (key) {
        const data = await fetchChampionAnalysis(key, "global", "ranked", "all", "mid");
        setAnalysis(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="space-y-6 animate-pulse"><div className="h-48 bg-slate-800 rounded-xl" /><div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card p-6 h-24" />)}</div></div>;
  if (!champion) return <div className="text-center py-20"><p className="text-[#8E9CBA]">英雄数据加载失败</p><button onClick={() => navigate("/analytics")} className="btn-primary mt-4">返回分析页</button></div>;

  const starterItems = analysis?.starter_items || [];
  const bootsItems = analysis?.boots || [];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/analytics")} className="text-[#8E9CBA] hover:text-white transition-colors text-sm">← 返回分析列表</button>

      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-[#040B1A]">
        <Image
          src={getSplashUrl(champion.id)}
          alt={champion.name}
          fill
          sizes="100vw"
          className="object-cover object-top opacity-50"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040B1A] via-[#040B1A]/20 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-wide">{champion.name}</h1>
          <p className="text-[#7DD8FF] text-base mt-2 font-light tracking-wider">{champion.title} · 英雄分析</p>
        </div>
      </div>

      {!analysis ? (
        <div className="text-center py-12 glass-card"><p className="text-[#8E9CBA]">暂无分析数据</p></div>
      ) : (
        <>
          {/* Skill order */}
          {analysis.skills && analysis.skills.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">技能加点</h3>
              <div className="space-y-3">
                {analysis.skills.slice(0, 3).map((skill, i) => {
                  const wr = (skill.win / (skill.play || 1) * 100).toFixed(1);
                  return (
                    <div key={i} className="text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#8E9CBA]">#{i + 1}</span>
                        <span className="text-[#8E9CBA]">登场 {(skill.pick_rate * 100).toFixed(1)}%</span>
                        <span className={`font-medium ${parseFloat(wr) >= 50 ? "text-green-400" : "text-red-400"}`}>{wr}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1 font-mono">
                        {skill.order.map((s, j) => (
                          <span key={j} className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-bold ${j >= 15 ? "bg-[#8E9CBA]/10 text-[#8E9CBA]" : "bg-[#0AB4FF]/10 text-[#0AB4FF]"}`}>{s}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Runes */}
          {analysis.runes && analysis.runes.length > 0 && gameMaps && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">推荐符文</h3>
              <div className="space-y-3">
                {analysis.runes.slice(0, 3).map((rune, i) => {
                  const wr = (rune.win / (rune.play || 1) * 100).toFixed(1);
                  return (
                    <div key={i} className="text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#8E9CBA]">#{i + 1}</span>
                        <span className="text-[#8E9CBA]">登场 {(rune.pick_rate * 100).toFixed(1)}%</span>
                        <span className={`font-medium ${parseFloat(wr) >= 50 ? "text-green-400" : "text-red-400"}`}>{wr}%</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {rune.primary_rune_ids?.map(id => {
                          const d = gameMaps.runeMap.get(id);
                          return <span key={id} className="flex items-center gap-1 bg-[#040B1A] rounded px-1.5 py-0.5 border border-white/5">{d?.icon && <img src={d.icon} alt="" className="w-4 h-4 rounded" />}<span className="text-white">{d?.name || `#${id}`}</span></span>;
                        })}
                        {rune.secondary_rune_ids && rune.secondary_rune_ids.length > 0 && (
                          <>
                            <span className="text-[#8E9CBA]/40 text-[10px] px-1">+</span>
                            {rune.secondary_rune_ids.map(id => {
                              const d = gameMaps.runeMap.get(id);
                              return <span key={id} className="flex items-center gap-1 bg-[#040B1A] rounded px-1.5 py-0.5 border border-white/5 opacity-70">{d?.icon && <img src={d.icon} alt="" className="w-4 h-4 rounded" />}<span className="text-white">{d?.name || `#${id}`}</span></span>;
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summoner spells */}
          {analysis.summoner_spells && analysis.summoner_spells.length > 0 && gameMaps && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">召唤师技能</h3>
              <div className="space-y-2">
                {analysis.summoner_spells.slice(0, 3).map((sp, i) => {
                  const wr = (sp.win / (sp.play || 1) * 100).toFixed(1);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[#8E9CBA] text-xs w-4">{i + 1}</span>
                      <div className="flex items-center gap-1.5">
                        {sp.ids?.map(id => {
                          const d = gameMaps.spellMap.get(id);
                          return <span key={id} className="flex items-center gap-1 bg-[#040B1A] rounded px-1.5 py-0.5 border border-white/5">{d?.icon && <img src={d.icon} alt="" className="w-5 h-5 rounded" />}<span className="text-white text-xs">{d?.name || `#${id}`}</span></span>;
                        })}
                      </div>
                      <span className="text-[#8E9CBA] text-xs">{(sp.pick_rate * 100).toFixed(1)}%</span>
                      <span className={`text-xs font-medium ${parseFloat(wr) >= 50 ? "text-green-400" : "text-red-400"}`}>{wr}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core items */}
          {analysis.core_items && analysis.core_items.length > 0 && gameMaps && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-2">核心出装</h3>
              {analysis.core_items.slice(0, 6).map((b, i) => <BuildRow key={i} index={i + 1} build={b} nameMap={gameMaps.itemMap} />)}
            </div>
          )}

          {/* Starter + Boots — side by side */}
          {((starterItems.length > 0 || bootsItems.length > 0)) && gameMaps && (
            <div className="grid grid-cols-2 gap-4">
              {starterItems.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">出门装</h3>
                  {starterItems.slice(0, 5).map((s, i) => <BuildRow key={`s${i}`} index={i + 1} build={s} nameMap={gameMaps.itemMap} />)}
                </div>
              )}
              {bootsItems.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">鞋子</h3>
                  {bootsItems.slice(0, 5).map((b, i) => <BuildRow key={`b${i}`} index={i + 1} build={b} nameMap={gameMaps.itemMap} />)}
                </div>
              )}
            </div>
          )}

          {/* Counters */}
          {analysis.counters && analysis.counters.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">对位克制 <span className="text-[#8E9CBA] font-normal">（对线胜率）</span></h3>
              <div className="flex flex-wrap gap-2">
                {analysis.counters.slice(0, 18).map(c => {
                  const wr = (c.win / (c.play || 1) * 100).toFixed(0);
                  const isGood = parseFloat(wr) >= 50;
                  const cd = counterData.get(c.champion_id);
                  const name = cd?.name || `#${c.champion_id}`;
                  return (
                    <span key={c.champion_id}
                      onClick={() => cd && navigate(`/analytics/${cd.id}`)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-all hover:scale-105 ${
                      isGood ? "bg-green-400/10 border-green-400/30 text-green-400 hover:bg-green-400/20" : "bg-red-400/10 border-red-400/30 text-red-400 hover:bg-red-400/20"
                    }`}>
                      {cd && <div className="w-5 h-5 rounded-full overflow-hidden bg-[#040B1A] border border-white/5 shrink-0"><img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${cd.id}.png`} alt="" className="w-full h-full object-cover" /></div>}
                      <span>{name}</span>
                      <span className="opacity-70">{wr}%</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
