import { animate } from 'animejs';

type Point = { x: number; y: number };
type Perch = { name: string; element: Element; point: () => Point; accessory: string };
type Hooks = { reduced: () => boolean; ready: Promise<void>; log: (message: string) => void; register: (name: string, animation: { progress: number }) => void };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const ease = (t: number) => 1 - (1 - t) ** 3;

export function createPenguin({ ready, log, register, reduced }: Hooks) {
  const bird = document.querySelector<HTMLElement>('[data-penguin]')!;
  const body = bird.querySelector<SVGGElement>('[data-penguin-body]')!;
  const wing = bird.querySelector<SVGGElement>('[data-wing]')!;
  const pupils = [...bird.querySelectorAll<SVGEllipseElement>('[data-pupil]')];
  const feet = [...bird.querySelectorAll<SVGPathElement>('[data-foot]')];
  const props = [...bird.querySelectorAll<SVGGElement>('[data-prop]')];
  const label = document.querySelector<HTMLElement>('[data-penguin-label]')!;
  const header = document.querySelector('header')!;
  const hud = document.querySelector<HTMLElement>('[data-hud]')!;
  const track = document.querySelector('[data-hero-track]')!;
  const contact = document.querySelector('[data-cta]')!;
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const rect = (el: Element) => el.getBoundingClientRect();
  const pose = { x: 0, y: 0, lift: 0, face: 1, tilt: 0, squash: 1, wing: 0, alpha: 1 };
  let width = parseFloat(getComputedStyle(bird).width);
  let current: Perch | null = null;
  let destination: Perch | null = null;
  let scene: AbortController | null = null;
  let loaded = false;
  let scrolling = false;
  let suspended = false;
  let frame = 0;
  let settle = 0;
  let lastWave = 0;
  const disabled = () => !loaded || signal.aborted || suspended || reduced() || document.hidden;
  const hero: Perch = {
    name: 'switch', element: track, accessory: 'scarf',
    point: () => { const r = rect(track); return { x: r.left + r.width / 2, y: r.top + scrollY + 1 }; },
  };
  const perches = [hero];
  for (const [selector, name, accessory] of [
    ['#work li[id^="w-"]', 'project', 'glasses'], ['#skills > ol > li', 'skill', 'headphones'],
    ['#experience > ol > li', 'role', 'beanie'], ['#experience > ul > li', 'school', 'beanie'],
  ]) {
    document.querySelectorAll(selector).forEach((element, i) => perches.push({
      name: `${name} ${i + 1}`, element, accessory,
      point: () => { const r = rect(element); return { x: r.right - width / 2 - 8, y: r.bottom + scrollY }; },
    }));
  }
  const about = document.querySelector('#about [data-phrase]')!;
  perches.push({
    name: 'behind the words', element: about, accessory: '',
    point: () => { const r = [...about.getClientRects()].at(-1) ?? rect(about); return { x: r.left + r.width * 0.42, y: r.bottom + scrollY }; },
  });
  const finale: Perch = {
    name: 'hello', element: contact, accessory: 'bowtie',
    point: () => { const r = rect(contact); return { x: r.left + r.width * 0.7, y: r.top + scrollY + 1 }; },
  };
  perches.push(finale);

  function draw() {
    bird.style.transform = `translate3d(${pose.x - width / 2}px, ${pose.y - width * 72 / 64 - pose.lift}px, 0) scaleX(${pose.face})`;
    bird.style.opacity = String(pose.alpha);
    body.style.transform = `rotate(${pose.tilt}deg) scale(${1 / pose.squash}, ${pose.squash})`;
    wing.style.transform = `rotate(${pose.wing}deg)`;
    feet.forEach((foot, i) => { foot.style.transform = `rotate(${(i ? -1 : 1) * (pose.squash - 1) * 45}deg)`; });
    label.style.opacity = String(pose.alpha);
    const left = pose.x > innerWidth / 2;
    label.style.transform = `translate(${pose.x + (left ? -1 : 1) * (width / 2 + 8)}px, ${pose.y - pose.lift - 16}px)${left ? ' translateX(-100%)' : ''}`;
    label.textContent = `${label.dataset.prefix} · ${destination?.name ?? current?.name ?? 'entrance'} · ${bird.dataset.state}`;
  }
  function neutral() {
    Object.assign(pose, { lift: 0, tilt: 0, squash: 1, wing: 0, alpha: 1, face: Math.sign(pose.face) || 1 });
    pupils.forEach(pupil => { pupil.style.transform = ''; });
  }
  function hide() {
    bird.hidden = label.hidden = true;
    bird.dataset.state = 'hidden';
  }
  function cancel() {
    scene?.abort();
    scene = null;
    destination = null;
    neutral();
  }
  function sleep() {
    cancel();
    clearTimeout(settle);
    cancelAnimationFrame(frame);
    frame = 0;
    scrolling = false;
    current = null;
    hide();
  }
  function visible(perch: Perch, margin = 0) {
    const r = rect(perch.element);
    if (!r.width || !r.height) return false;
    const p = perch.point();
    let bottom = innerHeight - 12 - margin;
    if (document.documentElement.dataset.mode === 'backstage' && hud.getClientRects().length && p.x + width / 2 > rect(hud).left) {
      bottom = Math.min(bottom, rect(hud).top - 16);
    }
    return p.y - scrollY > rect(header).bottom + width * 72 / 64 + 2 + margin && p.y - scrollY < bottom;
  }
  function choose() {
    if (visible(hero)) return hero;
    if (visible(finale) && scrollY + innerHeight >= document.documentElement.scrollHeight - 12) return finale;
    const readingLine = scrollY + rect(header).bottom + (innerHeight - rect(header).bottom) * 0.58;
    return perches.filter(p => visible(p, 24)).sort((a, b) => Math.abs(a.point().y - readingLine) - Math.abs(b.point().y - readingLine))[0] ?? null;
  }

  // Every gesture belongs to one scene; cancellation stops its clock and all following beats.
  function beat(state: string, duration: number, update: (t: number) => void, abort: AbortSignal) {
    abort.throwIfAborted();
    bird.dataset.state = state;
    return new Promise<void>((resolve, reject) => {
      const clock = { t: 0 };
      const animation = animate(clock, {
        t: 1, duration, ease: 'linear',
        onUpdate: () => { if (!abort.aborted) { update(clock.t); draw(); } },
        onComplete: () => { abort.removeEventListener('abort', stop); update(1); draw(); resolve(); },
      });
      const stop = () => { animation.cancel(); reject(abort.reason); };
      abort.addEventListener('abort', stop, { once: true });
      register(`penguin · ${state}`, animation);
    });
  }
  async function face(x: number, abort: AbortSignal) {
    const target = x >= pose.x ? -1 : 1;
    if (target === pose.face) return;
    const start = pose.face;
    await beat('look', 140, t => { pose.face = mix(start, target, ease(t)); }, abort);
  }
  async function jump(perch: Perch, abort: AbortSignal) {
    await face(perch.point().x, abort);
    await beat('prepare', 130, t => { pose.squash = 1 - Math.sin(t * Math.PI / 2) * 0.16; pose.wing = -10 * t; }, abort);
    const start = { x: pose.x, y: pose.y };
    const end = perch.point();
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const arc = clamp(20 + distance * 0.13, 20, 58);
    await beat('hop', clamp(320 + distance * 0.65, 320, 520), t => {
      const p = perch.point();
      pose.x = mix(start.x, p.x, t);
      pose.y = mix(start.y, p.y, t);
      pose.lift = Math.sin(Math.PI * t) * arc;
      pose.squash = 1 + Math.sin(Math.PI * t) * 0.1;
      pose.tilt = Math.sin(Math.PI * t) * clamp((p.x - start.x) / 30, -7, 7) * pose.face;
      pose.wing = -28 * Math.sin(Math.PI * t);
    }, abort);
    await land(perch, abort);
  }
  async function land(perch: Perch, abort: AbortSignal) {
    await beat('land', 230, t => {
      Object.assign(pose, perch.point());
      pose.lift = 0;
      pose.squash = 1 - Math.cos(t * Math.PI * 1.5) * (1 - t) ** 2 * 0.18;
      pose.tilt = 0;
      pose.wing = -10 * (1 - t);
    }, abort);
    abort.throwIfAborted();
    neutral();
  }
  async function wave(perch: Perch, abort: AbortSignal) {
    await beat('wave', 760, t => {
      Object.assign(pose, perch.point());
      pose.wing = -Math.sin(Math.PI * t) * (46 + 12 * Math.sin(t * Math.PI * 6));
      pose.tilt = Math.sin(Math.PI * t) * -4;
    }, abort);
    lastWave = performance.now();
  }
  async function play(perch: Perch, action: (abort: AbortSignal) => Promise<void>) {
    cancel();
    const controller = new AbortController();
    scene = controller;
    destination = perch;
    try {
      await action(controller.signal);
      controller.signal.throwIfAborted();
      await face(pose.x > innerWidth / 2 ? pose.x - 1 : pose.x + 1, controller.signal);
      controller.signal.throwIfAborted();
      current = perch;
      neutral();
      Object.assign(pose, perch.point());
      bird.dataset.state = 'idle';
      bird.dataset.perch = perch.name;
      draw();
      log(`penguin → ${perch.name}`);
    } catch (error) {
      if (!controller.signal.aborted) { current = null; hide(); console.error('Penguin scene failed', error); }
    } finally {
      if (scene === controller) { scene = null; destination = null; schedule(); }
    }
  }
  function enter(perch: Perch) {
    const from = current;
    const continuous = from && !bird.hidden && visible(from);
    const p = perch.point();
    const nearby = continuous && Math.hypot(p.x - pose.x, p.y - pose.y) < 230;
    void play(perch, async abort => {
      if (nearby) { await jump(perch, abort); return; }
      if (continuous) {
        await beat('exit', 150, t => { Object.assign(pose, from.point()); pose.alpha = 1 - t; pose.squash = 1 - 0.12 * t; }, abort);
        abort.throwIfAborted();
        hide();
      }
      abort.throwIfAborted();
      props.forEach(prop => prop.toggleAttribute('hidden', prop.dataset.prop !== perch.accessory));
      Object.assign(pose, perch.point(), { alpha: 0, lift: -8, face: p.x > innerWidth / 2 ? 1 : -1 });
      bird.hidden = label.hidden = false;
      await beat('arrive', 320, t => {
        Object.assign(pose, perch.point());
        pose.alpha = ease(t);
        pose.lift = Math.sin(Math.PI * t) * 12 - 8 * (1 - t);
        pose.squash = 1 + Math.sin(Math.PI * t) * 0.06;
      }, abort);
      await land(perch, abort);
      if (perch === finale) await wave(perch, abort);
    });
  }
  function reconcile() {
    if (disabled()) { sleep(); return; }
    if (scene) {
      if (destination && !visible(destination)) { cancel(); current = null; hide(); }
      else return;
    }
    if (!scrolling && current !== finale && visible(finale) && scrollY + innerHeight >= document.documentElement.scrollHeight - 12) { enter(finale); return; }
    if (current && visible(current)) {
      Object.assign(pose, current.point());
      draw();
      if (scrolling || visible(current, 36)) return;
    } else if (current) { current = null; hide(); }
    if (scrolling) return;
    const next = choose();
    if (next && next !== current) enter(next);
  }
  function schedule() {
    clearTimeout(settle);
    if (!disabled()) settle = window.setTimeout(() => { scrolling = false; reconcile(); }, 180);
  }
  function layout() {
    if (!frame && !disabled()) frame = requestAnimationFrame(() => { frame = 0; reconcile(); });
  }
  function onFlip() {
    if (disabled()) return;
    if ((current === hero || destination === hero) && !bird.hidden) {
      void play(hero, async abort => { await jump(hero, abort); });
    } else layout();
  }
  addEventListener('scroll', () => { scrolling = true; layout(); schedule(); }, { passive: true, signal });
  addEventListener('resize', () => { width = parseFloat(getComputedStyle(bird).width); layout(); schedule(); }, { signal });
  addEventListener('pagehide', () => { suspended = true; sleep(); }, { signal });
  addEventListener('pageshow', () => { suspended = false; layout(); }, { signal });
  document.addEventListener('visibilitychange', () => document.hidden ? sleep() : layout(), { signal });
  const greet = () => {
    if (!disabled() && current === finale && !scene && performance.now() - lastWave > 2400) void play(finale, abort => wave(finale, abort));
  };
  contact.addEventListener('pointerenter', greet, { signal });
  contact.addEventListener('focus', greet, { signal });
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || bird.hidden || scene || disabled()) return;
    const dx = event.clientX - pose.x;
    const dy = event.clientY - (pose.y - scrollY - width * 0.7);
    const near = Math.hypot(dx, dy) < 160;
    pupils.forEach(pupil => { pupil.style.transform = near ? `translate(${clamp(dx / 90, -1.2, 1.2) * pose.face}px, ${clamp(dy / 100, -0.8, 0.8)}px)` : ''; });
  }, { passive: true, signal });
  const observer = new ResizeObserver(layout);
  perches.forEach(perch => observer.observe(perch.element));
  observer.observe(document.body);
  observer.observe(header);
  void ready.then(() => { loaded = true; layout(); });
  return { onFlip, onMotionChange() { reduced() ? sleep() : layout(); }, destroy() { lifetime.abort(); sleep(); observer.disconnect(); } };
}
