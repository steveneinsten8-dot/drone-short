// Timeline of the Drone short: shots timed to the voice beats
// (~/workspace/drone-awal/vo-gemini/timings.json — 5 beats, Gemini Kore, 66.67 s total).
// Beats (s): b1 0-6.96, b2 6.96-25.46, b3 25.46-40.10, b4 40.10-55.61, b5 55.61-66.67.
// 8 shots map onto the 5 beats: hook (beat 1), 1917 airfield + 1918 launch + snap
// (beat 2), Queen Bee naming (beat 3), Parrot + Phantom (beat 4), callback (beat 5).
// The world is the same stylised town/river/park set as Tacoma (bridge stays calm;
// it is background here, never the subject). Aircraft are posed from the path
// functions below, shared by world.ts (3D meshes) and cast.ts (bee fx card).
// Camera grammar (from the bridge template): continuous slow push-ins; symmetric
// smootherstep glides 18-40 f; big reframes are cuts; impacts are 7-frame kicks
// that flip sign every frame; no hand-held float. No captions/labels in the video.
export const FPS = 30;
export const TOTAL = 2000; // 66.67 s: Gemini VO + SFX mix (66.67 s)
export const D0 = 6.0; // bank top + deck height (m)
export const HALF = 27; // towers at z = +-27, span 54 m
export const PARK: V3 = [70, D0, -75]; // park lawn (also the 1917 airfield + 2010 park)
export const TUNNEL: V3 = [52, D0, -58]; // unused by this short, kept for world.ts compat
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- aircraft paths (t = video time in seconds) ----------------
export const AIRFIELD: V3 = [62, D0, -68]; // 1917 airfield centre (park lawn)
export const RAIL_A: V3 = [52, D0, -62]; // Kettering Bug launch rail, along +x
export const RAIL_B: V3 = [64, D0, -62];
/** "terus jatuh ke targetnya" — end of beat 2 */
export const SNAP = 23.7;
export const DROP0 = 23.9, DROP1 = 24.5;
export const DROP_H = 6.6;
/** Kettering Bug: parked on the rail until 17.5 s, launch + climb, then the snap:
 *  wings detach at SNAP and the body falls to the field. */
export const bugAt = (t: number): V3 => {
  if (t < 17.5) return [54, D0 + 0.7, -62];
  if (t < SNAP) {
    const u = smooth((t - 17.5) / 6.2);
    return [54 + 41 * u, D0 + 0.7 + 11.3 * u, -62 + 27 * u];
  }
  const u = smooth((t - SNAP) / (DROP1 - SNAP));
  return [95, 12 - (12 - (D0 + 0.3)) * u, -35];
};
export const bugWings = (t: number) => t < SNAP;
export const bugRoll = (t: number) => (t < SNAP ? 0 : (t - SNAP) * 4);
/** Queen Bee biplane across the sky during shot 5 (26.67-40.10 s) */
export const queenBeeAt = (t: number): V3 => {
  const u = clamp01((t - 26.67) / 13.43);
  return [-70 + 140 * u, 26 + 2 * u, -50 + 80 * u];
};
/** Parrot AR.Drone hovering over the park, shot 6 */
export const parrotAt = (t: number): V3 =>
  [72 + 0.8 * Math.sin(t * 0.5), D0 + 3.5 + 0.3 * Math.sin(t * 1.3), -72 + 0.5 * Math.cos(t * 0.4)];
/** DJI Phantom holding steady over the river, shot 7 */
export const phantomAt = (t: number): V3 =>
  [0.5 * Math.sin(t * 0.3), 13 + 0.2 * Math.sin(t * 0.8), -8 + 0.8 * Math.sin(t * 0.23)];
/** modern quadcopter: shot 1 across the town, shot 8 flying toward the camera */
export const modernAt = (t: number, shot: number): V3 => {
  if (shot === 8) {
    const u = clamp01((t - 55.61) / 11.06);
    return [0, 18 - 7 * u, -70 + 52 * u];
  }
  const u = clamp01(t / 6.96);
  return [-30 + 60 * u, 17 + 2 * u, -25 + 40 * u];
};
/** Zeppelin drifting far away in the 1917 sky, shot 2 only */
export const zeppelinAt = (t: number): V3 => [-180 + 2 * t, 70, -250];

