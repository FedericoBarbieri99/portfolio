// Renders index.html (EN) and it/index.html (IT) from the content files.
// Runs before `vite dev` and `vite build` (see package.json). Node 24 strips the TS types.
// Styling is Tailwind utilities written here; src/styles.css holds tokens, variants and base rules.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import en from '../src/content/en.ts';
import it from '../src/content/it.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://federicobarbieri.it';
const brand = readFileSync(resolve(root, 'public/logo.svg'), 'utf8')
  .replace('fill="#111c33" role="img" aria-labelledby="title"', 'fill="currentColor" class="w-8 h-8 shrink-0" aria-hidden="true" focusable="false"')
  .replace(/\s*<title[^>]*>.*?<\/title>/, '');

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// [[phrase]] marks words the penguin walks behind: same ground colour, stacked above it
const rich = (s) => esc(s).replace(/\[\[(.+?)\]\]/g, '<span data-phrase class="relative z-2 bg-bg">$1</span>');

// ---------- shared class strings (whole tokens only, so Tailwind's scanner sees them) ----------
const SECTION = 'relative py-[clamp(72px,11vh,150px)] border-t border-line';
const H2 = 'relative w-fit max-w-full text-[clamp(40px,6vw,80px)] font-extrabold font-stretch-75% tracking-[-0.03em] leading-[0.95] opsz-96 mb-11 text-balance';
// two-column rows: label column left, content right; stacked under 900px
const COLS = 'grid grid-cols-[250px_minmax(0,1fr)] gap-x-8 max-lg:grid-cols-1 max-lg:gap-y-2';
const MUTE_MD = 'text-md text-mute';
// redline: amber mono annotation, its label comes from data-label
const RL = 'absolute font-mono text-xs leading-none tracking-[0.01em] text-signal pointer-events-none after:content-[attr(data-label)] after:absolute after:whitespace-nowrap';
const TAG = 'absolute font-mono text-xs leading-none tracking-[0.01em] text-signal pointer-events-none px-1.5 py-1 border border-signal';

// measuring bracket under the heading, its label to the right (under it on phones, where there is no room beside)
const bracket = (label) =>
  `<span class="${RL} bs inset-x-0 -bottom-[14px] after:left-full after:ml-2 after:-top-1.5 max-md:after:left-0 max-md:after:ml-0 max-md:after:top-1.5 border-t border-signal before:content-[''] before:absolute before:-top-1 before:inset-x-0 before:h-2 before:border-x before:border-signal" aria-hidden="true" data-label="${esc(label)}"></span>`;

// section heading with its backstage spec, plus the section's id tag in the corner
const heading = (id, text, ui) =>
  `<h2 class="${H2}" id="${id}-h">${esc(text)}${bracket(ui.rlH2)}</h2>
      <span class="${TAG} bs top-4 right-0" aria-hidden="true">#${id} · ${esc(ui.rlSection)}</span>`;

// physical toggle: a drawn track and a knob that anime.js slides
const switchSvg = (cls, stroke, hero) => `
<svg class="${cls}" viewBox="0 0 200 100" aria-hidden="true" focusable="false">
  <path ${hero ? 'data-hero-track' : ''} class="fill-none stroke-ink ${stroke} [stroke-linecap:round]" d="M50 4 H150 A46 46 0 0 1 150 96 H50 A46 46 0 0 1 50 4 Z" />
  <circle data-knob ${hero ? 'data-hero-knob' : ''} class="fill-signal" cx="50" cy="50" r="34" />
</svg>`;

