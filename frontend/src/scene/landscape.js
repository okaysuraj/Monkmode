import { mergeGeos } from './geometry.js';
import { mulberry32, TAU, noise2D, fbm } from './math.js';
import { aspectFix, lowQuality } from './settings.js';
import { hdrColor } from './materials.js';
import {
  texMoon,
  texGlow,
  texLeaf,
  texGrassCutout,
  texRockCutout,
  texBranchCutout,
} from './nature-textures.js';
import * as THREE from 'three';
export function createLandscape(runtime, materials) {
  // Moon and vegetation share GPU texture uploads with the building builders.
  const { createTexture } = materials;
  /* ---- the site plan, in metres ----------------------------------------
     Everything downstream — camera waypoints, lantern rows, the moon — is
     pinned to these, so the approach can be re-proportioned in one place. */

  const MOON = {
    x: 17.9,
    y: 31.9,
    z: -72,
    r: 8.6,
  };
  function buildMoon() {
    const disc = new THREE.Mesh(
      new THREE.PlaneGeometry(
        MOON.r * 2,
        MOON.r * 2,
      ) /* The whole blood-moon grade lives here, on a near-neutral albedo. The plate measures G/R ≈ B/R ≈ .48, but that is a *display* ratio: the map is decoded out of sRGB before this multiplies it, so the tint has to be written in linear, where the same look is ≈ .21. Reading the ratio straight off the reference is what left the moon a pale pink. */,
      new THREE.MeshBasicMaterial({
        map: createTexture(texMoon()),
        color: hdrColor(3.6, 0.64, 0.61),
        transparent: true,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    );
    disc.position.set(MOON.x, MOON.y, MOON.z);
    disc.renderOrder = 1;
    runtime.scene.add(disc);
    runtime.world.moon = disc;

    /* the air around it — a wide, weak corona that the bloom picks up */
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(MOON.r * 6.4, MOON.r * 6.4),
      new THREE.MeshBasicMaterial({
        map: createTexture(texGlow('rgba(255,124,112,.90)', 'rgba(206,52,48,.26)')),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        opacity: 0.44,
      }),
    );
    halo.position.set(MOON.x, MOON.y, MOON.z - 0.3);
    halo.renderOrder = 0;
    runtime.scene.add(halo);
    runtime.world.moonHalo = halo;
  }
  /* On a tall frame the rig steps back and its horizontal reach narrows, which
     would slide the moon off the right edge — draw it in by the same amount. */
  function placeMoon() {
    if (!runtime.world.moon) return;
    const x = MOON.x * (1 - 0.4 * aspectFix());
    runtime.world.moon.position.x = x;
    runtime.world.moonHalo.position.x = x;
  }
  function buildMaple(seed, x, z, scale) {
    const rnd = mulberry32(seed);
    const parts = [],
      tips = [];
    const M = new THREE.Matrix4(),
      Q = new THREE.Quaternion(),
      UP = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3(),
      pos = new THREE.Vector3();
    function seg(from, to, r0, r1) {
      dir.subVectors(to, from);
      const len = dir.length();
      dir.normalize();
      const geo = new THREE.CylinderGeometry(r1, r0, len, 6, 1, true);
      Q.setFromUnitVectors(UP, dir);
      pos.addVectors(from, to).multiplyScalar(0.5);
      M.compose(pos, Q, new THREE.Vector3(1, 1, 1));
      geo.applyMatrix4(M);
      parts.push(geo);
    }
    function branch(from, dirV, len, rad, depth) {
      const to = from.clone().addScaledVector(dirV, len);
      to.y += len * 0.1;
      seg(from, to, rad, rad * 0.68);
      if (depth >= 4 || len < 0.34) {
        tips.push(to.clone());
        return;
      }
      const n = depth < 2 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const d = dirV.clone();
        d.x += (rnd() - 0.5) * 1.25;
        d.z += (rnd() - 0.5) * 1.25;
        d.y += 0.3 + rnd() * 0.5;
        d.normalize();
        branch(to, d, len * (0.62 + rnd() * 0.16), rad * 0.66, depth + 1);
      }
    }
    const root = new THREE.Vector3(0, 0, 0);
    seg(root, new THREE.Vector3(0, 1.5, 0), 0.22, 0.16);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + rnd();
      branch(
        new THREE.Vector3(0, 1.5, 0),
        new THREE.Vector3(Math.cos(a) * 0.8, 0.8, Math.sin(a) * 0.8).normalize(),
        1.45,
        0.155,
        0,
      );
    }
    const trunk = new THREE.Mesh(
      mergeGeos(parts),
      new THREE.MeshStandardMaterial({
        color: 0x171413,
        roughness: 0.94,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),
    );
    trunk.castShadow = true;
    const leafGeo = new THREE.PlaneGeometry(0.36, 0.36);
    const leafMat = new THREE.MeshStandardMaterial({
      map: createTexture(texLeaf()),
      color: 0x2b0406,
      alphaTest: 0.42,
      side: THREE.DoubleSide,
      roughness: 0.86,
      metalness: 0,
      emissive: 0x080000,
      emissiveIntensity: 0.12,
    });
    const per = lowQuality ? 5 : 9;
    const inst = new THREE.InstancedMesh(leafGeo, leafMat, tips.length * per);
    const m4 = new THREE.Matrix4(),
      e = new THREE.Euler(),
      q2 = new THREE.Quaternion(),
      sc = new THREE.Vector3();
    let k = 0;
    tips.forEach((t) => {
      for (let i = 0; i < per; i++) {
        const p = new THREE.Vector3(
          t.x + (rnd() - 0.5) * 0.95,
          t.y + (rnd() - 0.5) * 0.8,
          t.z + (rnd() - 0.5) * 0.95,
        );
        e.set(rnd() * TAU, rnd() * TAU, rnd() * TAU);
        q2.setFromEuler(e);
        const s = 0.7 + rnd() * 0.75;
        sc.set(s, s, s);
        m4.compose(p, q2, sc);
        inst.setMatrixAt(k++, m4);
      }
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = false;
    inst.frustumCulled = false;
    const g = new THREE.Group();
    g.add(trunk);
    g.add(inst);
    g.position.set(x, 0, z);
    g.scale.setScalar(scale || 1);
    g.rotation.y = rnd() * TAU;
    runtime.scene.add(g);
    /* leaves breathe in the wind */
    leafMat.onBeforeCompile = (sh) => {
      sh.uniforms.uT = runtime.world.uT;
      sh.vertexShader =
        'uniform float uT;\n' +
        sh.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\n' +
            'vec3 wp = (instanceMatrix * vec4(0.0,0.0,0.0,1.0)).xyz;\n' +
            'float ph = wp.x*1.7 + wp.z*1.3 + wp.y*.7;\n' +
            'transformed.x += sin(uT*1.35 + ph)*0.055;\n' +
            'transformed.z += cos(uT*1.05 + ph*1.3)*0.045;\n',
        );
    };
    return g;
  }
  function buildRocks() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x141a1c,
      roughness: 0.46,
      metalness: 0.1,
    });
    const rnd = mulberry32(404),
      n = noise2D(88);
    const spots = [
      [-6.2, -5.4, 0.95],
      [-7.4, -2.1, 0.7],
      [6.6, -7.2, 0.8],
      [8.0, -4.0, 1.05],
      [-9.0, -8.4, 1.15],
      [9.6, -9.2, 0.9],
      [3.4, -7.8, 0.55],
      [-3.2, -8.6, 0.6],
    ];
    spots.forEach((s, i) => {
      const geo = new THREE.IcosahedronGeometry(s[2], 2);
      const p = geo.attributes.position;
      for (let v = 0; v < p.count; v++) {
        const vx = p.getX(v),
          vy = p.getY(v),
          vz = p.getZ(v);
        const d = 1 + 0.34 * fbm(n, vx * 1.6 + i * 7, vz * 1.6 + vy, 3, 2.2, 0.5);
        p.setXYZ(v, vx * d, vy * d * 0.68, vz * d);
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mat);
      m.position.set(s[0], s[2] * 0.3, s[1]);
      m.rotation.set(rnd(), rnd() * TAU, rnd() * 0.4);
      m.castShadow = true;
      m.receiveShadow = true;
      runtime.scene.add(m);
    });
  }
  function cutoutMaterial(canvasEl, sway) {
    const mat = new THREE.MeshBasicMaterial({
      map: createTexture(canvasEl, {
        aniso: 16,
      }),
      transparent: true,
      depthWrite: true,
      alphaTest: 0.012,
      side: THREE.DoubleSide,
      fog: true,
      color: 0xffffff,
    });
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uT = runtime.world.uT;
      sh.uniforms.uSway = {
        value: sway || 0.07,
      };
      sh.vertexShader =
        'uniform float uT;\nuniform float uSway;\nvarying vec2 vCutoutUv;\n' +
        sh.vertexShader.replace(
          '#include <begin_vertex>',
          'vCutoutUv = uv;\n#include <begin_vertex>\n' +
            'float h = uv.y;\n' +
            'float ph = position.x*0.30 + float(gl_InstanceID)*0.0;\n' +
            'transformed.x += sin(uT*0.85 + ph)*uSway*h*h;\n' +
            'transformed.y += cos(uT*0.62 + ph*1.7)*uSway*0.35*h*h;\n',
        );
      /* These plates are drawn to the edge of their own canvas — the grass runs straight off the left and the bottom — so every sheet ends on a hard straight line wherever its plane stops. Feathering the alpha at the edges lets each one dissolve into the scene instead of being cut out of it. */
      sh.fragmentShader =
        'varying vec2 vCutoutUv;\n' +
        sh.fragmentShader.replace(
          '#include <alphatest_fragment>',
          'float feX = smoothstep(0.0, 0.11, vCutoutUv.x) * (1.0 - smoothstep(0.89, 1.0, vCutoutUv.x));\n' +
            'float feY = smoothstep(0.0, 0.07, vCutoutUv.y);\n' +
            'diffuseColor.a *= feX * feY;\n' +
            '#include <alphatest_fragment>',
        );
    };
    return mat;
  }
  function buildForeground() {
    /* the plane widths are sized against the frustum at their own depth: a
       26-unit sheet two metres from the lens only shows its middle tenth */
    const layers = [
      /* name        canvas                                                                     x     y     z     w     h   sway */
      [
        'grassFar',
        texGrassCutout(101, {
          crest: 0.3,
          peak: 0.46,
          wide: 0.42,
          blades: 11000,
          len: 34,
          warm: 0.7,
          crest2: 0.46,
          crest3: 0.4,
        }),
        -3.4,
        2.85,
        -0.4,
        24,
        12,
        0.04,
      ],
      [
        'rockLeft',
        texRockCutout(404, {
          blobs: [
            [0.24, 0.78, 0.48, 0.38],
            [0.58, 0.94, 0.46, 0.3],
            [0.84, 1.06, 0.42, 0.28],
          ],
        }),
        -7.2,
        2.55,
        1.8,
        17,
        11.3,
        0.01,
      ],
      [
        'grassMid',
        texGrassCutout(202, {
          crest: 0.6,
          peak: 0.55,
          wide: 0.4,
          blades: 13000,
          len: 40,
          warm: 0.95,
          crest2: -0.44,
          crest3: 0.34,
        }),
        3.9,
        2.86,
        3.6,
        15,
        7.5,
        0.062,
      ],
      [
        'grassNear',
        texGrassCutout(303, {
          crest: 0.42,
          peak: 0.62,
          wide: 0.48,
          blades: 16000,
          len: 50,
          warm: 0.85,
          crest2: 0.42,
          crest3: 0.44,
        }),
        -1.9,
        2.92,
        5.6,
        12,
        6,
        0.092,
      ],
      ['bough', texBranchCutout(505), 4.6, 2.95, 6.4, 13, 8.7, 0.045],
      [
        'rockNear',
        texRockCutout(606, {
          blobs: [
            [0.18, 0.86, 0.54, 0.44],
            [0.54, 1.02, 0.5, 0.36],
            [0.86, 0.92, 0.4, 0.32],
          ],
        }),
        -6.6,
        1.7,
        6.0,
        9,
        6,
        0.008,
      ],
    ];
    runtime.world.fg = [];
    layers.forEach((L) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(L[5], L[6], 12, 12),
        cutoutMaterial(L[1], L[7]),
      );
      m.position.set(L[2], L[3], L[4]);
      m.renderOrder = 20 + runtime.world.fg.length;
      m.name = L[0];
      m.frustumCulled = false;
      runtime.scene.add(m);
      runtime.world.fg.push(m);
      L[1] = null;
    });
  }
  return {
    buildMoon,
    placeMoon,
    buildMaple,
    buildRocks,
    buildForeground,
  };
}
