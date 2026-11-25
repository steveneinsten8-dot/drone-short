# drone-short

"Drone Pertama Bukan Buat Foto-foto" — cartoon 3D short (Remotion + three.js, 2D card
characters in a colourful 3D world), 1080x1920, 30 fps, 2000 frames (66.67 s).
Built from the Tacoma Narrows template (`cartoon_3d_short` skill).

- Composition: `DroneShort`
- Audio (final, not in this repo): Gemini Kore VO + SFX mix, 66.67 s, SFX-only, no music.
  Muxed onto the rendered video afterwards (`-map 0:v:0 -map 1:a:0`).
- No captions/labels in the video.

## Render di GitHub Actions (rencana Rachel, 2026-11-26)

Bench Tacoma di GitHub: 24.3 detik/frame wall (concurrency 2). Drone = 2000 frame,
dibagi 8 chunk @ 250 frame, ~100 menit/chunk, di dalam batas 6 jam/job.

1. **Bench dulu:** Actions → *Bench 30 frames Drone* → Run (default 0-29).
   Job `stills` di workflow yang sama merender 8 preview stills (tengah tiap shot).
2. **Preview stills** di artifact `drone-stills` — Rachel menyetujui dulu.
3. **Full render:** Actions → *Render chunk Drone* → Run, chunk 0-7 (bisa paralel).
   Download artifact `drone-part0` … `drone-part7`, gabung + mux audio jadi final.

Render lokal: `npm ci && npx remotion render DroneShort out/drone.mp4 --concurrency=2 --gl=angle`
(fast props buat tes: `--props='{"post":{"lens":false,"bloom":false,"msaa":false,"shadows":false}}'`).

## Shot list

| Shot | Frame | Isi |
| --- | --- | --- |
| 1 | 0–209 | Hook: drone modern di atas kota |
| 2 | 209–480 | 1917: lapangan terbang, Aerial Target, tentara, Zeppelin |
| 3 | 480–700 | 1918: Kettering Bug di rel, lepas landas |
| 4 | 700–800 | Snap: sayap lepas, badan jatuh (SNAP 23.7 s) |
| 5 | 800–1203 | 1935: Queen Bee + lebah jantan |
| 6 | 1203–1470 | 2010: anak muda + HP + Parrot di taman |
| 7 | 1470–1668 | 2013: DJI Phantom di atas sungai |
| 8 | 1668–2000 | Callback: bom terbang → kamera terbang (golden) |
