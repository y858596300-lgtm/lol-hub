import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOL Hub — 海克斯科技",
  description:
    "LOL 英雄皮肤预览、对战数据分析、出装符文推荐、皮肤对比评分。数据来自 Riot Data Dragon 与 OP.GG。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#050a14] antialiased">
        {children}
        <footer className="relative z-10 border-t border-slate-800/50 py-6 text-center text-slate-500 text-sm">
          <p>
            LOL Hub 与 Riot Games 无关。皮肤数据来自{" "}
            <a
              href="https://developer.riotgames.com/docs/lol#data-dragon"
              target="_blank"
              rel="noopener"
              className="text-cyan-400 hover:underline"
            >
              Riot Data Dragon
            </a>
            。
          </p>
        </footer>
      </body>
    </html>
  );
}
