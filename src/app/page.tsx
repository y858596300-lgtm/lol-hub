"use client";

import { useEffect, useState, useCallback } from "react";
import HeroList from "@/components/HeroList";
import HeroDetail from "@/components/HeroDetail";
import ComparePage from "@/components/ComparePage";
import AnalyticsList from "@/components/AnalyticsList";
import AnalyticsDetail from "@/components/AnalyticsDetail";
import HextechBackground from "@/components/HextechBackground";

type Route =
  | { page: "home" }
  | { page: "hero"; id: string }
  | { page: "compare" }
  | { page: "analytics" }
  | { page: "analytics-detail"; id: string };

function hashToRoute(hash: string): Route {
  const h = hash.startsWith("#") ? hash : "#" + hash;
  if (h.startsWith("#/analytics/")) return { page: "analytics-detail", id: h.slice(12) };
  if (h === "#/analytics") return { page: "analytics" };
  if (h.startsWith("#/hero/")) return { page: "hero", id: h.slice(7) };
  if (h === "#/compare") return { page: "compare" };
  return { page: "home" };
}

function parseHash(): Route {
  if (typeof window === "undefined") return { page: "home" };
  return hashToRoute(window.location.hash);
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [fading, setFading] = useState(false);
  const [route, setRoute] = useState<Route>({ page: "home" });

  useEffect(() => {
    setRoute(parseHash());
    const handler = () => setRoute(parseHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = useCallback((hash: string, opts?: { home?: boolean }) => {
    window.scrollTo(0, 0);
    if ((hash === "/" || hash === "#/") && opts?.home) {
      // Logo/首页 button → landing page
      window.location.hash = "#/";
      setFading(false);
      setEntered(false);
    } else {
      // All other navigation stays in-app
      window.location.hash = hash || "#/";
      if (!entered) {
        setFading(true);
        setTimeout(() => setEntered(true), 600);
      }
      setRoute(hashToRoute(hash || "#/"));
    }
  }, [entered]);

  const handleEnter = () => {
    window.location.hash = "#/";
    const surgeFn = ((window as unknown) as Record<string, unknown>).__hextechSurge as (() => void) | undefined;
    surgeFn?.();
    setTimeout(() => setFading(true), 200);
    setTimeout(() => setEntered(true), 800);
  };

  return (
    <>
      <HextechBackground />

      {/* Landing Page */}
      {!entered && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${fading ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}>
          <div className="text-center space-y-10 px-4 land-enter">
            <div className="flex justify-center">
              <div className="hex-btn hex-pulse w-20 h-20 flex items-center justify-center bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-cyan-400/30">
                <div className="hex-btn w-12 h-12 flex items-center justify-center bg-gradient-to-br from-cyan-400/40 to-purple-500/40 border border-cyan-300/50">
                  <div className="hex-btn w-6 h-6 bg-gradient-to-br from-white to-cyan-300 shadow-lg shadow-cyan-400/50" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="font-black text-4xl md:text-6xl tracking-[0.15em] text-white">LOL HUB</h1>
              <h2 className="font-black text-2xl md:text-4xl tracking-[0.25em] text-[#0AB4FF] mt-1">海克斯科技</h2>
              <p className="font-light text-sm md:text-base tracking-[0.3em] text-[#8E9CBA] mt-6">皮肤预览 · 英雄分析 · 数据对比</p>
            </div>
            <button onClick={handleEnter} className="relative group">
              <div className="hex-btn px-12 py-4 text-base font-semibold tracking-[0.3em] text-white bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 hover:border-cyan-300 hover:from-cyan-500/30 hover:to-purple-500/30 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-300">
                <span className="relative z-10">进入预览</span>
              </div>
              <div className="absolute inset-0 hex-btn bg-cyan-400/5 blur-xl scale-110 group-hover:bg-cyan-400/15 transition-all duration-300" />
            </button>
            <p className="text-[10px] tracking-[0.5em] text-[#8E9CBA]/50">RIOT DATA DRAGON · HEX TECH</p>
          </div>
        </div>
      )}

      {/* Main App */}
      {entered && (
        <div className="animate-in fade-in duration-500">
          <nav className="sticky top-0 z-40 glass-card border-t-0 border-x-0 rounded-none -mx-4 px-4 relative">
            <div className="max-w-7xl mx-auto h-14 flex items-center justify-between">
              <a href="#/" className="flex items-center gap-2 group" onClick={(e) => { e.preventDefault(); navigate("/", { home: true }); }}>
                <span className="text-xl">⚔️</span>
                <span className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">LOL Hub</span>
              </a>
              <div className="flex items-center gap-1">
                <button onClick={() => navigate("/", { home: true })} className="btn-ghost text-sm">首页</button>
                <button onClick={() => navigate("/compare")} className="btn-ghost text-sm">对比</button>
                <button onClick={() => navigate("/analytics")} className="btn-ghost text-sm">分析</button>
              </div>
            </div>
          </nav>
          <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
            {route.page === "home" && <HeroList navigate={navigate} />}
            {route.page === "hero" && <HeroDetail id={route.id} navigate={navigate} />}
            {route.page === "compare" && <ComparePage navigate={navigate} />}
            {route.page === "analytics" && <AnalyticsList navigate={navigate} />}
            {route.page === "analytics-detail" && <AnalyticsDetail id={route.id} navigate={navigate} />}
          </div>
        </div>
      )}
    </>
  );
}
