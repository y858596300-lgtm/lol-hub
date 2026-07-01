/**
 * Local dev proxy for OP.GG MCP
 * Usage: node worker/dev-proxy.mjs
 * Listens on port 8787, same API as the Cloudflare Worker
 */
import http from "http";

const MCP_URL = "https://mcp-api.op.gg/mcp";
const PORT = 8787;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function callMCP(toolName, args) {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: toolName, arguments: args },
  });

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    return { error: `MCP returned ${res.status}` };
  }

  const json = await res.json();
  if (json.error) {
    return { error: json.error.message || "MCP error" };
  }

  const content = json.result?.content || [];
  const textPart = content.find((c) => c.type === "text");
  if (textPart) {
    try {
      return { data: JSON.parse(textPart.text) };
    } catch {
      // Not JSON — try to parse repr format
      const parsed = parseRepr(textPart.text);
      if (parsed !== null) return { data: parsed };
      return { data: textPart.text };
    }
  }

  return { data: json.result };
}

/**
 * Parse OP.GG MCP's Python-like repr into JSON.
 * Format: Mid("champion",false,plays,wins,kills,win_rate,pick_rate,role_rate,ban_rate,kda,tier,rank,rank_prev,rank_prev_patch)
 */
function parseRepr(text) {
  // Find the data instance — the last line is the data
  const lines = text.split("\n");
  const dataLine = lines.find((l) => /^\w+\(/.test(l));
  if (!dataLine) return null;

  // Extract all constructor calls like Mid("name",...)
  const midRegex = /Mid\("([^"]+)",(true|false),(\d+),(\d+),(\d+),([\d.]+),([\d.]+),([\d.]+),([\d.]+),([\d.]+),(\d+),(\d+),(\d+),([\d.]+|null)\)/g;

  const champions = [];
  let match;
  while ((match = midRegex.exec(dataLine)) !== null) {
    const [, name, isRip, play, win, kill, winRate, pickRate, roleRate, banRate, kda, tier, rank, rankPrev, rankPrevPatch] = match;
    champions.push({
      champion: name,
      is_rip: isRip === "true",
      play: parseInt(play),
      win: parseInt(win),
      kill: parseInt(kill),
      win_rate: parseFloat(winRate),
      pick_rate: parseFloat(pickRate),
      role_rate: parseFloat(roleRate),
      ban_rate: parseFloat(banRate),
      kda: parseFloat(kda),
      tier: parseInt(tier),
      rank: parseInt(rank),
      rank_prev: parseInt(rankPrev),
      rank_prev_patch: rankPrevPatch === "null" ? null : parseFloat(rankPrevPatch),
    });
  }

  return champions.length > 0 ? { champions } : null;
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  let result;

  try {
    if (path === "/meta") {
      const position = url.searchParams.get("position") || "all";
      console.log(`[proxy] /meta position=${position}`);
      result = await callMCP("lol_list_lane_meta_champions", {
        position,
        game_mode: "ranked",
        lang: "zh_CN",
      });
    } else if (path === "/analysis") {
      const champion = url.searchParams.get("champion");
      const position = url.searchParams.get("position") || "all";
      if (!champion) {
        result = { error: "Missing champion parameter" };
      } else {
        console.log(`[proxy] /analysis champion=${champion} position=${position}`);
        result = await callMCP("lol_get_champion_analysis", {
          champion,
          position,
          game_mode: "ranked",
          lang: "zh_CN",
        });
      }
    } else {
      result = { error: "Unknown endpoint" };
    }
  } catch (e) {
    result = { error: e.message };
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(result));
});

server.listen(PORT, () => {
  console.log(`OP.GG proxy running at http://localhost:${PORT}`);
});
