// Renders index.html (EN) and it/index.html (IT) from the content files.
// Runs before `vite dev` and `vite build` (see package.json). Node 24 strips the TS types.
// Styling is Tailwind utilities written here; src/styles.css holds tokens, variants and base rules.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import en from '../src/content/en.ts';
import it from '../src/content/it.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://federicobarbieri.it';

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
const RL = 'absolute font-mono text-xs leading-none tracking-[0.01em] text-signal pointer-events-none after:content-[attr(data-label)] after:absolute after:whitespace-nowrap max-md:hidden';
const TAG = 'absolute font-mono text-xs leading-none tracking-[0.01em] text-signal pointer-events-none px-1.5 py-1 border border-signal max-md:hidden';

// measuring bracket under the heading, its label to the right
const bracket = (label) =>
  `<span class="${RL} bs inset-x-0 -bottom-[14px] after:left-full after:ml-2 after:-top-1.5 border-t border-signal before:content-[''] before:absolute before:-top-1 before:inset-x-0 before:h-2 before:border-x before:border-signal" aria-hidden="true" data-label="${esc(label)}"></span>`;

// section heading with its backstage spec, plus the section's id tag in the corner
const heading = (id, text, ui) =>
  `<h2 class="${H2}" id="${id}-h">${esc(text)}${bracket(ui.rlH2)}</h2>
      <span class="${TAG} bs top-4 right-0">#${id} · ${esc(ui.rlSection)}</span>`;

// physical toggle: a drawn track and a knob that anime.js slides
const switchSvg = (cls, stroke, hero) => `
<svg class="${cls}" viewBox="0 0 200 100" aria-hidden="true" focusable="false">
  <path ${hero ? 'data-hero-track' : ''} class="fill-none stroke-ink ${stroke} [stroke-linecap:round]" d="M50 4 H150 A46 46 0 0 1 150 96 H50 A46 46 0 0 1 50 4 Z" />
  <circle data-knob ${hero ? 'data-hero-knob' : ''} class="fill-signal" cx="50" cy="50" r="34" />
</svg>`;

// backstage-only chain of amber nodes on a drawn line. In a work row it sits in the bottom padding
// (no layout shift on toggle); under a skill rung on mobile it stacks in flow so every node stays readable.
function chain(nodes, skill = false) {
  const wrap = skill ? 'max-md:static max-md:col-span-full max-md:h-auto max-md:mt-3 max-md:not-bs:hidden' : '';
  const list = skill
    ? 'max-md:grid max-md:gap-1 max-md:whitespace-normal'
    : 'max-md:justify-start max-md:gap-3.5 max-md:overflow-hidden max-md:mask-r-from-78%';
  const li = skill ? 'max-md:p-0' : '';
  return `
  <div class="bs absolute inset-x-0 bottom-2 h-[18px] ${wrap}" aria-hidden="true">
    <svg class="absolute inset-x-0 top-[9px] w-full h-[2px] ${skill ? 'max-md:hidden' : ''}" viewBox="0 0 1000 2" preserveAspectRatio="none"><path data-chain-line class="fill-none stroke-line stroke-2" d="M0 1 H1000" /></svg>
    <ol class="relative flex justify-between font-mono text-xs leading-[18px] text-signal whitespace-nowrap ${list}">${nodes.map((c) => `<li class="px-2 bg-bg first:pl-0 last:pr-0 ${li}">${esc(c)}</li>`).join('')}</ol>
  </div>`;
}

// collapsible row head: title / years / tags / plus, reflowing to two lines under 900px
function rowHead(id, title, years, tags, quiet) {
  return `
  <h4 class="m-0 font-normal">
    <button data-row class="group grid grid-cols-[minmax(0,1fr)_7.5em_auto_24px] items-baseline gap-x-6 w-full ${quiet ? 'pt-5' : 'pt-[26px]'} pb-3 text-left cursor-pointer max-lg:grid-cols-[auto_minmax(0,1fr)_24px] max-lg:[grid-template-areas:'title_title_plus'_'years_tags_plus'] max-lg:gap-y-1.5" type="button" aria-expanded="false" aria-controls="p-${id}">
      <span class="${quiet ? 'text-sub font-medium text-mute max-md:text-[20px]' : 'text-title font-semibold tracking-[-0.015em] opsz-30 max-md:text-[24px]'} leading-[1.1] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-[0.1em] max-lg:[grid-area:title]">${esc(title)}</span>
      <span class="tabular-nums max-lg:[grid-area:years] max-lg:text-md max-lg:text-mute max-lg:whitespace-nowrap">${esc(years)}</span>
      <span class="text-sm text-mute justify-self-end text-right max-lg:[grid-area:tags]">${esc(tags)}</span>
      <span class="relative w-[18px] h-[18px] self-center justify-self-end transition-transform duration-[450ms] ease-page group-aria-expanded:rotate-45 before:content-[''] before:absolute before:left-0 before:top-2 before:w-[18px] before:h-0.5 before:bg-current after:content-[''] after:absolute after:left-0 after:top-2 after:w-[18px] after:h-0.5 after:bg-current after:rotate-90 max-lg:[grid-area:plus]" aria-hidden="true"></span>
    </button>
  </h4>`;
}

