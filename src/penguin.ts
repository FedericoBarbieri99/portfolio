import { animate } from 'animejs';
import { clamp, decode, mod } from './diorama';
import sprites from '../public/penguin/sprites.json';

type Point = { x: number; y: number };
type Perch = { name: string; element: Element; point: () => Point; fits?: () => boolean };
type Hooks = { reduced: () => boolean; away: () => boolean; ready: Promise<void>; log: (message: string) => void; register: (name: string, animation: { progress: number }) => void };
type Clip = { start: number; frames: number; fps?: number };
type Mini = { file: string; wireFile: string; frameWidth: number; frameHeight: number; cols: number; degreesPerFrame: number; clips: { turn: Clip; wave: Clip; blink: Clip } };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => 1 - (1 - t) ** 3;
// Geometry of a frame of the mini sheet (see sprites.json: same framing as the big sheets). The element is the whole square frame.
const GROUND = 1 - 0.0833; // the feet stand on this line, as a fraction of the frame's height
const HALF = 0.34; // half the character's width, as a fraction of the frame's width
const TALL = 0.75; // the character's height above the ground line, as a fraction of the frame
const SIDE = 45; // how far it turns towards where it is going, in degrees

export function createPenguin({ ready, log, register, reduced, away }: Hooks) {
  const bird = document.querySelector<HTMLElement>('[data-penguin]')!;
  const canvas = bird.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const label = document.querySelector<HTMLElement>('[data-penguin-label]')!;
  const shadow = document.querySelector<HTMLElement>('[data-penguin-shadow]')!;
  const header = document.querySelector('header')!;
  const hud = document.querySelector<HTMLElement>('[data-hud]')!;
  const track = document.querySelector('[data-hero-track]')!;
  const contact = document.querySelector('[data-cta]')!;
  const closing = contact.closest('section')!;
  const root = document.documentElement;
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const rect = (el: Element) => el.getBoundingClientRect();
  // yaw: degrees, 0 facing the viewer, positive towards the viewer's right. clip: a played clip (wave, blink) replaces the turn frame.
  const pose = { x: 0, y: 0, lift: 0, yaw: 0, tilt: 0, squash: 1, alpha: 1, clip: null as { name: 'wave' | 'blink'; frame: number } | null };
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
  const backstage = () => root.dataset.mode === 'backstage';

  // ---------- the sprite: sheet layout comes from sprites.json, nothing here assumes it ----------
  const mini: Mini = sprites.mini; // bundled: no extra request before the sheet
  let clay: ImageBitmap | null = null;
  let wire: ImageBitmap | null = null;
  let wireRequested = false;
  let ground = '#edefec';
  let painted = '';
  // the sheet is only needed once the entrance is done, so it never competes with the hero's own assets
  const sprite = ready.then(async () => { clay = await decode(`/penguin/${mini.file}`); });
  // the wire twin loads on first entry to backstage; until it is decoded the clay silhouette is filled and drawn without lines
  function loadWire() {
    if (wireRequested) return;
    wireRequested = true;
    void decode(`/penguin/${mini.wireFile}`).then(image => { wire = image; painted = ''; paint(); }, () => { wireRequested = false; });
  }
  function frameIndex() {
    const { clips, degreesPerFrame } = mini;
    if (pose.clip) return clips[pose.clip.name].start + pose.clip.frame;
    return clips.turn.start + mod(Math.round(pose.yaw / degreesPerFrame), clips.turn.frames);
  }
  // One frame onto the canvas: clay in front; in backstage the clay silhouette filled with the ground colour and the wire frame on top.
  function paint() {
    if (!clay || !canvas.width) return;
    const index = frameIndex();
    const key = `${index}|${backstage()}|${!!wire}|${canvas.width}|${ground}`;
    if (key === painted) return;
    painted = key;
    bird.dataset.frame = String(index);
    const { frameWidth: w, frameHeight: h, cols } = mini;
    const from = (image: ImageBitmap) => ctx.drawImage(image, (index % cols) * w, Math.floor(index / cols) * h, w, h, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    from(clay);
    if (!backstage()) return;
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    if (wire) from(wire);
  }
  function size() {
    width = parseFloat(getComputedStyle(bird).width);
    const px = Math.max(1, Math.round(width * Math.min(devicePixelRatio || 1, 2)));
    if (canvas.width !== px) {
      canvas.width = canvas.height = px;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      painted = '';
      paint();
    }
  }
  size();

  // ---------- where it can stand ----------
  const hero: Perch = {
    name: 'switch', element: track,
    point: () => { const r = rect(track); return { x: r.left + r.width / 2, y: r.top + scrollY + 1 }; },
  };
  const perches = [hero];
  // A row's perch is the spot on its bottom line where the character covers no text and no button: the slot is searched from the
  // right edge leftwards over the row's own text, pills and plus button, and cached until the layout changes. A row with no free
  // slot (a narrow screen full of text) is not a perch at the moment.
  const slots = new WeakMap<Element, number | null>();
  function findSlot(element: Element) {
    const r = rect(element);
    const half = width * HALF;
    const top = r.bottom - width * TALL * 0.9; // the character's head must clear the last line of text above the line it stands on
    const boxes: [number, number, number][] = [];
    const add = (b: DOMRect) => { if (b.width > 0 && b.height > 0 && b.bottom > top && b.top < r.bottom) boxes.push([b.left - 6, b.right + 6, b.bottom]); };
    // Backstage the mascot carries its annotation beside it (see draw()): that strip must not land on the row's own annotations.
    // ponytail: the label's width is a constant, its longest resting text; measure it if the wording ever grows.
    const note = backstage() ? 184 : 0;
    const noteTop = r.bottom - 22;
    const clear = (x: number) => {
      const [from, to] = x > innerWidth / 2 ? [x - half - 8 - note, x - half] : [x + half, x + half + 8 + note];
      return from >= 8 && to <= innerWidth - 8 && !boxes.some(([left, right, bottom]) => bottom > noteTop && to > left && from < right);
    };
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement!;
      if (!node.textContent!.trim() || parent.closest('[inert]') || getComputedStyle(parent).visibility === 'hidden') continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const b of range.getClientRects()) add(b);
    }
    element.querySelectorAll('[data-clay="plus"], [data-clay="lump"]').forEach(el => add(rect(el)));
    for (let x = r.right - half - 8; x >= r.left + half + 4; x -= 6) {
      if (!boxes.some(([left, right]) => x + half > left && x - half < right) && (!note || clear(x))) return x;
    }
    return null;
  }
  const slot = (element: Element) => {
    if (!slots.has(element)) slots.set(element, findSlot(element));
    return slots.get(element)!;
  };
  const forgetSlots = () => perches.forEach(perch => slots.delete(perch.element));
  for (const [selector, name] of [
    ['#work li[id^="w-"]', 'project'], ['#skills > ol > li', 'skill'],
    ['#experience > ol > li', 'role'], ['#experience > ul > li', 'school'],
  ]) {
    document.querySelectorAll(selector).forEach((element, i) => perches.push({
      name: `${name} ${i + 1}`, element,
      point: () => { const r = rect(element); return { x: slot(element) ?? r.right - width * HALF - 8, y: r.bottom + scrollY }; },
      fits: () => slot(element) !== null,
    }));
  }
  // Beside the last words of the About text, in the margin to the right of the paragraph: standing on a line of text anywhere else
  // would hide the line above it, so on a screen too narrow to have that margin this is not a perch.
  const about = document.querySelector('#about [data-phrase]')!;
  const aboutText = about.closest('p')!;
  perches.push({
    name: 'by the words', element: about,
    point: () => { const r = [...about.getClientRects()].at(-1) ?? rect(about); return { x: rect(aboutText).right + width * HALF + 16, y: r.bottom + scrollY }; },
    fits: () => rect(aboutText).right + width * 2 * HALF + 24 <= innerWidth,
  });
  const finale: Perch = {
    name: 'hello', element: contact,
    point: () => { const r = rect(contact); return { x: r.left + r.width * 0.7, y: r.top + scrollY + 1 }; },
  };
  perches.push(finale);

  function draw() {
    bird.style.transform = `translate3d(${pose.x - width / 2}px, ${pose.y - width * GROUND - pose.lift}px, 0)`;
    bird.style.opacity = String(pose.alpha);
    canvas.style.transform = `rotate(${pose.tilt}deg) scale(${1 / pose.squash}, ${pose.squash})`;
    paint();
    // Ground contact: the shadow widens and fades as the bird rises, the way a real one does.
    const air = Math.max(0, pose.lift) / 60;
    const w = width * 2 * HALF * (0.82 + air * 0.5);
    const h = width * 0.115;
    shadow.style.width = `${w}px`;
    shadow.style.height = `${h}px`;
    shadow.style.transform = `translate3d(${pose.x - w / 2}px, ${pose.y - h * 0.58}px, 0)`;
    shadow.style.opacity = String(pose.alpha * 0.16 * Math.max(0, 1 - air * 0.75));
    label.style.opacity = String(pose.alpha);
    label.textContent = `${label.dataset.prefix} · ${destination?.name ?? current?.name ?? 'entrance'} · ${bird.dataset.state}`;
    // Side follows the mascot, but a narrow screen wins: the annotation never leaves the viewport.
    const span = label.offsetWidth;
    const gap = width * HALF + 8;
    const x = pose.x > innerWidth / 2 ? pose.x - gap - span : pose.x + gap;
    label.style.transform = `translate(${clamp(x, 8, Math.max(8, innerWidth - span - 8))}px, ${pose.y - pose.lift - 16}px)`;
  }
  function neutral() {
    Object.assign(pose, { lift: 0, tilt: 0, squash: 1, alpha: 1, clip: null });
    glance = glanceTarget = 0;
  }
  function hide() {
    stopIdle();
    bird.hidden = label.hidden = shadow.hidden = true;
    bird.dataset.state = 'hidden';
  }
  function cancel() {
    stopIdle();
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
    if (backstage() && hud.getClientRects().length && p.x + width * HALF > rect(hud).left) {
      bottom = Math.min(bottom, rect(hud).top - 16);
    }
    return p.y - scrollY > rect(header).bottom + width * TALL + 2 + margin && p.y - scrollY < bottom && (perch.fits?.() ?? true);
  }
  // ---------- life while it stands still: a blink every few seconds, a glance at the pointer ----------
  // One frame loop, alive only while the bird is on screen, idle and doing something; between blinks a timer sleeps. Every scene,
  // hide and sleep stops both.
  let idle = 0;
  let idleTimer = 0;
  let glance = 0;
  let glanceTarget = 0;
  let blinkStart = -1;
  let nextBlink = 0;
  let before = 0;
  const idling = () => !disabled() && !bird.hidden && !scene && bird.dataset.state === 'idle';
  function stopIdle() {
    cancelAnimationFrame(idle);
    clearTimeout(idleTimer);
    idle = idleTimer = 0;
    blinkStart = -1;
  }
  function idleFrame(now: number) {
    idle = 0;
    if (!idling()) return;
    const dt = Math.min(0.05, (now - before) / 1000);
    before = now;
    glance += (glanceTarget - glance) * (1 - Math.exp(-dt * 11));
    if (Math.abs(glanceTarget - glance) < 0.4) glance = glanceTarget;
    pose.yaw = glance;
    const clip = mini.clips.blink;
    if (blinkStart < 0 && now >= nextBlink && Math.abs(glance) < 7) blinkStart = now;
    if (blinkStart >= 0) {
      const f = Math.floor((now - blinkStart) * (clip.fps ?? 12) / 1000);
      if (f >= clip.frames) { blinkStart = -1; pose.clip = null; nextBlink = now + 2800 + Math.random() * 3200; }
      else pose.clip = { name: 'blink', frame: f };
    }
    paint();
    if (blinkStart >= 0 || glance !== glanceTarget) idle = requestAnimationFrame(idleFrame);
    else idleTimer = window.setTimeout(() => { idleTimer = 0; idle = requestAnimationFrame(idleFrame); }, Math.max(0, nextBlink - performance.now()));
  }
  function startIdle() {
    if (!idling()) return;
    if (!idle && !idleTimer) {
      glance = pose.yaw;
      before = performance.now();
      nextBlink = before + 1800 + Math.random() * 2400;
    }
    clearTimeout(idleTimer);
    idleTimer = 0;
    if (!idle) idle = requestAnimationFrame(idleFrame);
  }
  // The farewell belongs to the moment the whole contact section is on screen. Below it sits the clay
  // diorama, whose own character takes over (see `away`), so the end of the page is not the trigger.
  const endZone = () => rect(closing).bottom <= innerHeight + 12;
  function choose() {
    if (visible(hero)) return hero;
    if (endZone() && visible(finale)) return finale;
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
  // Turning steps through the neighbouring turn frames: yaw is continuous, the frame is the nearest 15 degrees.
  async function turn(target: number, abort: AbortSignal) {
    if (Math.abs(target - pose.yaw) < 1) return;
    const start = pose.yaw;
    await beat('look', 140, t => { pose.yaw = mix(start, target, ease(t)); }, abort);
  }
  async function jump(perch: Perch, abort: AbortSignal) {
    await turn(perch.point().x >= pose.x ? SIDE : -SIDE, abort);
    await beat('prepare', 130, t => { pose.squash = 1 - Math.sin(t * Math.PI / 2) * 0.16; }, abort);
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
      pose.tilt = Math.sin(Math.PI * t) * clamp((p.x - start.x) / 30, -7, 7);
    }, abort);
    await land(perch, abort);
  }
  async function land(perch: Perch, abort: AbortSignal) {
    await beat('land', 230, t => {
      Object.assign(pose, perch.point());
      pose.lift = 0;
      pose.squash = 1 - Math.cos(t * Math.PI * 1.5) * (1 - t) ** 2 * 0.18;
      pose.tilt = 0;
    }, abort);
    abort.throwIfAborted();
    neutral();
  }
  // The wave is the sheet's own clip, front on; it lasts as long as the clip.
  async function wave(perch: Perch, abort: AbortSignal) {
    const clip = mini.clips.wave;
    await turn(0, abort);
    await beat('wave', clip.frames / (clip.fps ?? 12) * 1000, t => {
      Object.assign(pose, perch.point());
      pose.clip = { name: 'wave', frame: Math.min(clip.frames - 1, Math.floor(t * clip.frames)) };
    }, abort);
    pose.clip = null;
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
      await turn(0, controller.signal);
      controller.signal.throwIfAborted();
      current = perch;
      neutral();
      Object.assign(pose, perch.point());
      bird.dataset.state = 'idle';
      bird.dataset.perch = perch.name;
      draw();
      log(`penguin → ${perch.name}`);
      startIdle();
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
      Object.assign(pose, perch.point(), { alpha: 0, lift: -8, yaw: 0 });
      bird.hidden = label.hidden = shadow.hidden = false;
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
  // The big clay character owns the stage: this one takes its short exit and stays away until it is released.
  async function depart() {
    const controller = new AbortController();
    cancel();
    scene = controller;
    current = null;
    try {
      await beat('exit', 150, t => { pose.alpha = 1 - t; pose.squash = 1 - 0.12 * t; }, controller.signal);
      hide();
    } catch { /* superseded by sleep() or a new scene, which own the state now */ }
    finally { if (scene === controller) scene = null; }
  }
  function reconcile() {
    if (disabled()) { sleep(); return; }
    if (away()) {
      if (!bird.hidden && bird.dataset.state !== 'exit') void depart();
      else if (bird.hidden) current = null;
      return;
    }
    if (scene) {
      if (destination && !visible(destination)) { cancel(); current = null; hide(); }
      else return;
    }
    if (!scrolling && endZone() && visible(finale) && current !== finale) { enter(finale); return; }
    if (current && visible(current)) {
      Object.assign(pose, current.point());
      draw();
      startIdle();
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
  addEventListener('resize', () => { size(); forgetSlots(); layout(); schedule(); }, { signal });
  addEventListener('pagehide', () => { suspended = true; sleep(); }, { signal });
  addEventListener('pageshow', () => { suspended = false; layout(); }, { signal });
  document.addEventListener('visibilitychange', () => document.hidden ? sleep() : layout(), { signal });
  // Hovering or focusing the button, with the mascot standing on it, earns another wave.
  const greet = () => {
    if (current === finale && !disabled() && !scene && performance.now() - lastWave > 2400) void play(finale, abort => wave(finale, abort));
  };
  contact.addEventListener('pointerenter', greet, { signal });
  contact.addEventListener('focus', greet, { signal });
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || bird.hidden || scene || disabled()) return;
    // it glances towards a near pointer, up to 45 degrees either way
    const dx = event.clientX - pose.x;
    const dy = event.clientY - (pose.y - scrollY - width * 0.4);
    glanceTarget = Math.hypot(dx, dy) < 170 ? clamp(dx / 90, -1, 1) * SIDE : 0;
    if (glanceTarget !== glance) startIdle();
  }, { passive: true, signal });
  const observer = new ResizeObserver(() => { forgetSlots(); layout(); });
  perches.forEach(perch => observer.observe(perch.element));
  observer.observe(document.body);
  observer.observe(header);
  void Promise.all([ready, sprite]).then(() => { loaded = true; if (backstage()) loadWire(); layout(); }, error => console.error('The mascot sprite did not load', error));
  return {
    onFlip,
    refresh: layout,
    // Called by setMode(), inside the view transition's update callback: the canvas is redrawn synchronously, so the snapshot of the
    // new mode already holds the new look. The wire twin is fetched the first time the page goes backstage.
    onMode() {
      ground = getComputedStyle(root).getPropertyValue('--color-bg').trim() || ground;
      forgetSlots();
      if (backstage()) loadWire();
      painted = '';
      paint();
    }, onMotionChange() { reduced() ? sleep() : layout(); },
    destroy() { lifetime.abort(); sleep(); observer.disconnect(); },
  };
}
