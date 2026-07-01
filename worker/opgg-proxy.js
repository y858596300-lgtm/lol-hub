/**
 * OP.GG MCP Proxy — Cloudflare Worker
 *
 * Converts REST requests from the frontend into JSON-RPC calls to OP.GG MCP.
 * Adds CORS headers so the browser can call it directly.
 *
 * Local dev: wrangler dev
 * Deploy:    wrangler deploy (when ready)
 */

const MCP_URL = "https://mcp-api.op.gg/mcp";

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

  // Extract text content from MCP response
  const content = json.result?.content || [];
  const textPart = content.find((c) => c.type === "text");
  if (textPart) {
    try {
      return { data: JSON.parse(textPart.text) };
    } catch {
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
  const lines = text.split("\n");
  const dataLine = lines.find((l) => /^\w+\(/.test(l));
  if (!dataLine) return null;

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

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  let result;

  try {
    if (path === "/meta") {
      const position = url.searchParams.get("position") || "all";
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
        result = await callMCP("lol_get_champion_analysis", {
          champion,
          position,
          game_mode: "ranked",
          lang: "zh_CN",
        });
      }
    } else if (path === "/champions") {
      const ids = url.searchParams.get("ids");
      if (!ids) {
        result = { error: "Missing ids parameter" };
      } else {
        const champions = ids.split(",").slice(0, 10);
        result = await callMCP("lol_list_champion_details", {
          champions,
          lang: "zh_CN",
        });
      }
    } else {
      result = { error: "Unknown endpoint. Use /meta, /analysis, or /champions" };
    }
  } catch (e) {
    result = { error: e.message };
  }

  return new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

export default {
  fetch: handleRequest,
};
