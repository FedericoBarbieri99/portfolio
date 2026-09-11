---
name: federicobarbieri.it
description: One page, two faces. A quiet typographic front and an annotated blueprint backstage, switched by a physical toggle.
colors:
  bone: "#edefec"
  navy: "#111c33"
  hairline: "#c8ccc6"
  signal: "#d9481c"
  mute: "#5f6878"
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
    fontSize: "clamp(24px, 2.2vw, 32px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
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
  none: "0px"
  focus: "2px"
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
    padding: "16px 28px"
  ledger-row:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    rounded: "{rounded.none}"
    padding: "26px 0 12px"
  skill-rung:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    rounded: "{rounded.none}"
    padding: "26px 0 30px"
  annotation-tag:
    backgroundColor: "transparent"
    textColor: "{colors.amber}"
    typography: "{typography.annotation}"
    padding: "4px 6px"
---

# Design System: federicobarbieri.it

## Overview

**Creative North Star: "Doppio fondo"** (the false bottom)

The site is one page with two faces. The *front* is the surface a visitor reads: a huge condensed name, bone-white ground, navy ink, hairlines, and almost nothing else. The *backstage* is the same page inspected: the ground turns blueprint blue, amber redlines measure the hero, every project row and every skill rung grows a drawn chain of evidence beneath it, and a small panel lists the anime.js timelines actually running with live progress. Nothing is added in backstage that the front hides; it is the same content annotated. The switch that flips them is the single bold element, and the rest of the page stays disciplined so the mechanism reads as the message: *what the user sees, and what makes it work*.

Density is editorial: one column of long text, generous vertical rhythm, a wide right margin reserved for annotations. Hierarchy is carried by type size and the condensed width axis, never by colour, boxes or badges. Confirmed rejections: card grids, stat heroes, eyebrow labels, gradients, glass, skill bars or percentages, monospace as decoration in the front.

