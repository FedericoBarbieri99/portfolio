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

Useful while developing: `B` toggles the mode from the keyboard, and `/#backstage` opens the page already flipped. In backstage on desktop, hovering any text shows its computed type; the HUD in the corner lists running timelines, scroll position and the last events. A small penguin lives on the page (desktop only). It always stands on something real: it starts behind the switch knob, hops onto the switch when you flip it, then perches on the end of whichever row, rung or role is nearest the middle of the screen. Scrolling only chooses the station; every move is a timed animation. A near station it reaches with a hop; a far one it leaves for through the right edge of the page and comes back in from the top, dropping from behind the bar onto the perch, when you scroll down, or walking in from the right when you scroll up. Each return it wears a different accessory (`[data-prop]` groups in the SVG; the order is `wardrobe` in `penguin()`). In About it walks in along the last line and stops behind the `[[phrase]]`-marked words (a marked phrase must be the closing words of its paragraph's last line); at the bottom it walks in behind the Contact phrase, hides behind the email button and climbs on top of it to wave. Stations are `penguin()` in `src/motion.ts`; positions are read from element rects, so an opened row carries it along.

## Content

All copy lives in `src/content/en.ts` and `src/content/it.ts` (same schema, see `src/content/types.ts`). `scripts/render.mjs` turns them into `index.html` (English, served at `/`) and `it/index.html` (Italian, at `/it/`). Both HTML files are generated: edit the content files, not the HTML. Rendering runs automatically before `dev` and `build`.

Work is grouped by employer in `groups`. To add a project: append a `Work` entry to the right group's `works` in both content files; one-line extras go in that group's `also`. `chain` is the list of nodes drawn under the row in backstage mode. `link` is optional. Skills live in `skills`: `tier` (1–3) sets the type size on the front, `proof` is the evidence chain drawn in backstage.

## Deploy

`npm run build` produces a fully static `dist/`. Configure the host to serve `dist/` and point `federicobarbieri.it` at it; no server-side rewrites are needed because both routes exist as real files.

## Design

`PRODUCT.md` records product truth, `DESIGN.md` the visual system. Both are read by the impeccable design tooling (`/impeccable …` in Claude Code).
