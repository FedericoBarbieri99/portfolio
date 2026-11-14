# federicobarbieri.it

Personal portfolio of Federico Barbieri. One page, two faces: the switch in the hero flips the site between its *front* and its *backstage* (blueprint palette, redlines, stack chains, live anime.js timelines).

## Stack

- Vite 8, vanilla TypeScript, no framework
- Tailwind CSS 4 via `@tailwindcss/vite`: every class lives in `scripts/render.mjs`, design tokens (`@theme`: type scale, spacing, radii, shadows, gradients, grids, transition lists), the `bs:` (backstage) / `js:` / `current:` / `idle:` / `waiting:` / `covered:` variants and the few utilities Tailwind lacks in `src/styles.css`
- `animejs` 4.5 is the only runtime dependency
- The look is soft clay ("pongo"): shadow, gradient and radius tokens in `src/styles.css`, and the recipes (`SLAB`, `LUMP`, `WELL`, `DETAIL`, `INK_PRESS`, `GROOVE_*`, `PLUS`) as class-string constants in `scripts/render.mjs`, a tiny grain tile in `public/clay/`, and the hero name as a pre-rendered bas-relief in `public/hero/` laid over the live text (see `DESIGN.md`)
- Self-hosted fonts in `public/fonts/` (Bricolage Grotesque with the `wdth`/`opsz` axes, Azeret Mono)

## Develop

```bash
npm install
npm run dev        # renders the two pages, then starts Vite on http://localhost:5173
npm run build      # typecheck + static build into dist/
npm run preview    # serve dist/ locally
```

Useful while developing: `B` toggles the mode and `/#backstage` opens it directly (on an already-open tab the hash flips it with the reveal). The lead case study of the first group arrives open; every other row starts closed and inert. The new motion system lives in `src/motion.ts`: two whole name lines enter in sequence, the switch reveals the blueprint through a circle growing from the switch (640ms) and closes it in reverse (540ms), and project panels unfold in 360ms with a short content stagger. Rapid mode commands are coalesced without interrupting the active reveal. The navigation presses a well under the current reading section; below 1100px the bar is a single row and the sections live in a Menu popover (native `popover`, closed by `src/motion.ts` when a link is chosen). Backstage shows computed type on hover/tap and a HUD that redraws only during active animations or scrolling.

The page closes on a clay diorama (`[data-horizon]` in `scripts/render.mjs`, sized by the `--spacing-horizon*` and `--spacing-stage` tokens, its plate fade is the `mask-plate` utility): two plates that share one composition, a day plate for the front and a night plate for backstage, both in `public/footer/` (1831×599, with a 960w variant). The plate keeps a generous band of pure sky above the peaks and the sun (they start at 37.7% of its height). The band's height follows the art: `clamp(200px, 32.72vw, 1000px)`, so the whole plate shows whenever the viewport is wide enough, a phone crops the sides (keeping the sun and an iceberg), and above ~3056px only empty sky is cropped (at 3840px, 20% of the art). The plates are stacked, masks fade their skies into the page and the snow into the footer, both fades are measured from the art so they only ever cover sky and snow, and the mode wipe already does the cross-fade between them.

