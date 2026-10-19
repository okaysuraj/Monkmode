import { releaseCanvas } from './canvas-textures.js';
import { createCardCloth } from './cloth.js';
import { createPostProcessing } from './postprocessing.js';
import { createCamera } from './camera.js';
import { createAtmosphere } from './atmosphere.js';
import { createLandscape } from './landscape.js';
import { createWorld, STAIR_Z0, STAIR_RUN, PODIUM, STEPS, STAIR_W } from './world.js';
import { createMaterials } from './materials.js';
import { damp, smooth, clamp, easeOut, saturate } from './math.js';
import {
  pixelRatioCap,
  viewportWidth,
  viewportHeight,
  useShadows,
  lowQuality,
  reducedMotion,
  select,
  selectAll,
} from './settings.js';
import { createPageEffects } from './page-effects.js';
import { createLifecycle } from './lifecycle.js';
import * as THREE from 'three';
// A single experience owns all of its scene state and releases it on React unmount.
export function boot() {
  const lifecycle = createLifecycle();
  const runtime = {
    lifecycle,
    renderer: null,
    scene: null,
    camera: null,
    maxAniso: 1,
    running: false,
    clock: 0,
    frameNumber: 0,
    uploadedCanvases: new Set(),
    world: {
      uT: {
        value: 0,
      },
    },
    word: {
      glyphs: [],
      group: null,
      ink: null,
      reveal: 0,
    },
    rig: {
      prog: 0,
      smooth: 0,
      mx: 0,
      my: 0,
      tmx: 0,
      tmy: 0,
      intro: 0,
      focus: -1,
      focusAmt: 0,
    },
    post: {
      levels: [],
    },
    cards: [],
  };
  const page = createPageEffects(runtime);
  let materials, world, landscape, atmosphere, cameraController, postProcessing, cloth;
  let canvas, preEl, preFill, prePct;
  let tPrev = 0,
    fadeIn = 0;
  const intro = {
    t0: 0,
  };
  const performanceState = {
    scale: 1,
    acc: 0,
    n: 0,
  };
  const displayTiming = {
    targetFT: 1 / 60,
    measured: false,
  };
  function initGL() {
    runtime.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    runtime.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, pixelRatioCap));
    /* updateStyle stays on: the stylesheet sizes the canvas at 100% of the
       initial containing block, which is the very box that runs wide on a
       phone. Writing the CSS size in pixels pins the element to the layout
       viewport the buffer was built for. */
    runtime.renderer.setSize(viewportWidth(), viewportHeight(), true);
    runtime.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    runtime.renderer.toneMapping = THREE.NoToneMapping;
    runtime.renderer.toneMappingExposure = 1.0;
    runtime.renderer.setClearColor(0x05070a, 1);
    if (useShadows) {
      runtime.renderer.shadowMap.enabled = true;
      runtime.renderer.shadowMap.type = THREE.PCFShadowMap;
    }
    runtime.maxAniso = runtime.renderer.capabilities.getMaxAnisotropy();
    runtime.scene = new THREE.Scene();
    /* Density puts the hall back in the air; the colour is what decides how dark it is back there. At this depth most of the building's pixel is fog rather than its own material — darkening the timber and the tiles moved the hall by 0.18 of a luminance unit, the fog colour moves it properly. */
    runtime.scene.fog = new THREE.FogExp2(0x050a0e, 0.0168);
    runtime.scene.background = new THREE.Color(0x060a0d);
    runtime.camera = new THREE.PerspectiveCamera(36, viewportWidth() / viewportHeight(), 0.35, 220);
    runtime.scene.add(runtime.camera);
  }
  function resize() {
    const w = viewportWidth(),
      h = viewportHeight();
    document.documentElement.style.setProperty('--vw', w + 'px');
    runtime.renderer.setPixelRatio(
      Math.min(devicePixelRatio || 1, pixelRatioCap) * performanceState.scale,
    );
    runtime.renderer.setSize(w, h, true);
    runtime.camera.aspect = w / h;
    runtime.camera.updateProjectionMatrix();
    const pw = runtime.renderer.domElement.width,
      ph = runtime.renderer.domElement.height;
    if (runtime.post.scene) {
      runtime.post.scene.setSize(pw, ph);
      runtime.post.comp.uniforms.uRes.value.set(pw, ph);
      let lw = Math.max(2, pw >> 1),
        lh = Math.max(2, ph >> 1);
      runtime.post.levels.forEach((L) => {
        L.a.setSize(lw, lh);
        L.b.setSize(lw, lh);
        L.w = lw;
        L.h = lh;
        lw = Math.max(2, lw >> 1);
        lh = Math.max(2, lh >> 1);
      });
    }
    /* multisampling is the first thing to go when the budget tightens */
    if (runtime.post.scene) {
      const want = !lowQuality && performanceState.scale > 0.78 ? 2 : 0;
      if (runtime.post.scene.samples !== want) {
        runtime.post.scene.samples = want;
        runtime.post.scene.dispose();
      }
    }
    runtime.cards.forEach((C) => {
      C.dirty = true;
    });
    if (useShadows && runtime.world.key) runtime.world.key.shadow.needsUpdate = true;
    if (runtime.world.embers)
      runtime.world.embers.material.uniforms.uSize.value =
        h * runtime.renderer.getPixelRatio() * 0.5;
    if (atmosphere.wisps.mesh)
      atmosphere.wisps.mesh.material.uniforms.uPx.value = h * runtime.renderer.getPixelRatio();
    landscape.placeMoon();
    cameraController.layoutWord();
    page.measure();
  }
  function updateWorld(dt) {
    runtime.world.uT.value = runtime.clock;

    /* the focused chapter warms the lanterns and swells the disc */
    runtime.rig.focusAmt = damp(runtime.rig.focusAmt, runtime.rig.focus >= 0 ? 1 : 0, 5, dt);
    const pulse = Math.sin(runtime.clock * 1.9) * 0.5 + 0.5;
    const f = runtime.rig.focusAmt;
    if (runtime.world.hallHalo)
      runtime.world.hallHalo.material.opacity =
        0.3 + f * 0.14 + Math.sin(runtime.clock * 0.6) * 0.035;
    if (runtime.world.hallLight)
      runtime.world.hallLight.intensity =
        3.4 * (1 + f * 0.3) * (1 + Math.sin(runtime.clock * 0.43) * 0.045);
    /* the moon only breathes — the haze in front of it is what actually moves */
    if (runtime.world.moonHalo)
      runtime.world.moonHalo.material.opacity =
        0.44 + f * 0.1 + Math.sin(runtime.clock * 0.34) * 0.05;
    if (runtime.world.lanternLights)
      runtime.world.lanternLights.forEach((l, i) => {
        l.intensity =
          2.6 *
          (1 + f * 0.55) *
          (0.86 + 0.22 * Math.sin(runtime.clock * (2.3 + i * 0.7) + i * 2.1) + 0.1 * pulse);
      });
    if (runtime.world.lanternGlows)
      runtime.world.lanternGlows.forEach((g) => {
        g.quaternion.copy(runtime.camera.quaternion);
      });

    /* haze slides across the courtyard */
    if (runtime.world.haze)
      runtime.world.haze.forEach((h) => {
        h.position.x =
          h.userData.x0 + Math.sin(runtime.clock * h.userData.sp + h.userData.ph) * 5.5;
        h.quaternion.copy(runtime.camera.quaternion);
      });

    /* ripples on the standing water */
    if (runtime.world.ripples)
      runtime.world.ripples.forEach((r) => {
        const u = r.userData;
        u.t += dt * u.sp;
        if (u.t > 4) {
          u.t = 0;
          u.x = (Math.random() - 0.5) * 22;
          u.z = -8 + Math.random() * 22;
        }
        const k = u.t / 4;
        const s = 0.3 + k * 4.2;
        r.scale.set(s, s, 1);
        r.position.set(u.x, 0.02, u.z);
        r.material.opacity = Math.sin(k * Math.PI) * 0.16;
      });

    /* the type rises from behind the grass, then dissolves as you close on it */
    if (runtime.word.group) {
      const near = smooth(0.02, 0.92, runtime.rig.smooth);
      runtime.word.glyphs.forEach((g, i) => {
        const st = clamp((runtime.word.reveal - i * 0.075) / 0.62, 0, 1);
        const e = easeOut(st);
        g.position.y = g.userData.baseY - (1 - e) * (runtime.word.ink.asc * 1.15);
        g.material.opacity = e * (1 - near * 0.96);
        g.visible = g.material.opacity > 0.004;
      });
    }
    /* the cut-out layers dissolve as the camera reaches them, so the path can
       walk straight through the garden instead of steering around the veil */
    if (runtime.world.fg)
      runtime.world.fg.forEach((m) => {
        const a = smooth(0.9, 4.6, runtime.camera.position.z - m.position.z);
        m.material.opacity = a;
        m.visible = a > 0.006;
      });
    atmosphere.updateLeaves(dt);
    atmosphere.updateWisps(dt);
    if (runtime.cards.length)
      runtime.cards.forEach((C) => {
        const u = C.cam.userData;
        u.push = damp(u.push, u.want, 3.4, dt);
      });
  }
  function render() {
    runtime.frameNumber++;
    runtime.renderer.setRenderTarget(runtime.post.scene);
    runtime.renderer.clear(true, true, false);
    runtime.renderer.render(runtime.scene, runtime.camera);
    postProcessing.renderCards(runtime.post.scene);
    runtime.renderer.setRenderTarget(null);
    runtime.post.comp.uniforms.uT.value = runtime.clock;
    runtime.post.comp.uniforms.uFade.value = fadeIn;
    postProcessing.renderPost();
  }
  function measureRefreshRate(now) {
    if (displayTiming.measured) return;
    if (!displayTiming._samples) {
      displayTiming._samples = [];
      displayTiming._prev = now;
      return;
    }
    displayTiming._samples.push(now - displayTiming._prev);
    displayTiming._prev = now;
    if (displayTiming._samples.length >= 30) {
      displayTiming._samples.sort((a, b) => a - b);
      const mid = displayTiming._samples.slice(5, 25);
      const median = mid.reduce((s, v) => s + v, 0) / mid.length;
      displayTiming.targetFT = median / 1000;
      displayTiming.measured = true;
      displayTiming._samples = null;
    }
  }
  function frame(now) {
    if (!runtime.running) return;
    const raw = (now - tPrev) / 1000 || 0;
    const dt = Math.min(raw, 0.05); /* animation never jumps */
    tPrev = now;
    runtime.clock += dt;
    fadeIn = intro.t0 ? saturate((now - intro.t0) / 700) : 1;
    if (runtime.clock > 2.2) {
      if (!displayTiming.measured) measureRefreshRate(now);
      performanceState.acc += raw;
      performanceState.n++; /* governor reads actual frame times */
      if (performanceState.n >= 40 || performanceState.acc > 0.9) {
        const avg = performanceState.acc / performanceState.n;
        performanceState.acc = 0;
        performanceState.n = 0;
        const tgt = displayTiming.targetFT;
        const downThresh = tgt * 1.38;
        const crashThresh = tgt * 3.0;
        const upThresh = tgt * 0.83;
        if (avg > downThresh && performanceState.scale > 0.55) {
          performanceState.scale = Math.max(
            0.55,
            performanceState.scale * (avg > crashThresh ? 0.64 : 0.85),
          );
          resize();
        } else if (avg < upThresh && performanceState.scale < 1) {
          performanceState.scale = Math.min(1, performanceState.scale + 0.08);
          resize();
        }
      }
    }
    runtime.rig.prog = page.progressFor(scrollY);
    runtime.rig.smooth = reducedMotion
      ? runtime.rig.prog
      : damp(runtime.rig.smooth, runtime.rig.prog, 5.2, dt);
    runtime.rig.mx = damp(runtime.rig.mx, runtime.rig.tmx, 2.6, dt);
    runtime.rig.my = damp(runtime.rig.my, runtime.rig.tmy, 2.6, dt);
    if (intro.t0) {
      const el = (now - intro.t0) / 1000;
      runtime.rig.intro = saturate(el / 2.4);
      runtime.word.reveal = Math.min(1.2, el / 1.5);
    }
    cameraController.applyCamera();
    updateWorld(dt);
    render();
    queue();
  }
  function queue() {
    lifecycle.frame(frame);
  }
  const loadingSteps = [
    ['Reading the type', () => document.fonts && document.fonts.load('600 320px Wordmark')],
    [
      'Pouring the ground',
      () => {
        initGL();
        materials = createMaterials(runtime);
        world = createWorld(runtime, materials);
        landscape = createLandscape(runtime, materials);
        atmosphere = createAtmosphere(runtime, materials);
        cameraController = createCamera(runtime, materials);
        postProcessing = createPostProcessing(runtime);
        cloth = createCardCloth(runtime);
        cameraController.buildRig();
        world.buildLights();
      },
    ],
    ['Cutting the approach', () => world.buildShell()],
    ['Raising the hall', () => world.buildTemple()],
    ['Hanging the moon', () => landscape.buildMoon()],
    ['Setting the gate', () => world.buildTorii()],
    [
      'Placing the stones',
      () => {
        landscape.buildRocks();
        world.buildLantern(7.4, -7.0, 1.15);
        world.buildLantern(-7.6, -5.2, 1.0);
        /* The pairs flanking the flight were given flat heights — 2 and PODIUM —
    and the flight does not reach either at those depths, so both pairs hung
    in the air. Solve the step under each one from the same constants the
    treads and cheeks are built from, and they stand on the rail instead of
    beside it. */
        const stepAt = (z) => Math.max(0, (STAIR_Z0 - z) / STAIR_RUN - 0.5);
        const cheekTop = (z) => (stepAt(z) + 1) * (PODIUM / STEPS) + 0.45;
        const cheekX = (z) => (STAIR_W + (STEPS - stepAt(z)) * 0.052) / 2 + 0.45;
        [-14.4, -23.5].forEach((z, i) => {
          const sc = i ? 0.95 : 0.9;
          world.buildLantern(cheekX(z), z, sc, cheekTop(z));
          world.buildLantern(-cheekX(z), z, sc, cheekTop(z));
        });
      },
    ],
    [
      'Growing the maples',
      () => {
        landscape.buildMaple(71, 12.6, -13.0, 1.05);
        landscape.buildMaple(72, -11.8, -9.4, 0.95);
        landscape.buildMaple(73, 9.2, -19.0, 0.82);
        landscape.buildMaple(74, -14.5, -17.5, 1.0);
        landscape.buildMaple(75, 16.5, -6.0, 0.88);
      },
    ],
    ['Painting the near grass', () => landscape.buildForeground()],
    ['Cutting the word', () => cameraController.buildWordmark()],
    [
      'Raising the mist',
      () => {
        atmosphere.buildAtmosphere();
        atmosphere.buildLeafFall();
        atmosphere.buildWisps();
      },
    ],
    [
      'Polishing the water',
      () => {
        postProcessing.initPost();
        postProcessing.buildCards();
        cloth.buildCardCloth();
        runtime.world.fg.forEach((m) => m.layers.set(1));
        runtime.word.glyphs.forEach((m) => m.layers.set(2));
        if (runtime.world.rain) runtime.world.rain.layers.set(1);
        /* the fall is all around the rig, including behind it — mirroring it
    would drop leaves into the water that are nowhere near the water */
        if (runtime.world.leaves) runtime.world.leaves.mesh.layers.set(1);
        runtime.world.ripples.forEach((r) => r.layers.set(1));
        cameraController.layoutWord();
        page.measure();
        /* nothing that casts a shadow ever moves, so bake it once */
        if (useShadows && runtime.world.key) {
          runtime.world.key.shadow.autoUpdate = false;
          runtime.world.key.shadow.needsUpdate = true;
        }
      },
    ],
  ];
  function startLoading() {
    canvas = document.getElementById('gl');
    preEl = select('#pre');
    preFill = select('#pre-fill');
    prePct = select('#pre-pct');
    page.wirePage();
    document.body.classList.add('is-locked');
    let i = 0;
    const step = () => {
      const j = loadingSteps[i];
      const done = () => {
        if (lifecycle.disposed) return;
        i++;
        const p = i / loadingSteps.length;
        preFill.style.right = ((1 - p) * 100).toFixed(1) + '%';
        prePct.textContent = Math.round(p * 100);
        if (i < loadingSteps.length) lifecycle.delay(step, 16);
        else lifecycle.delay(start, 220);
      };
      let r;
      try {
        r = j[1]();
      } catch {
        return fallback();
      }
      if (r && r.then) r.then(done, fallback);
      else done();
    };
    lifecycle.delay(step, 60);
  }
  function fallback() {
    if (lifecycle.disposed) return;
    disposeGraphics(runtime);
    document.documentElement.classList.add('no-webgl');
    document.body.classList.add('no-webgl');
    document.body.classList.remove('is-locked');
    preEl.classList.add('done');
    selectAll('[data-rv], .mask-line').forEach((e) => e.classList.add('rv-in'));
  }
  function start() {
    runtime.uploadedCanvases.forEach(releaseCanvas);
    runtime.uploadedCanvases.clear();
    lifecycle.listen(
      window,
      'resize',
      () => {
        resize();
      },
      {
        passive: true,
      },
    );
    lifecycle.listen(window, 'orientationchange', () => lifecycle.delay(resize, 250));
    lifecycle.listen(document, 'visibilitychange', () => {
      if (document.hidden) {
        runtime.running = false;
      } else if (!runtime.running) {
        runtime.running = true;
        tPrev = performance.now();
        queue();
      }
    });
    resize();
    preEl.classList.add('done');
    lifecycle.delay(
      () => {
        document.body.classList.remove('is-locked');
        select('#hero')
          .querySelectorAll('[data-rv], .mask-line')
          .forEach((element, index) =>
            lifecycle.delay(
              () => element.classList.add('rv-in'),
              reducedMotion ? 0 : 120 + index * 95,
            ),
          );
      },
      reducedMotion ? 0 : 340,
    );
    runtime.running = true;
    tPrev = performance.now();
    intro.t0 = reducedMotion ? performance.now() - 4000 : performance.now();
    queue();
  }
  startLoading();
  return () => {
    runtime.running = false;
    lifecycle.dispose();
    disposeGraphics(runtime);
    document.body.classList.remove('is-locked', 'no-webgl');
    document.documentElement.classList.remove('nav-open', 'no-webgl');
  };
}

// Scene materials may share textures, so dispose each GPU resource once.
function disposeGraphics(runtime) {
  const resources = new Set();
  runtime.scene?.traverse((object) => {
    if (object.geometry) resources.add(object.geometry);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      resources.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
      for (const uniform of Object.values(material.uniforms || {})) {
        if (uniform.value?.isTexture) resources.add(uniform.value);
      }
    }
    if (object.shadow) resources.add(object.shadow);
  });
  const post = runtime.post;
  for (const value of Object.values(post)) if (value?.dispose) resources.add(value);
  for (const level of post.levels) {
    resources.add(level.a);
    resources.add(level.b);
  }
  if (post.quad) resources.add(post.quad.geometry);
  for (const card of runtime.cards) if (card.rt) resources.add(card.rt);
  for (const resource of resources) resource.dispose();
  runtime.uploadedCanvases.forEach(releaseCanvas);
  runtime.uploadedCanvases.clear();
  runtime.renderer?.dispose();
}
