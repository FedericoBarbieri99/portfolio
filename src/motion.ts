import { animate, spring, createTimeline, stagger, svg, text, utils, type AnimationParams } from 'animejs';

type Mode = 'front' | 'backstage';
type Progressable = { progress: number };

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 768px)').matches;
const root = document.documentElement;

// Every animation this page runs, listed by name. Backstage draws their progress live.
const registry: { name: string; item: Progressable }[] = [];
function register(name: string, item: Progressable) {
  const i = registry.findIndex((r) => r.name === name);
  if (i >= 0) registry.splice(i, 1);
  registry.push({ name, item }); // most recent last; the HUD shows the last few
}
const HUD_ROWS = 4;
const hudRows = new Map<string, { li: HTMLElement; bar: HTMLElement; pct: HTMLElement }>();

// ---------- HUD event log (backstage) ----------
const logList = document.querySelector<HTMLElement>('[data-hud-log]');
export function log(msg: string) {
  if (!logList) return;
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleTimeString([], { hour12: false })}  ${msg}`;
  logList.prepend(li);
  while (logList.children.length > 3) logList.lastElementChild!.remove();
}

// ---------- mode toggle ----------
const toggles = utils.$('[data-toggle]') as HTMLButtonElement[];
const knobs = utils.$('[data-knob]');
const layer = utils.$('.bs:not([data-under]):not([data-hud])');
const panel = document.querySelector<HTMLElement>('[data-hud]');
const labels = utils.$('[data-mode-label]') as HTMLElement[];
let mode: Mode = 'front';

function setMode(next: Mode) {
  if (next === mode) return;
  mode = next;
  const on = next === 'backstage';
  root.dataset.mode = next;
  toggles.forEach((t) => t.setAttribute('aria-pressed', String(on)));
  labels.forEach((l) => (l.textContent = on ? l.dataset.backstage! : l.dataset.front!));
  log(`flip → ${next}`);
  pen.hop();

  if (reduced) {
    knobs.forEach((k) => k.setAttribute('cx', on ? '150' : '50'));
    layer.forEach((el) => ((el as HTMLElement).style.cssText = ''));
    return;
  }

  const tl = createTimeline({ defaults: { ease: 'outExpo' } });
  tl.add(knobs, { cx: on ? 150 : 50, ease: spring({ stiffness: 170, damping: 15 }) }, 0);
  if (on) {
    utils.set(layer, { visibility: 'visible' });
    tl.add(layer, { opacity: [0, 1], translateY: [6, 0], duration: 550, delay: stagger(22) }, 120);
    tl.add(svg.createDrawable('[data-chain-line]'), { draw: ['0 0', '0 1'], duration: 1000, delay: stagger(70) }, 200);
    if (panel) {
      utils.set(panel, { visibility: 'visible' });
      tl.add(panel, { opacity: [0, 1], duration: 400 }, 500);
    }
    startTicker();
  } else {
    const all = panel ? [...layer, panel] : layer;
    tl.add(all, {
      opacity: 0,
      translateY: 4,
      duration: 240,
      ease: 'outQuad',
      onComplete: () => utils.set(all, { visibility: 'hidden' }),
    }, 0);
  }
  register('toggle', tl);
}

// The flip is a circular wipe growing from the switch (View Transitions API). The page's own
// colour transitions are paused for the flip so the wipe reveals the finished backstage, not a fade.
function flip(from?: Element) {
  const next: Mode = mode === 'front' ? 'backstage' : 'front';
  if (reduced || !document.startViewTransition) return setMode(next);
  const r = (from?.querySelector('[data-knob]') ?? from)?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : innerWidth / 2;
  const y = r ? r.top + r.height / 2 : innerHeight / 2;
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  root.style.setProperty('--dur', '0ms');
  const t = document.startViewTransition(() => setMode(next));
  t.finished.finally(() => root.style.removeProperty('--dur'));
  register('flip · wipe', { get progress() { return vtProgress; } });
  vtProgress = 0;
  const start = performance.now();
  const step = () => {
    vtProgress = Math.min(1, (performance.now() - start) / 750);
    if (vtProgress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
let vtProgress = 0;

toggles.forEach((t) => t.addEventListener('click', () => flip(t)));
addEventListener('keydown', (e) => {
  if ((e.key === 'b' || e.key === 'B') && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
      log('key B');
      flip(document.querySelector('[data-hero-knob]') ?? undefined);
    }
  }
});

// ---------- live HUD: timelines, scroll position ----------
let ticking = false;
function startTicker() {
  if (ticking || !panel) return;
  ticking = true;
  const list = panel.querySelector<HTMLElement>('[data-tl-list]')!;
  const scrollOut = panel.querySelector<HTMLElement>('[data-hud-scroll]');
  const tick = () => {
    if (mode !== 'backstage') {
      ticking = false;
      return;
    }
    const shown = registry.slice(-HUD_ROWS);
    for (const [name, row] of hudRows) if (!shown.some((r) => r.name === name)) { row.li.remove(); hudRows.delete(name); }
    for (const { name, item } of shown) {
      let row = hudRows.get(name);
      if (!row) {
        const li = document.createElement('li');
        li.className = 'grid grid-cols-[1fr_30px] gap-2 items-center';
        li.innerHTML = `<div>${name}<span class="block mt-[3px] h-0.5 bg-line overflow-hidden"><i class="block h-full bg-signal origin-left"></i></span></div><em class="not-italic text-right tabular-nums"></em>`;
        row = { li, bar: li.querySelector('i')!, pct: li.querySelector('em')! };
        hudRows.set(name, row);
      }
      if (row.li.parentElement !== list || row.li !== list.children[shown.indexOf(shown.find((r) => r.name === name)!)]) list.append(row.li);
      const p = Math.min(1, Math.max(0, item.progress || 0));
      row.bar.style.transform = `scaleX(${p.toFixed(3)})`;
      row.pct.textContent = `${Math.round(p * 100)}%`;
    }
    if (scrollOut) {
      const max = root.scrollHeight - innerHeight;
      scrollOut.textContent = `${Math.round(scrollY)}px · ${max > 0 ? Math.round((scrollY / max) * 100) : 0}%`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ---------- the penguin ----------
// A stagehand. It always stands on something real: the switch, the right end of a row, rung or role,
// behind a phrase, on the email button. It stays put until its perch is about to leave the screen,
// then moves in the reader's direction to the perch nearest the reading line: a hop if that is on the
// same rail and close, otherwise off through the nearest page edge (the wings) and back in from there.
// Every move is timed and animated with anticipation, stretch, squash and a real turn; nothing is
// scrubbed, so it is never caught between poses.
type Kind = 'switch' | 'floor' | 'phrase' | 'cta';
type Station = { kind: Kind; name: string; side: 1 | -1; pos: () => { x: number; y: number } | null };
const pen = { perched: false, intro: 0, hop: () => {}, wake: () => {} };
let ceremonyDone = false; // the finale's walk, pause and wave play once per visit

function penguin() {
  const el = document.querySelector<HTMLElement>('[data-penguin]');
  if (!el) return;
  const wing = el.querySelector('[data-wing]')!;
  const eye = el.querySelector('[data-eye]')!;
  const label = document.querySelector<HTMLElement>('[data-penguin-label]');
  const H = 38;
  const OFF = 44; // offstage: this far past the page edge
  // where a perch may be for it to stand there (feet y in viewport): clear of the top bar and, when there is room, of the HUD
  const ZONE = { top: 200, bottom: () => Math.max(200 + 220, innerHeight - 300) };
  const READ = () => ZONE.top + (ZONE.bottom() - ZONE.top) * 0.62; // where it likes to land, so it rides up a while before moving again
  const S = { x: 0, y: 0, face: -1, rot: 0, sq: 1, bob: 0, breath: 0, scene: '' }; // face: -1 looks left … 1 looks right
  let walked = 0;
  let lastX = 0;
  const R = (e: Element) => e.getBoundingClientRect();
  // wardrobe: changed in the wings, so every return looks a little different; plain every other time
  const props = [...el.querySelectorAll<SVGGElement>('[data-prop]')];
  const wardrobe = ['', 'scarf', '', 'glasses', 'beanie', '', 'headphones', 'bowtie'];
  let visits = 0;
  const dress = () => {
    const pick = wardrobe[visits++ % wardrobe.length];
    props.forEach((g) => g.toggleAttribute('hidden', g.dataset.prop !== pick));
  };

  // ---- stations
  const stations: Station[] = [];
  const track = document.querySelector('[data-hero-track]');
  const knob = document.querySelector('[data-hero-knob]');
  if (track && knob)
    stations.push({
      kind: 'switch',
      name: 'switch',
      side: 1,
      pos: () => {
        const t = R(track);
        const k = R(knob);
        if (!t.width) return null;
        if (pen.perched) return { x: t.left + t.width / 2, y: t.top + scrollY + 1 };
        const kx = k.left + k.width / 2;
        const ex = kx > t.left + t.width / 2 ? t.left + t.height / 2 : t.right - t.height / 2;
        return { x: kx + (ex - kx) * pen.intro, y: t.top + scrollY + t.height * 0.8 + (1 - pen.intro) * 8 };
      },
    });
  const floors = (sel: string, name: string) =>
    document.querySelectorAll(sel).forEach((li, i) =>
      stations.push({
        kind: 'floor',
        name: `${name} ${i + 1}`,
        side: 1,
        pos: () => {
          const r = R(li);
          return r.width ? { x: r.right - 14, y: r.bottom + scrollY } : null;
        },
      }),
    );
  floors('#work li[id^=w-]', 'row');
  floors('#skills > ol > li', 'rung');
  floors('#experience > ol > li', 'role');
  floors('#experience > ul > li', 'school');
  const lastLine = (span: Element | null) => {
    const rs = span?.getClientRects();
    return rs && rs.length ? rs[rs.length - 1] : null;
  };
  const aboutPhrase = document.querySelector('#about [data-phrase]');
  if (aboutPhrase)
    stations.push({
      kind: 'phrase',
      name: 'behind the words',
      side: -1,
      pos: () => {
        const lr = lastLine(aboutPhrase);
        return lr ? { x: lr.left + lr.width * 0.42, y: lr.bottom + scrollY } : null;
      },
    });
  const cta = document.querySelector('[data-cta]');
  const contactPhrase = document.querySelector('#contact [data-phrase]');
  if (cta)
    stations.push({
      kind: 'cta',
      name: 'hello',
      side: -1,
      pos: () => {
        const r = R(cta);
        return r.width ? { x: r.left + r.width / 2 + 34, y: r.top + scrollY + 1 } : null;
      },
    });

  // ---- drawing
  const render = () => {
    if (Math.abs(S.x - lastX) > 0.2) walked += Math.abs(S.x - lastX);
    lastX = S.x;
    const sy = S.sq * (1 + S.breath);
    const sx = 2 - S.sq;
    el.style.transform = `translate(${(S.x - 14).toFixed(1)}px, ${(S.y - H + S.bob).toFixed(1)}px) scaleX(${(-S.face).toFixed(3)}) rotate(${S.rot.toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    if (label) {
      label.textContent = `${label.dataset.prefix} · ${S.scene} · ${Math.round(S.x)}, ${Math.round(S.y)}`;
      label.style.transform = S.x > innerWidth / 2 ? `translate(${(S.x - 22).toFixed(0)}px, ${(S.y - 14).toFixed(0)}px) translateX(-100%)` : `translate(${(S.x + 22).toFixed(0)}px, ${(S.y - 14).toFixed(0)}px)`;
    }
  };
  const place = (st: Station) => {
    const p = st.pos();
    if (!p) return;
    S.x = p.x;
    S.y = p.y;
    S.rot = 0;
    S.bob = 0;
    S.scene = st.name;
    render();
  };

  // ---- vocabulary of moves; every one is timed and returns when done
  const tween = (name: string, o: object, params: AnimationParams) => {
    const a = animate(o, params);
    register(name, a);
    return a.then(() => {});
  };
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const turn = (dir: number) => {
    if (Math.sign(S.face) === dir) return Promise.resolve();
    return tween('penguin · turn', S, { face: dir, duration: 220, ease: 'inOutQuad', onUpdate: render });
  };
  const land = () => {
    S.rot = 0;
    S.bob = 0;
    return tween('penguin · land', S, { sq: [0.78, 1], duration: 340, ease: 'outBack(2.2)', onUpdate: render });
  };
  const walk = async (x: number, y: number) => {
    const dx = x - S.x;
    if (Math.abs(dx) < 1) return;
    await turn(dx > 0 ? 1 : -1);
    const x0 = S.x;
    const y0 = S.y;
    const dy = y - y0;
    const o = { t: 0 };
    await tween('penguin · walk', o, {
      t: 1,
      duration: 180 + Math.abs(dx) / 0.55,
      ease: 'inOutSine',
      onUpdate: () => {
        S.x = x0 + dx * o.t;
        S.y = y0 + dy * o.t;
        const step = walked / 7;
        S.rot = Math.sin(step) * 6;
        S.bob = -Math.abs(Math.sin(step)) * 1.6;
        render();
      },
    });
    S.rot = 0;
    S.bob = 0;
    render();
  };
  const hop = async (x: number, y: number) => {
    const dx = x - S.x;
    const dy = y - S.y;
    if (Math.abs(dx) > 2) await turn(dx > 0 ? 1 : -1);
    await tween('penguin · crouch', S, { sq: 0.86, duration: 110, ease: 'outQuad', onUpdate: render }); // anticipation
    const x0 = S.x;
    const y0 = S.y;
    const h = 24 + Math.min(36, Math.abs(dy) / 5) + Math.min(16, Math.abs(dx) / 14) + (dy < 0 ? -dy * 0.25 : 0);
    const lean = 10 * (Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) + 1)); // lean into the travel, not into a plain drop
    const o = { t: 0 };
    await tween('penguin · hop', o, {
      t: 1,
      duration: 320 + Math.sqrt(Math.hypot(dx, dy)) * 16,
      ease: 'linear',
      onUpdate: () => {
        const t = o.t;
        S.x = x0 + dx * t;
        S.y = y0 + dy * t - h * 4 * t * (1 - t);
        S.sq = 1 + 0.12 * Math.sin(Math.PI * t); // stretch in the air
        S.rot = -lean * Math.sin(Math.PI * t); // forward in local space, so it holds for both facings
        render();
      },
    });
    await land();
  };
  // straight down from behind the top bar onto the perch: a drop, then the landing squash
  const drop = async (y: number) => {
    const y0 = S.y;
    const dy = y - y0;
    const o = { t: 0 };
    await tween('penguin · drop', o, {
      t: 1,
      duration: 240 + Math.sqrt(Math.abs(dy)) * 22,
      ease: 'inQuad',
      onUpdate: () => {
        S.y = y0 + dy * o.t;
        S.sq = 1 + 0.1 * o.t; // stretching as it falls
        render();
      },
    });
    await land();
  };
  const wave = () => {
    const a = animate(wing, { rotate: [0, -40, 0, -40, 0], duration: 900, ease: 'inOutSine' });
    register('penguin · wave', a);
    log('penguin · wave');
    return a.then(() => {});
  };
  const blink = () => {
    animate(eye, { scaleY: [1, 0.1, 1], duration: 180 });
    setTimeout(blink, 2800 + Math.random() * 3200);
  };

  // ---- entrances and exits, by kind of station; the wings are the nearest page edge
  const edge = (st: Station) => (st.side > 0 ? innerWidth + OFF : -OFF);
  const enter = async (st: Station, dir: 0 | 1 | -1 = 0) => {
    const p = st.pos();
    if (!p) return;
    S.scene = st.name;
    if (st.kind === 'switch') return place(st);
    dress();
    S.sq = 1;
    if (st.kind === 'floor' && dir > 0) {
      // the reader is coming down the page: so does it, dropping in from behind the bar onto the perch
      S.x = p.x;
      S.y = scrollY + 50;
      S.face = -1;
      render();
      await drop(p.y);
      return;
    }
    S.x = edge(st);
    S.face = -st.side;
    if (st.kind === 'cta' && cta) {
      // in along the note's last line, a beat behind the words, then behind the button and up on top of it
      const lr = lastLine(contactPhrase);
      const r = R(cta);
      if (ceremonyDone) {
        // seen it already: just come back up from behind the button
        S.x = r.left + r.width / 2;
        S.y = r.bottom + scrollY - 6;
        render();
        await wait(200);
        await hop(p.x, p.y);
        return;
      }
      S.y = lr ? lr.bottom + scrollY : r.bottom + scrollY - 6;
      render();
      if (lr) {
        await walk(lr.left + lr.width * 0.42, S.y);
        await wait(700);
      }
      await hop(r.left + r.width / 2, r.bottom + scrollY - 6); // hidden behind the button
      await wait(380);
      await hop(p.x, p.y);
      await wait(200);
      await wave();
      ceremonyDone = true;
      return;
    }
    S.y = p.y;
    render();
    await walk(p.x, p.y);
  };
  const exit = async (st: Station) => {
    if (st.kind === 'cta' && cta) {
      const r = R(cta);
      return hop(r.left + r.width / 2, r.bottom + scrollY - 6); // back behind the button
    }
    return walk(edge(st), S.y);
  };

  // ---- staging: which perch, and when to move
  let current: Station | null = null;
  let moving = false;
  let pending: Station | null | undefined;
  let landedAt = 0;
  let settle = 0;
  const vyOf = (st: Station) => {
    const p = st.pos();
    return p ? p.y - scrollY : NaN;
  };
  const zone = (st: Station) => {
    const vy = vyOf(st);
    if (Number.isNaN(vy)) return NaN;
    const bottom = st.kind === 'cta' ? innerHeight - 60 : ZONE.bottom(); // it holds the button until the edge
    return vy < ZONE.top ? vy - ZONE.top : vy > bottom ? vy - bottom : 0;
  };
  // in view = the whole body is below the top bar and above the bottom edge
  const inView = (st: Station) => {
    const vy = vyOf(st);
    return vy - H > 56 && vy < innerHeight + H;
  };
  const rail = (k: Kind) => k === 'switch' || k === 'floor';
  const atBottom = () => scrollY >= document.documentElement.scrollHeight - innerHeight - 4;
  // the perch nearest the reading line among those in the zone, optionally only past the current one in one direction
  const choose = (dir: 0 | 1 | -1): Station | null => {
    const finale = stations.find((st) => st.kind === 'cta');
    if (finale && atBottom() && zone(finale) === 0) return finale;
    const line = scrollY + READ();
    const cy = current?.pos()?.y ?? 0;
    let best: Station | null = null;
    let bd = Infinity;
    for (const st of stations) {
      if (st === current || zone(st) !== 0) continue;
      const y = st.pos()!.y;
      if (dir > 0 && y <= cy) continue;
      if (dir < 0 && y >= cy) continue;
      const d = Math.abs(y - line);
      if (d < bd) {
        bd = d;
        best = st;
      }
    }
    return best;
  };
  async function goTo(next: Station | null, dir: 0 | 1 | -1 = 0) {
    if (moving) {
      pending = next;
      return;
    }
    if (next === current) return;
    moving = true;
    const from = current;
    current = null;
    if (next) S.scene = next.name;
    try {
      if (from && inView(from)) {
        const fp = from.pos();
        const np = next?.pos();
        if (next && fp && np && rail(from.kind) && rail(next.kind) && Math.abs(np.y - fp.y) < 460) {
          await hop(np.x, np.y);
        } else {
          await exit(from);
          if (next) await enter(next, dir);
        }
      } else if (next) await enter(next, dir);
      current = next;
      landedAt = performance.now();
      if (next) {
        place(next);
        log(`penguin → ${next.name}`);
      }
    } finally {
      moving = false;
      if (pending !== undefined) {
        const p = pending;
        pending = undefined;
        if (p !== current) goTo(p);
      } else {
        // the page may have scrolled while it was moving: look again once it has landed
        clearTimeout(settle);
        settle = window.setTimeout(settled, 120);
      }
    }
  }

  // ---- wiring
  const check = () => {
    if (moving) return;
    if (current) {
      const z = zone(current);
      if (z === 0 || Number.isNaN(z)) return;
      const rest = 300 - (performance.now() - landedAt);
      if (rest > 0) {
        clearTimeout(settle);
        settle = window.setTimeout(settled, rest); // it has only just landed: give it a beat, then look again
        return;
      }
      goTo(choose(z < 0 ? 1 : -1), z < 0 ? 1 : -1); // its perch is leaving: move on in that direction, or off through the wings
    }
  };
  let lastDir: 0 | 1 | -1 = 0;
  const settled = () => {
    if (moving || current) return check();
    const next = choose(0);
    if (next) goTo(next, lastDir);
  };
  // a flick is too fast to keep up with: it rides off with the page and comes back in from the wings when the reader stops
  let lastY = scrollY;
  let lastT = performance.now();
  const onScrollOrResize = () => {
    const now = performance.now();
    const v = Math.abs(scrollY - lastY) / Math.max(1, now - lastT);
    if (scrollY !== lastY) lastDir = scrollY > lastY ? 1 : -1;
    lastY = scrollY;
    lastT = now;
    if (v < 0.7) check();
    clearTimeout(settle);
    settle = window.setTimeout(settled, 160);
  };
  addEventListener('scroll', onScrollOrResize, { passive: true });
  addEventListener('resize', onScrollOrResize);
  // an opened row moves the floor it stands on: it rides along, and thinks again at the next scroll
  new ResizeObserver(() => current && !moving && place(current)).observe(document.body);
  pen.wake = () => {
    if (current && !moving) place(current);
  };
  let perchLater = false;
  pen.hop = () => {
    if (pen.perched || current?.kind !== 'switch' || moving) return;
    if (pen.intro < 1) {
      perchLater = true; // still coming out from behind the knob: hop up once it is out
      return;
    }
    pen.perched = true;
    const p = current.pos();
    if (!p) return;
    moving = true;
    hop(p.x, p.y).then(() => {
      moving = false;
      if (current) place(current);
      landedAt = performance.now();
      clearTimeout(settle);
      settle = window.setTimeout(settled, 120);
    });
  };
  register('penguin', { get progress() { return current ? (stations.indexOf(current) + 1) / stations.length : 0; } });
  setTimeout(blink, 2500);
  animate(S, { breath: [0, 0.025], duration: 1400, alternate: true, loop: true, ease: 'inOutSine', onUpdate: render });

  // first entrance: from behind the knob, once the switch has been drawn; or straight onto the page if it was reloaded further down
  current = choose(0);
  if (current?.kind === 'switch') {
    place(current);
    el.style.opacity = '0'; // the knob it hides behind is only drawn at 900ms
    if (label) label.hidden = true;
    const a = animate(pen, {
      intro: 1,
      duration: 800,
      delay: 1500,
      ease: 'outBack',
      onBegin: () => {
        if (current) place(current);
        el.style.opacity = '';
        if (label) label.hidden = false;
      },
      onUpdate: () => current && place(current),
      onComplete: () => {
        if (perchLater) setTimeout(pen.hop, 250);
      },
    });
    register('penguin · intro', a);
  } else {
    pen.intro = 1;
    if (current) place(current);
    else S.x = innerWidth + OFF;
  }
}

