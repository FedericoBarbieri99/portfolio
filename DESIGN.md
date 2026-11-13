---
name: federicobarbieri.it
description: One page, two faces, one slab of clay. A quiet typographic front and an annotated blueprint backstage, switched by a physical toggle; everything on the page is pressed into the clay or sits on it.
colors:
  bone: "#edefec"
  navy: "#111c33"
  hairline: "#c8ccc6"
  clay-hi: "rgba(255, 255, 255, 0.92)"
  clay-lo: "#a5ada1"
  clay-ink-lo: "rgba(17, 28, 51, 0.3)"
  blueprint-clay-hi: "rgba(46, 98, 196, 0.4)"
  blueprint-clay-lo: "#061029"
  blueprint-clay-ink-lo: "#030a1c"
  signal: "#d9481c"
  mute: "#586172"
  blueprint: "#0f2451"
  blueprint-line: "#5c7dc7"
  amber: "#ffb03b"
  blueprint-mute: "#9fb4e0"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(88px, 14vw, 220px)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.03em"
  heading:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(40px, 6vw, 80px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  org:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(34px, 4.2vw, 60px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  skill:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(20px, 1.55vw, 22px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  subtitle:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "normal"
  lede:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  small:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  dates:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  mono-paragraph:
    fontFamily: "Azeret Mono, ui-monospace, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  title-mobile:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  display-mobile:
    fontFamily: "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(64px, 19vw, 120px)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.03em"
  annotation:
    fontFamily: "Azeret Mono, ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
rounded:
  slab: "28px"
  well: "22px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "26px"
  lg: "44px"
  section: "clamp(72px, 11vh, 150px)"
  gutter: "clamp(20px, 4vw, 64px)"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "20px 44px"
  work-slab:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.navy}"
    rounded: "{rounded.slab}"
    padding: "40px 48px 6px"
  skill-pill:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  annotation-tag:
    backgroundColor: "transparent"
    textColor: "{colors.amber}"
    typography: "{typography.annotation}"
    padding: "4px 6px"
---

# Design System: federicobarbieri.it

## Overview

**Creative North Star: "Doppio fondo"** (the false bottom)

The site is one page with two faces, cast in one material. The *front* is the surface a visitor reads: a huge condensed name in navy clay, a bone-white ground like matte plasticine, navy ink, grooves, and almost nothing else. The *backstage* is the same page inspected: the ground turns blueprint blue, amber redlines measure the hero, every project row and every skill rung grows a drawn chain of evidence beneath it, and a small panel lists the anime.js timelines actually running with live progress. Nothing is added in backstage that the front hides; it is the same content annotated. The switch that flips them is the signature object (a deep well with a ball of orange clay in it), and the rest of the page stays disciplined so the mechanism reads as the message: *what the user sees, and what makes it work*.

Density is editorial: one column of long text, generous vertical rhythm, a wide right margin reserved for annotations. Hierarchy is carried by type size and the condensed width axis, and by how high a thing sits in the clay; never by colour or badges. Confirmed rejections: card grids of identical tiles, stat heroes, eyebrow labels, glossy gradients, glass, skill bars or percentages, monospace as decoration in the front. The whole page is one slab of soft matte clay under a single light from the upper left, the same light as the closing diorama and its 3D mascot, whose material it borrows (see Elevation & Depth and The closing horizon). The backstage annotations are the exception: they stay flat amber drawings laid over the clay, a technical drawing over an object.

**Key Characteristics:**
- Two token sets on one DOM, switched by `data-mode` on `<html>`. The switch reveals the blueprint through a circle growing from the switch in 640ms; closing shrinks the circle back to the switch in 540ms. The mask uses viewport percentages for high-density webviews. Latest input is queued until the current reveal finishes. Without View Transitions, colours transition in 360ms; reduced motion applies state directly.
- Backstage annotates, it never decorates: every section heading carries its type spec, every section its id and padding, hovered text its computed size, and the HUD reports timelines, scroll position and the last three events.
- Ledger rows grouped under employer names, each employer one slab of clay; grooves carry the structure inside it.
- One grotesque, two registers: the condensed axis (wdth 75, opsz 96/60) marks the top of every hierarchy (name, section headings, employer names); everything below it is the same face at normal width, opsz 30 or 17.
- Mono appears only where it is content (annotations, chains, "under the hood").
- Motion thesis: a small typographic stage. The two name lines arrive as whole printed units over 700ms, 110ms apart; the track of the switch presses into the clay and its knob pops, the printed name turns to clay once (560ms, from 640ms), and supporting text follows within one second. Content remains static during reading. Project panels unfold in 360ms, their contents enter in a bounded 280ms stagger, and the plus turns in 220ms. Navigation marks the section currently being read.
- The stagehand is a small clay penguin: the same character as the diorama's, drawn on a canvas from a 160px sprite sheet (`public/penguin/mini.webp`, 44 frames in an 11×4 grid read from `sprites.json`: 24 turn frames at 15°, a 16-frame wave, a 4-frame blink), always in its orange scarf. The element is the whole square frame, 72px on desktop and 58px below 768px, so the character is about as wide as the old flat one was; its feet stand on a line 8.33% above the frame's bottom edge, and that line is the perch. It starts on top of the switch and makes a small celebratory hop after the mode change finishes. Scroll chooses its surface only after settling for 180ms. Close perches use a turn towards the destination (45°, stepping through the neighbouring turn frames in 140ms), a 130ms crouch, a 320–520ms arc and a 230ms landing, and it faces the viewer when it settles; distant perches use a 150ms fade-out and 320ms local arrival. No page-wide crossing or fall from the header. Live bounds keep its feet on opening rows. A single abortable scene prevents competing gestures. Contact earns the sheet's wave clip (1.33s, front on); while it stands it blinks every three to six seconds (the blink clip) and, with a mouse, glances up to 45° towards a near pointer, and a slow breathing scale about its ground line runs in CSS. It stands only where it covers no text and no button: a row's perch is the first free spot on its bottom line, searched from the right, and a row with none free (a narrow screen full of text) is simply not a perch, as is the About text on a screen with no margin beside the paragraph. In backstage the same canvas fills the clay silhouette with the ground colour and draws the amber wire frame over it (the wire sheet loads the first time the page goes backstage, and is redrawn inside the mode change's view transition). Reduced motion and page suspension hide the character; focus and hover on contact can repeat its greeting. It does not follow the page to the closing diorama: while the clay penguin there is on stage (at least 45% of the band visible) it takes its short exit and stays away.

## Colors

Cold bone and navy at rest; blueprint blue with amber marks in backstage. One signal colour per mode, used as a marker, never as running text.

### Primary
- **Navy** (#111c33): all front text, the switch track, the primary button ground. A nod to the CV's blue without copying it.
- **Blueprint** (#0f2451): the backstage ground. The page becomes the drawing.

### Secondary
- **Signal orange** (#d9481c): the switch knob (a ball of orange clay) and focus ring in front mode. Never used for text on bone (contrast is below 4.5:1).
- **Amber** (#ffb03b): the knob, every redline, corner tag, chain node and HUD heading in backstage. Also the HUD progress bars.

### Neutral
- **Bone** (#edefec): front ground and backstage text.
- **Hairline** (#c8ccc6): no longer a rule in front (grooves replaced them); it survives as the chain line, the HUD border and the print rule.
- **Blueprint line** (#5c7dc7): the same roles in backstage.
- **Clay light and shade**, three tokens that flip with the mode: `--clay-hi` (the light left on raised upper-left edges: white at 92% in front, `#2e62c4` at 40% in backstage), `--clay-lo` (the shade to the lower right: `#a5ada1`, the bone ground darkened and cooled, in front; `#061029`, deeper than the ground, in backstage) and `--clay-ink-lo` (the shade under navy lumps: navy at 30% in front, `#030a1c` in backstage). Every shadow on the page is made of these three.
- **Mute** (#586172) / **Blueprint mute** (#9fb4e0): secondary text (employer periods, tags, dates, skill group labels, the "Also" row title, hints, definition labels), tinted toward each ground rather than gray.

### Named Rules
**The One Marker Rule.** The signal colour has three roles: the knob, the focus ring, and backstage annotation (redlines, tags, chain nodes, HUD). It never colours body text, headings or surfaces; the knob is the one lump of it. If it starts doing so, it stops being a marker.
**The Same Page Rule.** Backstage may recolour and annotate, but never rearranges, hides, or adds copy that the front does not carry (the only exception is "Under the hood", which is technical detail, not a claim).

## Typography

**Display Font:** Bricolage Grotesque (self-hosted variable, wght 200–800, wdth 75–100, with Helvetica Neue / Arial fallback)
**Body Font:** Bricolage Grotesque
**Label/Mono Font:** Azeret Mono (wght 300–600), backstage only

**Character:** One grotesque doing two jobs through its axes: brutally condensed and heavy at the top of every hierarchy, open and calm at text sizes. The mono is a different voice on purpose: it belongs to the drawing, not the prose.

### Hierarchy
- **Display** (800, clamp(88px, 14vw, 220px), 0.86, -0.03em, wdth 75, opsz 96): the name only. Two lines, left-aligned, width fit-content so redlines can hug it. clamp(64px, 19vw, 120px) under 768px.
- **Heading** (800, clamp(40px, 6vw, 80px), 0.95, -0.03em, wdth 75, opsz 96): section titles, balanced wrap, 44px below. No separate mobile size; the clamp does the work.
- **Org** (700, clamp(34px, 4.2vw, 60px), 1, -0.025em, wdth 75, opsz 60): employer names heading each work group; the period sits beside them at baseline in Dates.
- **Skill** (600, clamp(20px, 1.55vw, 22px), 1.15, -0.01em, opsz 30): every pill at the same size; pills are ordered by working time, never sized by it. They are set apart by a 12px gap between raised clay shapes, no separator glyph.
- **Title** (600, 30px, 1.1, -0.015em, opsz 30): project rows. 24px under 768px.
- **Subtitle** (500, 22px, 1.35): role line, project summaries, contact note, experience roles.
- **Lede** (400, 19px, 1.5): hero intro, about paragraphs, skills note; measure ≤ 60ch (44ch for the note).
- **Body** (400, 17px, 1.5, opsz 17): everything else, measure ≤ 70ch.
- **Dates** (400, 15px, tabular): employer period, experience and education dates, skill group labels, mobile row years. Always in mute.
- **Small** (400, 14px): tags, nav, hints, definition labels, footer. Sentence case, never tracked caps.
- **Annotation** (400, 11px mono, 0.01em): redlines, corner tags, chain nodes, HUD. **Mono paragraph** (13px mono, 1.65) for "Under the hood".

### Named Rules
**The No Eyebrow Rule.** No label above a heading. Definition-list labels ("The problem", "What I did") sit inside expanded case studies only, where they structure a sequence. The skill group label sits beside its rung, not above it.
**The Mono Is Content Rule.** Azeret Mono never appears in front mode.
**The Size Is The Ranking Rule.** In the skills ladder, type size and weight are the only ranking device. No bars, percentages, badges or colour steps.

## Layout

A single 1440px max column with a fluid gutter (`clamp(20px, 4vw, 64px)`); content is left-aligned and the right margin stays empty for the annotations and the penguin. Sections are separated by exactly one groove and `clamp(72px, 11vh, 150px)` of padding: a section opens with its own groove unless the one before it already ends on one (the skills ladder and the education list keep their last groove as the floor under the mascot's last perch), and that one then has no bottom padding. Section order: hero, work, skills, experience, about, contact; the floating bar links to the last five.

Hero: a two-column grid, name left, switch bottom-right of the name row, role and intro full width beneath; from 768px up the min-height fills the viewport under the floating 56px bar. Work: employer groups, each one slab (org name · period at its head, then a ledger of rows: title · years · tags · +; the grid is `1fr 7.5em auto 34px`) whose rows expand in place with a CSS grid-rows transition, one open at a time, closed by an "Also" row (title 22px/500 in mute, tags column carries a short summary) that expands to a plain list of smaller things done there; slabs are `clamp(56px, 8vh, 96px)` apart. Skills: a ladder of rungs on a 250px label / 1fr items grid sitting directly on the page, a groove between rungs, every skill a raised pill. Experience: one slab for the four roles on the same 250px date column and text column, the dates in small pressed pills; education below it on the page, in grooves. About: one column of lede text, ≤ 60ch, the languages as two small raised pills. Contact: note, the big ink lump, a LinkedIn lump, the plain address in a pressed well.

The rhythm of elevation, top to bottom: floating bar, switch well, slab (work), pills on the ground (skills), slab (experience), flat text (about), lumps (contact), diorama.

Under 900px rows restack (title on the first line, years in mute Dates and tags on the second, the plus spanning both; years never wrap), and the skills, experience and education grids collapse to one column with 8px row gap. Under 768px the hero keeps the switch at the right of the name, smaller, and ends where its content ends (it no longer stretches to the viewport height, so there is no dead area above the explore row); the HUD, the name redlines and the gutter line are removed (corner tags, section tags, h2 brackets and the penguin stay); row titles drop to 24px; row chains fade out at the right edge instead of wrapping; skill chains leave the padding and stack in flow under the rung (see Components); the bar's mode label is hidden so the toggle keeps its gutter. Under 1100px the bar wraps to two rows (brand, language and switch above; section links below) and becomes a rounded slab of 30px radius instead of a lozenge. Under 640px every shadow offset and blur is halved.

## Elevation & Depth

The page is one slab of soft matte clay lit from the upper left, the same light as the penguin and the diorama. Everything on it is either **pressed into** the slab or **a lump sitting on** it; nothing floats above it on a shadow from nowhere, nothing is glossy, nothing is glass, and the light never changes direction. The ground carries a faint matte grain (`public/clay/grain.png`, a 160px seamless tile of about 8KB at 1 to 2% alpha, tiled on the body and on every clay surface; no blend modes, no fixed overlays) so large flat areas read as clay and not as a CSS colour. All offsets and blurs are written in `--u`, which is `1px × --clay-k`; `--clay-k` is 1 and drops to 0.5 under 640px.

The recipes (classes in `src/styles.css`, tokens in the root rule; each is the same six shadow layers so a lump can sink into a well, or squash, and the shadow interpolates):

- **Raised, slab** (`.clay-slab`): ground-coloured fill with a faint tonal turn toward the lower right, radius 28px, a long shade (20px/26px, 40px blur) in `--clay-lo`, a short contact shade, a light to the upper left, a 1px rim light on the top-left edge and a soft inner shade. Work and experience.
- **Raised, small** (`.clay-lump`): the same recipe at chip scale (8px/10px, 20px blur) on a fully rounded shape, with a gentle puffiness from the inner shade and light. Skill pills, round buttons, the LinkedIn lump, the language pills.
- **Pressed** (`.clay-well`): inset `--clay-lo` at the top-left, inset `--clay-hi` at the bottom-right, a fill slightly darker than the ground. Three depths: the shallow well (dates, current link in the bar, the address, the explore row), the deep well (the detail of an open row) and the switch track (deepest, in em).
- **Groove** (`.groove-t`, `.groove-b`, `.groove-between`): a 2px engraved line, a `--clay-lo` line with a `--clay-hi` line directly beneath it. It replaces every hairline in the front design; there are no plain 1px borders left in it.
- **Ink lump** (`.clay-ink`): the primary button's clay: navy in front, a lighter blueprint lump (`--clay-primary` #2c5aa8, bone text, 4.9:1 at the worst pixel) in backstage, where the amber stays for annotations and the knob. A tonal shift from the upper left, a tinted shade, a faint rim light, inner shading. The email button.
- **Signal lump**: the switch ball: orange with a soft top-left highlight and a shade tinted with the signal colour, so it is a ball of orange clay and not a disc (amber in backstage).
- **Clay type** (`.clay-type`): display headings only (section titles, employer names): navy letters that sit on the surface, a short soft shadow to the lower right and a hairline of light to the upper left, in `em` so it scales. Body, muted and small text stay plain and flat. The hero name is a bas-relief of the same kind (see Components).
- **Press feedback** (`.clay-press`): hover lifts a lump with its shadow only (the mascot may be standing on it, so nothing moves more than a pixel), a press squashes it to 97% with a flatter shadow in 120ms; the plus button of a row sinks into a well as its row opens. Under reduced motion the shadow changes and nothing moves.
- **More contrast**: under `prefers-contrast: more` every slab, lump and well gets a 1px ink outline, since shadows alone are a weak affordance.

Shadows are never clipped by an `overflow` (the bar and the slabs have none; the open-row well is inset, so the clipped panel cannot cut it) and never cause horizontal scroll. In backstage the same recipes flip through the tokens: the light becomes a lighter blueprint, the shade a deeper navy, and the highlights are kept low so nothing glows.

### Named Rules
**The One Light Rule.** The light comes from the upper left, always: highlights top-left, shades bottom-right, in every mode and for every element, including the type and the switch ball.
**The Drawing On Clay Rule.** The backstage annotations (redlines, tags, chains, HUD, inspector) stay flat amber drawings on top of the clay, never made of it. The HUD panel and the inspector label are flat surfaces on the page colour with a 1px border.
**The Flat Print Rule.** The print stylesheet strips every shadow, the grain and the slabs: a plain document with hairlines.

## Shapes

Everything is chunky and generously rounded: slabs at 28px, wells at 22px (18px on phones), the bar a full lozenge (30px where it wraps), pills, chips, the plus buttons, the switch and the contact buttons fully round. Square corners are gone from the interface; only the backstage annotation tags keep theirs, because they are drawings. Grooves are 2px; the switch track is twice as wide as it is tall; the chain line and the plus strokes are 2px.

## Components

### Buttons
- **Shape:** pill (999px)
- **Primary ("Write me an email"):** the big ink lump, 20px 44px padding, 19px text, weight 600, pillowy. It lifts by shadow on hover and squashes to 97% when pressed; its top edge stays a clean line because the mascot lands on it (its light spreads sideways, never above, so it cannot haze the mascot's feet). In backstage it becomes the lighter blueprint lump.
- **Secondary:** LinkedIn is a raised ground-coloured pill beside it; the plain address sits engraved in a pressed well, still a `mailto:` link and still selectable. Case-study links stay plain underlined text.
- **Focus:** 2px signal outline, 4px offset, on every interactive element; it follows the round shapes.

### The Switch (signature component)
Built from HTML elements: a deep pressed track (2:1, sized by `--sw`, every shadow in em so one recipe serves the 210px hero switch and the 48px twin in the bar) and an orange clay ball. The outer knob element slides and carries the reveal circle's origin; the inner ball pops and squashes. The knob's resting side is CSS (`aria-pressed`); anime.js only animates the travel, from the old side to rest, as a percentage of the knob (147.06%, so it survives any size). At load the track presses in (`--press` 0 to 1, 650ms) and the ball pops (380ms). On click the knob springs across (360ms) and the page flips. The mascot perches on the top edge of the hero track. A copy lives in the floating bar with a mode label ("front" / "backstage"). Keyboard: `B`. `aria-pressed` reflects the state; the label names the action. `#backstage` in the URL opens the page already flipped; the mode is not otherwise persisted.

### Work groups and ledger rows
- **Group:** one raised slab: employer name in Org (clay type), period beside it in Dates, then the ledger, whose last row is "Also": same button, plus and grid transition as a case study, title 22px/500 in mute (20px on mobile), body a body-size list with 10px gaps, ≤ 70ch.
- **Row:** a groove above it, no background of its own, no org (the group carries it). Title 30px, years tabular, tags in mute Small right-aligned. At the right a small raised round plus button; when the row opens it sinks into a well and its mark turns 45° into a cross.
- **Open state:** the panel's grid track goes 0fr → 1fr over 360ms with the page ease; the detail sits in a pressed well inside the slab (an inner element, so the collapsed panel stays at zero height and nothing is clipped), so opening a row literally presses into the clay. Content: summary at 22px, then "The problem", "What I did", and in backstage "Under the hood" in mono. The lead case study of the first group arrives open, so a visitor who never clicks still reads one in full; every other row starts closed and inert. Without JS every row is open.
- **Backstage:** a stack chain (below) in the row's bottom padding so nothing shifts on toggle.

### Skills ladder
- **Rung:** group label (Dates, mute, 250px column) beside a wrapping list of raised pills, all the same size (20 to 22px, weight 600), 12px apart; a groove below; 26px above, 44px below (30px under 1100px). Pills are not interactive; they may lift a hair on hover.
- **Backstage:** a proof chain (below) of facts already on the page, in the rung's bottom padding on desktop.
- **Mobile (≤ 768px):** the chain leaves the padding and stacks in flow under the rung, one node per line, line hidden; it is hidden entirely in front mode so no blank band remains. Accepted trade-off: the section grows on toggle on phones.

### Chains (backstage)
The shared drawing under rows and rungs, flat on top of the clay: a 2px line in blueprint-line colour drawn left to right on reveal (460ms, visible connections only) with 11px mono node labels in amber spaced along it, each label on a page-coloured pad so it breaks the line. Nodes are `aria-hidden`; the same component serves the row's stack and the rung's proof.

### Redlines and tags (backstage)
Amber 1px measurement lines with 8px end ticks and an 11px mono label: name height, name width, gutter, intro measure. Bordered mono tags at the hero corners (route, `data-mode`, stack). All `aria-hidden`; none of them inherits the clay type's shadow. Under 768px the two name redlines and the gutter line are hidden (they quote desktop sizes and need room beside the name); the h2 label moves under its bracket.

### HUD ("Running timelines")
Fixed bottom-right, 230px, flat (not clay), 1px border, mono 11px. One row per registered animation (load, toggle) with a 2px progress bar and a percentage, updated per frame only while a visible backstage has active animations, and on scroll. Hidden on mobile and under reduced motion.

### Navigation
A floating raised lozenge, 56px tall, inset from the viewport edge by 12px (8px on phones) and aligned with the page's text column; it sticks at that inset, and the inset is in flow so the hero starts below it (`--bar-top`, included in `scroll-padding-top`). Name (600), section links (Work, Skills, Experience, About, Contact), language link in mute, small switch. The link of the section being read sits in a small pressed well; hover presses a shallow one. Under 1100px it wraps to two rows and becomes a rounded slab; the second row carries the section links, scrolling sideways if it must.

### The name
The hero `h1` keeps its live text (accessibility, no-JS, fallback). Over it lies `public/hero/name@1x.webp` / `name@2x.webp`, a frontal bas-relief of the two words in navy clay with a baked soft shadow; it is positioned inside the `h1` in em (left −0.22em, top −0.16em, 3.0727 × 2.1409em), `alt=""`, `aria-hidden`, never lazy, preloaded in the head, and it sits outside the line wrappers' `overflow: hidden`. The entrance prints the flat lines first, then the clay settles in on top (560ms fade with a 1.8% scale and lift), so the name visibly turns from print into clay once; under reduced motion it is simply there, and if it fails to load it removes itself and the flat text stays. In backstage the image is hidden and the live text becomes its own outline (ground-coloured fill under a double stroke painted first, so the glyphs' overlapping contours do not show), on screen only; the redlines still measure the same box.

## Do's and Don'ts

- Do keep every new element readable in front mode with motion off; backstage is additive.
- Do reserve the signal colour for the knob, focus ring, annotations and the single sun of the footer diorama (clay in both, the same orange). The orange circle at the top right of the first viewport and the orange sun on the shelf at the bottom of the last are the same mark: the page opens and closes on it. Nothing else earns the colour.
- Do put technical detail in "Under the hood" (backstage) rather than inflating the front copy.
- Do use grooves (2px, `--clay-lo` over `--clay-hi`) for all structure, slabs for the one or two things that deserve a floor, and pills for lists of equals.
- Do keep the light on the upper left and make every shadow from the three clay tokens.
- Do use the condensed axis (wdth 75) only at the top of a hierarchy: name, section heading, employer. Rows, subtitles and body stay at normal width.
- Do rank by type size alone; when something new needs a hierarchy, pick a size that already exists. Skills are the exception: one size, ordered.
- Don't add a grid of identical cards, glass, glossy gradients, icon tiles, bars, percentages or badges, and don't float anything on a shadow that is not one of the recipes. Don't make a second hero of the same height: the elevations alternate slab, ground, slab, flat, lumps. Raster art is the diorama, its sprites, the icons, the name's bas-relief and the 8KB grain tile. The annotations are never clay.
- Don't use the mono face in front mode, and don't use it at sizes above 13px anywhere. Don't set clay type on body, muted or small text: legibility wins.
- Don't add per-section entrance animations; the page has one load sequence, one scroll-linked line, and one toggle timeline.
- Don't introduce a third colour family; extend within bone/navy and blueprint/amber.
- Don't persist the mode between visits; every visit starts on the front (the `#backstage` hash is the only way to open flipped).

### The closing horizon

This is where the clay material of the whole page comes from, and the one place it is a rendered scene instead of CSS: the interface above it borrows its light and its matte, soft, rounded character, and every annotation on it stays a flat drawing.

A full-bleed band between the last section and the footer, holding two plates of the same composition: a day plate in front mode and a night plate in backstage, cropped to 1831×599 and shipped in `public/footer/` (with a 960w variant). Plasticine ice massifs, a shelf, the water and the sun, in the page's own bone and navy so the front plate sits on the ground; the night plate is the blueprint's blue with the sun turned amber. The plate keeps a deliberate band of empty sky: the peaks and the sun start at 37.7% of its height. The band's height follows the art, `clamp(200px, 32.72vw, 1000px)`: the whole plate shows whenever the viewport is wide enough, a phone crops the sides (keeping the sun and an iceberg), and above the cap, about 3056px, only the top of the sky is cut (20% of the art at 3840px, against 37.7% of sky). The night plate is stacked on the day one and appears only in backstage, so the circular mode wipe is already the cross-fade. A mask dissolves each plate's sky into the page and softens its bottom against the footer; both fades are measured from the art, so the top one ends above the highest peak and the sun at every width and the bottom one starts below the character's shadow, and the band has no hard edge. The band is `aria-hidden` and hidden in print; the plates carry no animation of their own.

On the shelf lives a 3D clay penguin. It is shipped as pre-rendered WebP sprite sheets in `public/penguin/`, 400×400 frames at 24 fps, described by `sprites.json`: `turn` (72 frames, 5° each), `idle`, `wave`, `rise`, `still`, each with a `-wire` twin, an amber wireframe with a transparent interior aligned pixel for pixel. One canvas draws it. In front mode it shows the clay frame; in backstage the same canvas fills the clay silhouette with the backstage ground and draws the wireframe of the very same frame over it, so the wireframe still reads as a solid object drawn in lines and nothing shows through the body (the clay frame's soft contact shadow comes along as a faint darker patch under the feet). The wipe reveals the wireframe of the very same pose because the canvas is redrawn inside the mode change itself. Clips advance by elapsed time and every change of clip dissolves over 120ms: the clay is moved by hand, but never pops. The feet stand on the middle of the shelf at every width (the ground line is 8.33% above the bottom of the frame, and the character stands 73% of its height); its square is 0.45 of the drawn plate height on a wide screen, so the character is about 60% of the tallest peak, and grows to 0.9 on a phone, as far as the head clears the corner tag.

Its behaviour: once at least 45% of the band is on screen it glides in on its belly from beyond the left edge in 1.3 seconds, a long soft deceleration like something sliding to a stop on ice, starts to rise before it has quite stopped, waves once and idles. It turns to look at the mouse, up to 90° either way, on a critically damped spring so the head follows the hand without stepping; pressing and dragging turns it 1:1 (a drag across the stage is a full turn), with a little decaying inertia, and a spring brings it back to the front by the shortest way; a tap or click, or hovering or focusing the contact button, makes it wave. In backstage a small mono tag beside it reads `sprite · turn · 14/72 · 65°`. Reduced motion, and no JavaScript, leave only the still pose, clay in front and wire in backstage. There is one mascot at a time: while the clay penguin is on stage the small mascot takes its short exit and stays away until the band scrolls back under 45%, so the small mascot's farewell on the contact button is the last thing it does before the diorama.

The footer below it drops its top rule: the ice edge is the separation. Unlike the small mascot, whose ground shadow is a separate element, the diorama's clay penguin carries a soft contact shadow baked into its frames; it belongs to the rendered scene, not to the CSS elevation recipes.

## Print

The page prints as a plain document, flat: white ground, navy ink, no shadows, grain, slabs or pills (grooves become 1px hairlines), header, footer, closing diorama, the clay name image, mascots, HUD and the whole backstage layer removed, every collapsible row forced open with its plus mark hidden, and contact links followed by their target in parentheses. Sections avoid page breaks; headings never end one.

## Identity assets

The share card at `public/og.png` (1200×630, referenced by `og:image` and `twitter:card`) is the same clay world at poster scale: the ground with its grain, the clay name from `public/hero/` at the left, the switch drawn with the same recipe as the page's, role and city as flat text, and the domain in mono. It carries no photograph; it is palette-quantised to stay under 150 KB.

The mark is a geometric FB monogram with a square F and rounded B, drawn as paths in `public/logo.svg`; it does not depend on a font. It inherits the page ink in the header, alongside the name on larger screens and on its own below 640px (the accessible link name remains Federico Barbieri). The favicon is not the monogram: it is the clay penguin's bust, the same character as the diorama's. It sits on a bone tile, never a navy one: the navy bird needs a light ground to keep its outline, on light and dark browser tabs alike. At 16px the crop tightens to the face so the eyes stay two dark dots. The icons are raster by nature: `favicon.ico`, `icon-32.png`, `icon-192.png` and a 180px `apple-touch-icon.png`; there is no SVG favicon. A browser tab is where a portfolio is remembered among thirty others, and a penguin is remembered where two initials are not. The header keeps the FB monogram.
