// The clay penguin on the closing diorama: a real-time glTF model drawn with three.js on one WebGL canvas
// (src/diorama-scene.ts). This file is the behaviour: when to load, which clip plays, how the body turns.
// Nothing loads before the band is within 800px; then three.js, the meshopt decoder and the clay model arrive
// as one lazy chunk plus one GLB, and the wireframe model only the first time the page is in backstage. Until
// the model is ready (and always with reduced motion, without WebGL, or if anything fails) the still image is
// the whole feature; in backstage that fallback is drawn flat on a 2D canvas from still-wire.webp.
// One requestAnimationFrame loop runs while something moves and stops when nothing does (off screen, hidden
// tab, static, or a held turned pose). The clips are sampled at 24 fps: while only clips play the loop draws
// at 30 fps (an even divisor of 60 and 120 Hz), and at every vsync while the body turns, so a drag is smooth.
// The yaw (pointer look, drag, inertia) is a continuous angle put straight on the model.
import type { ClipName, Scene3D } from './diorama-scene';

type State = 'waiting' | 'slide' | 'rise' | 'wave' | 'idle' | 'look' | 'spin' | 'static';
type Hooks = { reduced: () => boolean; log: (message: string) => void; onStage: (active: boolean) => void };
type Clip = { name: ClipName; loop: boolean; done?: () => void };

const SLIDE = 1300; // ms
const RISE_AT = 1040; // the character starts to rise while the slide is still settling
const FADE = 120; // ms: every change of clip cross-fades, so nothing ever pops
const FRAME = 1000 / 30 - 4; // ms: the draw interval while only clips play (4 ms of slack for vsync jitter)
const ACTIVE = 0.45; // share of the band on screen that puts the character on stage
const LOOK_OMEGA = 18; // rad/s of the critically damped spring that follows the pointer
const SETTLE_OMEGA = 11; // softer, for the way back to the front after a drag
const INERTIA = 0.3; // s: decay of the spin after release
const MAX_SPIN = 540; // deg/s: a flick coasts about half a turn at most
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const mod = (n: number, m = 360) => ((n % m) + m) % m;
export const decode = async (file: string) => createImageBitmap(await (await fetch(file)).blob());
const LIVE = ['idle', 'look', 'wave', 'spin']; // the states in which the character answers the pointer
const wrap = (deg: number) => mod(deg + 180) - 180; // to (-180, 180]
const MODEL = '/penguin/diorama.glb';
const MODEL_WIRE = '/penguin/diorama-wire.glb';
const GRAIN = '/clay/grain.png';