// backstage-only chain of amber nodes on a drawn line. In a work row it sits in the bottom padding
// (no layout shift on toggle); under a skill rung on mobile it stacks in flow so every node stays readable.
function chain(nodes, skill = false) {
  const wrap = skill ? 'max-[1100px]:static max-[1100px]:col-span-full max-[1100px]:h-auto max-[1100px]:mt-3 max-[1100px]:not-bs:hidden' : '';
  const list = skill
    ? 'max-[1100px]:grid max-[1100px]:gap-1 max-[1100px]:whitespace-normal'
    : 'max-md:justify-start max-md:gap-3.5 max-md:overflow-hidden max-md:mask-r-from-78%';
  const li = skill ? 'max-[1100px]:p-0' : '';
  return `
  <div class="bs absolute inset-x-0 bottom-2 h-[18px] ${wrap}" aria-hidden="true">
    <svg class="absolute inset-x-0 top-[9px] w-full h-[2px] ${skill ? 'max-[1100px]:hidden' : ''}" viewBox="0 0 1000 2" preserveAspectRatio="none"><path data-chain-line class="fill-none stroke-line stroke-2" d="M0 1 H1000" /></svg>
    <ol class="relative flex justify-between font-mono text-xs leading-[18px] text-signal whitespace-nowrap ${list}">${nodes.map((c) => `<li class="px-2 bg-bg first:pl-0 last:pr-0 ${li}">${esc(c)}</li>`).join('')}</ol>
  </div>`;
}

// collapsible row head: title / years / tags / plus, reflowing to two lines under 900px
function rowHead(id, title, years, tags, quiet) {
  return `
  <h4 class="m-0 font-normal">
    <button data-row class="group grid grid-cols-[minmax(0,1fr)_7.5em_auto_24px] items-baseline gap-x-6 w-full ${quiet ? 'pt-5' : 'pt-[26px]'} pb-3 text-left cursor-pointer max-lg:grid-cols-[auto_minmax(0,1fr)_24px] max-lg:[grid-template-areas:'title_title_plus'_'years_tags_plus'] max-lg:gap-y-1.5" type="button" aria-expanded="false" aria-controls="p-${id}">
      <span class="${quiet ? 'text-sub font-medium text-mute max-md:text-[20px]' : 'text-title font-semibold tracking-[-0.015em] opsz-30 max-md:text-[24px]'} leading-[1.1] project-title max-lg:[grid-area:title]">${esc(title)}</span>
      <span class="tabular-nums max-lg:[grid-area:years] max-lg:text-md max-lg:text-mute max-lg:whitespace-nowrap">${esc(years)}</span>
      <span class="text-sm text-mute justify-self-end text-right max-lg:[grid-area:tags]">${esc(tags)}</span>
      <span class="relative w-[18px] h-[18px] self-center justify-self-end transition-transform duration-[220ms] ease-page group-aria-expanded:rotate-45 before:content-[''] before:absolute before:left-0 before:top-2 before:w-[18px] before:h-0.5 before:bg-current after:content-[''] after:absolute after:left-0 after:top-2 after:w-[18px] after:h-0.5 after:bg-current after:rotate-90 max-lg:[grid-area:plus]" aria-hidden="true"></span>
    </button>
  </h4>`;
}

// expandable panel: CSS grid transition, open by default without JS
const PANEL = 'grid grid-rows-[1fr] js:not-data-open:grid-rows-[0fr] transition-[grid-template-rows] duration-[360ms] ease-page';
const BODY = 'overflow-hidden min-h-0 grid gap-[26px] max-w-[70ch] pb-3 js:not-in-data-open:pb-0 js:in-data-open:pb-9';

function workRow(w, ui) {
  return `
<li class="relative border-b border-line pb-3.5" id="w-${w.id}">${rowHead(w.id, w.title, w.years, w.tags.join(', '), false)}
  <p class="max-w-[70ch] pb-7 text-mute leading-[1.55] text-pretty">${esc(w.summary)}</p>
  <div class="${PANEL}" id="p-${w.id}">
    <div class="${BODY}">
      <dl class="grid gap-[22px]">
        <div><dt class="text-sm text-mute mb-1.5">${esc(ui.problem)}</dt><dd class="leading-[1.55] text-pretty">${esc(w.problem)}</dd></div>
        <div><dt class="text-sm text-mute mb-1.5">${esc(ui.did)}</dt><dd class="leading-[1.55] text-pretty">${esc(w.did)}</dd></div>
        <div data-under class="bs not-bs:hidden"><dt class="text-sm text-mute mb-1.5">${esc(ui.under)}</dt><dd class="font-mono text-[13px] leading-[1.65] text-mute text-pretty">${esc(w.under)}</dd></div>
      </dl>
      ${w.link ? `<a class="w-fit underline" href="${esc(w.link.href)}" rel="noopener">${esc(w.link.label)}</a>` : ''}
    </div>
  </div>
${chain(w.chain)}
</li>`;
}

