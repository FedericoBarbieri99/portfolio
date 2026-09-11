# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Vite (vanilla TypeScript), Tailwind CSS 4 for all styling (utilities in the render template, tokens and the two custom variants in `src/styles.css`), anime.js 4.5 as the only runtime library, self-hosted fonts. Two static HTML pages (`/` English, `/it/` Italian) rendered from one template by `scripts/render.mjs` before dev/build. Output is a plain static `dist/`; deploy is handled by the owner on federicobarbieri.it.

## Users
Recruiters and tech leads evaluating Federico Barbieri for a fullstack developer role. They arrive from LinkedIn or a CV link, usually on desktop, with 30–90 seconds of attention and several other candidates open. Their job: decide in under a minute whether he is worth a call, and find one concrete reason to remember him. Secondary: peers and potential clients who land on the domain from a shared link.

## Product Purpose
A personal portfolio for Federico Barbieri, fullstack developer (Brescia, Italy; Aitech S.r.l. since March 2025, StarkTech S.p.A. before). It exists to get him hired: show what he has built, what he can do end to end, and how to contact him. Success = the visitor writes an email or a LinkedIn message, and remembers the site.

## Positioning
The CV line the whole site is built on: *"I follow platforms end to end: what the user sees and what makes it work."* The site proves it by letting the visitor flip the page itself between its surface and its backstage. A template portfolio cannot claim that, because the mechanism is the evidence.

## Operating Context
Visited from LinkedIn profile links, CV PDFs and shared URLs. Desktop first (recruiters), mobile second (links opened from phones). Bilingual: English at the root for international recruiters, Italian at `/it/` for the local market. Read cold, without introduction, often in a browser tab among many.

## Capabilities and Constraints
- Sections, in order: hero, selected work (grouped by employer: Aitech, StarkTech, personal), skills, experience, about, contact. No blog, no CV download, no contact form.
- Contact is `mailto:` plus a LinkedIn link only. No phone number, no GitHub links, no photo, no signature.
- No screenshots or project imagery for now; the only figure is the articulated SVG penguin that lives on the right rail. Content schema leaves room for media later.
- Four showcased works, verified against git authorship: the Aitech platform ecosystem (a management platform described only as "gestionale", OIDC SSO, marketplace, ticketing, timesheet; Vaadin 25 + Spring Boot), Towedo at StarkTech (Flutter + Next.js + Firebase), App Viaggi (personal, v1 team build → v2 solo Expo rewrite), Traq (Spotify QR card game). Smaller pieces (Java Playwright scraper, Electron client, Python compliance scripts, company websites, the NDA social app) are one-line items in a collapsed "Also" row under their employer, so they never outweigh the case studies.
- Not yet publishable (September 2026): the Aitech learning platform (LMS) in any detail, Masseria Passarelli, Video Map. Refer to it only as a management platform ("gestionale") for the core business; never name the LMS domain (courses, Docebo, SCORM, certificates).
- Skills are a first-class section: a ladder of groups ordered by how much working time they take (languages, back-end, front-end, mobile, cloud, the rest), all at one size. In backstage each rung shows its evidence, drawn from facts already on the page.
- Never name the NDA client. Never claim CI/CD maturity, Kubernetes, or broad test coverage.
- Must read completely with JavaScript off and with `prefers-reduced-motion`. No scroll hijacking, no smooth-scroll library.
- Terminology: "backstage" (EN) / "backstage" (IT) for the annotated mode; "front" for the default.

## Brand Commitments
Name: Federico Barbieri. Voice: first person, direct, concrete, no hype; sentence case. Navy from his CV is a nod, not a rule. No existing logo.

## Evidence on Hand
- CV (PDF in project root, not published): bio, four roles 2020–2026, education, languages, skill list.
- Real project facts from local repositories (commit counts, stack, sizes) used to write case studies; the scan report itself stays outside the repo.
- No testimonials, no metrics from production, no press. Do not invent any.
- Masseria Passarelli and Video Map are kept out of the page for now; their case studies were removed from the content files and must be rewritten if they return.

## Product Principles
1. Evidence over adjectives: every claim traces to something he actually built.
2. The mechanism is the message: the front/backstage flip carries the positioning, everything else stays quiet.
3. Recruiter time is the budget: full picture in one scroll, contact within reach at all times.
4. Both languages are first-class; nothing ships in one language only.
5. Honest scope: real projects, verified authorship, anonymised where a contract requires it.

## Accessibility & Inclusion
Keyboard operable throughout (switch, expandable work rows, links) with visible focus. Text contrast ≥ 4.5:1 in both modes. Motion respects `prefers-reduced-motion`. Backstage annotations are `aria-hidden` decoration; nothing essential lives only there.
