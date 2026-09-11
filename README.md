# federicobarbieri.it

Personal portfolio of Federico Barbieri. One page, two faces: the switch in the hero flips the site between its *front* and its *backstage* (blueprint palette, redlines, stack chains, live anime.js timelines).

## Stack

- Vite 8, vanilla TypeScript, no framework
- Tailwind CSS 4 via `@tailwindcss/vite`: every class lives in `scripts/render.mjs`, tokens and the `bs:` (backstage) / `js:` variants in `src/styles.css`
- `animejs` 4.5 is the only runtime dependency
- Self-hosted fonts in `public/fonts/` (Bricolage Grotesque with the `wdth`/`opsz` axes, Azeret Mono)

## Develop

```bash
npm install
npm run dev        # renders the two pages, then starts Vite on http://localhost:5173
npm run build      # typecheck + static build into dist/
npm run preview    # serve dist/ locally
```

Useful while developing: `B` toggles the mode and `/#backstage` opens it directly. The new motion system lives in `src/motion.ts`: two whole name lines enter in sequence, the switch reveals the blueprint through a circle growing from the switch (640ms) and closes it in reverse (540ms), and project panels unfold in 360ms with a short content stagger. Rapid mode commands are coalesced without interrupting the active reveal. The navigation underlines the current reading section. Backstage shows computed type on hover/tap and a HUD that redraws only during active animations or scrolling.

The penguin controller is in `src/penguin.ts`. It starts on the switch, waits for scroll to settle, then chooses a real row or text perch. Nearby moves use a look, crouch, short arc and cushioned landing; distant moves use a brief exit and local arrival, with no page-wide walk or falling entrance. Accessories belong to sections: scarf, glasses, headphones, beanie and the contact bow tie. Contact earns a wave, repeated on hover or focus. One abortable scene owns every gesture; hidden pages, stale destinations and live reduced-motion changes stop it. Landings follow live element bounds, including expanding project rows. The 64×72 navy/ivory/orange SVG renders at 48px desktop and 40px mobile; breathing and blinking run in CSS only while idle.

The browser regression checks require a running dev server and Playwright CLI:

```bash
playwright-cli open http://127.0.0.1:5173/it/
playwright-cli run-code --filename scripts/check-penguin.js
playwright-cli run-code --filename scripts/check-browser.js
```

## Content

All copy lives in `src/content/en.ts` and `src/content/it.ts` (same schema, see `src/content/types.ts`). `scripts/render.mjs` turns them into `index.html` (English, served at `/`) and `it/index.html` (Italian, at `/it/`). Both HTML files are generated: edit the content files, not the HTML. Rendering runs automatically before `dev` and `build`.

Work is grouped by employer in `groups`. To add a project: append a `Work` entry to the right group's `works` in both content files; one-line extras go in that group's `also`. `chain` is the list of nodes drawn under the row in backstage mode. `link` is optional. Skills live in `skills`, in order of working time (one size on the front); `proof` is the evidence chain drawn in backstage.

## Deploy

`npm run build` produces a fully static `dist/`. Configure the host to serve `dist/` and point `federicobarbieri.it` at it; no server-side rewrites are needed because both routes exist as real files.

## Design

`PRODUCT.md` records product truth, `DESIGN.md` the visual system. Both are read by the impeccable design tooling (`/impeccable …` in Claude Code).