// One employer: condensed display name, period, its rows, then the smaller things done there.
function workGroup(g, ui) {
  return `
<li class="not-first:mt-[clamp(56px,8vh,96px)]" id="g-${g.id}">
  <h3 class="flex items-baseline flex-wrap gap-x-[22px] gap-y-2 mb-2"><span class="text-[clamp(34px,4.2vw,60px)] font-bold font-stretch-75% tracking-[-0.025em] leading-none opsz-60">${esc(g.org)}</span><span class="${MUTE_MD} tabular-nums">${esc(g.period)}</span></h3>
  <ol class="border-t border-line">${g.works.map((w) => workRow(w, ui)).join('')}${g.also.length ? alsoRow(g, ui) : ''}
  </ol>
</li>`;
}

// The smaller things done at one employer: a quieter row, collapsed like the case studies.
function alsoRow(g, ui) {
  return `
<li class="relative border-b border-line pb-3.5" id="w-also-${g.id}">${rowHead(`also-${g.id}`, ui.alsoHeading, '', g.alsoTags, true)}
  <div class="${PANEL}" id="p-also-${g.id}">
    <div class="${BODY}">
      <ul class="grid gap-2.5 text-pretty">${g.also.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
    </div>
  </div>
</li>`;
}

// Skills ladder: one size for every rung, items set apart by space alone; backstage draws the evidence under each rung.
const SKILL = 'text-[clamp(24px,2.2vw,32px)] font-semibold tracking-[-0.015em] leading-[1.15] opsz-30';
function skillRow(s) {
  return `
<li class="relative ${COLS} py-[26px] pb-[30px] border-b border-line max-md:gap-y-2.5">
  <h3 class="${MUTE_MD} font-normal pt-[0.45em] max-md:pt-0">${esc(s.group)}</h3>
  <ul class="flex flex-wrap items-baseline gap-x-[1em] gap-y-[0.1em] text-balance ${SKILL}">${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
${chain(s.proof, true)}
</li>`;
}

