// The real-time half of the closing diorama: the clay penguin as a glTF model drawn with three.js on one WebGL
// canvas. src/diorama.ts loads this module (and with it three.js) on demand, once the band is near, and owns all
// the behaviour; this file only knows how to put a pose on the canvas. Nothing here reads the DOM besides the
// canvas it is given, and nothing runs on its own: the caller steps the clips and asks for a draw.
//
// Front mode draws the clay rig. Backstage draws the same rig as a solid ground-coloured silhouette (so nothing
// shows through the body) and, over it, the wireframe rig in amber lines. Both rigs sit under one yaw group,
// share one AnimationMixer and play the same clips, so a turn or a clip change never fights the animation.
import {
  type AnimationAction, AnimationMixer, CanvasTexture, Color, DirectionalLight, Group, HemisphereLight,
  LineBasicMaterial, type LineSegments, LoopOnce, LoopRepeat, MathUtils, Mesh, MeshBasicMaterial, MeshPhysicalMaterial,
  NoToneMapping, type Object3D, PerspectiveCamera, PlaneGeometry, RepeatWrapping, Scene, SRGBColorSpace,
  type InterleavedBufferAttribute, type Texture, TextureLoader, Vector3, WebGLRenderer,
} from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

export type ClipName = 'idle' | 'wave' | 'rise';
export type PlayOptions = { loop: boolean; paused?: boolean };
export type Scene3D = {
  readonly wired: boolean;
  loadWire(url: string): Promise<void>;
  resize(side: number, ratio: number): void;
  mode(backstage: boolean, ground: string): void;
  play(name: ClipName, options: PlayOptions): void;
  freeze(): void;
  resume(): void;
  step(dt: number): void;
  draw(yaw: number): void;
  pose(): { name: ClipName | null; frame: number };
  eyesOpen(): boolean;
  takeFinished(): boolean;
  onLost(handler: () => void, restored: () => void): void;
  dispose(): void;
};

const FADE = 0.12; // s: clips cross-fade, so nothing ever pops
const FPS = 24; // the clips are keyed at 24 fps
const AMBER = 0xffb03b;
const WIRE_PX = 1.5; // line weight, in pixels of a 400px frame; scaled with the canvas
const rad = MathUtils.degToRad;

// A rig is one loaded glTF scene and its actions, one per clip, on the shared mixer.
type Rig = { root: Object3D; actions: Partial<Record<ClipName, AnimationAction>> };
// A wire mesh drawn as fat lines. The glTF line keeps animating (it carries the node transforms and the morph
// weights); the fat copy hangs under it and, for the few meshes with a morph target, is re-morphed on the CPU.
type Fat = { source: LineSegments; geometry: LineSegmentsGeometry; base: Float32Array; deltas: Float32Array[]; weights: number[] };

const NAVY_FALLBACK = new Color('#17253e');

function blobTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.72)');
  grad.addColorStop(0.3, 'rgba(0,0,0,0.46)');
  grad.addColorStop(0.65, 'rgba(0,0,0,0.13)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// three.js reports a missing WebGL on the console before it throws; ask a throwaway canvas first, so a browser without it
// falls back to the still quietly.
function hasWebGL() {
  const probe = document.createElement('canvas').getContext('webgl2'); // three.js needs WebGL 2
  probe?.getExtension('WEBGL_lose_context')?.loseContext();
  return probe !== null;
}

export async function createScene(canvas: HTMLCanvasElement, urls: { clay: string; grain: string }): Promise<Scene3D> {
  if (!hasWebGL()) throw new Error('no WebGL');
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  const lost: { handler?: () => void; restored?: () => void } = {};
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost.handler?.(); });
  canvas.addEventListener('webglcontextrestored', () => lost.restored?.());

  // Camera: the same framing as the still: world x in [-1.5, 1.5] at the target, the ground line 8.33% above the
  // bottom of the square, the character 73% of its height.
  const position = new Vector3(0, 1.45, 9);
  const target = new Vector3(0, 1.25, 0);
  const camera = new PerspectiveCamera(MathUtils.radToDeg(2 * Math.atan(1.5 / position.distanceTo(target))), 1, 6, 13);
  camera.position.copy(position);
  camera.lookAt(target);

  const scene = new Scene();
  const yaw = new Group(); // the user's turn about the vertical axis; animation never touches it
  scene.add(yaw);

  // Light: a soft key from the top left, the footer's own light, a hemisphere fill and a faint cool rim.
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(-4.5, 6.5, 5.5);
  key.target.position.set(0, 1, 0);
  scene.add(key, key.target);
  const hemi = new HemisphereLight(0xffffff, 0xd4d9e0, 2.3);
  scene.add(hemi);
  const rim = new DirectionalLight(0xdde6ff, 0.35);
  rim.position.set(5, 3, -4);
  scene.add(rim);

  // The contact shadow: a soft blob on the ground, a little to the right of the feet like the key light says.
  const blob = new Mesh(
    new PlaneGeometry(2.3, 1.4),
    new MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, opacity: 1 }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.set(0.16, 0.003, 0.02);
  blob.renderOrder = -1;
  scene.add(blob);

  // ---------- the clay rig ----------
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  let clayGltf: GLTF;
  let grain: Texture;
  try {
    [clayGltf, grain] = await Promise.all([loader.loadAsync(urls.clay), new TextureLoader().loadAsync(urls.grain)]);
  } catch (error) {
    lost.handler = lost.restored = undefined;
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }
  grain.wrapS = grain.wrapT = RepeatWrapping;
  grain.repeat.set(6, 6);
  const mixer = new AnimationMixer(clayGltf.scene);
  const rigOf = (gltf: GLTF): Rig => {
    const actions: Rig['actions'] = {};
    for (const clip of gltf.animations) actions[clip.name as ClipName] = mixer.clipAction(clip, gltf.scene);
    return { root: gltf.scene, actions };
  };
  const clay = rigOf(clayGltf);
  let wire: Rig | null = null;
  const rigs: Rig[] = [clay];
  yaw.add(clay.root);

  // matte clay: rough, a little sheen, a grain bump on the one mesh that has UVs
  const clayMeshes: Mesh[] = [];
  const matte = new Map<Mesh, MeshPhysicalMaterial>();
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  clay.root.traverse(object => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    const old = mesh.material as MeshPhysicalMaterial;
    const material = new MeshPhysicalMaterial({
      color: old.map ? 0xffffff : (old.color ?? NAVY_FALLBACK), map: old.map ?? null,
      roughness: 0.9, metalness: 0, sheen: 0.12, sheenRoughness: 0.6, sheenColor: new Color(0xffffff), specularIntensity: 0.08,
    });
    if (old.map) { old.map.anisotropy = anisotropy; material.bumpMap = grain; material.bumpScale = 0.12; }
    old.dispose();
    mesh.material = material;
    mesh.frustumCulled = false;
    matte.set(mesh, material);
    clayMeshes.push(mesh);
  });
  const fill = new MeshBasicMaterial({ color: 0xffffff, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 8000 });

  // ---------- the wire rig, on demand ----------
  const fats: Fat[] = [];
  const lineMaterial = new LineMaterial({ color: AMBER, linewidth: WIRE_PX, worldUnits: false });
  const hidden = new LineBasicMaterial({ visible: false });
  let backstage = false;

  function fatten(line: LineSegments) {
    const source = line.geometry;
    const pos = source.attributes.position;
    const index = source.index;
    const count = index ? index.count : pos.count;
    const expand = (attribute: { getX(i: number): number; getY(i: number): number; getZ(i: number): number }) => {
      const out = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const v = index ? index.getX(i) : i;
        out[i * 3] = attribute.getX(v);
        out[i * 3 + 1] = attribute.getY(v);
        out[i * 3 + 2] = attribute.getZ(v);
      }
      return out;
    };
    const base = expand(pos);
    const geometry = new LineSegmentsGeometry();
    geometry.setPositions(base.slice());
    const targets = source.morphAttributes.position ?? [];
    const fat = new LineSegments2(geometry, lineMaterial);
    fat.frustumCulled = false;
    line.add(fat);
    line.material = hidden;
    if (targets.length) fats.push({ source: line, geometry, base, deltas: targets.map(expand), weights: targets.map(() => NaN) });
  }
  // glTF morph targets are relative: position = base + sum(weight * delta), recomputed only when a weight moved
  function morph() {
    for (const fat of fats) {
      const influences = fat.source.morphTargetInfluences ?? [];
      if (fat.weights.every((w, i) => w === (influences[i] ?? 0))) continue;
      const data = (fat.geometry.attributes.instanceStart as unknown as InterleavedBufferAttribute).data;
      const out = data.array as Float32Array;
      out.set(fat.base);
      fat.deltas.forEach((delta, t) => {
        const weight = influences[t] ?? 0;
        fat.weights[t] = weight;
        if (!weight) return;
        for (let i = 0; i < out.length; i++) out[i] += delta[i] * weight;
      });
      data.needsUpdate = true;
    }
  }

  // fat lines are measured in CSS pixels against the CSS size of the canvas; the weight follows the canvas, one
  // 400px frame having had lines of WIRE_PX, and never goes under one device pixel
  let box = 400;
  let dpr = 1;
  function lines() {
    lineMaterial.resolution.set(box, box);
    lineMaterial.linewidth = Math.max(1 / dpr, WIRE_PX * box / 400);
  }

  function look() {
    const front = !backstage;
    for (const mesh of clayMeshes) mesh.material = front ? matte.get(mesh)! : fill;
    blob.visible = front;
    if (wire) wire.root.visible = !front;
  }

  // A rig that arrives late takes up the clip that is playing, at the same moment of it (a cross-fade in flight
  // is not copied: the new rig simply plays the clip it is fading into).
  function sync(from: Rig, to: Rig) {
    const a = current ? from.actions[current] : undefined;
    const w = current ? to.actions[current] : undefined;
    if (!a || !w) return;
    w.reset().setLoop(a.loop, a.repetitions);
    w.clampWhenFinished = a.clampWhenFinished;
    w.play();
    w.time = a.time;
    w.paused = a.paused;
  }

  const eye = clay.root.getObjectByName('eye_L');
  const eyeRest = eye?.scale.y ?? 1;
  let current: ClipName | null = null;
  let finished = false;
  mixer.addEventListener('finished', event => { if (event.action === clay.actions[current as ClipName]) finished = true; });

  look();
  const api: Scene3D = {
    get wired() { return wire !== null; },
    async loadWire(url) {
      if (wire) return;
      const gltf = await loader.loadAsync(url);
      if (wire) return;
      const rig = rigOf(gltf);
      gltf.scene.traverse(object => {
        const line = object as LineSegments;
        if (line.isLineSegments) { line.frustumCulled = false; fatten(line); }
      });
      lines();
      wire = rig;
      rigs.push(rig);
      yaw.add(rig.root);
      sync(clay, rig);
      mixer.update(0);
      morph();
      look();
    },
    resize(sideCss, ratio) {
      renderer.setPixelRatio(ratio);
      renderer.setSize(sideCss, sideCss, false);
      box = sideCss;
      dpr = ratio;
      lines();
    },
    mode(isBackstage, ground) {
      backstage = isBackstage;
      fill.color.set(ground);
      look();
    },
    play(name, { loop, paused = false }) {
      const previous = current;
      for (const rig of rigs) {
        const next = rig.actions[name];
        if (!next) continue;
        const before = previous && previous !== name ? rig.actions[previous] : undefined;
        for (const action of Object.values(rig.actions)) if (action !== next && action !== before) action.stop();
        next.reset().setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1);
        next.clampWhenFinished = !loop;
        next.play();
        next.paused = paused;
        if (before) { before.paused = false; before.crossFadeTo(next, FADE, false); }
      }
      current = name;
      finished = false;
      if (paused) { mixer.update(0); morph(); }
    },
    freeze() { for (const rig of rigs) if (current) rig.actions[current]!.paused = true; },
    resume() { for (const rig of rigs) if (current) rig.actions[current]!.paused = false; },
    step(dt) {
      mixer.update(dt);
      morph();
    },
    draw(angle) {
      yaw.rotation.y = rad(angle);
      renderer.render(scene, camera);
    },
    pose() {
      const action = current ? clay.actions[current] : null;
      return { name: current, frame: action ? Math.floor(action.time * FPS + 1e-4) : 0 };
    },
    eyesOpen() { return !eye || eye.scale.y >= eyeRest * 0.9; },
    takeFinished() {
      const done = finished;
      finished = false;
      return done;
    },
    onLost(handler, restored) { lost.handler = handler; lost.restored = restored; },
    dispose() {
      lost.handler = lost.restored = undefined;
      mixer.stopAllAction();
      scene.traverse(object => {
        const mesh = object as Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as { dispose?: () => void } | undefined;
        material?.dispose?.();
      });
      for (const material of matte.values()) material.dispose();
      fill.dispose();
      lineMaterial.dispose();
      grain.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
  return api;
}
