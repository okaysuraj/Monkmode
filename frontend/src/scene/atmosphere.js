import { createCanvas } from './canvas-textures.js';
import { lowQuality, viewportHeight, coarsePointer } from './settings.js';
import { mulberry32, TAU, damp, smooth } from './math.js';
import { texGlow, texLeaf, texWisp } from './nature-textures.js';
import * as THREE from 'three';
// Builds and updates haze, rain, falling leaves, and pointer particles.

export function createAtmosphere(runtime, materials) {
  const { createTexture } = materials;
  function buildAtmosphere() {
    /* drifting haze slabs */
    const hazeTex = createTexture(texGlow('rgba(160,205,210,.55)', 'rgba(110,165,175,.18)'));
    runtime.world.haze = [];
    const rnd = mulberry32(66);
    for (let i = 0; i < (lowQuality ? 4 : 6); i++) {
      const s = 12 + rnd() * 15;
      const h = new THREE.Mesh(
        new THREE.PlaneGeometry(s, s * 0.55),
        new THREE.MeshBasicMaterial({
          map: hazeTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: false,
          opacity: 0.05 + rnd() * 0.07,
        }),
      );
      h.position.set((rnd() - 0.5) * 44, 1.5 + rnd() * 10, -38 + rnd() * 40);
      h.renderOrder = 4;
      h.userData = {
        sp: 0.06 + rnd() * 0.12,
        ph: rnd() * TAU,
        x0: h.position.x,
      };
      runtime.scene.add(h);
      runtime.world.haze.push(h);
    }

    /* embers around the lantern and the disc */
    const N = lowQuality ? 220 : 460;
    const pos = new Float32Array(N * 3),
      seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (rnd() - 0.5) * 30;
      pos[i * 3 + 1] = rnd() * 11;
      pos[i * 3 + 2] = -26 + rnd() * 36;
      seed[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const emb = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        uniforms: {
          uT: runtime.world.uT,
          uTex: {
            value: createTexture(texGlow('rgba(255,190,140,1)', 'rgba(255,120,60,.35)')),
          },
          uSize: {
            value: viewportHeight() * 0.5,
          },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader:
          'attribute float aSeed; uniform float uT; uniform float uSize; varying float vA;\n' +
          'void main(){ vec3 p=position;\n' +
          ' p.y = mod(p.y + uT*(0.14+aSeed*0.28), 11.5);\n' +
          ' p.x += sin(uT*0.36 + aSeed*22.0)*0.85;\n' +
          ' p.z += cos(uT*0.29 + aSeed*17.0)*0.7;\n' +
          ' vec4 mv = modelViewMatrix * vec4(p,1.0);\n' +
          ' vA = (0.25+aSeed*0.75) * smoothstep(11.5,7.0,p.y) * smoothstep(0.0,1.4,p.y);\n' +
          ' gl_PointSize = uSize*(0.010+aSeed*0.020)/max(-mv.z,0.6);\n' +
          ' gl_Position = projectionMatrix * mv; }',
        fragmentShader:
          'uniform sampler2D uTex; varying float vA;\n' +
          'void main(){ vec4 t=texture2D(uTex, gl_PointCoord);\n' +
          ' gl_FragColor = vec4(t.rgb*vec3(1.6,0.78,0.42), t.a*vA*0.75); }',
      }),
    );
    emb.frustumCulled = false;
    emb.renderOrder = 5;
    runtime.scene.add(emb);
    runtime.world.embers = emb;

    /* rain in the slot of open sky */
    if (!lowQuality) {
      const D = 900,
        rp = new Float32Array(D * 2 * 3),
        rt = new Float32Array(D * 2),
        rs = new Float32Array(D * 2),
        rl = new Float32Array(D * 2);
      for (let i = 0; i < D; i++) {
        const x = (rnd() - 0.5) * 40,
          z = -30 + rnd() * 34,
          y = rnd() * 17,
          sp = 7 + rnd() * 9,
          ln = 0.3 + rnd() * 0.55;
        for (let k = 0; k < 2; k++) {
          const o = (i * 2 + k) * 3;
          rp[o] = x;
          rp[o + 1] = y;
          rp[o + 2] = z;
          rt[i * 2 + k] = k;
          rs[i * 2 + k] = sp;
          rl[i * 2 + k] = ln;
        }
      }
      const rg = new THREE.BufferGeometry();
      rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
      rg.setAttribute('aTop', new THREE.BufferAttribute(rt, 1));
      rg.setAttribute('aSpeed', new THREE.BufferAttribute(rs, 1));
      rg.setAttribute('aLen', new THREE.BufferAttribute(rl, 1));
      const rain = new THREE.LineSegments(
        rg,
        new THREE.ShaderMaterial({
          uniforms: {
            uT: runtime.world.uT,
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexShader:
            'attribute float aTop; attribute float aSpeed; attribute float aLen; uniform float uT; varying float vA;\n' +
            'void main(){ vec3 p=position;\n' +
            ' float y = mod(p.y - uT*aSpeed, 17.0);\n' +
            ' p.y = y + aTop*aLen;\n' +
            ' vA = smoothstep(0.0,3.0,y)*smoothstep(17.0,11.0,y);\n' +
            ' gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }',
          fragmentShader:
            'varying float vA;\nvoid main(){ gl_FragColor = vec4(0.55,0.74,0.82, vA*0.024); }',
        }),
      );
      rain.frustumCulled = false;
      rain.renderOrder = 6;
      runtime.scene.add(rain);
      runtime.world.rain = rain;
    }

    /* ripples on the standing water */
    const ringC = createCanvas(256, 256),
      rx2 = ringC.getContext('2d');
    const rg2 = rx2.createRadialGradient(128, 128, 84, 128, 128, 128);
    rg2.addColorStop(0, 'rgba(255,255,255,0)');
    rg2.addColorStop(0.62, 'rgba(255,255,255,.55)');
    rg2.addColorStop(0.86, 'rgba(255,255,255,.22)');
    rg2.addColorStop(1, 'rgba(255,255,255,0)');
    rx2.fillStyle = rg2;
    rx2.fillRect(0, 0, 256, 256);
    const ringTex = createTexture(ringC);
    runtime.world.ripples = [];
    for (let i = 0; i < (lowQuality ? 6 : 13); i++) {
      const r = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          map: ringTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: true,
          opacity: 0,
        }),
      );
      r.rotation.x = -Math.PI / 2;
      r.renderOrder = 7;
      r.userData = {
        t: rnd() * 4,
        x: (rnd() - 0.5) * 22,
        z: -8 + rnd() * 22,
        sp: 0.5 + rnd() * 0.5,
      };
      runtime.scene.add(r);
      runtime.world.ripples.push(r);
    }
  }

  /* LEAF_AHEAD/LEAF_SPREAD is the disc leaves are recycled into, hung down the
     camera's own sight line; LEAF_R is only the far backstop for a rig that has
     walked out from under its weather. */
  const LEAF_AHEAD = 11,
    LEAF_SPREAD = 12,
    LEAF_R = 30;
  function buildLeafFall() {
    const N = lowQuality ? 110 : 260;
    const mat = new THREE.MeshStandardMaterial({
      map: createTexture(texLeaf()),
      alphaTest: 0.42,
      side: THREE.DoubleSide,
      color: 0x40080a,
      roughness: 0.84,
      metalness: 0,
      /* green and blue driven to nothing: the composite tone-maps at the end,
         and an emissive red with any green in it comes back out of that pink */
      emissive: 0x780200,
      emissiveIntensity: 0.72,
    });
    const inst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.4, 0.4), mat, N);
    inst.frustumCulled = false;
    inst.renderOrder = 5;
    inst.castShadow = inst.receiveShadow = false;
    const rnd = mulberry32(404),
      list = [];
    for (let i = 0; i < N; i++)
      list.push({
        x: (rnd() - 0.5) * 2 * LEAF_R,
        z: (rnd() - 0.5) * 2 * LEAF_R,
        y: rnd() * 26,
        fall: 0.5 + rnd() * 0.9,
        sway: 0.45 + rnd() * 1.5,
        swayPh: rnd() * TAU,
        swayAmp: 0.3 + rnd() * 0.95,
        spin: (rnd() - 0.5) * 2.6,
        roll: rnd() * TAU,
        rollSp: 0.5 + rnd() * 2.0,
        tilt: rnd() * TAU,
        s: 0.55 + rnd() * 0.9,
      });
    runtime.scene.add(inst);
    runtime.world.leaves = {
      mesh: inst,
      list: list,
    };
  }
  const LEAF_M = new THREE.Matrix4(),
    LEAF_Q = new THREE.Quaternion();
  const LEAF_E = new THREE.Euler(),
    LEAF_P = new THREE.Vector3(),
    LEAF_S = new THREE.Vector3();
  const LEAF_F = new THREE.Vector3();
  function updateLeaves(dt) {
    const LV = runtime.world.leaves;
    if (!LV) return;
    const cy = runtime.camera.position.y,
      L = LV.list;
    /* Respawn ahead of the rig, not around it. A band centred on the camera spends nearly all of itself behind and beside the frustum — of a couple of hundred leaves only a dozen were ever on screen. Recycling them into the cone the camera is actually looking down puts the same count in frame several times over, and costs nothing. */
    runtime.camera.getWorldDirection(LEAF_F);
    LEAF_F.y = 0;
    if (LEAF_F.lengthSq() < 1e-6) LEAF_F.set(0, 0, -1);
    else LEAF_F.normalize();
    const fx = runtime.camera.position.x + LEAF_F.x * LEAF_AHEAD;
    const fz = runtime.camera.position.z + LEAF_F.z * LEAF_AHEAD;
    const seed = !LV.seeded;
    LV.seeded = true;
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      l.y -= l.fall * dt;
      l.roll += l.rollSp * dt;
      l.tilt += l.spin * dt;
      if (seed || l.y < cy - 10) {
        /* back to the top of the band */
        l.y = seed ? cy - 10 + Math.random() * 26 : cy + 16;
        const a = Math.random() * TAU,
          r = Math.sqrt(Math.random()) * LEAF_SPREAD;
        l.x = fx + Math.cos(a) * r;
        l.z = fz + Math.sin(a) * r;
      }
      /* the far wrap is a backstop for a rig that has walked away from its own
         leaves — it sits well outside the fog, so nothing is seen to jump */
      const cx = runtime.camera.position.x,
        cz = runtime.camera.position.z;
      if (l.x - cx > LEAF_R) l.x -= 2 * LEAF_R;
      else if (l.x - cx < -LEAF_R) l.x += 2 * LEAF_R;
      if (l.z - cz > LEAF_R) l.z -= 2 * LEAF_R;
      else if (l.z - cz < -LEAF_R) l.z += 2 * LEAF_R;
      /* the side-slip of a leaf shedding air off one edge, then the other */
      const sw = Math.sin(runtime.clock * l.sway + l.swayPh);
      LEAF_P.set(
        l.x + sw * l.swayAmp,
        l.y,
        l.z + Math.cos(runtime.clock * l.sway * 0.7 + l.swayPh) * l.swayAmp * 0.6,
      );
      LEAF_E.set(l.roll, l.tilt, sw * 0.55);
      LEAF_Q.setFromEuler(LEAF_E);
      LEAF_S.setScalar(l.s);
      LEAF_M.compose(LEAF_P, LEAF_Q, LEAF_S);
      LV.mesh.setMatrixAt(i, LEAF_M);
    }
    LV.mesh.instanceMatrix.needsUpdate = true;
  }
  const WISP_D = 3.4;
  const wisps = {
    list: [],
    i: 0,
    acc: 0,
    ex: 0,
    ey: 0,
    lx: 0,
    ly: 0,
    idle: 0,
    seen: false,
  };
  function buildWisps() {
    if (coarsePointer) return;
    /* The motes are round, so nothing here is oriented: no per-particle angle,
       no rotated lookup. They are also small — a few pixels of core inside a
       faint halo — which is what lets the count go up without the additive fill
       that a screenful of big sprites costs. */
    const N = lowQuality ? 90 : 190;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(N), 1));
    g.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(N), 1));
    const pts = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        uniforms: {
          uTex: {
            value: createTexture(texWisp()),
          },
          uPx: {
            value: viewportHeight(),
          },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        fog: false,
        vertexShader:
          'attribute float aA; attribute float aS;\n' +
          'uniform float uPx; varying float vA;\n' +
          'void main(){ vA = aA;\n' +
          ' vec4 mv = modelViewMatrix * vec4(position,1.0);\n' +
          ' gl_PointSize = uPx * aS / max(-mv.z, 0.4);\n' +
          ' gl_Position = projectionMatrix * mv; }',
        fragmentShader:
          'uniform sampler2D uTex; varying float vA;\n' +
          'void main(){ if (vA <= 0.0) discard;\n' +
          ' vec4 t = texture2D(uTex, gl_PointCoord);\n' +
          ' gl_FragColor = vec4(t.rgb, t.a * vA); }',
      }),
    );
    pts.frustumCulled = false;
    pts.renderOrder = 9;
    pts.layers.set(1); /* near the lens: never in the mirror */
    runtime.camera.add(pts);
    wisps.mesh = pts;
    for (let i = 0; i < N; i++)
      wisps.list.push({
        life: 0,
        max: 1,
        vx: 0,
        vy: 0,
        sz: 0,
        ph: 0,
      });
  }
  /* the pointer, in camera space, on the plane the trail hangs on */
  function wispPoint(nx, ny) {
    const hh = Math.tan((runtime.camera.fov * Math.PI) / 360) * WISP_D;
    return [nx * hh * runtime.camera.aspect, ny * hh];
  }
  function updateWisps(dt) {
    if (!wisps.mesh) return;
    const g = wisps.mesh.geometry;
    const P = g.attributes.position.array,
      A = g.attributes.aA.array;
    const S = g.attributes.aS.array;
    const L = wisps.list,
      N = L.length;
    const pt = wispPoint(runtime.rig.tmx, runtime.rig.tmy);
    if (!wisps.seen) {
      wisps.ex = wisps.lx = pt[0];
      wisps.ey = wisps.ly = pt[1];
      wisps.seen = true;
    }
    /* the emitter trails the pointer slightly, which is what gives the drift
       its lag on a fast flick instead of snapping rigidly to the cursor */
    wisps.ex = damp(wisps.ex, pt[0], 16, dt);
    wisps.ey = damp(wisps.ey, pt[1], 16, dt);
    const dx = wisps.ex - wisps.lx,
      dy = wisps.ey - wisps.ly;
    const moved = Math.hypot(dx, dy);
    const ang = moved > 1e-5 ? Math.atan2(dy, dx) : 0;
    const spawn = (x, y, a, weak) => {
      const i = wisps.i;
      wisps.i = (i + 1) % N; /* slot and state must pair:
                            advancing first would put the position in the next slot and the life in
                            this one, and every mote appears where the one before it started */
      const w = L[i],
        k = i * 3;
      /* The plane the trail hangs on is only about 2.2 units tall, so the
         scatter has to be read against that: a few hundredths of a unit is a
         thread stitched to the cursor, not a drift of motes. */
      P[k] = x + (Math.random() + Math.random() - 1) * 0.3;
      P[k + 1] = y + (Math.random() + Math.random() - 1) * 0.3;
      P[k + 2] = -WISP_D + (Math.random() - 0.5) * 0.9;
      w.life = 0;
      w.max = (weak ? 2.1 : 1.45) + Math.random() * 1.3;
      w.vx = -Math.cos(a) * 0.09 + (Math.random() - 0.5) * 0.38;
      w.vy = -Math.sin(a) * 0.09 + (Math.random() - 0.5) * 0.32 + 0.02;
      w.sz = (weak ? 0.018 : 0.024) + Math.random() * 0.026;
      w.ph = Math.random() * TAU;
    };
    wisps.acc += moved;
    const STEP = 0.03;
    let guard = 0;
    while (wisps.acc >= STEP && guard++ < 14) {
      wisps.acc -= STEP;
      /* lay each one at the distance along the segment it is actually owed, so a
         flick draws a spaced-out line instead of a clump at one end of it */
      const t = moved > 1e-6 ? Math.min(1, (guard * STEP) / moved) : 0;
      spawn(wisps.lx + dx * t, wisps.ly + dy * t, ang, false);
    }
    /* the faintest breath when the hand is still, so the cursor keeps an aura.
       Rarely, and barely buoyant: emit often here and a stationary pointer
       grows a permanent column of smoke up the middle of the frame. */
    wisps.idle += dt;
    if (wisps.idle > 0.42) {
      wisps.idle = 0;
      spawn(wisps.ex, wisps.ey, Math.random() * TAU, true);
    }
    wisps.lx = wisps.ex;
    wisps.ly = wisps.ey;
    for (let i = 0; i < N; i++) {
      const w = L[i],
        k = i * 3;
      if (w.life >= w.max) {
        A[i] = 0;
        continue;
      }
      w.life += dt;
      const u = w.life / w.max;
      /* curl, so the drift frays rather than blowing along one straight line */
      P[k] += (w.vx + Math.sin(runtime.clock * 1.3 + w.ph) * 0.17) * dt;
      P[k + 1] += (w.vy + Math.cos(runtime.clock * 1.1 + w.ph * 1.7) * 0.14) * dt;
      /* light damping: they have to coast to carry the scatter outward, where
         the old rate stopped every mote within a tenth of a unit of its spawn */
      w.vx *= 1 - 0.5 * dt;
      w.vy = w.vy * (1 - 0.5 * dt) + 0.022 * dt; /* it rises */
      A[i] = smooth(0, 0.12, u) * (1 - smooth(0.22, 1, u)) * 0.9;
      S[i] = w.sz * (1 + u * 0.55); /* a mote softens, it does not swell */
    }
    g.attributes.position.needsUpdate = true;
    g.attributes.aA.needsUpdate = true;
    g.attributes.aS.needsUpdate = true;
  }
  return {
    buildAtmosphere,
    buildLeafFall,
    buildWisps,
    updateLeaves,
    updateWisps,
    wisps,
  };
}