// ---------- hover inspector (backstage, desktop): the page reads its own computed type ----------
function inspector() {
  const label = document.querySelector<HTMLElement>('[data-inspect]');
  if (!label) return;
  let current: HTMLElement | null = null;
  const clear = () => {
    if (current) current.style.outline = '';
    current = null;
    label.hidden = true;
  };
  addEventListener('mousemove', (e) => {
    if (mode !== 'backstage') return current && clear();
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('h1, h2, h3, h4, p, li, a, button, dt, dd');
    if (!el || el.closest('[data-hud]')) return clear();
    if (el !== current) {
      if (current) current.style.outline = '';
      current = el;
      el.style.outline = '1px dashed var(--color-signal)';
      el.style.outlineOffset = '3px';
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const lh = parseFloat(cs.lineHeight);
      const family = cs.fontFamily.includes('Azeret') ? 'Azeret Mono' : 'Bricolage';
      const stretch = parseFloat(cs.fontStretch);
      label.textContent = `${el.tagName.toLowerCase()} · ${family} ${cs.fontWeight}${stretch < 100 ? ` · wdth ${stretch}` : ''} · ${fs}px / ${(lh / fs).toFixed(2)}`;
      label.hidden = false;
    }
    label.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 18}px)`;
  });
  document.documentElement.addEventListener('mouseleave', clear);
  addEventListener('scroll', clear, { passive: true });
}

// ---------- load sequence (once) ----------
function load() {
  const lines = utils.$('[data-split]');
  const chars = lines.flatMap((el) => text.splitText(el, { chars: { wrap: 'clip' }, accessible: true }).chars);
  const track = svg.createDrawable('[data-hero-track]');
  const heroKnob = '[data-hero-knob]';
  const rest = utils.$('[data-fade]');

  utils.set(chars, { translateY: '108%' });
  utils.set([heroKnob, ...rest], { opacity: 0 });

  const tl = createTimeline({ defaults: { ease: 'outExpo' } })
    .add(chars, { translateY: ['108%', '0%'], duration: 950, delay: stagger(24) }, 0)
    .add(track, { draw: ['0 0', '0 1'], duration: 1100 }, 250)
    .add(heroKnob, { opacity: [0, 1], scale: [0.5, 1], duration: 500, ease: spring({ stiffness: 200, damping: 14 }) }, 900)
    .add(rest, { opacity: [0, 1], translateY: [10, 0], duration: 700, delay: stagger(110) }, 650);
  register('load', tl);
}


export function init() {
  if (!reduced) load();
  if (desktop) inspector();
  if (desktop && !reduced) penguin();
  // #backstage opens the page already flipped (shareable, and handy for screenshots)
  if (location.hash === '#backstage') setMode('backstage');
}
