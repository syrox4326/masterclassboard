// Data model of a tactic board.
// The shape is kept identical to the tactics already saved in Supabase
// (and to each scene), so existing saves open without a migration.

export type Pt = { x: number; y: number };

export type PitchId =
  | "full" | "attackHalf" | "defenseHalf" | "attackThird" | "defenseThird"
  | "seven" | "nine" | "blank";

export type LabelMode = "none" | "names" | "roles";
export type ZoneMode = "none" | "thirds" | "halfspaces" | "positional" | "lanes" | "lanesThirds";
export type GrassPattern = "grid" | "bands" | "lanes" | "checker" | "diag" | "rings" | "plain";
export type BallStyle = "ucl" | "superlig" | "stars" | "classic";
export type KitDesign =
  | "plain" | "hoops" | "thinhoops" | "stripes" | "thinstripes" | "halves" | "halvesH" | "quarters"
  | "sash" | "band" | "cross" | "chevron" | "checks" | "diag" | "pinstripe" | "plaid" | "wide";

export type Kit = { design: KitDesign; c2: string };

export type Player = {
  id: string; // "h0".."h10" home, "a0".."a10" away
  number: string | number;
  name: string;
  role: string;
  x: number;
  y: number;
  vest?: string | null;
};

export type StrokeTool = "line" | "arrow" | "darrow" | "pen" | "rect" | "frect" | "zone";
export type Stroke = {
  id: string; // "s…"
  tool: StrokeTool;
  color: string;
  points: Pt[];
  c?: Pt; // quadratic control point (curved line / arrow)
  curve?: boolean;
};

export type TextItem = { id: string; x: number; y: number; content: string; color: string; size: number };
export type Ball = { id: string; x: number; y: number; style: BallStyle };
export type Logo = { id: string; x: number; y: number; src: string; size: number };
export type Link = { id: string; a: string; b: string; color: string };

export type EquipType =
  | "goal" | "goal5" | "mini"
  | "cone_white" | "cone_yellow" | "cone_orange" | "cone_blue" | "cone_red" | "cone_tall"
  | "pole" | "hurdle" | "ladder" | "ring" | "wall" | "flag"
  | "dummy_yellow" | "dummy_blue" | "dummy_red";

export type Equipment = {
  id: string; // "e…"
  type: EquipType;
  x: number;
  y: number;
  rot?: number; // legacy quarter turns
  ang?: number; // degrees
  sc?: number; // scale
};

export type BoardState = {
  pitchId: PitchId;
  formationKey: string;
  players: Player[];
  teamColor: string;
  showOpponent: boolean;
  oppFormationKey: string;
  oppPlayers: Player[];
  oppColor: string;
  labelMode: LabelMode;
  zoneMode: ZoneMode;
  grassColor: string;
  grassPattern: GrassPattern;
  perspective: boolean;
  playerScale: number;
  ballScale: number;
  homeKit: Kit;
  awayKit: Kit;
  strokes: Stroke[];
  texts: TextItem[];
  balls: Ball[];
  logos: Logo[];
  links: Link[];
  equipment: Equipment[];
};

export type Scene = BoardState;

export type Tool =
  | "move" | "link" | "line" | "arrow" | "darrow" | "curve" | "pen"
  | "rect" | "frect" | "zone" | "text" | "eraser" | "equip" | "ball";

export type PanelId = "team" | "kit" | "pitch" | "draw" | "objects" | "scenes" | "saves";
