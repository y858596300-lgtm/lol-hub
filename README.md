# LOL Hub · 海克斯科技

英雄联盟一站式工具站。皮肤预览、对战数据分析、出装符文推荐、皮肤对比评分。

数据来自 Riot Data Dragon 与 OP.GG，纯前端，无需登录。

## 功能

- 🎨 **皮肤浏览** — 浏览全部 170+ 英雄的皮肤原画与加载画面，支持炫彩显示
- 📊 **英雄分析** — OP.GG 对战数据：胜率、登场率、Ban 率、KDA、Tier 排名
- 🛠️ **出装符文** — 推荐符文、核心出装、召唤师技能、技能加点、对位克制
- ⚔️ **皮肤对比** — 任意皮肤并排对比，跨英雄对比
- ⭐ **评分收藏** — 给皮肤打分，本地存储

## 开发

```bash
npm install
npm run dev       # 启动开发服务器 → http://localhost:3000
npm run build     # 静态导出 → out/
npm run lint      # 代码检查
```

技术栈：Next.js 14 + TypeScript + Tailwind CSS，静态 SPA 部署于 GitHub Pages。

## 部署

```bash
npm run build
cd out && git init && git add -A && git commit -m "Deploy"
git push -f origin HEAD:gh-pages
```

---

## LOL Hub · Hextech

An all-in-one League of Legends tool. Skin browser, champion analytics, build recommendations, skin comparison.

Data sourced from Riot Data Dragon and OP.GG. Pure frontend, no login required.

### Features

- 🎨 **Skin Browser** — Browse splash arts and loading screens for all 170+ champions, including chroma variants
- 📊 **Champion Analytics** — OP.GG stats: win rate, pick rate, ban rate, KDA, tier rankings
- 🛠️ **Builds & Runes** — Recommended runes, core items, summoner spells, skill orders, matchups
- ⚔️ **Skin Compare** — Side-by-side comparison of any skins, cross-champion supported
- ⭐ **Ratings** — Rate skins, stored locally

### Tech Stack

Next.js 14 + TypeScript + Tailwind CSS, static SPA deployed on GitHub Pages.
