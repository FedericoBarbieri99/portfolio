// The clay penguin on the closing diorama: pre-rendered sprite sheets drawn on one canvas. Front mode
// draws the clay frame; backstage draws the same frame as a solid ground-coloured silhouette with the amber
// wireframe over it, composited on the canvas itself so the mode wipe can snapshot it synchronously.
// Sheet layout, frame counts and fps are read from /penguin/sprites.json; nothing here assumes them.
// One requestAnimationFrame loop runs while something moves and stops when nothing does (off screen,
// hidden tab, static, or a held turned pose). Clips advance by elapsed time against their fps, never by
// counting callbacks; the yaw (pointer look, drag, inertia) is a continuous angle drawn as the nearest frame.
type Name = 'still' | 'rise' | 'idle' | 'wave' | 'turn';
type State = 'waiting' | 'slide' | 'rise' | 'wave' | 'idle' | 'look' | 'spin' | 'static';
type Hooks = { reduced: () => boolean; log: (message: string) => void; onStage: (active: boolean) => void };
type Sheet = { frames: number; cols: number; rows: number; frameWidth?: number; frameHeight?: number; fps: number; loop?: boolean };
type Pose = { sheet: Name; frame: number };
type Clip = { sheet: Name; from: number; to: number; fps: number; loop: boolean; done?: () => void; t0: number; elapsed: number };
type Source = ImageBitmap | HTMLImageElement;

