import { clamp, lerp, smooth } from './math.js';
import { viewportWidth, viewportHeight } from './settings.js';
import { createCanvas } from './canvas-textures.js';
import * as THREE from 'three';
// Keeps the chapter camera path and the world-space wordmark aligned with the viewport.

export function createCamera(runtime, materials) {
  const { createTexture } = materials;
  const WORD_Z = 3.0;
  function buildWordmark() {
    /* The word is set to the frame width, so a short word is a *taller* word.
       Four letters at the old tracking put a 400-pixel cap height across the
       scene; the letters are spaced out instead, which keeps the type edge to
       edge while the caps come back down to the height of the headline block. */
    const SZ = 320,
      TRACK = 0.4,
      PAD = 26;
    const m = createCanvas(4, 4).getContext('2d');
    m.font = '600 ' + SZ + 'px Wordmark, sans-serif';
    m.textBaseline = 'alphabetic';
    m.textAlign = 'left';
    const word = 'KAGE',
      gl = [];
    let pen = 0,
      ascMax = 0,
      descMax = 0,
      xMin = 1e9,
      xMax = -1e9;
    for (const ch of word) {
      const t = m.measureText(ch);
      const g = {
        ch: ch,
        adv: t.width,
        asc: t.actualBoundingBoxAscent,
        desc: t.actualBoundingBoxDescent,
        l: t.actualBoundingBoxLeft,
        r: t.actualBoundingBoxRight,
        pen: pen,
      };
      gl.push(g);
      ascMax = Math.max(ascMax, g.asc);
      descMax = Math.max(descMax, g.desc);
      xMin = Math.min(xMin, pen - g.l);
      xMax = Math.max(xMax, pen + g.r);
      pen += t.width + TRACK * SZ;
    }
    const group = new THREE.Group();
    runtime.word.glyphs = [];
    gl.forEach((g) => {
      const cw = Math.ceil(g.l + g.r) + PAD * 2,
        chh = Math.ceil(g.asc + g.desc) + PAD * 2;
      const c = createCanvas(cw, chh),
        x = c.getContext('2d');
      x.font = '600 ' + SZ + 'px Wordmark, sans-serif';
      x.textBaseline = 'alphabetic';
      x.textAlign = 'left';
      /* the vertical wash is baked per glyph so the whole word shares one ramp */
      const gy0 = PAD + g.asc - ascMax,
        gy1 = PAD + g.asc + descMax * 0.4;
      const grad = x.createLinearGradient(0, gy0, 0, gy1);
      grad.addColorStop(0, 'rgb(226,236,229)');
      grad.addColorStop(0.52, 'rgb(198,214,203)');
      grad.addColorStop(1, 'rgb(150,170,157)');
      x.fillStyle = grad;
      x.fillText(g.ch, PAD + g.l, PAD + g.asc);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(cw, chh),
        new THREE.MeshBasicMaterial({
          map: createTexture(c, {
            aniso: 16,
          }),
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          fog: true,
          opacity: 1,
        }),
      );
      mesh.position.set(g.pen + (g.r - g.l) / 2, (g.asc - g.desc) / 2 + (PAD - PAD), 0);
      mesh.position.y = (g.asc - g.desc) / 2;
      mesh.renderOrder = 12;
      mesh.frustumCulled = false;
      mesh.userData.baseY = mesh.position.y;
      group.add(mesh);
      runtime.word.glyphs.push(mesh);
    });
    group.position.z = WORD_Z;
    runtime.scene.add(group);
    runtime.word.group = group;
    runtime.word.ink = {
      xMin: xMin,
      xMax: xMax,
      cx: (xMin + xMax) / 2,
      w: xMax - xMin,
      asc: ascMax,
    };
  }
  const cameraStops = [
    {
      p: [0.0, 4.05, 13.6],
      t: [0.0, 6.6, -18.0],
      fov: 36,
    } /* 0 hero        */,
    {
      p: [-5.6, 2.35, 11.6],
      t: [1.2, 5.6, -14.0],
      fov: 48,
    } /* 1 the sanmon  */,
    {
      p: [1.2, 3.6, 2.2],
      t: [-0.6, 7.5, -22.0],
      fov: 40,
    } /* 2 gardens     */,
    {
      p: [5.2, 2.1, -3.4],
      t: [-2.6, 7.0, -20.0],
      fov: 46,
    } /* 3 craft       */,
    {
      p: [0.0, 7.6, -16.0],
      t: [0.0, 13.0, -40.0],
      fov: 42,
    } /* 4 afterlight  */,
    {
      p: [0.0, 10.5, -20.0],
      t: [0.0, 3.0, -34.0],
      fov: 46,
    } /* 5 footer      */,
  ];
  const RIG = {
    prog: 0,
    smooth: 0,
    mx: 0,
    my: 0,
    tmx: 0,
    tmy: 0,
    intro: 0,
    focus: -1,
    focusAmt: 0,
  };
  let curveP, curveT, tmpCam;
  function buildRig() {
    curveP = new THREE.CatmullRomCurve3(
      cameraStops.map((c) => new THREE.Vector3(c.p[0], c.p[1], c.p[2])),
      false,
      'catmullrom',
      0.42,
    );
    curveT = new THREE.CatmullRomCurve3(
      cameraStops.map((c) => new THREE.Vector3(c.t[0], c.t[1], c.t[2])),
      false,
      'catmullrom',
      0.42,
    );
    tmpCam = new THREE.PerspectiveCamera(
      cameraStops[0].fov,
      viewportWidth() / viewportHeight(),
      0.35,
      220,
    );
    runtime.camera.layers.enable(1);
    runtime.camera.layers.enable(2);
  }
  const _p = new THREE.Vector3(),
    _t = new THREE.Vector3(),
    _d = new THREE.Vector3();
  /* Every waypoint is composed for a wide frame. On a tall one the same
     numbers crop the gate in half, so the rig steps back along its own view
     axis and opens up a little instead of letting the sides fall away. */
  function aspectFix() {
    return clamp((1.62 - viewportWidth() / viewportHeight()) / 1.05, 0, 1);
  }
  function fitAspect(p, t, fov) {
    const nf = aspectFix();
    if (nf <= 0) return fov;
    _d.subVectors(p, t).normalize();
    p.addScaledVector(_d, nf * 8.2);
    p.y += nf * 1.1;
    return fov * (1 + nf * 0.4);
  }
  function applyCamera() {
    const N = cameraStops.length - 1;
    const u = clamp(RIG.smooth / N, 0, 1);
    curveP.getPoint(u, _p);
    curveT.getPoint(u, _t);
    const i = clamp(Math.floor(RIG.smooth), 0, N - 1),
      f = clamp(RIG.smooth - i, 0, 1);
    let fov = lerp(cameraStops[i].fov, cameraStops[i + 1].fov, f);
    fov = fitAspect(_p, _t, fov);

    /* the opening dolly: a long lens easing in from further back */
    const io = 1 - RIG.intro;
    _p.z += io * 5.6;
    _p.y += io * 0.65;
    fov += io * 8;

    /* parallax — a hand-held drift, never enough to break the frame */
    const par = 1 - smooth(0, 1.6, RIG.smooth) * 0.55;
    _p.x += RIG.mx * 0.62 * par;
    _p.y += RIG.my * 0.34 * par;
    _t.x -= RIG.mx * 0.2 * par;
    _t.y -= RIG.my * 0.12 * par;
    runtime.camera.position.copy(_p);
    runtime.camera.lookAt(_t);
    if (Math.abs(runtime.camera.fov - fov) > 1e-4) {
      runtime.camera.fov = fov;
      runtime.camera.updateProjectionMatrix();
    }
  }
  function layoutWord() {
    if (!runtime.word.group) return;
    const c = cameraStops[0];
    const hp = new THREE.Vector3(c.p[0], c.p[1], c.p[2]);
    const ht = new THREE.Vector3(c.t[0], c.t[1], c.t[2]);
    tmpCam.fov = fitAspect(hp, ht, c.fov);
    tmpCam.aspect = viewportWidth() / viewportHeight();
    tmpCam.position.copy(hp);
    tmpCam.lookAt(ht);
    tmpCam.updateProjectionMatrix();
    tmpCam.updateMatrixWorld(true);
    const hit = (nx, ny) => {
      const v = new THREE.Vector3(nx, ny, 0.5).unproject(tmpCam).sub(tmpCam.position).normalize();
      return tmpCam.position.clone().addScaledVector(v, (WORD_Z - tmpCam.position.z) / v.z);
    };
    const L = hit(-1, 0),
      R = hit(1, 0);
    /* Judge the frame by its shape, not its width. What forces the word up and
       in is a *tall* frame, and a 768-wide tablet held upright is as tall as a
       phone — on a width test it took the desktop baseline and sat below the
       fold with only the top of the G showing. */
    const narrow = viewportWidth() / viewportHeight() < 1.05;
    /* Four wide-tracked letters reach the frame edge exactly; pushing past it,
       as the six-letter word could afford to, decapitates the K and the E. The
       narrow branch is held a little inside the edge because a phone frame has
       no gutter to lose the tracking that trails the final letter into. */
    const fill = narrow ? 0.96 : 1.0;
    const s = ((R.x - L.x) * fill) / runtime.word.ink.w;
    /* on a tall frame the mounds sit near mid-height, so the baseline has to
       ride above them or the whole word disappears into the grass */
    const base = hit(0, narrow ? -0.16 : -0.585);
    runtime.word.group.scale.setScalar(s);
    runtime.word.group.position.set(-runtime.word.ink.cx * s, base.y, WORD_Z);
    runtime.word.rise = runtime.word.ink.asc * s * 1.25;
  }
  return {
    buildRig,
    applyCamera,
    buildWordmark,
    layoutWord,
  };
}