export function createDiorama({ reduced, log, onStage }: Hooks) {
  const stage = document.querySelector<HTMLElement>('[data-diorama-stage]');
  const band = stage?.closest<HTMLElement>('[data-horizon]');
  const contact = document.querySelector('[data-cta]');
  if (!stage || !band) return { onMotionChange() {}, onMode() {}, destroy() {} };
  const root = document.documentElement;
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const nameTag = stage.querySelector<HTMLElement>('[data-diorama-name]');
  const frameTag = stage.querySelector<HTMLElement>('[data-diorama-frame]');
  const canvasClass = 'absolute inset-0 size-full block pointer-events-none select-none'; // select-none: WebKit paints a selected canvas dark
  const canvas = document.createElement('canvas'); // the WebGL canvas
  canvas.className = canvasClass;
  canvas.setAttribute('aria-hidden', 'true');
  let flat: HTMLCanvasElement | null = null; // the 2D canvas of the static pose in backstage, made when first needed
  const hit = document.createElement('div');
  hit.className = 'absolute left-9/50 right-9/50 top-17/100 bottom-3/50 pointer-events-auto cursor-grab touch-pan-y select-none data-dragging:cursor-grabbing';
  hit.hidden = true;
  stage.prepend(canvas);
  stage.append(hit);

  let scene: Scene3D | null = null;
  let loading = false;
  let wireRequest: Promise<void> | null = null;
  let stills: [ImageBitmap, ImageBitmap] | null = null;
  let stillsRequest: Promise<void> | null = null;
  let state: State = 'waiting';
  let dirty = false;
  let near = false;
  let failed = false;
  let lostContext = false;
  let onScreen = false;
  let staged = false; // enough of the band is on screen for the character to take the stage
  let active = false;
  let suspended = false;
  let entranceDone = false;
  let entering = false;
  let clip: Clip | null = null;
  let frozen = false; // the idle clip is paused under a held turned pose
  let fadeEnd = 0;
  let slide: Animation | null = null;
  let raf = 0;
  let before = 0;
  let lastDraw = 0;
  let fast = false; // the body is turning: draw at every vsync
  let ground = '#edefec';
  let side = 0;
  let ratio = 1;
  // yaw: a continuous angle in degrees, 0 facing the viewer, positive towards the viewer's right
  let yaw = 0;
  let vel = 0;
  let target = 0;
  let omega = LOOK_OMEGA;
  let coasting = false;
  let wantWave = false;
  let lastWave = -Infinity;
  let inside = false;
  let calm = false; // after a drag the pose stays frontal until the pointer moves again
  let pointerX = 0;
  let drag: { id: number; x0: number; yaw0: number; moved: boolean; t: number; v: number; fresh: boolean } | null = null;
  const written: Record<string, string> = {};

  const backstage = () => root.dataset.mode === 'backstage';
  // Ready when the clay model is loaded and, in backstage, its wireframe too.
  const ready = () => scene !== null && !lostContext && (!backstage() || scene.wired);
  const turning = () => state === 'look' || state === 'spin';
  const put = (name: string, value: string | null) => {
    if (written[name] === (value ?? '')) return;
    written[name] = value ?? '';
    if (value === null) stage!.removeAttribute(`data-${name}`); else stage!.setAttribute(`data-${name}`, value);
  };

  // ---------- drawing ----------
  function size() {
    side = stage!.clientWidth;
    if (!side) return;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    scene?.resize(side, ratio);
    if (flat) flat.width = flat.height = Math.max(1, Math.round(side * ratio));
    dirty = true;
    render();
  }
  function render() {
    dirty = false;
    // In backstage before the wireframe model has arrived (a slow first fetch) the flat still stands in for it, never a bare silhouette.
    if (state === 'static' || (backstage() && scene && !scene.wired && state !== 'waiting')) { drawFlat(); return; }
    if (!scene || lostContext || !side || state === 'waiting') return; // the waiting stage is invisible: nothing to draw
    canvas.hidden = false;
    if (flat) flat.hidden = true;
    scene.draw(yaw);
    stage!.toggleAttribute('data-drawn', true);
    const pose = scene.pose();
    put('pose', `${pose.name ?? 'still'}:${pose.frame}`);
    put('yaw', String(Math.round(mod(yaw)) % 360));
    label(pose.name);
  }
  function label(name: ClipName | null) {
    if (!backstage()) return;
    const text = `model · ${turning() ? 'turn' : name ?? 'still'}`;
    if (nameTag && nameTag.textContent !== text) nameTag.textContent = text;
    const angle = `${Math.round(mod(yaw)) % 360}°`;
    if (frameTag && frameTag.textContent !== angle) frameTag.textContent = angle;
  }
  // The static pose in backstage: the still's clay silhouette filled with the ground colour and the still's
  // wireframe over it, composited on a 2D canvas so the mode wipe can snapshot it synchronously. In front the
  // still image itself is visible and nothing is drawn.
  function drawFlat() {
    canvas.hidden = true;
    const show = backstage() && stills !== null && side > 0;
    if (!show) {
      if (flat) flat.hidden = true;
      stage!.toggleAttribute('data-drawn', false);
      put('pose', 'still');
      put('yaw', null);
      return;
    }
    if (!flat) {
      flat = document.createElement('canvas');
      flat.className = canvasClass;
      flat.setAttribute('aria-hidden', 'true');
      flat.width = flat.height = Math.max(1, Math.round(side * ratio));
      canvas.after(flat);
    }
    const c = flat.getContext('2d')!;
    c.clearRect(0, 0, flat.width, flat.height);
    c.imageSmoothingQuality = 'high';
    c.drawImage(stills![0], 0, 0, flat.width, flat.height);
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = ground;
    c.fillRect(0, 0, flat.width, flat.height);
    c.globalCompositeOperation = 'source-over';
    c.drawImage(stills![1], 0, 0, flat.width, flat.height);
    flat.hidden = false;
    stage!.toggleAttribute('data-drawn', true);
    put('pose', 'still');
    put('yaw', null);
    if (nameTag) nameTag.textContent = 'model · still';
    if (frameTag) frameTag.textContent = '0°';
  }

  // ---------- loading ----------
  function fail() {
    failed = true;
    goStatic();
    setActive(staged);
  }
  async function loadClay() {
    if (!near || scene || loading || reduced() || failed) return;
    loading = true;
    let created: Scene3D;
    try {
      const { createScene } = await import('./diorama-scene');
      created = await createScene(canvas, { clay: MODEL, grain: GRAIN });
    } catch {
      loading = false;
      fail();
      return;
    }
    created.onLost(() => { lostContext = true; goStatic(); setActive(false); }, () => { lostContext = false; if (!reduced()) { setActive(staged); leaveStatic(); } });
    scene = created;
    loading = false;
    readGround();
    scene.mode(backstage(), ground);
    size();
    if (backstage()) void loadWire();
    if (reduced()) { goStatic(); return; }
    tryEnter();
  }
  function loadWire() {
    if (!near || reduced() || failed || !scene) return Promise.resolve();
    wireRequest ??= scene.loadWire(MODEL_WIRE).then(() => {
      stage!.dataset.wire = 'ready';
      dirty = true;
      render();
      tryEnter();
    }, () => { fail(); });
    return wireRequest;
  }
  function loadStills() {
    if (!near) return Promise.resolve();
    stillsRequest ??= Promise.all([decode('/penguin/still.webp'), decode('/penguin/still-wire.webp')]).then(images => {
      stills = images;
      if (state === 'static' || (backstage() && scene && !scene.wired)) { dirty = true; render(); }
    }, () => { stillsRequest = null; });
    return stillsRequest;
  }

  // ---------- the loop ----------
  function wake() {
    if (raf || !running() || signal.aborted || state === 'static') return; // a static pose never needs a loop
    before = performance.now();
    raf = requestAnimationFrame(dioramaFrame);
  }
  function running() { return onScreen && !document.hidden && !suspended; }
  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function dioramaFrame(now: number) {
    raf = 0;
    // while only clips play there is nothing new between two 30 fps frames
    if (!fast && !drag?.fresh && now - lastDraw < FRAME) { raf = requestAnimationFrame(dioramaFrame); return; }
    const dt = clamp((now - before) / 1000, 0, 0.05);
    before = now;
    const busy = advance(now, dt);
    if (dirty) { render(); lastDraw = now; }
    if (busy && running() && !raf) raf = requestAnimationFrame(dioramaFrame);
  }
  function startClip(name: ClipName, { loop = false, done }: { loop?: boolean; done?: () => void } = {}) {
    if (!scene) return;
    clip = { name, loop, done };
    frozen = false;
    scene.play(name, { loop });
    fadeEnd = performance.now() + FADE;
    dirty = true;
    wake();
  }
  // The idle clip under a turned body: resumed if it was held, started (with a cross-fade) if something else played.
  function ensureIdle() {
    if (clip?.name === 'idle' && scene) {
      if (frozen) { scene.resume(); frozen = false; }
      wake();
    } else startClip('idle', { loop: true });
  }
  // Returns whether anything is still moving.
  function advance(now: number, dt: number) {
    let busy = false;
    if (state === 'slide' && slide) {
      busy = true;
      if (Number(slide.currentTime) >= RISE_AT) beginRise();
    }
    let moving = false;
    if (turning()) {
      if (drag) {
        moving = drag.fresh;
        drag.fresh = false;
      } else if (coasting) {
        yaw = mod(yaw + vel * dt);
        vel *= Math.exp(-dt / INERTIA);
        if (Math.abs(vel) < 30) { coasting = false; target = 0; omega = SETTLE_OMEGA; }
        moving = true;
        dirty = true;
      } else {
        // critically damped spring, solved exactly so any frame time is stable
        const d0 = wrap(yaw - target);
        const k = (vel + omega * d0) * dt;
        const decay = Math.exp(-omega * dt);
        const d = (d0 + k) * decay;
        vel = (vel - omega * k) * decay;
        yaw = mod(target + d);
        if (Math.abs(d) < 0.2 && Math.abs(vel) < 1.5) { yaw = mod(target); vel = 0; arrived(); } else moving = true;
        dirty = true;
      }
    }
    fast = moving;
    busy ||= moving;
    if (clip && scene && state !== 'slide') {
      // an idle clip under a turned body only ticks while the body moves or the cross-fade runs; a parked body holds
      // still only once a blink is over, so the eyes never stay shut
      const holding = turning() && !moving && now >= fadeEnd;
      if (!holding || (!frozen && !scene.eyesOpen())) {
        scene.step(dt);
        dirty = true;
        if (scene.takeFinished()) {
          const { done } = clip;
          clip = null;
          done?.();
        } else busy = true;
      } else if (!frozen && clip.loop) { scene.freeze(); frozen = true; }
    }
    return busy;
  }

  // ---------- behaviour ----------
  function setState(next: State) {
    state = next;
    stage!.dataset.state = next;
    hit.hidden = !LIVE.includes(next);
  }
  function toIdle() {
    wantWave = false;
    setState('idle');
    ensureIdle();
  }
  function toWave() {
    if (!ready()) { toIdle(); return; }
    wantWave = false;
    lastWave = performance.now();
    setState('wave');
    log('diorama → wave');
    startClip('wave', { done: settled });
  }
  function lookYaw() {
    if (!inside || calm || !ready()) return 0;
    const r = stage!.getBoundingClientRect();
    const b = band!.getBoundingClientRect();
    const centre = r.left + r.width / 2;
    const edge = Math.max(1, pointerX >= centre ? b.right - centre : centre - b.left);
    const t = clamp((pointerX - centre) / edge, -1, 1);
    return mod(Math.sign(t) * Math.abs(t) ** 0.65 * 90);
  }
  // Whatever just finished, the character goes back to the pointer, or to idling.
  function settled() {
    const t = lookYaw();
    if (Math.abs(wrap(t)) > 3) steer(t); else toIdle();
  }
  function steer(angle: number) {
    target = mod(angle);
    omega = LOOK_OMEGA;
    if (state !== 'look') {
      vel = 0;
      coasting = false;
      setState('look');
      ensureIdle();
    } else if (frozen) ensureIdle();
    fast = true;
    wake();
  }
  function arrived() {
    if (Math.abs(wrap(target)) > 0.5) return; // holding a turned pose: the loop stops while nothing changes
    if (wantWave) { toWave(); return; }
    toIdle();
  }
  function wave() {
    if (!ready()) return;
    if (state === 'idle') toWave();
    else if (state === 'look') { wantWave = true; steer(0); }
  }

  function beginRise() {
    setState('rise');
    log('diorama → rise');
    startClip('rise', { done: () => { entranceDone = true; toWave(); } });
  }
  function enter() {
    entering = true;
    const r = stage!.getBoundingClientRect();
    const b = band!.getBoundingClientRect();
    const distance = -(r.right - b.left) - 8; // fully beyond the left edge of the band
    // the character lies still on the first frame of the rise while it slides in
    clip = { name: 'rise', loop: false };
    scene!.play('rise', { loop: false, paused: true });
    setState('slide');
    dirty = true;
    render();
    log('diorama → slide');
    // the slide is a compositor transform; the loop only watches the clock to start the rise early
    const animation = stage!.animate([{ transform: `translateX(${distance}px)` }, { transform: 'translateX(0)' }], {
      duration: SLIDE, easing: 'cubic-bezier(0.2, 0.6, 0.35, 1)', fill: 'both',
    });
    slide = animation;
    if (!running()) animation.pause();
    animation.finished.then(() => { animation.cancel(); if (slide === animation) slide = null; entering = false; }, () => {});
    wake();
  }
  function tryEnter() {
    if (state === 'waiting' && !entering && !entranceDone && active && !reduced() && !document.hidden && ready()) enter();
  }

  function goStatic() {
    stopLoop();
    clip = null;
    frozen = false;
    coasting = false;
    fast = false;
    yaw = vel = target = 0;
    slide?.cancel();
    slide = null;
    entering = false;
    wantWave = false;
    endDrag();
    setState('static');
    drawFlat();
    if (backstage()) void loadStills();
  }
  function leaveStatic() {
    if (failed || lostContext) return;
    canvas.hidden = false;
    if (flat) flat.hidden = true;
    stage!.toggleAttribute('data-drawn', false);
    if (entranceDone && ready()) { toIdle(); dirty = true; render(); return; }
    setState('waiting');
    void loadClay();
    if (backstage()) void loadWire();
    tryEnter();
  }

  // ---------- pointer ----------
  function endDrag() {
    if (!drag) return;
    hit.removeAttribute('data-dragging');
    if (hit.hasPointerCapture(drag.id)) hit.releasePointerCapture(drag.id);
    drag = null;
  }
  hit.addEventListener('pointerdown', event => {
    if (drag || (event.pointerType === 'mouse' && event.button !== 0) || !LIVE.includes(state) || !running()) return;
    hit.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x0: event.clientX, yaw0: turning() ? yaw : 0, moved: false, t: event.timeStamp, v: 0, fresh: false };
    hit.setAttribute('data-dragging', '');
  }, { signal });
  // a mouse drag must not start a text selection: WebKit paints whatever it selects (the plates, the canvas) in a wash
  hit.addEventListener('mousedown', event => event.preventDefault(), { signal });
  hit.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) < 5 || !ready()) return;
      drag.moved = true;
      coasting = false;
      wantWave = false;
      yaw = drag.yaw0;
      setState('spin');
      log('diorama → spin');
      ensureIdle();
    }
    // 1:1 with the finger: a drag across the stage is one full turn
    const perPixel = 360 / Math.max(1, stage!.clientWidth);
    const next = mod(drag.yaw0 + dx * perPixel);
    const dt = event.timeStamp - drag.t;
    if (dt > 0) drag.v = 0.6 * drag.v + 0.4 * (wrap(next - yaw) / dt * 1000);
    yaw = next;
    drag.t = event.timeStamp;
    drag.fresh = true;
    dirty = true;
    if (frozen) ensureIdle();
    wake();
  }, { signal });
  const release = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    const { moved, v, t } = drag;
    endDrag();
    if (!moved) { if (event.type === 'pointerup') wave(); return; }
    calm = true;
    const flick = event.timeStamp - t < 90 && Math.abs(v) > 60;
    coasting = flick;
    vel = flick ? clamp(v, -MAX_SPIN, MAX_SPIN) : 0;
    target = 0;
    omega = SETTLE_OMEGA;
    fast = true;
    if (frozen) ensureIdle();
    wake();
  };
  hit.addEventListener('pointerup', release, { signal });
  hit.addEventListener('pointercancel', release, { signal });
  band.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    inside = true;
    calm = false;
    pointerX = event.clientX;
    if (reduced() || wantWave || drag) return;
    if (state === 'idle' || state === 'look') {
      const t = lookYaw();
      if (state === 'look' || Math.abs(wrap(t)) > 3) steer(t);
    }
  }, { passive: true, signal });
  band.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    inside = false;
    if (state === 'look' && !wantWave) steer(0);
  }, { signal });
  // The contact button greets whoever stands on the diorama, politely rate-limited.
  const greet = () => {
    if (active && entranceDone && state !== 'static' && performance.now() - lastWave > 2400) wave();
  };
  contact?.addEventListener('pointerenter', greet, { signal });
  contact?.addEventListener('focus', greet, { signal });

  // ---------- visibility ----------
  function sync() {
    const go = onScreen && !document.hidden;
    if (go === !suspended) return;
    suspended = !go;
    if (suspended) {
      stopLoop();
      slide?.pause();
    } else {
      slide?.play();
      dirty = true;
      wake();
      tryEnter();
    }
  }
  function setActive(next: boolean) {
    const value = next && !reduced() && !failed && !lostContext;
    if (value === active) return;
    active = value;
    onStage(active);
    tryEnter();
  }
  const intersection = new IntersectionObserver(entries => {
    const entry = entries.at(-1)!;
    onScreen = entry.isIntersecting;
    staged = onScreen && entry.intersectionRatio >= ACTIVE - 0.005;
    setActive(staged);
    sync();
  }, { threshold: [0, 0.2, ACTIVE - 0.005, 0.7, 1] });
  intersection.observe(band);
  const proximity = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    proximity.disconnect();
    near = true;
    if (state === 'static') { if (backstage()) void loadStills(); } else void loadClay();
  }, { rootMargin: '800px 0px' });
  proximity.observe(band);
  document.addEventListener('visibilitychange', sync, { signal });
  const resizer = new ResizeObserver(size);
  resizer.observe(stage);

  // Any CSS colour the page's ground is written in, as three.js can read it.
  function readGround() {
    ground = getComputedStyle(root).getPropertyValue('--color-bg').trim() || ground;
  }
  readGround();
  setState('waiting');
  size();
  if (reduced()) goStatic();

  return {
    // Called by setMode(), inside the view transition's update callback: the canvas is redrawn
    // synchronously, so the snapshot of the new mode already holds the new pose.
    onMode() {
      readGround();
      scene?.mode(backstage(), ground);
      if (backstage()) { if (state === 'static' || (scene && !scene.wired)) void loadStills(); if (state !== 'static') void loadWire(); }
      dirty = true;
      render();
      tryEnter();
    },
    onMotionChange() {
      if (reduced()) { goStatic(); setActive(false); } else { setActive(staged); leaveStatic(); }
    },
    destroy() {
      lifetime.abort();
      stopLoop();
      slide?.cancel();
      intersection.disconnect();
      proximity.disconnect();
      resizer.disconnect();
      scene?.dispose();
      canvas.remove();
      flat?.remove();
      hit.remove();
      for (const name of ['state', 'wire', 'drawn', 'pose', 'yaw']) stage.removeAttribute(`data-${name}`);
      if (active) onStage(false);
    },
  };
}
