"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface SkinCardProps {
  splashUrl: string;
  chromaUrl?: string;
  fallbackUrl: string;
  skinName: string;
  skinNum: number;
  mode?: "splash" | "loading";
  priority?: boolean;
  onClick: () => void;
}

function useInView() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
}

export default function SkinCard({
  splashUrl,
  chromaUrl,
  fallbackUrl,
  skinName,
  skinNum,
  mode = "splash",
  priority = false,
  onClick,
}: SkinCardProps) {
  const [errorLevel, setErrorLevel] = useState(0); // 0=try splash, 1=try chroma, 2=fallback
  const [containerRef, inView] = useInView();

  const isChroma = errorLevel === 1 && chromaUrl;
  const displayName =
    skinNum === 0 ? "默认皮肤" : skinName || `皮肤 ${skinNum}`;

  const src =
    errorLevel === 2 ? fallbackUrl
    : isChroma ? chromaUrl
    : splashUrl;

  const handleError = () => {
    if (errorLevel === 0 && chromaUrl) {
      setErrorLevel(1);
    } else {
      setErrorLevel(2);
    }
  };

  // Preload chroma + fallback only when card is near viewport
  useEffect(() => {
    if (!inView) return;
    if (chromaUrl) {
      const preload = new window.Image();
      preload.onerror = () => {};
      preload.src = chromaUrl;
    }
    const preload = new window.Image();
    preload.onerror = () => {};
    preload.src = fallbackUrl;
  }, [chromaUrl, fallbackUrl, inView]);

  const aspectClass = mode === "loading" && !isChroma ? "aspect-[9/16]" : "aspect-[16/9]";
  const imgClass = isChroma ? "object-contain p-2" : "object-cover object-top";

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="glass-card-hover overflow-hidden cursor-pointer group"
    >
      <div className={`relative overflow-hidden bg-[#040B1A] ${aspectClass}`}>
        <Image
          src={src}
          alt={displayName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`${imgClass} group-hover:scale-105 transition-transform duration-500`}
          unoptimized
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onError={handleError}
          key={`${errorLevel}-${mode}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3">
        <p className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">
          {displayName}
        </p>
      </div>
    </div>
  );
}