// ---------------- story physics (kept calm: the bridge is background here) ----------------
// 1940s cars on the deck: [start z, speed m/s, direction].
export const CARS = [
  { start: -18, speed: 2.0, dir: 1, color: "#3a7a4a" },
  { start: -6.24, speed: 1.6, dir: -1, color: "#9a4040" },
  { start: 5, speed: 2.4, dir: 1, color: "#4a5a8a" },
  { start: -8, speed: 1.8, dir: -1, color: "#3a3a3a" },
];
export const carTau = (id: number, t: number) => t;
export const carZ = (i: number, id: number, t: number) => {
  const c = CARS[i], raw = c.start + c.dir * c.speed * carTau(id, t);
  return (((raw + 24) % 48) + 48) % 48 - 24;
};
export const shapeZ = (z: number) => (Math.abs(z) < HALF ? Math.cos((Math.PI * z) / (2 * HALF)) : 0);
export const dropW = (z: number) => smooth((20 - z) / 26);
export const dropU = (t: number) => (t < DROP0 ? 0 : Math.min(1, ((t - DROP0) / (DROP1 - DROP0)) ** 2));

export type BridgeState = { bounce: number; twist: number; drop: number; snap: number; collapsed: boolean };
/** the bridge never moves in this short: calm deck, no gallop, no collapse */
export const deckY = (x: number, z: number, b: BridgeState) =>
  D0 + b.bounce * shapeZ(z) - b.drop * DROP_H * dropW(z) + b.twist * shapeZ(z) * (x / 2.5);

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type Crowd = "soldiers" | "youth" | "photographers" | "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; towns?: boolean };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 209, light: "day", crowd: "none", towns: true }, // hook: modern drone over the town
  { id: 2, a: 209, b: 480, light: "day", crowd: "soldiers" }, // 1917 airfield: Aerial Target + soldiers + Zeppelin
  { id: 3, a: 480, b: 700, light: "day", crowd: "soldiers" }, // 1918: Kettering Bug on the rail, launch, flying
  { id: 4, a: 700, b: 800, light: "day", crowd: "none" }, // snap: wings detach, body falls to the field
  { id: 5, a: 800, b: 1203, light: "day", crowd: "soldiers" }, // 1935: Queen Bee + the bee joke (no pilot aboard)
  { id: 6, a: 1203, b: 1470, light: "day", crowd: "youth" }, // 2010: young person flies the Parrot from a phone
  { id: 7, a: 1470, b: 1668, light: "day", crowd: "photographers" }, // 2013: DJI Phantom over the river
  { id: 8, a: 1668, b: 2000, light: "golden", crowd: "none", towns: true }, // callback: bomb-plane -> camera-drone
];
/** crossfades (frames) at place/time changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 5: 8, 6: 8, 8: 8 };
export const FLASH_AT = 209;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** layers to draw at frame f: base shot, plus the next shot fading in during a crossfade */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

export const bridgeState = (id: number, t: number): BridgeState =>
  ({ bounce: 0, twist: 0, drop: 0, snap: 0, collapsed: false });

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
/** reference camera ease: symmetric smootherstep (attack = release, ~10 f each on a 23 f move) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for the first n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** dolly push: camera slides toward the look point by factor k */
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** (zoom/rolled framings from the Tacoma template are unused here — all drone shots dolly.) */

