# Drone Short — build notes

Project: "Drone Pertama Bukan Buat Foto-foto" (cartoon_3d_short, from the Tacoma template).
Audio (FINAL, do not regenerate): `../vo-gemini/drone-mix-gemini.mp3` — Gemini Kore + SFX, 66.67 s,
2000 frames @30 fps. SFX-only, no music. No captions/labels in the video.

## Timeline (Gemini VO beats, s)
- b1 0–6.96, b2 6.96–25.46, b3 25.46–40.10, b4 40.10–55.61, b5 55.61–66.67
- SNAP (Kettering Bug wings detach, "terus jatuh ke targetnya"): 23.7 s, end of beat 2.
  DROP0 23.9, DROP1 24.5.

## Shots (8, in `src/videos/drone/story.ts`)
1. 0–209 day, hook: modern quadcopter over the town (townsfolk on banks)
2. 209–480 day, 1917 airfield (park lawn): Aerial Target + 3 soldiers + Zeppelin far away
3. 480–700 day, 1918: Kettering Bug on the launch rail, launch + climb
4. 700–800 day, snap: wings detach, body falls (kick + white flash via snapFx)
5. 800–1203 day, 1935: Queen Bee biplane (yellow, pilotless — that is the point) + bee joke fx card
6. 1203–1470 day, 2010 park: youth + phone fx card + hovering Parrot
7. 1470–1668 day, 2013: DJI Phantom holding over the river + 2 photographers on the bank
8. 1668–2000 golden, callback: modern drone flies toward the camera over the town

## Files changed vs the Tacoma template
- `src/videos/tacoma/` → `src/videos/drone/`; `TacomaShort.tsx` → `DroneShort.tsx`
  (component `DroneShort`, `DRONE_FRAMES = 2000`, composition id `DroneShort`).
- `src/Root.tsx`: registers only `DroneShort`.
- `package.json`: name `drone-short`.
- `story.ts`: rewritten — TOTAL 2000, 8 shots, aircraft path functions
  (`bugAt/bugWings/bugRoll`, `queenBeeAt`, `parrotAt`, `phantomAt`, `modernAt`, `zeppelinAt`),
  bridge physics kept calm (bridge is background only), SUBS emptied (no captions).
- `cast.ts`: rewritten stage — soldiers (RIFLEMAN outfits), youth + phone fx card,
  photographers, townsfolk on banks, bee fx card; snapFx kept; splash/creak removed.
- `world.ts`: aircraft builders (quadcopter / plane / zeppelin / launch rail) + `poseAircraft()`;
  snapFx now fires at shot 4 on `bugAt(SNAP)`. Bridge/town/river/park, post chain
  (ink → lens → bloom → tone → grade, MSAA 4) and the `fx.ink.dispose` guard unchanged.
  Kenney GLBs are missing (404s, non-fatal — same as Tacoma on wan; trees/props just absent).
- `remotion.config.ts`: kept as-is, incl. the 300,000 ms timeout fix from Tacoma.

## Render plan (CHANGED 2026-11-26 ~00:57 WIB, Rachel's correction)
- Renders go to **GitHub Actions**, NOT the InstaBox VM wan (wan stays on Tacoma).
- GitHub bench proved 24.3 s/frame wall (concurrency 2) on `steveneinsten8-dot/tacoma-bench`.
- Repo choice: NEW public repo `steveneinsten8-dot/drone-short` (cleaner than reusing
  tacoma-bench — separate project, separate workflows, no stale Tacoma files).
- Chunks: 2000 frames / 8 chunks × 250 frames, 1 job per chunk, concurrency 2, fast props,
  `--gl=angle`, job timeout 360 min. At bench pace each chunk ≈ 100 min, inside the 6 h limit.
- Order: (1) bench 30 frames on GitHub first, verify the project really renders there;
  (2) preview stills from GitHub (bench/stills workflow) for Rachel's approval;
  (3) only then the full 8-chunk render.