const SOLO: Sheet = { frames: 1, cols: 1, rows: 1, fps: 24 };
const FADE = 120; // ms: every change of clip dissolves, so nothing ever pops
const SLIDE = 1300; // ms
const RISE_AT = 1040; // the character starts to rise while the slide is still settling
const ACTIVE = 0.45; // share of the band on screen that puts the character on stage
const LOOK_OMEGA = 18; // rad/s of the critically damped spring that follows the pointer
const SETTLE_OMEGA = 11; // softer, for the way back to the front after a drag
const INERTIA = 0.3; // s: decay of the spin after release
const MAX_SPIN = 540; // deg/s: a flick coasts about half a turn at most
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const mod = (n: number, m = 360) => ((n % m) + m) % m;
const wrap = (deg: number) => mod(deg + 180) - 180; // to (-180, 180]
const url = (key: string) => `/penguin/${key}.webp`;

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
  const canvas = document.createElement('canvas');
  canvas.className = 'diorama-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  const scratch = document.createElement('canvas'); // one pose composed on its own, for the dissolves
  const sctx = scratch.getContext('2d');
  const hit = document.createElement('div');
  hit.className = 'diorama-hit';
  hit.hidden = true;
  stage.prepend(canvas);
  stage.append(hit);

  let meta: Record<string, Sheet> | null = null;
  const sources = new Map<string, Source>(); // every decoded sheet, kept alive
  const requests = new Map<string, Promise<boolean>>();
  let state: State = 'waiting';
  let cur: Pose = { sheet: 'still', frame: 0 };
  let prev: Pose | null = null;
  let fadeAt = 0;
  let painted = false;
  let dirty = false;
  let near = false;
  let failed = false;
  let onScreen = false;
  let active = false;
  let suspended = false;
  let entranceDone = false;
  let entering = false;
  let clip: Clip | null = null;
  let slide: Animation | null = null;
  let raf = 0;
  let before = 0;
  let ground = '#edefec';
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
  let drag: { id: number; x0: number; yaw0: number; moved: boolean; x: number; t: number; v: number } | null = null;

  const backstage = () => root.dataset.mode === 'backstage';
  const running = () => onScreen && !document.hidden && !suspended;
  const key = (name: Name, wired: boolean) => (wired ? `${name}-wire` : name);
  const sheet = (name: Name): Sheet => (name === 'still' ? SOLO : meta?.[name] ?? SOLO);
  // A sheet is ready when its clay is decoded and, in backstage, so is its wireframe twin.
  const ready = (name: Name) => sources.has(name) && (!backstage() || sources.has(`${name}-wire`));
  const turnStep = () => 360 / (meta?.turn?.frames ?? 36);
  const turnFrame = (angle: number) => mod(Math.round(angle / turnStep()), meta?.turn?.frames ?? 36);

  // ---------- drawing ----------
  function size() {
    const side = stage!.clientWidth;
    if (!side || !ctx) return;
    const px = Math.max(1, Math.round(side * Math.min(window.devicePixelRatio || 1, 2)));
    if (canvas.width !== px) {
      canvas.width = canvas.height = scratch.width = scratch.height = px;
      for (const c of [ctx, sctx]) if (c) { c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; }
      dirty = true;
      render();
    }
  }
  function frameOf(c: CanvasRenderingContext2D, source: Source, def: Sheet, index: number) {
    const w = def.frameWidth ?? source.width / def.cols;
    const h = def.frameHeight ?? source.height / def.rows;
    c.drawImage(source, (index % def.cols) * w, Math.floor(index / def.cols) * h, w, h, 0, 0, c.canvas.width, c.canvas.height);
  }
  // One pose onto a context: the clay frame in front; in backstage the clay silhouette filled with the
  // ground colour and the wireframe of the same frame on top. Until a wire sheet is decoded the neutral
  // wire pose stands in (with the neutral clay as its silhouette), and with no wire at all nothing is drawn.
  function compose(c: CanvasRenderingContext2D, pose: Pose) {
    if (!backstage()) {
      const clay = sources.get(pose.sheet);
      if (!clay) return false;
      frameOf(c, clay, sheet(pose.sheet), pose.frame);
      return true;
    }
    const real = sources.has(key(pose.sheet, true)) && sources.has(pose.sheet);
    const use: Pose = real ? pose : { sheet: 'still', frame: 0 };
    const clay = sources.get(use.sheet);
    const lines = sources.get(key(use.sheet, true));
    if (!clay || !lines) return false;
    frameOf(c, clay, sheet(use.sheet), use.frame);
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = ground;
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    c.globalCompositeOperation = 'source-over';
    frameOf(c, lines, sheet(use.sheet), use.frame);
    return true;
  }
  function render(now = performance.now()) {
    dirty = false;
    if (!ctx || !sctx || !canvas.width) return;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let drew = false;
    const fade = prev ? clamp((now - fadeAt) / FADE, 0, 1) : 1;
    if (prev && fade < 1) {
      // a dissolve is a linear blend of premultiplied pixels: both poses added, weighted
      const eased = fade * fade * (3 - 2 * fade);
      ctx.globalCompositeOperation = 'lighter';
      for (const [pose, alpha] of [[prev, 1 - eased], [cur, eased]] as const) {
        sctx.globalCompositeOperation = 'source-over';
        sctx.clearRect(0, 0, scratch.width, scratch.height);
        if (compose(sctx, pose)) { ctx.globalAlpha = alpha; ctx.drawImage(scratch, 0, 0); drew = true; }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      prev = null;
      drew = compose(ctx, cur);
    }
    painted ||= drew;
    stage!.toggleAttribute('data-drawn', drew);
    stage!.dataset.pose = `${cur.sheet}:${cur.frame}`;
    label();
  }
  function label() {
    if (!backstage()) return;
    const { frames } = sheet(cur.sheet);
    nameTag!.textContent = `sprite · ${cur.sheet}`;
    frameTag!.textContent = `${cur.frame + 1}/${frames}${cur.sheet === 'turn' ? ` · ${Math.round(cur.frame * turnStep())}°` : ''}`;
  }
  function setPose(next: Pose, now = performance.now()) {
    if (next.sheet === cur.sheet && next.frame === cur.frame) return;
    if (next.sheet !== cur.sheet && painted && !reduced()) { prev = cur; fadeAt = now; }
    cur = next;
    dirty = true;
  }

  // ---------- loading ----------
  async function decode(file: string): Promise<Source> {
    try {
      const blob = await (await fetch(file)).blob();
      return await createImageBitmap(blob);
    } catch {
      const img = new Image();
      img.decoding = 'async';
      img.src = file;
      await img.decode();
      return img;
    }
  }
  function load(name: Name, wired = false) {
    const id = key(name, wired);
    let request = requests.get(id);
    if (!request) {
      request = decode(url(id)).then(source => {
        sources.set(id, source);
        if (wired) stage!.dataset.wire = 'ready';
        dirty = true;
        render();
        tryEnter();
        return true;
      }, () => false);
      requests.set(id, request);
    }
    return request;
  }
  async function loadMeta() {
    if (meta) return true;
    try {
      meta = (await (await fetch('/penguin/sprites.json')).json()).sheets;
      return true;
    } catch { return false; }
  }
  async function loadClay() {
    if (reduced() || failed) return;
    if (!await loadMeta()) { failed = true; if (!entranceDone) goStatic(); return; }
    const first = await Promise.all([load('rise'), load('idle')]);
    if (!first.every(Boolean)) { failed = true; if (!entranceDone) goStatic(); return; }
    void Promise.all([load('turn'), load('wave')]);
  }
  async function loadWire() {
    if (!near) return; // nothing is fetched before the band is close
    await Promise.all([load('still'), load('still', true)]);
    if (reduced()) return;
    if (!await loadMeta()) return;
    await Promise.all([load('rise', true), load('idle', true)]);
    void Promise.all([load('turn', true), load('wave', true)]);
  }

  // ---------- the loop ----------
  function wake() {
    if (raf || !running() || signal.aborted || state === 'static') return; // a static pose never needs a loop
    before = performance.now();
    raf = requestAnimationFrame(dioramaFrame);
  }
  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function dioramaFrame(now: number) {
    raf = 0;
    const dt = clamp((now - before) / 1000, 0, 0.05);
    before = now;
    const busy = advance(now, dt);
    if (dirty || prev) render(now);
    if (busy && running() && !raf) raf = requestAnimationFrame(dioramaFrame);
  }
  function startClip(name: Name, { from = 0, to = sheet(name).frames - 1, loop = !!sheet(name).loop, done }: { from?: number; to?: number; loop?: boolean; done?: () => void } = {}) {
    clip = { sheet: name, from, to, fps: sheet(name).fps || 24, loop, done, t0: performance.now(), elapsed: 0 };
    setPose({ sheet: name, frame: from }, clip.t0);
    wake();
  }
  // Returns whether anything is still moving.
  function advance(now: number, dt: number) {
    let busy = false;
    if (state === 'slide' && slide) {
      busy = true;
      if (Number(slide.currentTime) >= RISE_AT) beginRise();
    }
    if (clip) {
      const length = clip.to - clip.from + 1;
      const n = Math.max(0, Math.floor((now - clip.t0) * clip.fps / 1000));
      if (!clip.loop && n >= length) {
        const { done } = clip;
        clip = null;
        done?.();
      } else {
        setPose({ sheet: clip.sheet, frame: clip.from + (clip.loop ? n % length : n) }, now);
        busy = true;
      }
    }
    if (state === 'look' || state === 'spin') {
      if (!drag) {
        if (coasting) {
          yaw = mod(yaw + vel * dt);
          vel *= Math.exp(-dt / INERTIA);
          if (Math.abs(vel) < 30) { coasting = false; target = 0; omega = SETTLE_OMEGA; }
          busy = true;
        } else {
          // critically damped spring, solved exactly so any frame time is stable
          const d0 = wrap(yaw - target);
          const k = (vel + omega * d0) * dt;
          const decay = Math.exp(-omega * dt);
          const d = (d0 + k) * decay;
          vel = (vel - omega * k) * decay;
          yaw = mod(target + d);
          if (Math.abs(d) < 0.2 && Math.abs(vel) < 1.5) { yaw = mod(target); vel = 0; arrived(); } else busy = true;
        }
      }
      if (state === 'look' || state === 'spin') setPose({ sheet: 'turn', frame: turnFrame(yaw) }, now);
    }
    return busy || (prev !== null && now - fadeAt < FADE);
  }

  // ---------- behaviour ----------
  function setState(next: State) {
    state = next;
    stage!.dataset.state = next;
    hit.hidden = !['idle', 'look', 'wave', 'spin'].includes(next);
  }
  function toIdle() {
    wantWave = false;
    setState('idle');
    startClip('idle');
  }
  function toWave() {
    if (!ready('wave')) { toIdle(); return; }
    wantWave = false;
    lastWave = performance.now();
    setState('wave');
    log('diorama → wave');
    startClip('wave', { loop: false, done: settled });
  }
  function lookYaw() {
    if (!inside || calm || !ready('turn')) return 0;
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
      clip = null;
      yaw = mod(cur.sheet === 'turn' ? cur.frame * turnStep() : 0);
      vel = 0;
      coasting = false;
      setState('look');
    }
    wake();
  }
  function arrived() {
    if (Math.abs(wrap(target)) > 0.5) return; // holding a turned pose: the loop stops while nothing changes
    if (wantWave) { toWave(); return; }
    toIdle();
  }
  function wave() {
    if (!ready('wave')) return;
    if (state === 'idle') toWave();
    else if (state === 'look') { wantWave = true; steer(0); }
  }

  function beginRise() {
    setState('rise');
    log('diorama → rise');
    startClip('rise', { from: 1, loop: false, done: () => { entranceDone = true; toWave(); } });
  }
  function enter() {
    entering = true;
    const r = stage!.getBoundingClientRect();
    const b = band!.getBoundingClientRect();
    const distance = -(r.right - b.left) - 8; // fully beyond the left edge of the band
    setPose({ sheet: 'rise', frame: 0 });
    render();
    setState('slide');
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
    if (state === 'waiting' && !entering && !entranceDone && active && !reduced() && !document.hidden && ready('rise') && ready('idle')) enter();
  }

  function goStatic() {
    stopLoop();
    clip = null;
    coasting = false;
    prev = null;
    slide?.cancel();
    slide = null;
    entering = false;
    wantWave = false;
    endDrag();
    setState('static');
    setPose({ sheet: 'still', frame: 0 });
    render();
    if (backstage()) void loadWire();
  }
  function leaveStatic() {
    if (failed) return;
    if (entranceDone && ready('idle')) { toIdle(); return; }
    setState('waiting');
    void loadClay();
    if (backstage()) void loadWire();
    tryEnter();
  }

  // ---------- pointer ----------
  function endDrag() {
    if (!drag) return;
    hit.classList.remove('is-dragging');
    if (hit.hasPointerCapture(drag.id)) hit.releasePointerCapture(drag.id);
    drag = null;
  }
  hit.addEventListener('pointerdown', event => {
    if (drag || (event.pointerType === 'mouse' && event.button !== 0) || !['idle', 'look', 'wave', 'spin'].includes(state) || !running()) return;
    hit.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x0: event.clientX, yaw0: state === 'look' || state === 'spin' ? yaw : 0, moved: false, x: event.clientX, t: event.timeStamp, v: 0 };
    hit.classList.add('is-dragging');
  }, { signal });
  hit.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) < 5 || !ready('turn')) return;
      drag.moved = true;
      clip = null;
      coasting = false;
      wantWave = false;
      yaw = drag.yaw0;
      setState('spin');
      log('diorama → spin');
    }
    // 1:1 with the finger: a drag across the stage is one full turn
    const perPixel = 360 / Math.max(1, stage!.clientWidth);
    const next = mod(drag.yaw0 + dx * perPixel);
    const dt = event.timeStamp - drag.t;
    if (dt > 0) drag.v = 0.6 * drag.v + 0.4 * (wrap(next - yaw) / dt * 1000);
    yaw = next;
    drag.x = event.clientX;
    drag.t = event.timeStamp;
    setPose({ sheet: 'turn', frame: turnFrame(yaw) });
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
      if (clip) clip.elapsed = performance.now() - clip.t0;
      stopLoop();
      slide?.pause();
    } else {
      slide?.play();
      if (clip) clip.t0 = performance.now() - clip.elapsed;
      prev = null;
      dirty = true;
      wake();
      tryEnter();
    }
  }
  function setActive(next: boolean) {
    const value = next && !reduced() && !failed;
    if (value === active) return;
    active = value;
    onStage(active);
    tryEnter();
  }
  const intersection = new IntersectionObserver(entries => {
    const entry = entries.at(-1)!;
    onScreen = entry.isIntersecting;
    setActive(entry.isIntersecting && entry.intersectionRatio >= ACTIVE - 0.005);
    sync();
  }, { threshold: [0, 0.2, ACTIVE - 0.005, 0.7, 1] });
  intersection.observe(band);
  const proximity = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    proximity.disconnect();
    near = true;
    void loadClay();
    if (backstage()) void loadWire();
  }, { rootMargin: '800px 0px' });
  proximity.observe(band);
  document.addEventListener('visibilitychange', sync, { signal });
  const resizer = new ResizeObserver(size);
  resizer.observe(stage);
  addEventListener('resize', size, { signal });

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
      if (backstage()) void loadWire();
      dirty = true;
      render();
      tryEnter();
    },
    onMotionChange() {
      if (reduced()) { goStatic(); setActive(false); } else { setActive(onScreen && visibleShare() >= ACTIVE - 0.005); leaveStatic(); }
    },
    destroy() {
      lifetime.abort();
      stopLoop();
      slide?.cancel();
      intersection.disconnect();
      proximity.disconnect();
      resizer.disconnect();
      canvas.remove();
      hit.remove();
      stage.removeAttribute('data-state');
      stage.removeAttribute('data-wire');
      stage.removeAttribute('data-drawn');
      if (active) onStage(false);
    },
  };

  function visibleShare() {
    const r = band!.getBoundingClientRect();
    return r.height ? clamp((Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height, 0, 1) : 0;
  }
}