**Key Characteristics:**
- Two token sets on one DOM, switched by `data-mode` on `<html>`. The switch reveals the blueprint through a circle growing from the switch in 640ms; closing shrinks the circle back to the switch in 540ms. The mask uses viewport percentages for high-density webviews. Latest input is queued until the current reveal finishes. Without View Transitions, colours transition in 360ms; reduced motion applies state directly.
- Backstage annotates, it never decorates: every section heading carries its type spec, every section its id and padding, hovered text its computed size, and the HUD reports timelines, scroll position and the last three events.
- Ledger rows grouped under employer names instead of cards; hairlines carry all structure.
- One grotesque, two registers: the condensed axis (wdth 75, opsz 96/60) marks the top of every hierarchy (name, section headings, employer names); everything below it is the same face at normal width, opsz 30 or 17.
- Mono appears only where it is content (annotations, chains, "under the hood").
- Motion thesis: a small typographic stage. The two name lines arrive as whole printed units over 700ms, 110ms apart; the switch draws and supporting text follows within one second. Content remains static during reading. Project panels unfold in 360ms, their contents enter in a bounded 280ms stagger, and the plus turns in 220ms. Navigation marks the section currently being read.
- The stagehand is a rounded penguin, 48px wide on desktop and 40px below 768px, on a 64×72 SVG canvas. Navy (#17253e), warm ivory (#fff9e9), orange (#ec793b), with a light edge in backstage. It starts on top of the switch and makes a small celebratory hop after the mode change finishes. Scroll chooses its surface only after settling for 180ms. Close perches use a look, 130ms crouch, 320–520ms arc and 230ms landing; distant perches use a 150ms fade-out and 320ms local arrival. No page-wide crossing or fall from the header. Live bounds keep its feet on opening rows. A single abortable scene prevents competing gestures. Accessories are tied to sections, and contact earns a 760ms wave with smiling eyes. Breathing (4200ms) and blinking (7200ms) use CSS only while idle. Reduced motion and page suspension hide the character; focus and hover on contact can repeat its greeting.

## Colors

Cold bone and navy at rest; blueprint blue with amber marks in backstage. One signal colour per mode, used as a marker, never as running text.

### Primary
- **Navy** (#111c33): all front text, the switch track, the primary button ground. A nod to the CV's blue without copying it.
- **Blueprint** (#0f2451): the backstage ground. The page becomes the drawing.

### Secondary
- **Signal orange** (#d9481c): the switch knob and focus ring in front mode. Never used for text on bone (contrast is below 4.5:1).
- **Amber** (#ffb03b): the knob, every redline, corner tag, chain node and HUD heading in backstage. Also the HUD progress bars.

### Neutral
- **Bone** (#edefec): front ground and backstage text.
- **Hairline** (#c8ccc6): every rule and border in front; the chain line, and the dot separators between skills.
- **Blueprint line** (#5c7dc7): the same roles in backstage.
- **Mute** (#5f6878) / **Blueprint mute** (#9fb4e0): secondary text (employer periods, tags, dates, skill group labels, the "Also" row title, hints, definition labels), tinted toward each ground rather than gray.

### Named Rules
**The One Marker Rule.** The signal colour has three roles: the knob, the focus ring, and backstage annotation (redlines, tags, chain nodes, HUD). It never colours body text, headings or backgrounds. If it starts doing so, it stops being a marker.
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
- **Skill** (600, clamp(24px, 2.2vw, 32px), 1.15, -0.015em, opsz 30): every rung at the same size; rungs are ordered by working time, never sized by it. Items are set apart by a 1em gap, no separator glyph.
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

A single 1440px max column with a fluid gutter (`clamp(20px, 4vw, 64px)`); content is left-aligned and the right margin stays empty for the annotations and the penguin. Sections are separated by a hairline and `clamp(72px, 11vh, 150px)` of padding. Section order: hero, work, skills, experience, about, contact; the sticky bar links to the last five.

Hero: a two-column grid, name left, switch bottom-right of the name row, role and intro full width beneath; min-height fills the viewport under the 56px sticky bar. Work: employer groups (org name · period, 8px below), each holding a ledger of rows (title · years · tags · +; the grid is `1fr 7.5em auto 24px`) that expand in place with a CSS grid-rows transition, one open at a time, closed by an "Also" row (title 22px/500 in mute, tags column carries a short summary) that expands to a plain list of smaller things done there; groups are `clamp(56px, 8vh, 96px)` apart. Skills: a ladder of rungs on a 250px label / 1fr items grid, 32px gap, hairline between rungs. Experience and education: the same 250px date column and text column. About: one column of lede text, ≤ 60ch. Contact: note, pill button, LinkedIn link, plain email.

Under 900px rows restack (title on the first line, years in mute Dates and tags on the second, the plus spanning both; years never wrap), and the skills, experience and education grids collapse to one column with 8px row gap. Under 768px the hero becomes one column with the switch under the name; the HUD, the name redlines and the gutter line are removed (corner tags, section tags, h2 brackets and the penguin stay); row titles drop to 24px; row chains fade out at the right edge instead of wrapping; skill chains leave the padding and stack in flow under the rung (see Components); the bar's mode label is hidden so the toggle keeps its gutter. Under 640px the section nav is hidden.

## Elevation & Depth

No shadows anywhere. Depth is conveyed by the mode flip itself (ground colour), by hairlines, and by the sticky bar sharing the page ground with a single bottom rule. The HUD panel and bar are flat surfaces on the page colour with a 1px border.

### Named Rules
**The Flat Drawing Rule.** Nothing floats. If an element needs separation, it gets a hairline, not a shadow.

## Shapes

Rectangles with zero radius for every container, rule and tag. Exactly two round shapes exist: the physical switch (pill track, circular knob) and the primary contact button, which borrows the switch's pill so the two "do something" controls share a silhouette. Rules are 1px; the switch track is 3px (7px in the bar copy); the chain line and the plus strokes are 2px.

## Components

### Buttons
- **Shape:** pill (999px)
- **Primary ("Write me an email"):** navy ground, bone text, 16px 28px padding, weight 600. Press contracts to 97% over 180ms without moving its perch. In backstage the roles invert with the tokens.
- **Secondary:** plain underlined text links (LinkedIn, email, case-study links).
- **Focus:** 2px signal outline, 4px offset, on every interactive element.

### The Switch (signature component)
An SVG toggle: a 200×100 pill track stroked in ink and a knob filled with the signal colour. At load the track draws itself (`svg.createDrawable`) and the knob pops in on a spring. On click the knob springs from cx 50 to 150 and the page flips. A 40×20 copy lives in the sticky bar with a mode label ("front" / "backstage"). Keyboard: `B`. `aria-pressed` reflects the state; the label names the action. `#backstage` in the URL opens the page already flipped; the mode is not otherwise persisted.

### Work groups and ledger rows
- **Group:** employer name in Org, period beside it in Dates, then the ledger, whose last row is "Also": same button, plus and grid transition as a case study, title 22px/500 in mute (20px on mobile), body a body-size list with 10px gaps, ≤ 70ch.
- **Row:** hairline above and below, no background, no org (the group carries it). Title 30px, years tabular, tags in mute Small right-aligned. A drawn plus at the right rotates 45° into a close mark when open.
- **Open state:** the panel's grid track goes 0fr → 1fr over 550ms with the page ease; body padding grows to 36px. Content: summary at 22px, then "The problem", "What I did", and in backstage "Under the hood" in mono. Without JS every row is open.
- **Backstage:** a stack chain (below) in the row's bottom padding so nothing shifts on toggle.

### Skills ladder
- **Rung:** group label (Dates, mute, 250px column) beside a wrapping list of skills at the one skill size, 1em apart; hairline below; 26px above, 30px below.
- **Backstage:** a proof chain (below) of facts already on the page, in the rung's bottom padding on desktop.
- **Mobile (≤ 768px):** the chain leaves the padding and stacks in flow under the rung, one node per line, line hidden; it is hidden entirely in front mode so no blank band remains. Accepted trade-off: the section grows on toggle on phones.

### Chains (backstage)
The shared drawing under rows and rungs: a 2px line in hairline colour drawn left to right on reveal (460ms, visible connections only) with 11px mono node labels in amber spaced along it, each label on a page-coloured pad so it breaks the line. Nodes are `aria-hidden`; the same component serves the row's stack and the rung's proof.

### Redlines and tags (backstage)
Amber 1px measurement lines with 8px end ticks and an 11px mono label: name height, name width, gutter, intro measure. Bordered mono tags at the hero corners (route, `data-mode`, stack). All `aria-hidden`. Under 768px the two name redlines and the gutter line are hidden (they quote desktop sizes and need room beside the name); the h2 label moves under its bracket.

### HUD ("Running timelines")
Fixed bottom-right, 230px, 1px border, mono 11px. One row per registered animation (load, toggle) with a 2px progress bar and a percentage, updated per frame only while a visible backstage has active animations, and on scroll. Hidden on mobile and under reduced motion.

### Navigation
Sticky 56px bar: name (600), section links (Work, Skills, Experience, About, Contact), language link in mute, small switch. Links underline on hover. On mobile only name, language and switch remain.

## Do's and Don'ts

- Do keep every new element readable in front mode with motion off; backstage is additive.
- Do reserve the signal colour for the knob, focus ring and annotations.
- Do put technical detail in "Under the hood" (backstage) rather than inflating the front copy.
- Do use hairlines (1px, `--line`) for all structure; never boxes with backgrounds.
- Do use the condensed axis (wdth 75) only at the top of a hierarchy: name, section heading, employer. Rows, subtitles and body stay at normal width.
- Do rank by type size alone; when something new needs a hierarchy, pick a size that already exists. Skills are the exception: one size, ordered.
- Don't add cards, shadows, gradients, glass, icon tiles, bars, percentages or badges.
- Don't use the mono face in front mode, and don't use it at sizes above 13px anywhere.
- Don't add per-section entrance animations; the page has one load sequence, one scroll-linked line, and one toggle timeline.
- Don't introduce a third colour family; extend within bone/navy and blueprint/amber.
- Don't persist the mode between visits; every visit starts on the front (the `#backstage` hash is the only way to open flipped).

## Identity assets

The mark is a geometric FB monogram with a square F and rounded B, drawn as paths in `public/logo.svg`; it does not depend on a font. It inherits the page ink in the header, alongside the name on larger screens and on its own below 640px (the accessible link name remains Federico Barbieri). The favicon uses the same ivory mark on a navy tile with a 14px corner radius. SVG, ICO and a 180px Apple touch icon share the same silhouette.