## Still frames (mid-shot, for preview stills on GitHub)
- Shot 1 hook: f=104 (3.47 s)
- Shot 2 1917 airfield: f=344 (11.47 s)
- Shot 3 1918 launch: f=590 (19.67 s)
- Shot 4 snap: f=750 (25.00 s, just after SNAP 23.7 s)
- Shot 5 Queen Bee: f=1001 (33.37 s)
- Shot 6 2010 park: f=1336 (44.53 s)
- Shot 7 2013 Phantom: f=1569 (52.30 s)
- Shot 8 callback: f=1834 (61.13 s)

## Verification (local, 2026-11-26 ~01:00 WIB)
- `tsc --noEmit`: CLEAN (after `npm ci` in the project; the symlinked roblox
  node_modules lacked @react-three/postprocessing + postprocessing, so real deps
  were installed — 208 packages. node_modules stays local, never uploaded).
- `remotion bundle`: OK (cached bundle, exit 0). Build output removed afterwards.
- Workflow YAML: both files parse OK.
- NO render was run on this VM (per the brief).

## GitHub repo — prepared, NOT yet uploaded (BLOCKER: no token)
- Folder ready: `~/workspace/github-drone-short/` — 24 files, 464 KB:
  src/, package.json, package-lock.json, remotion.config.ts, tsconfig.json,
  BUILD_NOTES.md, README.md, .gitignore, `.github/workflows/bench-30f.yml`
  (bench 30 f + 8 preview stills in one run) and `render-chunk.yml` (8 × 250 f).
- Repo choice: NEW public repo `steveneinsten8-dot/drone-short` (see Render plan above).
- BLOCKER: no GitHub credential is saved anywhere — `credentials.list` for github.com
  is empty, `gh auth status` is not logged in, no GITHUB_TOKEN env. The classic PAT
  Rachel sent in chat on 2026-11-26 was used transiently only for tacoma-bench and
  was never stored (by design), so it is not available to reuse. Next step needs
  Rachel to supply a GitHub PAT again (same secure-capture flow as tacoma-bench,
  scopes repo + workflow) — then: create repo, upload these 24 files via the
  Contents API, dispatch bench-30f, verify the 30-frame video + 8 stills.
- Do NOT run the full 8-chunk render until the bench is OK and Rachel approves the stills.

## Remaining
1. Rachel supplies GitHub PAT again → create repo `steveneinsten8-dot/drone-short`, upload.
2. GitHub bench 30 f → verify → preview stills → Rachel approves → full 8-chunk render.

## Camera fixes 2026-11-26 ~01:20 WIB (bench stills round 1 — Rachel approved the fix)
- Shot 2 (f344): old SE cameras sat ~10 m from the swing frame (legs crossed huge) and the
  Aerial Target sat dead-centre 15 m out (dark blob). New east cameras at ~21 m, fov 54/42:
  plane side-on at sane size, all 3 soldiers in frame (verified numerically: worst -15.1 deg
  vs 16.0 deg half-fov). Swing frame now a thin line far away.
- Shot 5 (f1001): old cameras looked north through the bridge tower (z=-27). New cameras
  TRACK queenBeeAt(t) with offset (+26,-11,+26)/(+20,-8,+20): plane dead centre, tower out
  of frame (verified numerically).
- Shot 6 (f1336): old cameras ~9 m out, fov 36-40, Parrot at the top edge (rotors only).
  New east cameras at ~20 m, fov 46/42, look y=8 between youth and Parrot: youth, phone and
  Parrot all ~6 deg off centre (verified numerically).
- Shot 8 (f1834): old cameras at z=-30/-22 looked north while the drone was at z=-44
  BEHIND them. New cameras TRACK modernAt(t,8) with offset (+10,-3,+22)/(+8,-2.5,+18):
  drone dead centre at f1668/1834/1999, grows 5.6 -> 9.9 deg (verified numerically).
- Shots 1, 3, 4, 7 untouched. TOTAL/SNAP/timeout/guard unchanged. tsc clean, bundle OK.