A 3D clay penguin lives on the snow shelf. It is a real-time model: a glTF file (meshopt-compressed, 171 KB, `public/penguin/diorama.glb`) with the clips `idle`, `wave`, `rise` and `blink`, drawn with three.js on one WebGL `<canvas>` in the stage (sized to the stage × `min(devicePixelRatio, 2)`, resized with a ResizeObserver, lit by a soft key light from the top left, the footer's own light, a hemisphere fill and a faint cool rim, with a live contact shadow on the ice). `src/diorama.ts` is the behaviour and stays free of three.js; `src/diorama-scene.ts` is the scene, and it is a lazy chunk: nothing loads until the band is within 800px of the viewport, then `import('./diorama-scene')` brings three.js, the meshopt decoder and the GLB loader (a separate ~158 KB gzipped chunk, never part of the main bundle) and the clay model is fetched. The wireframe model (`public/penguin/diorama-wire.glb`, 45 KB) is fetched only the first time the page is in backstage. Until the model is ready, and for good with reduced motion, without WebGL, if a file or the chunk fails to load or if the GL context is lost (it recovers if the context comes back), the still image `public/penguin/still.webp` is the whole feature, and in backstage `still-wire.webp` is drawn flat on a second, 2D canvas. In backstage the same WebGL canvas draws the clay rig as a solid ground-coloured silhouette (the page's `--color-bg`) and the wireframe rig over it as fat amber lines (`LineSegments2`; the few meshes with a morph target are re-morphed on the CPU), so the lines read as a solid object and nothing shows through the body; `setMode()` in `src/motion.ts` calls `diorama.onMode()`, which redraws the canvas synchronously inside the view transition's update callback, so the snapshot of the new mode already holds the right image. One `AnimationMixer` plays the clips and every change of clip cross-fades over 120ms, so nothing pops; the yaw lives on an outer group, so the animation never fights it. When at least 45% of the band is on screen the character glides in on its belly from beyond the left edge (1.3s, a long soft deceleration; the model lies on the first frame of `rise` while the stage slides), starts to rise before it has quite stopped, waves once, then idles. One `requestAnimationFrame` loop runs only while something moves: it draws at every vsync while the body turns (drag, inertia, look, spring back) and at 30 fps while only clips play (they are keyed at 24 fps, and 30 divides 60 and 120 Hz evenly), and it stops when the band is off screen, the tab is hidden, the pose is held or the state is static. The character looks at the mouse (up to 90° each way) with a critically damped spring on a continuous yaw applied straight to the model; dragging with a mouse or a finger turns it 1:1 (a drag across the stage is one full turn), with exponentially decaying inertia on release and a spring back to the front the short way; a tap or click, or hovering or focusing the contact button, makes it wave. `data-state` on `[data-diorama-stage]` exposes the state (`waiting`, `slide`, `rise`, `wave`, `idle`, `look`, `spin`, `static`), `data-pose` the playing clip and frame (`idle:12`), `data-yaw` the turn in degrees, and backstage prints a live `model · turn · 65°` tag beside it. With JavaScript off or reduced motion the still image is the whole feature. While the clay penguin is on stage the small mascot takes its short exit and stays away (`away` hook in `createPenguin`), so only one is ever on screen.

Icons are the same penguin on a bone tile: `public/favicon.ico` (16, 32, 48), `icon-32.png`, `icon-192.png` and `apple-touch-icon.png`. The 16 px one is cropped to the face so the eyes survive; there is no `favicon.svg` any more.

The small mascot is the same clay penguin: `src/penguin.ts` draws it on a canvas from `public/penguin/mini.webp` (160×160 frames in an 11×4 grid: `turn` 24 frames at 15°, `wave` 16, `blink` 4, plus the `-wire` twin for backstage; layout read from the `mini` entry of `sprites.json`, no baked shadow, so `[data-penguin-shadow]` stays its ground shadow). The controller starts it on the switch, waits for scroll to settle, then chooses a real row or text perch, always one where it covers no text and no button. Nearby moves turn it towards the destination, then crouch, short arc and cushioned landing; distant moves use a brief exit and local arrival, with no page-wide walk or falling entrance. At the very end of the contact section it stands on the contact button and plays the wave clip, repeated on hover or focus, until the diorama's own penguin takes over below it. Standing, it blinks now and then and glances at a near mouse pointer. One abortable scene owns every gesture; hidden pages, stale destinations and live reduced-motion changes stop it. Landings follow live element bounds, including expanding project rows. In backstage the canvas fills the clay silhouette with the page ground and draws the amber wire frame on top (redrawn synchronously in `setMode()` next to `diorama.onMode()`).

`public/og.png` is the 1200x630 share card for LinkedIn and friends.

The browser regression checks require a running dev server and Playwright CLI:

```bash
playwright-cli open http://127.0.0.1:5173/it/
playwright-cli run-code --filename scripts/check-penguin.js
playwright-cli run-code --filename scripts/check-browser.js
```

## Content

Copy is deliberately short: the page gives the shape of each project, the CV gives the detail. One hard number per case study at most. All copy lives in `src/content/en.ts` and `src/content/it.ts` (same schema, see `src/content/types.ts`). `scripts/render.mjs` turns them into `index.html` (English, served at `/`) and `it/index.html` (Italian, at `/it/`). Both HTML files are generated: edit the content files, not the HTML. Rendering runs automatically before `dev` and `build`.

Work is grouped by employer in `groups`. To add a project: append a `Work` entry to the right group's `works` in both content files; one-line extras go in that group's `also`. `chain` is the list of nodes drawn under the row in backstage mode. `link` is optional. Skills live in `skills`, in order of working time (one size on the front); `proof` is the evidence chain drawn in backstage.

## Deploy

`npm run build` produces a fully static `dist/`. Configure the host to serve `dist/` and point `federicobarbieri.it` at it; no server-side rewrites are needed because both routes exist as real files.

## Design

`PRODUCT.md` records product truth, `DESIGN.md` the visual system. Both are read by the impeccable design tooling (`/impeccable …` in Claude Code).
