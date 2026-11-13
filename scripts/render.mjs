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
// The clay name: a bas-relief image of the h1, laid over the live text. Its size is in em of the h1,
// so the srcset widths are the image's own pixels and `sizes` is the h1's font size times the image's em width.
const NAME_EM = 3.0727;
const NAME_SIZES = `(max-width: 767px) calc(clamp(64px, 19vw, 120px) * ${NAME_EM}), calc(clamp(88px, 14vw, 220px) * ${NAME_EM})`;
const NAME_SRCSET = '/hero/name@1x.webp 676w, /hero/name@2x.webp 1352w';
const brand = readFileSync(resolve(root, 'public/logo.svg'), 'utf8')
  .replace('fill="#111c33" role="img" aria-labelledby="title"', 'fill="currentColor" class="w-8 h-8 shrink-0" aria-hidden="true" focusable="false"')
  .replace(/\s*<title[^>]*>.*?<\/title>/, '');

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// [[phrase]] marks words the penguin walks behind: same ground colour, stacked above it
const rich = (s) => esc(s).replace(/\[\[(.+?)\]\]/g, '<span data-phrase class="relative z-2 bg-bg">$1</span>');

// ---------- shared class strings (whole tokens only, so Tailwind's scanner sees them) ----------
// Section rhythm: one groove between two sections. A section opens with its own groove unless the one before it already ends on
// one (the skills ladder and the education list), and that one then has no bottom padding, so the groove sits one section-gap above the next heading.
const PT = 'relative pt-[clamp(72px,11vh,150px)]';
const PB = 'pb-[clamp(72px,11vh,150px)]';
const SECTION = `${PT} ${PB} groove-t`;
const SECTION_AFTER_GROOVE = `${PT} ${PB}`; // about
const SECTION_ENDING_ON_GROOVE = `${PT} pb-0 groove-t`;
const H2 = 'clay-type relative w-fit max-w-full text-[clamp(40px,6vw,80px)] font-extrabold font-stretch-75% tracking-[-0.03em] leading-[0.95] opsz-96 mb-11 text-balance';
// two-column rows: label column left, content right; stacked under 900px
const COLS = 'grid grid-cols-[250px_minmax(0,1fr)] gap-x-8 max-lg:grid-cols-1 max-lg:gap-y-2';
const MUTE_MD = 'text-md text-mute';
// a slab of clay: its content keeps the page's text column, so the padding is the slab's wall
const SLAB = 'clay-slab px-[clamp(20px,3.2vw,48px)]';
// redline: amber mono annotation, its label comes from data-label
const RL = 'absolute text-shadow-none font-mono text-xs leading-none tracking-[0.01em] text-signal pointer-events-none after:content-[attr(data-label)] after:absolute after:whitespace-nowrap';
const TAG = 'absolute text-shadow-none font-mono text-xs leading-none tracking-[0.01em] text-signal pointer-events-none px-1.5 py-1 border border-signal';

// measuring bracket under the heading, its label to the right (under it on phones, where there is no room beside)
const bracket = (label) =>
  `<span class="${RL} bs inset-x-0 -bottom-[14px] after:left-full after:ml-2 after:-top-1.5 max-md:after:left-0 max-md:after:ml-0 max-md:after:top-1.5 border-t border-signal before:content-[''] before:absolute before:-top-1 before:inset-x-0 before:h-2 before:border-x before:border-signal" aria-hidden="true" data-label="${esc(label)}"></span>`;

// section heading with its backstage spec, plus the section's id tag in the corner
const heading = (id, text, ui) =>
  `<h2 class="${H2}" id="${id}-h">${esc(text)}${bracket(ui.rlH2)}</h2>
      <span class="${TAG} bs top-4 right-0" aria-hidden="true">#${id} · ${esc(ui.rlSection)}</span>`;