// expandable panel: CSS grid transition, open by default without JS
const PANEL = 'grid grid-rows-[1fr] js:not-data-open:grid-rows-[0fr] transition-[grid-template-rows] duration-[550ms] ease-page';
const BODY = 'overflow-hidden min-h-0 grid gap-[26px] max-w-[70ch] pb-3 js:not-in-data-open:pb-0 js:in-data-open:pb-9';

function workRow(w, ui) {
  return `
<li class="relative border-b border-line pb-3.5" id="w-${w.id}">${rowHead(w.id, w.title, w.years, w.tags.join(', '), false)}
  <div class="${PANEL}" id="p-${w.id}">
    <div class="${BODY}">
      <p class="text-sub font-medium leading-[1.35] text-pretty">${esc(w.summary)}</p>
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

// Skills ladder: type size follows the tier; backstage draws the evidence under each rung.
const TIER = {
  1: 'text-[clamp(30px,3.8vw,54px)] font-bold font-stretch-75% tracking-[-0.025em] leading-[1.05] opsz-60',
  2: 'text-[clamp(24px,2.2vw,32px)] font-semibold tracking-[-0.015em] leading-[1.15] opsz-30',
  3: 'text-[20px] font-medium leading-[1.3]',
};
function skillRow(s) {
  // separator trails the item, so a wrapped line never starts with a dot
  const dot = s.tier === 3 ? 'after:text-mute' : 'after:text-line';
  return `
<li class="relative ${COLS} py-[26px] pb-[30px] border-b border-line max-md:gap-y-2.5">
  <h3 class="${MUTE_MD} font-normal pt-[0.45em] max-md:pt-0">${esc(s.group)}</h3>
  <ul class="flex flex-wrap items-baseline gap-x-[0.45em] gap-y-[0.1em] text-balance ${TIER[s.tier]}">${s.items
    .map((i) => `<li class="not-last:after:content-['·'] after:ml-[0.45em] after:font-normal ${dot}">${esc(i)}</li>`)
    .join('')}</ul>
${chain(s.proof, true)}
</li>`;
}

function page(c) {
  const { ui, hero, contact } = c;
  const alt = c.lang === 'en' ? it : en;
  const navLink = 'no-underline hover:underline';
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
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preload" href="/fonts/bricolage-grotesque-latin.woff2" as="font" type="font/woff2" crossorigin />
  <script type="module" src="/src/main.ts"></script>
</head>
<body class="relative bg-bg text-ink font-sans text-base overflow-x-clip">
  <a class="absolute left-gutter -top-[100px] focus:top-2 px-3.5 py-2.5 bg-ink text-bg z-20" href="#work">${esc(ui.skip)}</a>

  <header class="sticky top-0 z-10 flex items-center gap-7 h-bar px-gutter bg-bg border-b border-line text-sm max-sm:gap-[18px]">
    <a class="font-semibold mr-auto ${navLink}" href="#top">Federico Barbieri</a>
    <nav class="flex gap-[22px] max-sm:hidden" aria-label="Sections">
      <a class="${navLink}" href="#work">${esc(ui.navWork)}</a>
      <a class="${navLink}" href="#skills">${esc(ui.navSkills)}</a>
      <a class="${navLink}" href="#experience">${esc(ui.navExperience)}</a>
      <a class="${navLink}" href="#about">${esc(ui.navAbout)}</a>
      <a class="${navLink}" href="#contact">${esc(ui.navContact)}</a>
    </nav>
    <a class="text-mute ${navLink}" href="${c.other.href}" hreflang="${c.other.code}" lang="${c.other.code}">${esc(c.other.label)}</a>
    <button class="inline-flex items-center gap-2 py-1 cursor-pointer" type="button" data-toggle aria-pressed="false" aria-label="${esc(ui.toggleLabel)}">
      ${switchSvg('w-10 h-5', 'stroke-7', false)}
      <span class="min-w-[5.5em] text-left text-mute max-md:hidden" data-mode-label data-front="${esc(ui.modeFront)}" data-backstage="${esc(ui.modeBackstage)}">${esc(ui.modeFront)}</span>
    </button>
  </header>

  <main id="top" class="max-w-[1440px] mx-auto px-gutter">
    <section class="relative min-h-[calc(100svh-var(--spacing-bar))] grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto_1fr] gap-x-10 pt-[clamp(48px,12vh,140px)] pb-[clamp(48px,8vh,96px)] max-md:grid-cols-1 max-md:grid-rows-[auto_auto_auto_1fr] max-md:pt-10" aria-labelledby="hero-name">
      <h1 class="col-start-1 row-start-1 relative w-fit max-w-full text-[clamp(88px,14vw,220px)] font-extrabold font-stretch-75% opsz-96 leading-[0.86] tracking-[-0.03em] max-md:text-[clamp(64px,19vw,120px)]" id="hero-name">
        <span class="block" data-split>${esc(hero.first)}</span>
        <span class="block" data-split>${esc(hero.last)}</span>
        <span class="${RL} bs inset-y-0 -right-[30px] border-l border-signal before:content-[''] before:absolute before:-left-1 before:inset-y-0 before:w-2 before:border-y before:border-signal after:left-2.5 after:-top-0.5" aria-hidden="true" data-label="${esc(ui.rlName)}"></span>
        <span class="${RL} bs inset-x-0 -bottom-[22px] border-t border-signal before:content-[''] before:absolute before:-top-1 before:inset-x-0 before:h-2 before:border-x before:border-signal after:left-0 after:top-2" aria-hidden="true" data-label="${esc(ui.rlSize)}"></span>
      </h1>
      <div class="col-start-2 row-start-1 self-end justify-self-end w-[clamp(150px,15vw,210px)] text-right max-md:col-start-1 max-md:row-start-2 max-md:justify-self-start max-md:text-left max-md:w-[150px] max-md:mt-9">
        <button class="relative z-2 block w-full cursor-pointer rounded-full [&:hover_circle]:brightness-[1.08]" type="button" data-toggle aria-pressed="false" aria-label="${esc(ui.toggleLabel)}">
          ${switchSvg('block w-full h-auto', 'stroke-3', true)}
        </button>
        <p class="mt-3.5 text-sm leading-[1.4] text-mute max-w-[20ch] ml-auto text-balance max-md:ml-0" data-fade>${esc(ui.toggleHint)}</p>
      </div>
      <p class="col-span-full row-start-2 mt-[clamp(32px,5vh,56px)] text-sub font-medium leading-[1.3] max-md:row-start-3" data-fade>${esc(hero.role)}<span class="block font-normal text-mute">${esc(hero.place)}</span></p>
      <p class="col-span-full row-start-3 relative self-start mt-[22px] max-w-[60ch] text-lede max-md:row-start-4" data-fade>${esc(hero.intro)}<span class="${RL} bs inset-x-0 -bottom-[18px] border-t border-signal after:right-0 after:top-1.5" aria-hidden="true" data-label="${esc(ui.rlMeasure)}"></span></p>

      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <span class="${RL} bs top-[calc(clamp(48px,12vh,140px)_-_28px)] -left-gutter w-gutter border-t border-dashed border-signal after:left-0 after:-top-4" data-label="${esc(ui.rlGutter)}"></span>
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
        <a data-cta class="relative z-2 inline-block px-7 py-4 bg-ink text-bg rounded-full no-underline font-semibold transition-[background-color,color,transform] duration-[600ms,600ms,300ms] ease-page hover:-translate-y-0.5" href="mailto:${esc(contact.email)}">${esc(contact.cta)}</a>
        <a class="underline" href="${esc(contact.linkedin)}" rel="me noopener">LinkedIn</a>
      </p>
      <p class="mt-7 text-mute"><a class="underline" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
    </section>
  </main>

  <footer class="px-gutter pt-8 pb-10 border-t border-line text-sm text-mute">
    <p>© ${new Date().getFullYear()} Federico Barbieri. ${esc(ui.footer)}</p>
  </footer>

  <!-- the penguin: hides behind the switch knob, walks the hairlines and behind two phrases -->
  <div data-penguin class="absolute top-0 left-0 w-7 z-1 origin-bottom pointer-events-none will-change-transform max-md:hidden motion-reduce:hidden" aria-hidden="true">
    <svg viewBox="0 0 28 38" class="block w-full h-auto">
      <path class="fill-ink" d="M20.5 27 C23.5 26.5 24.5 29 23 32 C22.5 30 21.5 28.5 20.5 27 Z" />
      <path class="fill-ink stroke-ink stroke-1 [stroke-linejoin:round]" d="M13.5 2.5 C9.5 2.5 6.5 6 6 12 C5.5 16 4.5 20 4.5 24 C4.5 30 8 34 13.5 34 C19 34 22.5 30 22.5 24 C22.5 20 21.5 16 21 12 C20.5 6 17.5 2.5 13.5 2.5 Z" />
      <path class="fill-bg" d="M13.5 10.5 C10 10.5 7.5 16 7.5 22 C7.5 28 9.5 32.5 13.5 32.5 C17.5 32.5 19.5 28 19.5 22 C19.5 16 17 10.5 13.5 10.5 Z" />
      <path data-wing class="fill-ink stroke-bg stroke-1 [stroke-linejoin:round] [transform-box:fill-box] origin-top" d="M18.5 12.5 C23.5 16 24.5 24 20.5 30.5 C20 24.5 19.5 18.5 18.5 12.5 Z" />
      <circle data-eye class="fill-bg [transform-box:fill-box] origin-center" cx="9.6" cy="8.6" r="2" />
      <circle class="fill-ink" cx="9.1" cy="8.8" r="1" />
      <path class="fill-signal" d="M6.6 11 C4.2 11.4 2.6 12.6 1.4 13.6 C3 14.6 4.8 15.4 6.8 15.4 C7.2 14 7.2 12.4 6.6 11 Z" />
      <path class="fill-signal" d="M8.2 33.4 C6 33.8 5.2 35.6 5.6 37 L11.4 37 C11.6 35.2 10.6 33.8 8.2 33.4 Z" />
      <path class="fill-signal" d="M15.6 33.4 C13.4 33.8 12.6 35.6 13 37 L18.8 37 C19 35.2 18 33.8 15.6 33.4 Z" />
      <!-- wardrobe: one piece at a time, changed in the wings -->
      <g data-prop="scarf" hidden><path class="fill-signal" d="M6.8 13 C10 16 17 16 20.2 13 C19.6 15.4 17 17.4 13.5 17.4 C10 17.4 7.4 15.4 6.8 13 Z" /><path class="fill-signal" d="M16.2 16.2 L19.8 21.8 L22 20.2 L18.4 15 Z" /></g>
      <g data-prop="beanie" hidden><path class="fill-signal" d="M7.4 9 C7.4 2 19.6 2 19.6 9 C16.6 7.4 10.4 7.4 7.4 9 Z" /><path class="fill-bg" d="M6.8 9.4 C10.2 7.6 16.8 7.6 20.2 9.4 C16.8 10.6 10.2 10.6 6.8 9.4 Z" /><circle class="fill-bg stroke-ink stroke-[0.6]" cx="13.5" cy="2.4" r="1.8" /></g>
      <g data-prop="bowtie" hidden><path class="fill-signal" d="M9.6 16.2 L6 14.4 L6 18 Z M9.6 16.2 L13.2 14.4 L13.2 18 Z" /><circle class="fill-bg" cx="9.6" cy="16.2" r="0.9" /></g>
      <g data-prop="glasses" hidden><circle class="fill-none stroke-bg stroke-1" cx="9.6" cy="8.6" r="3.2" /><path class="fill-none stroke-bg stroke-1 [stroke-linecap:round]" d="M12.8 8.4 L18 7.2" /></g>
      <g data-prop="headphones" hidden><path class="fill-none stroke-bg stroke-[1.2] [stroke-linecap:round]" d="M7.2 8 C7.6 2.4 19.4 2.4 19.8 8" /><circle class="fill-signal" cx="7.4" cy="9" r="2.1" /><circle class="fill-signal" cx="19.6" cy="9" r="1.4" /></g>
    </svg>
  </div>
  <span data-penguin-label data-prefix="${esc(ui.rlMascot)}" class="bs absolute top-0 left-0 z-1 font-mono text-xs leading-none tracking-[0.01em] text-signal whitespace-nowrap pointer-events-none max-md:hidden" aria-hidden="true"></span>
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