function page(c) {
  const { ui, hero, contact } = c;
  const alt = c.lang === 'en' ? it : en;
  const navLink = 'inline-flex items-center min-h-11 shrink-0 no-underline nav-link';
  return `<!doctype html>
<html lang="${c.lang}" data-mode="front">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(c.meta.title)}</title>
  <meta name="description" content="${esc(c.meta.description)}" />
  <link rel="canonical" href="${SITE}${c.dir}" />
  <link rel="alternate" hreflang="${c.lang}" href="${SITE}${c.dir}" />
  <link rel="alternate" hreflang="${alt.lang}" href="${SITE}${alt.dir}" />
  <link rel="alternate" hreflang="x-default" href="${SITE}/" />
  <meta property="og:title" content="${esc(c.meta.title)}" />
  <meta property="og:description" content="${esc(c.meta.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE}${c.dir}" />
  <meta name="theme-color" content="#EDEFEC" />
  <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
  <link rel="preload" href="/fonts/bricolage-grotesque-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/src/styles.css" />
  <script type="module" src="/src/main.ts"></script>
</head>
<body class="relative bg-bg text-ink font-sans text-base overflow-x-clip">
  <a class="absolute left-gutter -top-[100px] focus:top-2 px-3.5 py-2.5 bg-ink text-bg z-20" href="#work">${esc(ui.skip)}</a>

  <header class="sticky top-0 z-10 flex items-center gap-x-7 h-bar px-gutter bg-bg border-b border-line text-sm max-[1100px]:flex-wrap max-[1100px]:gap-x-4 max-sm:gap-x-1.5">
    <a class="font-semibold mr-auto gap-2.5 ${navLink}" href="#top">${brand}<span class="max-sm:sr-only">Federico Barbieri</span></a>
    <nav class="flex gap-[22px] max-[1100px]:order-last max-[1100px]:w-full max-[1100px]:overflow-x-auto max-[1100px]:-mt-1 max-[1100px]:gap-6" aria-label="${esc(ui.navLabel)}">
      <a class="${navLink}" href="#work">${esc(ui.navWork)}</a>
      <a class="${navLink}" href="#skills">${esc(ui.navSkills)}</a>
      <a class="${navLink}" href="#experience">${esc(ui.navExperience)}</a>
      <a class="${navLink}" href="#about">${esc(ui.navAbout)}</a>
      <a class="${navLink} max-[1100px]:hidden" href="#contact">${esc(ui.navContact)}</a>
    </nav>
    <a class="${navLink} min-[1100px]:hidden" href="#contact">${esc(ui.navContact)}</a>
    <a class="text-mute ${navLink}" href="${c.other.href}" hreflang="${c.other.code}" lang="${c.other.code}">${esc(c.other.label)}</a>
    <button class="inline-flex items-center justify-center min-w-11 min-h-11 gap-2 cursor-pointer not-js:hidden" type="button" data-toggle aria-pressed="false" aria-label="${esc(ui.toggleLabel)}">
      ${switchSvg('w-10 h-5', 'stroke-7', false)}
      <span class="min-w-[5.5em] text-left text-mute max-[1100px]:hidden" data-mode-label data-front="${esc(ui.modeFront)}" data-backstage="${esc(ui.modeBackstage)}">${esc(ui.modeFront)}</span>
    </button>
  </header>

  <main id="top" class="max-w-[1440px] mx-auto px-gutter">
    <section class="relative min-h-[min(820px,calc(100svh-var(--spacing-bar)))] grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto_1fr_auto] gap-x-10 pt-[clamp(48px,12vh,140px)] pb-11 max-md:gap-x-5 max-md:pt-12" aria-labelledby="hero-name">
      <h1 class="col-start-1 row-start-1 relative w-fit max-w-full text-[clamp(88px,14vw,220px)] font-extrabold font-stretch-75% opsz-96 leading-[0.86] tracking-[-0.03em] max-md:text-[clamp(64px,19vw,120px)]" id="hero-name">
        <span class="block overflow-hidden pb-[0.05em] -mb-[0.05em]"><span class="block origin-bottom-left" data-name-line>${esc(hero.first)}</span></span>
        <span class="block overflow-hidden pb-[0.05em] -mb-[0.05em]"><span class="block origin-bottom-left" data-name-line>${esc(hero.last)}</span></span>
        <!-- the h1 redlines quote the desktop size and need room to its right: desktop only -->
        <span class="${RL} bs max-md:hidden inset-y-0 -right-[30px] border-l border-signal before:content-[''] before:absolute before:-left-1 before:inset-y-0 before:w-2 before:border-y before:border-signal after:left-2.5 after:-top-0.5" aria-hidden="true" data-label="${esc(ui.rlName)}"></span>
        <span class="${RL} bs max-md:hidden inset-x-0 -bottom-[22px] border-t border-signal before:content-[''] before:absolute before:-top-1 before:inset-x-0 before:h-2 before:border-x before:border-signal after:left-0 after:top-2" aria-hidden="true" data-label="${esc(ui.rlSize)}"></span>
      </h1>
      <div class="col-start-2 row-start-1 self-end justify-self-end w-[clamp(150px,15vw,210px)] text-right max-md:w-[clamp(96px,19vw,150px)] not-js:hidden">
        <button class="relative z-2 block w-full cursor-pointer rounded-full [&:hover_circle]:brightness-[1.08]" type="button" data-toggle aria-pressed="false" aria-label="${esc(ui.toggleLabel)}">
          ${switchSvg('block w-full h-auto', 'stroke-3', true)}
        </button>
        <p class="mt-3.5 text-sm leading-[1.4] text-mute max-w-[20ch] ml-auto text-balance" data-fade>${esc(ui.toggleHint)}</p>
      </div>
      <p class="col-span-full row-start-2 mt-[clamp(32px,5vh,56px)] text-sub font-medium leading-[1.3]" data-fade>${esc(hero.role)}<span class="block font-normal text-mute">${esc(hero.place)}</span></p>
      <p class="col-span-full row-start-3 relative self-start mt-[22px] max-w-[60ch] text-lede" data-fade>${esc(hero.intro)}<span class="${RL} bs inset-x-0 -bottom-[18px] border-t border-signal after:right-0 after:top-1.5" aria-hidden="true" data-label="${esc(ui.rlMeasure)}"></span></p>
      <a class="col-span-full row-start-4 flex items-center justify-between min-h-11 mt-14 w-full font-medium underline underline-offset-4 group" href="#work" data-fade>
        ${esc(ui.exploreWork)}
        <svg class="w-5 h-5 group-hover:translate-y-1 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3v17m-7-7 7 7 7-7" /></svg>
      </a>

      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <span class="${RL} bs max-md:hidden top-[calc(clamp(48px,12vh,140px)_-_28px)] -left-gutter w-gutter border-t border-dashed border-signal after:left-0 after:-top-4" data-label="${esc(ui.rlGutter)}"></span>
        <span class="${TAG} bs top-3.5 left-0">${esc(ui.rlRoute)}</span>
        <span class="${TAG} bs top-3.5 right-0">${esc(ui.rlMode)}</span>
        <span class="${TAG} bs bottom-3.5 left-0">${esc(ui.rlStack)}</span>
      </div>
    </section>

    <section class="${SECTION}" id="work" aria-labelledby="work-h">
      ${heading('work', ui.workHeading, ui)}
      <ol>${c.groups.map((g) => workGroup(g, ui)).join('')}
      </ol>
    </section>

    <section class="${SECTION}" id="skills" aria-labelledby="skills-h">
      ${heading('skills', ui.skillsHeading, ui)}
      <p class="-mt-[26px] mb-11 max-w-[44ch] text-lede text-mute text-pretty">${esc(ui.skillsNote)}</p>
      <ol class="border-t border-line">${c.skills.map(skillRow).join('')}
      </ol>
    </section>

    <section class="${SECTION}" id="experience" aria-labelledby="experience-h">
      ${heading('experience', ui.expHeading, ui)}
      <ol class="border-t border-line">${c.experience
        .map(
          (e) => `
        <li class="${COLS} py-7 border-b border-line">
          <p class="${MUTE_MD} tabular-nums pt-[5px]"><time>${esc(e.from)}</time><span class="inline-block w-3 mx-2 border-t border-current align-middle"></span><time>${esc(e.to)}</time></p>
          <div>
            <h3 class="text-sub font-semibold leading-[1.25] mb-2">${esc(e.role)}<span class="block font-normal text-mute text-base">${esc(e.org)}</span></h3>
            <p class="max-w-[65ch] text-pretty">${esc(e.text)}</p>
          </div>
        </li>`,
        )
        .join('')}
      </ol>
      <h3 class="mt-14 mb-3.5 text-sub font-semibold">${esc(ui.eduHeading)}</h3>
      <ul>${c.education
        .map((e) => `<li class="${COLS} py-3.5 border-b border-line"><span class="${MUTE_MD} tabular-nums pt-0.5">${esc(e.years)}</span><span class="font-semibold">${esc(e.school)}</span><span class="col-start-2 text-mute max-lg:col-start-1">${esc(e.what)}</span></li>`)
        .join('')}</ul>
    </section>

    <section class="${SECTION}" id="about" aria-labelledby="about-h">
      ${heading('about', ui.aboutHeading, ui)}
      <div class="grid gap-[18px] max-w-[60ch] text-lede">${c.about.paragraphs.map((p) => `<p>${rich(p)}</p>`).join('')}
        <p class="text-mute text-base">${esc(c.about.languages)}</p>
      </div>
    </section>

    <section class="${SECTION}" id="contact" aria-labelledby="contact-h">
      ${heading('contact', ui.contactHeading, ui)}
      <p class="text-sub max-w-[40ch] text-pretty">${rich(contact.note)}</p>
      <p class="flex items-center gap-7 mt-9 max-sm:flex-wrap">
        <a data-cta class="relative z-2 inline-block px-7 py-4 bg-ink text-bg rounded-full no-underline font-semibold contact-action" href="mailto:${esc(contact.email)}">${esc(contact.cta)}</a>
        <a class="underline" href="${esc(contact.linkedin)}" rel="me noopener">LinkedIn</a>
      </p>
      <p class="mt-7 text-mute"><a class="underline" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
    </section>
  </main>

  <footer class="px-gutter pt-8 pb-10 border-t border-line text-sm text-mute">
    <p>© ${new Date().getFullYear()} Federico Barbieri. ${esc(ui.footer)}</p>
  </footer>

  <!-- A compact, articulated character: stable plumage in both page modes. -->
  <div data-penguin hidden data-state="hidden" class="absolute top-0 left-0 z-1 origin-bottom pointer-events-none motion-reduce:hidden" aria-hidden="true">
    <svg viewBox="0 0 64 72" class="block w-full h-auto overflow-visible">
      <g data-penguin-body>
        <path class="penguin-dark penguin-outline" d="M14 31C7 34 3 42 5 50Q6 54 9 51L19 38Z" />
        <path class="penguin-accent" data-foot d="M20 63Q17 65 15 69Q14 71 18 71H29Q32 70 29 67L27 63Z" />
        <path class="penguin-accent" data-foot d="M38 63L36 67Q34 71 38 71H50Q53 71 50 68L45 63Z" />
        <path class="penguin-dark penguin-outline" d="M32 7C20 7 13 16 13 29C13 36 9 40 10 49C10 61 19 67 32 67C46 67 54 60 54 48C54 40 50 34 50 26C49 14 43 7 32 7Z" />
        <path class="penguin-dark" d="M28 9Q27 2 34 3L33 7Q38 2 42 6L39 12Z" />
        <path class="penguin-cream" d="M17 29C15 20 21 16 26 18Q30 19 32 23Q37 16 42 20C47 24 44 31 42 36C41 40 47 46 46 52C45 59 40 63 31 63C21 63 15 58 15 51C14 42 21 37 17 29Z" />
        <path class="penguin-belly" d="M16 50C21 60 37 63 45 52C45 60 39 64 31 64C23 64 16 59 16 50Z" />
        <g data-eye>
          <ellipse class="penguin-dark" data-pupil cx="23" cy="27" rx="2.8" ry="3.7" />
          <circle class="penguin-cream" cx="22.2" cy="25.8" r="0.9" />
        </g>
        <g data-eye>
          <ellipse class="penguin-dark" data-pupil cx="37" cy="27" rx="2.5" ry="3.4" />
          <circle class="penguin-cream" cx="36.3" cy="25.9" r="0.85" />
        </g>
        <g data-eyes-happy fill="none" stroke="var(--penguin-dark)" stroke-width="2.5" stroke-linecap="round">
          <path d="M20 28Q23 23 26 28M34 28Q37 23 40 28" />
        </g>
        <path class="penguin-accent" d="M23 33Q28 29 33 33Q32 37 28 38Q24 37 23 33Z" />
        <path fill="none" stroke="var(--penguin-dark)" stroke-width="0.8" stroke-linecap="round" opacity="0.35" d="M24 33.5Q28 35 32 33.5" />
        <g data-prop="scarf" hidden>
          <path class="penguin-accent" d="M16 38Q30 44 45 38L46 43Q30 49 16 43Z" />
          <path class="penguin-accent" d="M36 43L44 43L43 55L36 52Z" />
          <path fill="none" stroke="var(--penguin-cream)" stroke-width="1.4" opacity="0.6" d="M38 50L43 52" />
        </g>
        <g data-prop="beanie" hidden>
          <path class="penguin-accent" d="M14 20C13 0 49 0 49 20Q31 15 14 20Z" />
          <path class="penguin-cream" d="M13 17Q30 12 50 17L50 22Q31 17 13 22Z" />
          <circle class="penguin-cream" cx="33" cy="4" r="3.5" />
        </g>
        <g data-prop="bowtie" hidden>
          <path class="penguin-accent" d="M30 43L22 39Q20 44 22 49L30 45L39 49Q41 44 39 39Z" />
          <circle class="penguin-cream" cx="30" cy="44" r="2" />
        </g>
        <g data-prop="glasses" hidden fill="none" stroke="var(--penguin-dark)" stroke-width="1.6">
          <circle cx="23" cy="27" r="5.8" /><circle cx="37" cy="27" r="5.4" />
          <path d="M29 26H32M17 25L14 23M43 25L47 23" />
        </g>
        <g data-prop="headphones" hidden>
          <path fill="none" stroke="var(--penguin-accent)" stroke-width="3" d="M13 27C7 1 53 0 50 27" />
          <rect class="penguin-accent" x="10" y="23" width="6" height="12" rx="3" />
          <rect class="penguin-accent" x="47" y="23" width="6" height="12" rx="3" />
        </g>
        <path data-wing class="penguin-dark penguin-outline" d="M47 33C53 34 58 41 60 49Q61 54 57 53C51 50 46 44 44 39Q42 34 47 33Z" />
        <path fill="none" stroke="var(--penguin-cream)" stroke-linecap="round" stroke-width="1.1" opacity="0.22" d="M47 17Q50 20 49 25" />
      </g>
    </svg>
  </div>
  <span hidden data-penguin-label data-prefix="${esc(ui.rlMascot)}" class="bs absolute top-0 left-0 z-1 font-mono text-xs leading-none tracking-[0.01em] text-signal whitespace-nowrap pointer-events-none" aria-hidden="true"></span>
  <!-- live timelines panel (backstage) -->
  <aside data-hud class="bs fixed right-gutter bottom-4 z-9 w-[230px] pt-2.5 px-3 pb-3 border border-line bg-bg font-mono text-xs text-mute max-md:hidden motion-reduce:hidden" aria-hidden="true">
    <p class="mb-2 text-signal">${esc(ui.tlPanel)}</p>
    <ul class="grid gap-[7px]" data-tl-list></ul>
    <p class="mt-2.5 pt-2 border-t border-line flex justify-between tabular-nums"><span>${esc(ui.hudScroll)}</span><span data-hud-scroll>0px · 0%</span></p>
    <p class="mt-2 pt-2 border-t border-line text-signal">${esc(ui.hudLog)}</p>
    <ul class="grid gap-1 mt-1" data-hud-log></ul>
  </aside>
  <!-- hover inspector (backstage, desktop): the page reads its own computed type -->
  <div data-inspect hidden class="fixed top-0 left-0 z-20 pointer-events-none px-1.5 py-1 border border-signal bg-bg font-mono text-xs leading-none text-signal whitespace-nowrap" aria-hidden="true"></div>
</body>
</html>
`;
}

const out = [
  ['index.html', page(en)],
  ['it/index.html', page(it)],
];
for (const [file, html] of out) {
  const path = resolve(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
  console.log('rendered', file);
}
