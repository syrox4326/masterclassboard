import { AWAY_SQUAD, FORMATIONS, HOME_SQUAD, TEAM_COLORS } from "./constants";
import type { BoardState, Player } from "./types";

type Squad = { number: number | string; name: string }[];

// home team defends the top goal, so its formation is mirrored along the pitch
export function buildFormation(key: string, squad: Squad | null, prefix: "h" | "a", mirror: boolean): Player[] {
  return FORMATIONS[key].map((slot, i) => ({
    id: `${prefix}${i}`,
    number: squad ? squad[i].number : "",
    name: squad ? squad[i].name : "",
    role: slot.role,
    x: slot.x,
    y: mirror ? 105 - slot.y : slot.y,
  }));
}

// keeps names, numbers and vests when the formation changes
export function remapFormation(prev: Player[], key: string, prefix: "h" | "a", mirror: boolean): Player[] {
  return FORMATIONS[key].map((slot, i) => {
    const old = prev[i];
    return {
      id: `${prefix}${i}`,
      number: old ? old.number : "",
      name: old ? old.name : "",
      vest: old ? old.vest ?? null : null,
      role: slot.role,
      x: slot.x,
      y: mirror ? 105 - slot.y : slot.y,
    };
  });
}

// 1..11 players: a keeper plus rows of outfielders
export function buildTeam(count: number, prefix: "h" | "a", mirror: boolean, prev: Player[] = []): Player[] {
  if (count <= 0) return [];
  const ROWS: Record<number, number[]> = { 0: [], 1: [1], 2: [2], 3: [3], 4: [2, 2], 5: [3, 2], 6: [3, 3], 7: [3, 3, 1], 8: [3, 3, 2], 9: [4, 3, 2], 10: [4, 3, 3] };
  const rows = ROWS[count - 1];
  const slots = [{ role: "KL", x: 34, y: 99 }];
  rows.forEach((k, r) => {
    const y = rows.length === 1 ? 82 : 84 - (r * 52) / (rows.length - 1);
    const role = rows.length === 1 ? "MO" : r === 0 ? "STP" : r === rows.length - 1 ? "FV" : "MO";
    for (let i = 0; i < k; i++) slots.push({ role, x: (68 * (i + 1)) / (k + 1), y });
  });
  return slots.map((slot, i) => ({
    id: `${prefix}${i}`,
    number: prev[i] ? prev[i].number : "",
    name: prev[i] ? prev[i].name : "",
    vest: prev[i] ? prev[i].vest ?? null : null,
    role: slot.role,
    x: slot.x,
    y: mirror ? 105 - slot.y : slot.y,
  }));
}

export function emptyBoard(): BoardState {
  return {
    pitchId: "full",
    formationKey: "4-3-3",
    players: [],
    teamColor: TEAM_COLORS[0],
    showOpponent: false,
    oppFormationKey: "4-4-2",
    oppPlayers: [],
    oppColor: TEAM_COLORS[2],
    labelMode: "names",
    zoneMode: "none",
    grassColor: "green",
    grassPattern: "grid",
    perspective: true,
    playerScale: 1,
    ballScale: 1,
    homeKit: { design: "plain", c2: "#FFFFFF" },
    awayKit: { design: "plain", c2: "#FFFFFF" },
    strokes: [],
    texts: [],
    balls: [],
    logos: [],
    links: [],
    equipment: [],
  };
}

// first view: an attacking 4-3-3 against a 4-4-2 block, nobody standing on anyone
export function sampleBoard(): BoardState {
  const place = (team: Player[], pts: number[][]) => team.map((p, i) => ({ ...p, x: pts[i][0], y: pts[i][1] }));
  const HOME_AT = [[34, 5], [60, 26], [44, 19], [24, 19], [8, 26], [34, 35], [48, 45], [20, 45], [58, 63], [34, 66], [10, 63]];
  const AWAY_AT = [[34, 100], [8, 88], [24, 90], [44, 90], [60, 88], [9, 76], [26, 78], [42, 78], [59, 76], [25, 55], [43, 55]];
  return {
    ...emptyBoard(),
    players: place(buildFormation("4-3-3", HOME_SQUAD, "h", true), HOME_AT),
    oppPlayers: place(buildFormation("4-4-2", AWAY_SQUAD, "a", false), AWAY_AT),
    showOpponent: true,
    balls: [{ id: "b-sample", x: 36, y: 62, style: "classic" }],
  };
}

// fills fields that older saves may lack, so every board has the full shape
export function normalizeBoard(d: Partial<BoardState> | null | undefined): BoardState {
  const base = emptyBoard();
  if (!d) return base;
  return {
    ...base,
    ...d,
    labelMode: d.labelMode || base.labelMode,
    zoneMode: d.zoneMode || "none",
    grassColor: d.grassColor || "green",
    grassPattern: d.grassPattern || "grid",
    perspective: d.perspective !== false,
    playerScale: d.playerScale || 1,
    ballScale: d.ballScale || 1,
    homeKit: d.homeKit || base.homeKit,
    awayKit: d.awayKit || base.awayKit,
    players: d.players || [],
    oppPlayers: d.oppPlayers || [],
    strokes: d.strokes || [],
    texts: d.texts || [],
    balls: d.balls || [],
    logos: d.logos || [],
    links: d.links || [],
    equipment: d.equipment || [],
  };
}

export const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
