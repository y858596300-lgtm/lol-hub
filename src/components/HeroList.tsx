"use client";

import { useEffect, useState } from "react";
import HeroCard from "@/components/HeroCard";
import SearchBar from "@/components/SearchBar";
import { fetchVersions, fetchChampions } from "@/lib/api";
import type { ChampionListEntry } from "@/lib/types";

interface HeroListProps {
  navigate: (hash: string) => void;
}

export default function HeroList({ navigate }: HeroListProps) {
  const [champions, setChampions] = useState<ChampionListEntry[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "name" | "id">("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const ver = await fetchVersions();
        if (!ver) throw new Error("Version fetch failed");

        const data = await fetchChampions(ver);
        if (!data) throw new Error("Champions fetch failed");
        setChampions(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = champions
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name, "zh");
      if (sortBy === "id") return a.id.localeCompare(b.id);
      return 0; // default: API order
    });

  const sortOptions = [
    { key: "default" as const, label: "默认" },
    { key: "name" as const, label: "中文名 A-Z" },
    { key: "id" as const, label: "英文名 A-Z" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            英雄列表
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-px w-8 bg-gradient-to-r from-[#0AB4FF]/50 to-transparent" />
            {loading ? (
              <span className="text-sm text-[#8E9CBA] font-light animate-pulse">
                加载中...
              </span>
            ) : (
              <span className="text-sm text-[#8E9CBA] font-light">
                共{" "}
                <span className="text-[#0AB4FF] font-medium">
                  {search ? filtered.length : champions.length}
                </span>{" "}
                位英雄
              </span>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "default" | "name" | "id")}
              className="bg-[#040B1A]/60 border border-[#8E9CBA]/20 rounded-lg text-xs text-[#8E9CBA] px-2 py-1 focus:outline-none focus:border-[#0AB4FF]/40 cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Error */}
      {error && (
        <div className="text-center py-24">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-[#8E9CBA]/20
                        flex items-center justify-center">
            <svg className="w-5 h-5 text-[#8E9CBA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-[#8E9CBA] mb-6 font-light">数据加载失败，请检查网络后重试</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            重新加载
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-slate-800/50" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-2/3 bg-slate-800/50 rounded mx-auto" />
                <div className="h-3 w-1/2 bg-slate-800/30 rounded mx-auto" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty search */}
      {!loading && !error && search && filtered.length === 0 && (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-[#8E9CBA] text-lg font-light">
            未找到英雄 &quot;{search}&quot;
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-sm text-[#0AB4FF] hover:text-[#7DD8FF] mt-3 transition-colors"
          >
            清除搜索
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/hero/${c.id}`)}
            >
              <HeroCard
                id={c.id}
                name={c.name}
                title={c.title}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