// physical toggle: a pressed track and a ball of orange clay. The outer knob slides (anime.js), the ball pops and squashes.
const switchControl = (hero) => `
<span ${hero ? 'data-hero-track' : ''} class="switch" aria-hidden="true"><span data-knob ${hero ? 'data-hero-knob' : ''} class="switch-knob"><span class="switch-ball"></span></span></span>`;

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
function rowHead(id, title, years, tags, quiet, open = false) {
  return `
  <h4 class="m-0 font-normal">
    <button data-row class="group rounded-[18px] grid grid-cols-[minmax(0,1fr)_7.5em_auto_34px] items-center gap-x-6 w-full ${quiet ? 'pt-5' : 'pt-[26px]'} pb-3 text-left cursor-pointer max-lg:grid-cols-[auto_minmax(0,1fr)_34px] max-lg:[grid-template-areas:'title_title_plus'_'years_tags_plus'] max-lg:gap-y-1.5" type="button" aria-expanded="${open}" aria-controls="p-${id}">
      <span class="${quiet ? 'text-sub font-medium text-mute max-md:text-[20px]' : 'text-title font-semibold tracking-[-0.015em] opsz-30 max-md:text-[24px]'} leading-[1.1] project-title max-lg:[grid-area:title]">${esc(title)}</span>
      <span class="tabular-nums max-lg:[grid-area:years] max-lg:text-md max-lg:text-mute max-lg:whitespace-nowrap">${esc(years)}</span>
      <span class="text-sm text-mute justify-self-end text-right max-lg:[grid-area:tags]">${esc(tags)}</span>
      <span class="plus max-lg:[grid-area:plus]" aria-hidden="true"><span class="plus-mark"></span></span>
    </button>
  </h4>`;
}

// expandable panel: CSS grid transition, open by default without JS
const PANEL = 'grid grid-rows-[1fr] js:not-data-open:grid-rows-[0fr] transition-[grid-template-rows] duration-[360ms] ease-page';
const BODY = 'overflow-hidden min-h-0 max-w-[calc(70ch+56px)] pb-3 js:not-in-data-open:pb-0 js:in-data-open:pb-9';
const WELL = 'row-well clay-well clay-well-deep grid gap-[26px]';

function workRow(w, ui, open = false) {
  return `
<li class="relative groove-t pb-3.5" id="w-${w.id}">${rowHead(w.id, w.title, w.years, w.tags.join(', '), false, open)}
  <p class="max-w-[70ch] pb-7 text-mute leading-[1.55] text-pretty">${esc(w.summary)}</p>
  <div class="${PANEL}" id="p-${w.id}"${open ? ' data-open' : ''}>
    <div class="${BODY}"><div class="${WELL}">
      <dl class="grid gap-[22px]">
        <div><dt class="text-sm text-mute mb-1.5">${esc(ui.problem)}</dt><dd class="leading-[1.55] text-pretty">${esc(w.problem)}</dd></div>
        <div><dt class="text-sm text-mute mb-1.5">${esc(ui.did)}</dt><dd class="leading-[1.55] text-pretty">${esc(w.did)}</dd></div>
        <div data-under class="bs not-bs:hidden"><dt class="text-sm text-mute mb-1.5">${esc(ui.under)}</dt><dd class="font-mono text-[13px] leading-[1.65] text-mute text-pretty">${esc(w.under)}</dd></div>
      </dl>
      ${w.link ? `<a class="w-fit underline" href="${esc(w.link.href)}" rel="noopener">${esc(w.link.label)}</a>` : ''}
    </div></div>
  </div>
${chain(w.chain)}
</li>`;
}

// One employer: one slab of clay with its condensed name, period, its rows (grooves between them), then the smaller things done there.
function workGroup(g, ui, lead = false) {
  return `
<li class="${SLAB} pt-[clamp(24px,3vw,40px)] pb-1.5 not-first:mt-[clamp(56px,8vh,96px)]" id="g-${g.id}">
  <h3 class="flex items-baseline flex-wrap gap-x-[22px] gap-y-2 mb-2"><span class="clay-type text-[clamp(34px,4.2vw,60px)] font-bold font-stretch-75% tracking-[-0.025em] leading-none opsz-60">${esc(g.org)}</span><span class="${MUTE_MD} tabular-nums">${esc(g.period)}</span></h3>
  <ol>${g.works.map((w, i) => workRow(w, ui, lead && i === 0)).join('')}${g.also.length ? alsoRow(g, ui) : ''}
  </ol>
</li>`;
}

