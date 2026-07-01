"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import type { Skin, ComparePoolItem } from "@/lib/types";
import { getFallbackSkinNum } from "@/lib/utils";

interface SkinViewerProps {
  skins: Skin[];
  championId: string;
  championKey: string;
  championName: string;
  currentIndex: number;
  mode: "splash" | "loading";
  comparePool: ComparePoolItem[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleCompare: (item: ComparePoolItem) => void;
}

export default function SkinViewer({
  skins,
  championId,
  championKey,
  championName,
  currentIndex,
  mode,
  comparePool,
  onClose,
  onPrev,
  onNext,
  onToggleCompare,
}: SkinViewerProps) {
  const [imgError, setImgError] = useState(0); // 0=ok, 1=try chroma, 2=fallback

  const skin = skins[currentIndex];
  const total = skins.length;

  // Reset error state when skin changes
  useEffect(() => {
    setImgError(0);
  }, [currentIndex, mode]);

  const isInPool = comparePool.some(
    (item) =>
      item.championId === championId && item.skinNum === skin?.num
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  // Preload chroma + fallback for current skin so they're cached on error
  useEffect(() => {
    if (!skin) return;
    const fullSkinId = parseInt(championKey) * 1000 + skin.num;
    const cUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-chroma-images/${championKey}/${fullSkinId}.png`;
    const fNum = skin.chromas ? skin.num : getFallbackSkinNum(skins, skin.num);
    const fUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/${mode === "splash" ? "splash" : "loading"}/${championId}_${fNum}.jpg`;
    new window.Image().src = cUrl;
    new window.Image().src = fUrl;
  }, [skin, championKey, championId, mode, skins]);

  if (!skin) return null;

  // Build URLs
  const splashDdragon = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skin.num}.jpg`;
  const loadingDdragon = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_${skin.num}.jpg`;
  const fullSkinId = parseInt(championKey) * 1000 + skin.num;
  const chromaUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-chroma-images/${championKey}/${fullSkinId}.png`;

  const fallbackNum = skin.chromas ? skin.num : getFallbackSkinNum(skins, skin.num);
  const fallbackSplash = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${fallbackNum}.jpg`;
  const fallbackLoading = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_${fallbackNum}.jpg`;

  const primaryUrl = mode === "splash" ? splashDdragon : loadingDdragon;
  const fallbackUrl = mode === "splash" ? fallbackSplash : fallbackLoading;

  let imageUrl: string;
  if (imgError === 2) {
    imageUrl = fallbackUrl;
  } else if (imgError === 1 && mode === "splash") {
    imageUrl = chromaUrl;
  } else {
    imageUrl = primaryUrl;
  }

  const displayName =
    skin.num === 0 ? "默认皮肤" : skin.name || `皮肤 ${skin.num}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-slate-400 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>

        {/* Image */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={displayName}
            fill
            sizes="100vw"
            className={imgError === 1 ? "object-contain p-8" : "object-contain"}
            priority
            unoptimized
            onError={() => setImgError((prev) => prev === 0 ? 1 : 2)}
          />
        </div>

        {/* Navigation */}
        <button
          onClick={onPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10
                     flex items-center justify-center bg-slate-800/80 hover:bg-slate-700
                     text-white rounded-full transition-colors text-lg"
        >
          ‹
        </button>
        <button
          onClick={onNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10
                     flex items-center justify-center bg-slate-800/80 hover:bg-slate-700
                     text-white rounded-full transition-colors text-lg"
        >
          ›
        </button>

        {/* Info bar */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">{displayName}</p>
            <p className="text-slate-500 text-sm">
              {championName} · {currentIndex + 1}/{total}
            </p>
          </div>
          <button
            onClick={() =>
              onToggleCompare({
                championId,
                championName,
                skinNum: skin.num,
                skinName: displayName,
              })
            }
            className={isInPool ? "btn-ghost text-sm" : "btn-primary text-sm"}
          >
            {isInPool ? "移出对比" : "加入对比"}
          </button>
        </div>
      </div>
    </div>
  );
}
