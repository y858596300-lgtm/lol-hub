#!/usr/bin/env node
/**
 * Download all champion default splash arts to public/splash/
 * Usage: node scripts/download-splashes.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "splash");

const BASE = "https://ddragon.leagueoflegends.com";

async function main() {
  // Get version
  const versionsRes = await fetch(`${BASE}/api/versions.json`);
  const versions = await versionsRes.json();
  const version = versions[0];
  console.log(`Version: ${version}`);

  // Get champion list
  const champsRes = await fetch(`${BASE}/cdn/${version}/data/zh_CN/champion.json`);
  const champsData = await champsRes.json();
  const champions = Object.keys(champsData.data);
  console.log(`Champions: ${champions.length}`);

  // Create output dir
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Download each splash art
  let downloaded = 0;
  for (const id of champions) {
    const url = `${BASE}/cdn/img/champion/splash/${id}_0.jpg`;
    const filePath = path.join(OUT_DIR, `${id}.jpg`);

    if (fs.existsSync(filePath)) {
      console.log(`[skip] ${id}`);
      downloaded++;
      continue;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buf);
      downloaded++;
      console.log(`[${downloaded}/${champions.length}] ${id} (${(buf.length / 1024).toFixed(0)}KB)`);
    } catch (e) {
      console.error(`[fail] ${id}: ${e.message}`);
    }
  }

  console.log(`\nDone! ${downloaded} splash arts saved to ${OUT_DIR}`);
}

main();
