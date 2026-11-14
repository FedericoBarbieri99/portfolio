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

Useful while developing: `B` toggles the mode and `/#backstage` opens it directly (on an already-open tab the hash flips it with the reveal). The lead case study of the first group arrives open; every other row starts closed and inert. The new motion system lives in `src/motion.ts`: two whole name lines enter in sequence, the switch reveals the blueprint through a circle growing from the switch (640ms) and closes it in reverse (540ms), and project panels unfold in 360ms with a short content stagger. Rapid mode commands are coalesced without interrupting the active reveal. The navigation presses a well under the current reading section. Backstage shows computed type on hover/tap and a HUD that redraws only during active animations or scrolling.

The page closes on a clay diorama (`[data-horizon]` in `scripts/render.mjs`, sized by the `--spacing-horizon*` and `--spacing-stage` tokens, its plate fade is the `mask-plate` utility): two plates that share one composition, a day plate for the front and a night plate for backstage, both in `public/footer/` (1831×599, with a 960w variant). The plate keeps a generous band of pure sky above the peaks and the sun (they start at 37.7% of its height). The band's height follows the art: `clamp(200px, 32.72vw, 1000px)`, so the whole plate shows whenever the viewport is wide enough, a phone crops the sides (keeping the sun and an iceberg), and above ~3056px only empty sky is cropped (at 3840px, 20% of the art). The plates are stacked, masks fade their skies into the page and the snow into the footer, both fades are measured from the art so they only ever cover sky and snow, and the mode wipe already does the cross-fade between them.

A 3D clay penguin lives on the snow shelf. It is shipped as pre-rendered WebP sprite sheets in `public/penguin/` (400×400 frames at 24 fps: `turn` 72 frames every 5°, `idle` 60, `wave` 48, `rise` 28, `still` 1), plus a `-wire` twin of each sheet, an amber wireframe pixel-aligned with the clay, for backstage. The controller, `src/diorama.ts`, hard-codes none of that layout: frames, columns, rows, frame size and fps per sheet come from `sprites.json` and yaw per frame is 360 / `turn.frames`. It draws on one `<canvas>` in the stage (sized to the stage × devicePixelRatio, resized with a ResizeObserver) from decoded bitmaps of the sheets (`createImageBitmap`, falling back to the decoded `<img>`). In backstage the same canvas composites the clay frame, fills its silhouette with the page ground colour (`source-in`) and draws the wireframe over it, so the lines read as a solid object; `setMode()` in `src/motion.ts` calls `diorama.onMode()`, which redraws synchronously inside the view transition's update callback. Every change of clip dissolves over 120ms, so nothing pops. Nothing loads until the band is within 800px of the viewport; `sprites.json`, `rise` and `idle` come first, then `turn` and `wave`, and the wire sheets only once the page is in backstage (until a sheet is decoded the neutral pose stands in, and no animation starts on a sheet that is not ready). When at least 45% of the band is on screen the character glides in on its belly from beyond the left edge (1.3s, a long soft deceleration), starts to rise before it has quite stopped, waves once, then idles. One `requestAnimationFrame` loop runs only while something moves and advances clips by elapsed time; it stops when the band is off screen, the tab is hidden, the pose is held or the state is static. The character looks at the mouse (up to 90° each way) with a critically damped spring on a continuous yaw, drawing the nearest turn frame; dragging with a mouse or a finger turns it 1:1 (a drag across the stage is one full turn), with exponentially decaying inertia on release and a spring back to the front the short way; a tap or click, or hovering or focusing the contact button, makes it wave. `data-state` on `[data-diorama-stage]` exposes the state (`waiting`, `slide`, `rise`, `wave`, `idle`, `look`, `spin`, `static`), `data-pose` the drawn frame, and backstage prints a live `sprite · turn · 14/72 · 65°` tag beside it. With JavaScript off or reduced motion the still image is the whole feature. While the clay penguin is on stage the small mascot takes its short exit and stays away (`away` hook in `createPenguin`), so only one is ever on screen.

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