// The smaller things done at one employer: a quieter row, collapsed like the case studies.
function alsoRow(g, ui) {
  return `
<li class="relative groove-t pb-3.5" id="w-also-${g.id}">${rowHead(`also-${g.id}`, ui.alsoHeading, '', g.alsoTags, true)}
  <div class="${PANEL}" id="p-also-${g.id}">
    <div class="${BODY}"><div class="${WELL}">
      <ul class="grid gap-2.5 text-pretty">${g.also.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
    </div></div>
  </div>
</li>`;
}

// Skills ladder: one size for every pill, rungs set apart by grooves on the page itself; backstage draws the evidence under each rung.
const SKILL = 'text-[clamp(20px,1.55vw,22px)] font-semibold tracking-[-0.01em] leading-[1.15] opsz-30';
function skillRow(s) {
  return `
<li class="relative ${COLS} py-[26px] pb-11 groove-b max-md:gap-y-3.5">
  <h3 class="${MUTE_MD} font-normal pt-[15px] max-md:pt-0">${esc(s.group)}</h3>
  <ul class="flex flex-wrap items-center gap-x-3 gap-y-3.5 ${SKILL}">${s.items.map((i) => `<li class="clay-lump px-[22px] py-3 max-sm:px-[18px] max-sm:py-2.5">${esc(i)}</li>`).join('')}</ul>
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
  <meta property="og:type" content="profile" />
  <meta property="og:site_name" content="${esc(c.meta.title)}" />
  <meta property="og:locale" content="${c.lang === 'it' ? 'it_IT' : 'en_GB'}" />
  <meta property="og:url" content="${SITE}${c.dir}" />
  <meta property="og:image" content="${SITE}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(c.meta.title)}, ${esc(c.hero.role)}, ${esc(c.hero.place)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#EDEFEC" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#EDEFEC" />
  <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
  <link rel="icon" href="/icon-32.png" type="image/png" sizes="32x32" />
  <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
  <link rel="preload" href="/fonts/bricolage-grotesque-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" as="image" href="/hero/name@2x.webp" imagesrcset="${NAME_SRCSET}" imagesizes="${NAME_SIZES}" fetchpriority="high" />
  <link rel="stylesheet" href="/src/styles.css" />
  <script type="module" src="/src/main.ts"></script>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Federico Barbieri',
    url: `${SITE}${c.dir}`,
    jobTitle: c.hero.role,
    description: c.meta.description,
    email: `mailto:${c.contact.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Brescia', addressCountry: 'IT' },
    sameAs: [c.contact.linkedin],
    knowsLanguage: ['it', 'en'],
    knowsAbout: [...new Set(c.skills.flatMap((s) => s.items))],
    alumniOf: c.education.map((e) => ({ '@type': 'EducationalOrganization', name: e.school })),
  }).replace(/</g, '\\u003c')}</script>
