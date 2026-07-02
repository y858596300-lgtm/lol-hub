"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import SkinCard from "@/components/SkinCard";
import SkinViewer from "@/components/SkinViewer";
import StarRating from "@/components/StarRating";
import { fetchVersions, fetchChampionDetail } from "@/lib/api";
import { getSplashUrl, getDdragonSplashUrl, getDdragonLoadingUrl, getCommunityDragonChromaUrl } from "@/lib/cdn";
import type { ChampionDetail, ComparePoolItem } from "@/lib/types";
import { getComparePool, saveComparePool, buildFallbackMap } from "@/lib/utils";

interface HeroDetailProps {
  id: string;
  navigate: (hash: string) => void;
}

export default function HeroDetail({ id, navigate }: HeroDetailProps) {
  const [champion, setChampion] = useState<ChampionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"splash" | "loading">("splash");
  const [comparePool, setComparePool] = useState<ComparePoolItem[]>([]);

  useEffect(() => {
    setComparePool(getComparePool());
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setNotFoundError(false);
    async function load() {
      try {
        const ver = await fetchVersions();
        if (!ver) throw new Error("Version fetch failed");
        const data = await fetchChampionDetail(id, ver);
        if (!data) {
          setNotFoundError(true);
          return;
        }
        setChampion(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const toggleCompare = (item: ComparePoolItem) => {
    const pool = getComparePool();
    const exists = pool.findIndex(
      (p) => p.championId === item.championId && p.skinNum === item.skinNum
    );
    if (exists >= 0) {
      pool.splice(exists, 1);
    } else {
      if (pool.length >= 4) {
        alert("对比池已满，请先移除一些皮肤");
        return;
      }
      pool.push(item);
    }
    saveComparePool(pool);
    setComparePool([...pool]);
  };

  // Precompute fallback map + skin URLs (must be before any early return)
  const fallbackMap = useMemo(
    () => champion ? buildFallbackMap(champion.skins) : new Map<number, number>(),
    [champion]
  );
  const skinUrlData = useMemo(() => {
    if (!champion) return [] as { splashUrl: string; loadingUrl: string; fallbackSplashUrl: string; fallbackLoadingUrl: string; chromaUrl: string }[];
    const championKey = champion.key;
    return champion.skins.map((skin) => {
      const fallbackNum = fallbackMap.get(skin.num) ?? 0;
      return {
        splashUrl: getDdragonSplashUrl(champion.id, skin.num),
        loadingUrl: getDdragonLoadingUrl(champion.id, skin.num),
        fallbackSplashUrl: getDdragonSplashUrl(champion.id, fallbackNum),
        fallbackLoadingUrl: getDdragonLoadingUrl(champion.id, fallbackNum),
        chromaUrl: getCommunityDragonChromaUrl(championKey, skin.num),
      };
    });
  }, [champion, fallbackMap]);

  if (notFoundError) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🔍</p>
        <p className="text-xl text-slate-400 mb-2">英雄不存在</p>
        <p className="text-slate-600 mb-6">
          未找到英雄 &quot;{id}&quot; 的数据
        </p>
        <button onClick={() => navigate("/")} className="btn-primary">
          返回首页
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">数据加载失败</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          重新加载
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-slate-800 rounded-xl" />
        <div className="h-6 w-48 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card">
              <div className="aspect-video bg-slate-800 rounded-t-xl" />
              <div className="p-3 h-10 bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!champion) return null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
      >
        ← 返回英雄列表
      </button>

      {/* Hero Banner — ghostly semi-transparent splash */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-[#040B1A]">
        {/* Ghost splash art */}
        <Image
          src={bannerError
            ? getDdragonSplashUrl(champion.id, 0)
            : getSplashUrl(champion.id)}
          alt={champion.name}
          fill
          sizes="100vw"
          className="object-cover object-top opacity-70 scale-110"
          priority
          unoptimized
          onError={() => setBannerError(true)}
        />
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040B1A] via-[#040B1A]/20 to-transparent" />
        {/* Crystal line accent */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#0AB4FF]/40 to-transparent" />
        {/* Text */}
        <div className="absolute bottom-6 left-6">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-wide">
            {champion.name}
          </h1>
          <p className="text-[#7DD8FF] text-base mt-2 font-light tracking-wider">
            {champion.title}
          </p>
        </div>
      </div>

      {/* Lore */}
      {champion.lore && (
        <p className="text-slate-500 text-sm leading-relaxed italic border-l-2 border-cyan-400/30 pl-4">
          {champion.lore}
        </p>
      )}

      {/* View mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode("splash")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
            viewMode === "splash"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          原画
        </button>
        <button
          onClick={() => setViewMode("loading")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
            viewMode === "loading"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          加载画面
        </button>
        <span className="text-slate-600 text-sm ml-auto">
          {champion.skins.length} 款皮肤
        </span>
      </div>

      {/* Skin Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {champion.skins.map((skin, idx) => {
            const urls = skinUrlData[idx];
            return (
          <div key={skin.id}>
            <SkinCard
              splashUrl={viewMode === "splash" ? urls.splashUrl : urls.loadingUrl}
              chromaUrl={urls.chromaUrl}
              fallbackUrl={viewMode === "splash" ? urls.fallbackSplashUrl : urls.fallbackLoadingUrl}
              skinName={skin.name}
              skinNum={skin.num}
              mode={viewMode}
              priority={idx < 3}
              onClick={() => {
                setViewerIndex(idx);
                setViewerOpen(true);
              }}
            />
            <div className="mt-1 px-1">
              <StarRating championId={champion.id} skinNum={skin.num} />
            </div>
          </div>
          );
        })}
      </div>

      {/* Lightbox Viewer */}
      {viewerOpen && (
        <SkinViewer
          skins={champion.skins}
          championId={champion.id}
          championKey={champion.key}
          championName={champion.name}
          currentIndex={viewerIndex}
          mode={viewMode}
          comparePool={comparePool}
          onClose={() => setViewerOpen(false)}
          onPrev={() =>
            setViewerIndex(
              (viewerIndex - 1 + champion.skins.length) % champion.skins.length
            )
          }
          onNext={() =>
            setViewerIndex((viewerIndex + 1) % champion.skins.length)
          }
          onToggleCompare={toggleCompare}
        />
      )}
    </div>
  );
}
