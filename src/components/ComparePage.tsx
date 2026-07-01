"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import StarRating from "@/components/StarRating";
import type { ComparePoolItem } from "@/lib/types";
import { getComparePool, saveComparePool } from "@/lib/utils";

interface ComparePageProps {
  navigate: (hash: string) => void;
}

export default function ComparePage({ navigate }: ComparePageProps) {
  const [pool, setPool] = useState<ComparePoolItem[]>([]);
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(1);

  useEffect(() => {
    setPool(getComparePool());
  }, []);

  const clearPool = () => {
    saveComparePool([]);
    setPool([]);
  };

  const removeFromPool = (item: ComparePoolItem) => {
    const updated = pool.filter(
      (p) =>
        !(p.championId === item.championId && p.skinNum === item.skinNum)
    );
    saveComparePool(updated);
    setPool(updated);
    setLeftIdx(0);
    setRightIdx(Math.min(1, updated.length - 1));
  };

  if (pool.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🔬</p>
        <p className="text-xl text-white mb-2">对比池为空</p>
        <p className="text-slate-500 mb-6">
          在皮肤详情页选择皮肤，点击「加入对比」即可开始对比
        </p>
        <button onClick={() => navigate("/")} className="btn-primary">
          浏览英雄
        </button>
      </div>
    );
  }

  const left = pool[leftIdx];
  const right = pool[rightIdx];

  const leftUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${left.championId}_${left.skinNum}.jpg`;
  const rightUrl = right
    ? `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${right.championId}_${right.skinNum}.jpg`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">皮肤对比</h1>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm">对比池 ({pool.length}/4)</span>
          {pool.length > 0 && (
            <button onClick={clearPool} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">
              清空
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-xs text-slate-500 mb-1 block">左侧皮肤</label>
          <select
            value={leftIdx}
            onChange={(e) => setLeftIdx(Number(e.target.value))}
            className="w-full p-2 bg-slate-800/80 border border-slate-700/50 rounded-lg text-white text-sm
                       focus:outline-none focus:border-cyan-400/50"
          >
            {pool.map((item, idx) => (
              <option key={`${item.championId}_${item.skinNum}`} value={idx}>
                {item.championName} - {item.skinName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-500 mb-1 block">右侧皮肤</label>
          <select
            value={rightIdx}
            onChange={(e) => setRightIdx(Number(e.target.value))}
            className="w-full p-2 bg-slate-800/80 border border-slate-700/50 rounded-lg text-white text-sm
                       focus:outline-none focus:border-cyan-400/50"
          >
            {pool.map((item, idx) => (
              <option key={`${item.championId}_${item.skinNum}`} value={idx}>
                {item.championName} - {item.skinName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left */}
        <div className="glass-card overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={leftUrl}
              alt={left.skinName}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-4 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">{left.championName}</h3>
              <p className="text-slate-400 text-sm">{left.skinName}</p>
              <div className="mt-2">
                <StarRating
                  championId={left.championId}
                  skinNum={left.skinNum}
                  readonly
                />
              </div>
            </div>
            <button
              onClick={() => removeFromPool(left)}
              className="text-slate-600 hover:text-red-400 text-sm transition-colors"
            >
              移除
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="glass-card overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={rightUrl || leftUrl}
              alt={right?.skinName || left.skinName}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-4 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">
                {right?.championName || left.championName}
              </h3>
              <p className="text-slate-400 text-sm">
                {right?.skinName || left.skinName}
              </p>
              {right && (
                <div className="mt-2">
                  <StarRating
                    championId={right.championId}
                    skinNum={right.skinNum}
                    readonly
                  />
                </div>
              )}
            </div>
            {right && (
              <button
                onClick={() => removeFromPool(right)}
                className="text-slate-600 hover:text-red-400 text-sm transition-colors"
              >
                移除
              </button>
            )}
          </div>
        </div>
      </div>

      {pool.length < 2 && (
        <div className="text-center py-6 glass-card">
          <p className="text-slate-500">
            还需添加 {2 - pool.length} 个皮肤才能对比
          </p>
          <button onClick={() => navigate("/")} className="btn-primary mt-3">
            浏览英雄
          </button>
        </div>
      )}

      {pool.length > 1 && pool.length < 4 && (
        <div className="text-center text-slate-600 text-sm">
          提示：最多可添加 4 个皮肤到对比池，当前 {pool.length} 个
        </div>
      )}
    </div>
  );
}