</head>
<body class="relative pt-(--bar-top) bg-bg text-ink font-sans text-base overflow-x-clip">
  <a class="absolute left-gutter -top-[100px] focus:top-2 px-3.5 py-2.5 bg-ink text-bg z-20" href="#work">${esc(ui.skip)}</a>

  <header class="clay-bar sticky top-(--bar-top) z-10 flex items-center gap-x-5 h-bar px-6 max-sm:px-3.5 bg-bg text-sm max-[1100px]:flex-wrap max-[1100px]:gap-x-4 max-sm:gap-x-1.5">
    <a class="font-semibold mr-auto gap-2.5 ${navLink}" href="#top">${brand}<span class="max-sm:sr-only">Federico Barbieri</span></a>
    <nav class="flex gap-1 max-[1100px]:order-last max-[1100px]:w-full max-[1100px]:overflow-x-auto max-[1100px]:-mt-1 max-[1100px]:gap-1.5 max-sm:gap-0" aria-label="${esc(ui.navLabel)}">
      <a class="${navLink}" href="#work">${esc(ui.navWork)}</a>
      <a class="${navLink}" href="#skills">${esc(ui.navSkills)}</a>
      <a class="${navLink}" href="#experience">${esc(ui.navExperience)}</a>
      <a class="${navLink}" href="#about">${esc(ui.navAbout)}</a>
      <a class="${navLink} max-[1100px]:hidden" href="#contact">${esc(ui.navContact)}</a>
    </nav>
    <a class="${navLink} min-[1100px]:hidden" href="#contact">${esc(ui.navContact)}</a>
    <a class="text-mute ${navLink}" href="${c.other.href}" hreflang="${c.other.code}" lang="${c.other.code}">${esc(c.other.label)}</a>
    <button class="inline-flex items-center justify-center min-w-11 min-h-11 gap-2.5 cursor-pointer rounded-full not-js:hidden [--sw:48px]" type="button" data-toggle aria-pressed="false" aria-label="${esc(ui.toggleLabel)}">
      ${switchControl(false)}
      <span class="min-w-[5.5em] text-left text-mute max-[1100px]:hidden" data-mode-label data-front="${esc(ui.modeFront)}" data-backstage="${esc(ui.modeBackstage)}">${esc(ui.modeFront)}</span>
    </button>
  </header>

  <main id="top" class="max-w-[1440px] mx-auto px-gutter">
    <section class="relative min-h-[min(820px,calc(100svh-var(--spacing-bar)-var(--bar-top)))] max-md:min-h-0 grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto_1fr_auto] gap-x-10 pt-[clamp(48px,12vh,140px)] pb-11 max-md:gap-x-5 max-md:pt-12" aria-labelledby="hero-name">
      <h1 class="col-start-1 row-start-1 relative w-fit max-w-full text-[clamp(88px,14vw,220px)] font-extrabold font-stretch-75% opsz-96 leading-[0.86] tracking-[-0.03em] max-md:text-[clamp(64px,19vw,120px)]" id="hero-name">
        <span class="block overflow-hidden pb-[0.05em] -mb-[0.05em] pr-[0.05em] -mr-[0.05em]"><span class="block origin-bottom-left" data-name-line>${esc(hero.first)}</span></span>
        <span class="block overflow-hidden pb-[0.05em] -mb-[0.05em] pr-[0.05em] -mr-[0.05em]"><span class="block origin-bottom-left" data-name-line>${esc(hero.last)}</span></span>
        <img data-name-clay class="name-clay" src="/hero/name@2x.webp" srcset="${NAME_SRCSET}" sizes="${NAME_SIZES}" width="1352" height="942" alt="" aria-hidden="true" decoding="async" fetchpriority="high" onerror="this.remove()" />
        <!-- the h1 redlines quote the desktop size and need room to its right: desktop only -->
        <span class="${RL} bs max-md:hidden inset-y-0 -right-[30px] border-l border-signal before:content-[''] before:absolute before:-left-1 before:inset-y-0 before:w-2 before:border-y before:border-signal after:left-2.5 after:-top-0.5" aria-hidden="true" data-label="${esc(ui.rlName)}"></span>
        <span class="${RL} bs max-md:hidden inset-x-0 -bottom-[22px] border-t border-signal before:content-[''] before:absolute before:-top-1 before:inset-x-0 before:h-2 before:border-x before:border-signal after:left-0 after:top-2" aria-hidden="true" data-label="${esc(ui.rlSize)}"></span>
      </h1>
      <div data-hero-switch class="col-start-2 row-start-1 self-end justify-self-end w-(--sw) [--sw:clamp(150px,15vw,210px)] text-right max-md:[--sw:clamp(96px,19vw,150px)] not-js:hidden">
        <button class="relative z-2 block w-full cursor-pointer rounded-full" type="button" data-toggle aria-pressed="false" aria-label="${esc(ui.toggleLabel)}">
          ${switchControl(true)}
        </button>
        <p class="mt-3.5 text-sm leading-[1.4] text-mute max-w-[20ch] ml-auto text-balance" data-fade>${esc(ui.toggleHint)}</p>
      </div>
      <p class="col-span-full row-start-2 mt-[clamp(32px,5vh,56px)] text-sub font-medium leading-[1.3]" data-fade>${esc(hero.role)}<span class="block font-normal text-mute">${esc(hero.place)}</span></p>
      <p class="col-span-full row-start-3 relative self-start mt-[22px] max-w-[60ch] text-lede" data-fade>${esc(hero.intro)}<span class="${RL} bs inset-x-0 -bottom-[18px] border-t border-signal after:right-0 after:top-1.5" aria-hidden="true" data-label="${esc(ui.rlMeasure)}"></span></p>
      <a class="explore clay-well col-span-full row-start-4 flex items-center justify-between min-h-14 mt-14 w-full py-2 pr-2 pl-7 font-medium no-underline group max-sm:pl-5" href="#work" data-fade>
        ${esc(ui.exploreWork)}
        <span class="clay-lump shrink-0 text-ink"><svg class="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6" /></svg></span>
      </a>

      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <span class="${RL} bs max-md:hidden top-[calc(clamp(48px,12vh,140px)_-_28px)] -left-gutter w-gutter border-t border-dashed border-signal after:left-0 after:-top-4" data-label="${esc(ui.rlGutter)}"></span>
        <span class="${TAG} bs top-3.5 left-0">${esc(ui.rlRoute)}</span>
        <span class="${TAG} bs top-3.5 right-0 max-md:left-[100px] max-md:right-auto">${esc(ui.rlMode)}</span>
        <span class="${TAG} bs bottom-3.5 left-0">${esc(ui.rlStack)}</span>
      </div>
    </section>

    <section class="${SECTION}" id="work" aria-labelledby="work-h">
      ${heading('work', ui.workHeading, ui)}
      <ol>${c.groups.map((g, i) => workGroup(g, ui, i === 0)).join('')}
      </ol>
    </section>

    <section class="${SECTION_ENDING_ON_GROOVE}" id="skills" aria-labelledby="skills-h">
      ${heading('skills', ui.skillsHeading, ui)}
      <p class="-mt-4 max-md:-mt-2 mb-11 max-w-[44ch] text-lede text-mute text-pretty">${esc(ui.skillsNote)}</p>
      <ol class="border-t border-line">${c.skills.map(skillRow).join('')}
      </ol>
    </section>

    <section class="${PT} pb-0" id="experience" aria-labelledby="experience-h">
      ${heading('experience', ui.expHeading, ui)}
      <ol class="${SLAB} relative py-[clamp(8px,1vw,14px)]">${c.experience
        .map(
          (e) => `
        <li class="${COLS} relative py-7 max-md:pb-11 groove-between">
          <p class="${MUTE_MD} tabular-nums self-start"><span class="clay-well inline-block px-3.5 py-1.5 text-sm whitespace-nowrap"><time>${esc(e.from)}</time><span class="inline-block w-3 h-px mx-2 bg-current align-middle"></span><time>${esc(e.to)}</time></span></p>
          <div>
            <h3 class="text-sub font-semibold leading-[1.25] mb-2">${esc(e.role)}<span class="block font-normal text-mute text-base">${esc(e.org)}</span></h3>
            <p class="max-w-[65ch] text-pretty">${esc(e.text)}</p>
          </div>
        </li>`,
        )
        .join('')}
      </ol>
      <h3 class="mt-14 mb-3.5 text-sub font-semibold">${esc(ui.eduHeading)}</h3>
      <ul class="relative groove-t">${c.education
        .map((e) => `<li class="${COLS} relative py-3.5 groove-b"><span class="${MUTE_MD} tabular-nums pt-0.5">${esc(e.years)}</span><span class="font-semibold">${esc(e.school)}</span><span class="col-start-2 text-mute max-lg:col-start-1">${esc(e.what)}</span></li>`)
        .join('')}</ul>
    </section>

    <section class="${SECTION_AFTER_GROOVE}" id="about" aria-labelledby="about-h">
      ${heading('about', ui.aboutHeading, ui)}
      <div class="grid gap-[18px] max-w-[60ch] text-lede">${c.about.paragraphs.map((p) => `<p>${rich(p)}</p>`).join('')}
        <p class="flex flex-wrap gap-3 mt-2 text-mute text-base">${c.about.languages.split(/(?<=\.)\s+/).map((l) => `<span class="clay-lump px-[18px] py-1.5">${esc(l)}</span>`).join('')}</p>
      </div>
    </section>

    <section class="${SECTION}" id="contact" aria-labelledby="contact-h">
      ${heading('contact', ui.contactHeading, ui)}
      <p class="text-sub max-w-[40ch] text-pretty">${rich(contact.note)}</p>
      <p class="flex items-center gap-x-8 gap-y-6 mt-16 max-sm:flex-wrap">
        <a data-cta class="clay-ink clay-press relative z-2 inline-block px-11 py-5 text-lede no-underline font-semibold max-sm:px-8" href="mailto:${esc(contact.email)}">${esc(contact.cta)}</a>
        <a class="clay-lump clay-press inline-flex items-center min-h-12 px-7 no-underline font-semibold" href="${esc(contact.linkedin)}" rel="me noopener">LinkedIn</a>
      </p>
      <p class="mt-10"><a class="clay-well inline-block max-w-full px-7 py-3.5 text-sub max-sm:text-[18px] max-sm:px-5 no-underline break-words hover:underline" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
    </section>
  </main>

  <!-- The closing scene: a clay diorama, one composition in two plates. The night plate is stacked on the
       day one and only shows in backstage, so the circular mode wipe already does the cross-fade. The
       stage is a reserved square on the ice shelf: the still pose is the whole feature without JS or with
       reduced motion; src/diorama.ts layers the pre-rendered sprite sheets over it. -->
  <div data-horizon class="horizon" aria-hidden="true">
    <img class="diorama-plate" src="/footer/day-1831.webp" srcset="/footer/day-960.webp 960w, /footer/day-1831.webp 1831w" sizes="100vw" width="1831" height="599" alt="" loading="lazy" decoding="async" />
    <img class="diorama-plate diorama-night" src="/footer/night-1831.webp" srcset="/footer/night-960.webp 960w, /footer/night-1831.webp 1831w" sizes="100vw" width="1831" height="599" alt="" loading="lazy" decoding="async" />
    <div data-diorama-stage class="diorama-stage" aria-hidden="true">
      <img data-diorama-still class="diorama-still" src="/penguin/still.webp" width="400" height="400" alt="" loading="lazy" decoding="async" />
      <span class="${TAG} bs diorama-tag bg-bg left-[84%] top-[80%] sm:left-[80%] sm:top-[16%] whitespace-nowrap"><span data-diorama-name>sprite · still</span><span class="diorama-sep"> · </span><span data-diorama-frame>1/1</span></span>
    </div>
    <span class="${TAG} bs top-3 left-gutter">${esc(ui.rlHorizon)}</span>
  </div>

  <footer class="px-gutter pt-6 pb-10 text-sm text-mute">
    <p>© ${new Date().getFullYear()} Federico Barbieri. ${esc(ui.footer)}</p>
  </footer>

  <!-- The contact shadow is its own element: it stays on the ground while the bird leaves it. -->
  <span data-penguin-shadow hidden class="absolute top-0 left-0 z-1 block rounded-[50%] bg-ink opacity-0 pointer-events-none motion-reduce:hidden" aria-hidden="true"></span>
  <!-- The small mascot: the clay penguin again, a canvas drawn by src/penguin.ts from public/penguin/mini.webp (turned, waving and blinking
       with the sheet's own frames; the amber wire frame in backstage). The element is the whole square frame; the feet stand 8.33% above its bottom. -->
  <div data-penguin hidden data-state="hidden" class="absolute top-0 left-0 z-1 pointer-events-none motion-reduce:hidden" aria-hidden="true"><canvas class="block"></canvas></div>
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
