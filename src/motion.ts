import { animate, createTimeline, stagger, svg, utils } from 'animejs';
import { createPenguin } from './penguin';

type Mode = 'front' | 'backstage';
type Progress = { progress: number; cancelled?: boolean };
const root = document.documentElement;
const preference = matchMedia('(prefers-reduced-motion: reduce)');
// Cache the event state so layout reads cannot consume a pending media-query change.
let reduced = preference.matches;
const registry = new Map<string, Progress>();
const logList = document.querySelector<HTMLElement>('[data-hud-log]')!;
const hud = document.querySelector<HTMLElement>('[data-hud]')!;
let hudFrame = 0;

export function log(message: string) {
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleTimeString([], { hour12: false })}  ${message}`;
  logList.prepend(li);
  while (logList.children.length > 3) logList.lastElementChild!.remove();
}
function drawHUD() {
  cancelAnimationFrame(hudFrame);
  hudFrame = 0;
  if (root.dataset.mode !== 'backstage' || document.hidden || reduced) return;
  let active = false;
  for (const li of hud.querySelectorAll<HTMLElement>('[data-animation]')) {
    const item = registry.get(li.dataset.animation!)!;
    const progress = item.cancelled ? 1 : Math.max(0, Math.min(1, item.progress));
    li.querySelector('i')!.style.transform = `scaleX(${progress})`;
    li.querySelector('em')!.textContent = `${Math.round(progress * 100)}%`;
    active ||= progress < 1;
  }
  const max = root.scrollHeight - innerHeight;
  hud.querySelector('[data-hud-scroll]')!.textContent = `${Math.round(scrollY)}px · ${max > 0 ? Math.round(scrollY / max * 100) : 0}%`;
  if (active) hudFrame = requestAnimationFrame(drawHUD);
}
function register(name: string, item: Progress) {
  registry.delete(name);
  registry.set(name, item);
  while (registry.size > 4) registry.delete(registry.keys().next().value!);
  const list = hud.querySelector('[data-tl-list]')!;
  list.replaceChildren(...[...registry.keys()].map(key => {
    const li = document.createElement('li');
    li.dataset.animation = key;
    li.className = 'grid grid-cols-[1fr_30px] gap-2 items-center';
    const caption = document.createElement('div');
    caption.textContent = key;
    const bar = document.createElement('span');
    bar.className = 'block mt-[3px] h-0.5 bg-line overflow-hidden';
    const fill = document.createElement('i');
    fill.className = 'block h-full bg-signal origin-left';
    bar.append(fill);
    caption.append(bar);
    const percent = document.createElement('em');
    percent.className = 'not-italic text-right tabular-nums';
    li.append(caption, percent);
    return li;
  }));
  drawHUD();
}

export function init() {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const toggles = [...document.querySelectorAll<HTMLButtonElement>('[data-toggle]')];
  const knobs = [...document.querySelectorAll<SVGCircleElement>('[data-knob]')];
  const animations = new Map<string, ReturnType<typeof animate> | ReturnType<typeof createTimeline>>();
  let mode: Mode = root.dataset.mode === 'backstage' ? 'backstage' : 'front';
  let desired = mode;
  let transition: ViewTransition | null = null;
  let origin: Element = toggles[0];
  const trackAnimation = (name: string, animation: ReturnType<typeof animate> | ReturnType<typeof createTimeline>) => {
    animations.get(name)?.cancel();
    animations.set(name, animation);
    register(name, animation);
    return animation;
  };

  // Two printed lines enter as units. The rest of the page is never gated by this introduction.
  const entrance = createTimeline({ autoplay: false, defaults: { ease: 'outQuint' } });
  if (!reduced && scrollY < innerHeight && !location.hash) {
    entrance
      .add('[data-name-line]', { translateY: ['105%', '0%'], rotate: [2, 0], opacity: [0, 1], duration: 700, delay: stagger(110) }, 0)
      .add(svg.createDrawable('[data-hero-track]'), { draw: ['0 0', '0 1'], duration: 650 }, 160)
      .add('[data-hero-knob]', { scale: [0.72, 1], opacity: [0, 1], duration: 380 }, 430)
      .add('[data-fade]', { opacity: [0, 1], translateY: [8, 0], duration: 400, delay: stagger(45) }, 400);
    trackAnimation('page · entrance', entrance);
    entrance.play();
  }
  const pen = createPenguin({ ready: entrance.duration && !entrance.paused ? entrance.then(() => {}) : Promise.resolve(), log, register, reduced: () => reduced });

  function setMode(next: Mode) {
    animations.get('backstage · notes')?.revert();
    animations.delete('backstage · notes');
    clearInspector();
    mode = next;
    const on = next === 'backstage';
    root.dataset.mode = next;
    toggles.forEach(toggle => toggle.setAttribute('aria-pressed', String(on)));
    document.querySelectorAll<HTMLElement>('[data-mode-label]').forEach(label => { label.textContent = on ? label.dataset.backstage! : label.dataset.front!; });
    animations.get('switch · latch')?.cancel();
    if (reduced) knobs.forEach(knob => knob.setAttribute('cx', on ? '150' : '50'));
    else trackAnimation('switch · latch', animate(knobs, { cx: on ? 150 : 50, duration: 360, ease: 'outQuint' }));
    log(`flip → ${next}`);
    drawHUD();
  }
  function annotations() {
    if (mode !== 'backstage' || reduced) return;
    const visible = (el: Element) => { const r = el.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
    const notes = [...document.querySelectorAll('.bs:not([data-under]):not([data-penguin-label]):not([data-hud])')].filter(visible);
    trackAnimation('backstage · notes', animate(notes, { opacity: [0, 1], duration: 300, delay: (_: unknown, i = 0) => Math.min(i * 12, 100), ease: 'outQuad' }));
    const lines = [...document.querySelectorAll('[data-chain-line]')].filter(visible);
    if (lines.length) trackAnimation('backstage · connections', animate(svg.createDrawable(lines), { draw: ['0 0', '0 1'], duration: 460, ease: 'outCubic' }));
  }
  async function reveal() {
    if (transition || mode === desired || signal.aborted) return;
    const next = desired;
    if (reduced || !document.startViewTransition) {
      setMode(next);
      annotations();
      pen.onFlip();
      return;
    }
    let source = origin.querySelector('[data-knob]') ?? origin;
    let r = source.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) {
      source = toggles[0].querySelector('[data-knob]') ?? toggles[0];
      r = source.getBoundingClientRect();
    }
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    // Keep the circle in snapshot coordinates, including high-density webviews.
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty('--reveal-x', `${x / innerWidth * 100}%`);
    root.style.setProperty('--reveal-y', `${y / innerHeight * 100}%`);
    root.style.setProperty('--reveal-radius', `${radius / Math.hypot(innerWidth, innerHeight) * Math.SQRT2 * 100}%`);
    root.style.setProperty('--dur', '0ms');
    root.dataset.reveal = next === 'backstage' ? 'open' : 'close';
    const operation = document.startViewTransition(() => setMode(next));
    transition = operation;
    const progress = { progress: 0 };
    const timer = trackAnimation('backstage · circle', animate(progress, { progress: 1, duration: 640, ease: 'linear' }));
    try {
      await operation.ready;
      annotations();
    } catch { /* A hidden document may skip its visual snapshot; the mode still updates. */ }
    await operation.finished.catch(() => {});
    timer.complete();
    transition = null;
    delete root.dataset.reveal;
    root.style.removeProperty('--dur');
    if (signal.aborted) return;
    if (desired !== mode) void reveal();
    else pen.onFlip();
  }
  function flip(from: Element) {
    origin = from;
    desired = desired === 'front' ? 'backstage' : 'front';
    void reveal();
  }
  toggles.forEach(toggle => toggle.addEventListener('click', () => flip(toggle), { signal }));
  addEventListener('keydown', event => {
    const target = event.target as HTMLElement | null;
    if (event.key.toLowerCase() === 'b' && !event.repeat && !event.metaKey && !event.ctrlKey && !event.altKey && !target?.closest('input, textarea, select, [contenteditable="true"]')) {
      flip(toggles[1] ?? toggles[0]);
    }
  }, { signal });

  // The panel is the layout transition. Its contents enter once, with a short bounded stagger.
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-row]')];
  buttons.forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls')!)!;
    panel.inert = true;
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      for (const sibling of buttons) {
        const body = document.getElementById(sibling.getAttribute('aria-controls')!)!;
        const expanded = sibling === button && open;
        sibling.setAttribute('aria-expanded', String(expanded));
        body.toggleAttribute('data-open', expanded);
        body.inert = !expanded;
        animations.get(body.id)?.revert();
        if (expanded && !reduced) {
          const contents = [...body.querySelectorAll(':scope > div > dl > div, :scope > div > ul > li, :scope > div > a')];
          trackAnimation(body.id, animate(contents, { opacity: [0, 1], translateY: [7, 0], duration: 280, delay: (_: unknown, i = 0) => 60 + Math.min(i * 40, 120), ease: 'outCubic' }));
        }
      }
      log(`${open ? 'open' : 'close'} #${panel.id}`);
    }, { signal });
  });

  // A reading marker moves between section links; content itself stays still during scroll.
  const links = [...document.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')];
  const sections = [...document.querySelectorAll<HTMLElement>('main > section[id]')];
  let readingFrame = 0;
  function readPosition() {
    readingFrame = 0;
    const line = document.querySelector('header')!.getBoundingClientRect().bottom + innerHeight * 0.25;
    const active = sections.filter(section => section.getBoundingClientRect().top <= line).at(-1)?.id;
    links.forEach(link => { if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    drawHUD();
  }
  const onScroll = () => { if (!readingFrame) readingFrame = requestAnimationFrame(readPosition); };
  addEventListener('scroll', onScroll, { passive: true, signal });
  addEventListener('resize', onScroll, { signal });
  readPosition();

  const inspector = document.querySelector<HTMLElement>('[data-inspect]')!;
  let inspected: HTMLElement | null = null;
  const clearInspector = () => { if (inspected) inspected.style.outline = ''; inspected = null; inspector.hidden = true; };
  function inspect(event: MouseEvent) {
    if (mode !== 'backstage') { clearInspector(); return; }
    const el = (event.target as HTMLElement)?.closest<HTMLElement>('h1,h2,h3,h4,p,li,a,button,dt,dd');
    if (!el || el.closest('[data-hud],[data-toggle]')) { clearInspector(); return; }
    if (el !== inspected) {
      clearInspector();
      inspected = el;
      el.style.outline = '1px dashed var(--color-signal)';
      el.style.outlineOffset = '3px';
      const cs = getComputedStyle(el);
      inspector.textContent = `${el.tagName.toLowerCase()} · ${cs.fontFamily.includes('Azeret') ? 'Azeret Mono' : 'Bricolage'} ${cs.fontWeight} · ${cs.fontSize} / ${(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2)}`;
      inspector.hidden = false;
    }
    inspector.style.transform = `translate(${Math.min(event.clientX + 14, innerWidth - inspector.offsetWidth - 8)}px, ${Math.min(event.clientY + 18, innerHeight - inspector.offsetHeight - 8)}px)`;
  }
  addEventListener('pointermove', event => { if (event.pointerType === 'mouse') inspect(event); }, { passive: true, signal });
  addEventListener('click', event => { if (matchMedia('(hover: none)').matches) inspect(event); }, { signal });
  addEventListener('scroll', clearInspector, { passive: true, signal });
  root.addEventListener('mouseleave', clearInspector, { signal });
  preference.addEventListener('change', event => {
    reduced = event.matches;
    pen.onMotionChange();
    if (reduced) {
      for (const animation of animations.values()) animation.complete();
      transition?.skipTransition();
      setMode(desired);
    }
    drawHUD();
  }, { signal });
  document.addEventListener('visibilitychange', drawHUD, { signal });
  if (location.hash === '#backstage') { desired = 'backstage'; setMode(desired); }
  if (import.meta.hot) import.meta.hot.dispose(() => {
    lifetime.abort();
    transition?.skipTransition();
    for (const animation of animations.values()) animation.revert();
    cancelAnimationFrame(hudFrame);
    cancelAnimationFrame(readingFrame);
    clearInspector();
    pen.destroy();
  });
}