// ---- framings (f -> camera); each pushes in from the frame its key starts ----
const S1a = (f: number) => dolly([20, 16, -58], [0, 10, 0], pushK(f, 0, 0.002), { fov: 44 });
const S1b = (f: number) => dolly([10, 13, -40], [0, 12, 5], pushK(f, 120, 0.002), { fov: 40 });
// FIX 2026-11-26 (bench stills f344): the old south-east cameras sat ~10 m from the
// swing frame, so its legs crossed the frame at huge scale, and the Aerial Target sat
// dead-centre 15 m out and read as one giant dark blob. New cameras shoot from the
// EAST at ~21 m, fov 50: the plane reads side-on at a sane size, the soldiers fit
// (z-spread ±12 deg vs 14.7 deg half-fov), and the swing frame is a thin line far away.
const S2a = (f: number) => dolly([91, D0 + 5, PARK[2] + 1], [69, D0 + 1, PARK[2] + 1.5], pushK(f, 209, 0.0015), { fov: 54 });
const S2b = (f: number) => dolly([91, D0 + 4, PARK[2] + 3], [69.5, D0 + 1.2, PARK[2] + 1.5], pushK(f, 350, 0.0015), { fov: 42, roll: 0.03 });
const S3a = (f: number) => dolly([46, D0 + 2, -70], [58, D0 + 1, -62], pushK(f, 480, 0.002), { fov: 42 });
const S3b = (f: number) => dolly([60, D0 + 4, -75], [80, 10, -45], pushK(f, 580, 0.002), { fov: 40 });
const S4a = (f: number) => dolly([82, D0 + 5, -55], [95, 6, -35], pushK(f, 700, 0.003), { fov: 40, roll: -0.03 });
// FIX 2026-11-26 (bench still f1001): the old cameras looked north from z=-45/-35
// straight through the bridge tower at z=-27, so the tower filled the frame and the
// Queen Bee was never visible. New cameras TRACK the plane: look = queenBeeAt(t),
// camera offset (+26,-11,+26) south-east of it, so the tower stays behind the plane.
const S5a = (f: number) => { const q = queenBeeAt(T(f)); return dolly([q[0] + 26, q[1] - 11, q[2] + 26], q, pushK(f, 800, 0.001), { fov: 46 }); };
const S5b = (f: number) => { const q = queenBeeAt(T(f)); return dolly([q[0] + 20, q[1] - 8, q[2] + 20], q, pushK(f, 1000, 0.0015, 0.006, 35), { fov: 42 }); };
// FIX 2026-11-26 (bench still f1336): the old cameras were ~9 m from the youth with
// fov 36-40, so the Parrot (3 m above the look point) sat at the top edge and only its
// rotors peeked in, while the swing legs crossed the frame. New cameras shoot from the
// EAST at ~20 m, fov 46, look y=8 midway between youth (head ~8.2) and Parrot (~9.8):
// both sit ~6 deg off centre, well inside the frame.
const S6a = (f: number) => dolly([91, D0 + 4, PARK[2] + 1], [71.5, D0 + 2, PARK[2] + 2], pushK(f, 1203, 0.0015), { fov: 46 });
const S6b = (f: number) => dolly([90, D0 + 3.5, PARK[2] + 2], [71.8, D0 + 2.3, PARK[2] + 2.5], pushK(f, 1340, 0.0015), { fov: 42 });
const S7a = (f: number) => dolly([14, 10, -32], [0, 12, -5], pushK(f, 1470, 0.002), { fov: 42 });
const S7b = (f: number) => dolly([8, 8, -24], [0, 11, -2], pushK(f, 1560, 0.002), { fov: 38, roll: 0.03 });
// FIX 2026-11-26 (bench still f1834): the old cameras sat at z=-30/-22 looking NORTH
// while the drone flies from z=-70 toward z=-18 — at f1834 it was at z=-44, BEHIND
// the camera, so the frame showed only sunset sky. New cameras TRACK the drone:
// look = modernAt(t, 8), camera offset (+10,-3,+22) south-east of it, so the drone
// stays centred and grows from ~15% to ~23% of frame height as it approaches.
const S8a = (f: number) => { const m = modernAt(T(f), 8); return dolly([m[0] + 10, m[1] - 3, m[2] + 22], m, pushK(f, 1668, 0.0015), { fov: 44 }); };
const S8b = (f: number) => { const m = modernAt(T(f), 8); return dolly([m[0] + 8, m[1] - 2.5, m[2] + 18], m, pushK(f, 1830, 0.0015, 0.006, 32), { fov: 40 }); };

const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: S1a },
    { f: 120, dur: 24, s: S1b },
  ],
  2: [
    { f: 209, s: S2a },
    { f: 350, dur: 24, s: S2b },
  ],
  3: [
    { f: 480, s: S3a },
    { f: 580, dur: 24, s: S3b },
  ],
  4: [{ f: 700, s: S4a }],
  5: [
    { f: 800, s: S5a },
    { f: 1000, dur: 24, s: S5b },
  ],
  6: [
    { f: 1203, s: S6a },
    { f: 1340, dur: 24, s: S6b },
  ],
  7: [
    { f: 1470, s: S7a },
    { f: 1560, dur: 24, s: S7b },
  ],
  8: [
    { f: 1668, s: S8a },
    { f: 1830, dur: 30, s: S8b },
  ],
};

// impact kicks: the image offset flips sign every frame, decays to 0 in 7 f; they start on the first frame at/after the event.
const KICKS: [number, number][] = [[SNAP, 1], [DROP1, 1.6]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
/** frame at which the current key's move has finished (for picking billboard views per key, not per frame) */
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

// ---------------- lens: depth of field + foreground framing ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 0 }, // hook wide: establishing, sharp
  { f: 209, cInf: 10 }, // airfield MS: soldiers sharp, field soft
  { f: 480, cInf: 0 }, // launch wide
  { f: 700, cInf: 12, focus: () => bugAt(SNAP) }, // snap close: the falling Bug sharp
  { f: 800, cInf: 0 }, // Queen Bee sky wide
  { f: 1203, cInf: 7 }, // park: mild, focus = look
  { f: 1470, cInf: 0 }, // Phantom over the river
  { f: 1668, cInf: 0 }, // callback: sharp, golden
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};

/** near framing objects: visible while a <= f < b */
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [
  { a: 1203, b: 1470, kit: "plant_bushDetailed", pos: [69.65, D0, -79.4], s: 1.2, yaw: 0.4 },
];

// ---------------- subtitles ----------------
// This short has NO captions/labels in the video (Rachel's rule), so SUBS is empty.
export type Sub = { a: number; b: number; text: string; hl: string };
export const SUBS: Sub[] = [];
export const subAt = (f: number): Sub | null => SUBS.find((s) => f >= s.a && f < s.b) ?? null;
