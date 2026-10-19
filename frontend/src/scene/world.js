import { useShadows, lowQuality } from './settings.js';
import { texLacquer, texStone } from './wood-textures.js';
import { mergeGeos, roofGeo, sweepPoly } from './geometry.js';
import { texSky, texRidge, texGlow } from './nature-textures.js';
import { hdrColor } from './materials.js';
import { texWall, texFloor, texRoof, texShoji } from './building-textures.js';
import * as THREE from 'three';
// Builds the courtyard, stairs, temple, gate, lanterns, and lights. Coordinates are in metres.
export const PODIUM = 7;
export const STEPS = 40;
export const STAIR_Z0 = -11;
export const STAIR_RUN = 0.55;
export const STAIR_W = 8.4;
export const TEMPLE_Z = -44;
export function createWorld(runtime, materials) {
  const { createTexture, surface, cachedSurface, wallWood, postWood } = materials;
  /* ---- the site plan, in metres ----------------------------------------
     Everything downstream — camera waypoints, lantern rows, the moon — is
     pinned to these, so the approach can be re-proportioned in one place. */

  function buildShell() {
    const wallT = texWall();
    const wallMap = createTexture(wallT.map, {
      wrap: THREE.RepeatWrapping,
      repeat: [4, 1.4],
    });
    const wallNrm = createTexture(wallT.normal, {
      wrap: THREE.RepeatWrapping,
      repeat: [4, 1.4],
      srgb: false,
    });
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallMap,
      normalMap: wallNrm,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.78,
      metalness: 0.05,
      color: 0x525c60,
    });

    /* The court used to be a roofless box. It is now an open mountain approach:
       nothing encloses the frame but the night, the ridge and the fog. */

    /* the sky, hung far enough back that the whole frustum sits inside it */
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 190),
      new THREE.MeshBasicMaterial({
        color: hdrColor(0.6, 0.7, 0.8),
        map: createTexture(texSky()),
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    );
    sky.position.set(0, 62, -108);
    sky.renderOrder = 0;
    runtime.scene.add(sky);
    runtime.world.sky = sky;

    /* the wooded ridge that closes the valley — three-quarters eaten by fog,
       which is the only reason the ground plane can just stop out there */
    /* z, centre y, width, height, x — kept low: a crest that climbs past the
       hall's eaves stops reading as distance and starts reading as a cut-out */
    const ridgeMap = createTexture(texRidge(), {
      wrap: THREE.RepeatWrapping,
      repeat: [1.7, 1],
    });
    [
      [-90, 13, 300, 26, 0],
      [-63, 9.5, 210, 19, 16],
    ].forEach((r, i) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(r[2], r[3]),
        /* fog off: at a hundred metres it would lift a black silhouette to 80%
         of the fog colour, and the treeline came back as a *pale* band */
        new THREE.MeshBasicMaterial({
          map: i ? createTexture(texRidge()) : ridgeMap,
          transparent: true,
          color: i ? 0x0a1015 : 0x06090d,
          depthWrite: false,
          fog: false,
        }),
      );
      m.position.set(r[4], r[1], r[0]);
      m.renderOrder = 1;
      runtime.scene.add(m);
    });

    /* floor + podium */
    const fT = texFloor();
    const floorMat = new THREE.MeshStandardMaterial({
      map: createTexture(fT.map, {
        wrap: THREE.RepeatWrapping,
        repeat: [7, 7],
        aniso: 16,
      }),
      normalMap: createTexture(fT.normal, {
        wrap: THREE.RepeatWrapping,
        repeat: [7, 7],
        srgb: false,
        aniso: 16,
      }),
      roughnessMap: createTexture(fT.rough, {
        wrap: THREE.RepeatWrapping,
        repeat: [3.4, 3.4],
        srgb: false,
      }),
      normalScale: new THREE.Vector2(0.3, 0.3),
      /* The court used to carry a planar mirror and this was tuned to feed it —
         near-polished, and metal enough to hold a reflection. With the mirror
         gone those numbers only made the paving read as sheet metal, so it goes
         back to being wet stone: rough, barely metallic, and lit rather than
         reflecting. */
      roughness: 0.74,
      metalness: 0.06,
      color: 0x69757a,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -18);
    floor.receiveShadow = true;
    runtime.scene.add(floor);
    runtime.world.floor = floor;
    runtime.world.floorMat = floorMat;

    /* The podium and the flight use their own material: the mirror shader below
       is only ever attached to the water-level floor, and sharing it would make
       the reflection buffer sample itself. It is also deliberately matte — with
       the floor's metalness the forty risers strobed as the camera drifted. */
    const platMat = new THREE.MeshStandardMaterial({
      map: createTexture(fT.map, {
        wrap: THREE.RepeatWrapping,
        repeat: [3, 1.2],
        aniso: 16,
      }),
      normalMap: createTexture(fT.normal, {
        wrap: THREE.RepeatWrapping,
        repeat: [3, 1.2],
        srgb: false,
        aniso: 16,
      }),
      normalScale: new THREE.Vector2(0.18, 0.18),
      roughness: 0.93,
      metalness: 0.02,
      color: 0x58636a,
    });
    /* the podium the hall stands on */
    const plat = new THREE.Mesh(new THREE.BoxGeometry(42, PODIUM, 24), platMat);
    plat.position.set(0, PODIUM / 2, -45);
    plat.receiveShadow = true;
    plat.castShadow = true;
    runtime.scene.add(plat);
    const cope = new THREE.Mesh(new THREE.BoxGeometry(43, 0.34, 25), wallMat);
    cope.position.set(0, PODIUM - 0.17, -45);
    cope.receiveShadow = true;
    runtime.scene.add(cope);

    /* The flight. Twenty-six risers merged into one buffer — as separate meshes
       it is twenty-six draw calls for a shape nobody ever gets close to. */
    const treads = [],
      cheeks = [];
    for (let i = 0; i < STEPS; i++) {
      const y = (i + 1) * (PODIUM / STEPS),
        z = STAIR_Z0 - (i + 0.5) * STAIR_RUN;
      const w = STAIR_W + (STEPS - i) * 0.052; /* splayed at the foot */
      treads.push(
        new THREE.BoxGeometry(w, PODIUM / STEPS + 0.04, STAIR_RUN + 0.04).translate(
          0,
          y - PODIUM / STEPS / 2,
          z,
        ),
      );
      [-1, 1].forEach((s) =>
        cheeks.push(
          new THREE.BoxGeometry(0.9, 1.5, STAIR_RUN + 0.06).translate(
            s * (w / 2 + 0.45),
            y - 0.3,
            z,
          ),
        ),
      );
    }
    const stair = new THREE.Mesh(mergeGeos(treads), platMat);
    stair.receiveShadow = true;
    stair.castShadow = true;
    runtime.scene.add(stair);
    const rail = new THREE.Mesh(mergeGeos(cheeks), wallMat);
    rail.receiveShadow = true;
    rail.castShadow = true;
    runtime.scene.add(rail);
  }
  function buildTemple() {
    const g = new THREE.Group();
    /* One board library, sampled at two scales: the hall's flanks want the grain
       long and lying down, the columns want it running their own length. */
    const timber = surface(wallWood(), [4, 1.6], {
      color: 0x565150,
      normal: 1.5,
    });
    const post = surface(postWood(), [1.1, 1.0], {
      color: 0x8a746d,
      normal: 1.05,
      metalness: 0.03,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: 0x8f6f2e,
      roughness: 0.38,
      metalness: 0.78,
    });
    const rf = cachedSurface('roof', () => texRoof());
    /* Nearly a silhouette: the roof carries almost no colour of its own, and
       what reads on it is relief rather than tone — so the normal goes up as
       the albedo comes down. */
    const tileMat = surface(rf, [1, 1], {
      color: 0x2b343a,
      roughness: 0.74,
      metalness: 0.1,
      normal: 1.4,
    });
    /* the paper the lamps burn through — the only thing in the hall that is
       allowed to be bright, and even then only just above white */
    const paper = new THREE.MeshBasicMaterial({
      color: hdrColor(1.06, 0.48, 0.18),
      fog: true,
      toneMapped: false,
    });
    const grid = new THREE.MeshBasicMaterial({
      map: createTexture(texShoji()),
      transparent: true,
      depthWrite: false,
      fog: true,
    });
    runtime.world.paper = paper;

    /* one lit bay: a glowing sheet with a lattice hung just in front of it */
    function bay(w, h, x, y, z) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), paper);
      p.position.set(x, y, z);
      g.add(p);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), grid);
      s.position.set(x, y, z + 0.06);
      s.renderOrder = 3;
      g.add(s);
    }
    /* The block-and-arm band that carries every eave. The pieces are merged, so
       they carry absolute coordinates — TEMPLE_Z has to go in here, not on the
       mesh, or the whole band ends up hanging in the air by the camera. */
    function brackets(halfW, halfD, y, step) {
      const parts = [];
      for (let x = -halfW; x <= halfW + 1e-3; x += step) {
        [-halfD, halfD].forEach((dz) => {
          parts.push(new THREE.BoxGeometry(0.34, 0.46, 0.34).translate(x, y, TEMPLE_Z + dz));
          parts.push(new THREE.BoxGeometry(0.92, 0.17, 0.24).translate(x, y + 0.3, TEMPLE_Z + dz));
        });
      }
      for (let dz = -halfD + step; dz < halfD - 1e-3; dz += step) {
        [-halfW, halfW].forEach((x) => {
          parts.push(new THREE.BoxGeometry(0.34, 0.46, 0.34).translate(x, y, TEMPLE_Z + dz));
          parts.push(new THREE.BoxGeometry(0.24, 0.17, 0.92).translate(x, y + 0.3, TEMPLE_Z + dz));
        });
      }
      const m = new THREE.Mesh(mergeGeos(parts), post);
      m.castShadow = false;
      g.add(m);
    }
    const F = PODIUM; /* the hall's floor level */

    /* ---- ground storey: six bays of lit lattice between charred columns --- */
    const core = new THREE.Mesh(new THREE.BoxGeometry(13.6, 5.0, 8.2), timber);
    core.position.set(0, F + 2.5, TEMPLE_Z);
    core.castShadow = true;
    g.add(core);
    for (let i = 0; i < 5; i++) {
      const x = -5.6 + i * 2.8;
      bay(1.55, 2.5, x, F + 2.6, TEMPLE_Z + 4.16);
    }
    for (let i = 0; i < 6; i++) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 5.0, 14), post);
      c.position.set(-7.0 + i * 2.8, F + 2.5, TEMPLE_Z + 4.24);
      c.castShadow = true;
      g.add(c);
    }
    const sill = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.4, 8.9), post);
    sill.position.set(0, F + 0.2, TEMPLE_Z);
    g.add(sill);
    brackets(7.0, 4.4, F + 5.15, 1.4);

    /* ---- the pent roof over the ground storey ---------------------------- */
    const lower = new THREE.Mesh(roofGeo(9.6, 6.4, 3.2, 2.9, 0.4, 0.26), tileMat);
    lower.position.set(0, F + 5.6, TEMPLE_Z);
    lower.castShadow = true;
    g.add(lower);

    /* ---- upper storey: railed gallery, dark boards, the temple's name ----- */
    const up = new THREE.Mesh(new THREE.BoxGeometry(10.0, 3.4, 6.0), timber);
    up.position.set(0, F + 9.4, TEMPLE_Z);
    up.castShadow = true;
    g.add(up);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.26, 8.4), post);
    deck.position.set(0, F + 7.72, TEMPLE_Z);
    g.add(deck);
    [0.1, 0.94].forEach((dy) =>
      [4.2, -4.2].forEach((dz) => {
        const r = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.17, 0.17), post);
        r.position.set(0, F + 7.85 + dy, TEMPLE_Z + dz);
        g.add(r);
      }),
    );
    for (let i = 0; i <= 16; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.05, 0.1), post);
      b.position.set(-6.2 + i * 0.775, F + 8.42, TEMPLE_Z + 4.2);
      g.add(b);
    }
    for (let i = 0; i < 4; i++) bay(1.0, 1.35, -4.5 + i * 3.0, F + 9.5, TEMPLE_Z + 3.06);
    /* the plaque */
    const plq = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.3, 0.16), gold);
    plq.position.set(0, F + 9.7, TEMPLE_Z + 3.12);
    g.add(plq);
    const plqIn = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.98, 0.18), timber);
    plqIn.position.set(0, F + 9.7, TEMPLE_Z + 3.16);
    g.add(plqIn);
    brackets(5.2, 3.3, F + 11.2, 1.3);

    /* ---- the main roof: the silhouette the whole page hangs on ----------- */
    const upper = new THREE.Mesh(roofGeo(10.8, 7.2, 3.6, 5.2, 0.48, 0.26), tileMat);
    upper.position.set(0, F + 11.7, TEMPLE_Z);
    upper.castShadow = true;
    g.add(upper);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.6, 1.05), tileMat);
    ridge.position.set(0, F + 17.1, TEMPLE_Z);
    g.add(ridge);
    [-1, 1].forEach((s) => {
      const oni = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.15, 4), tileMat);
      oni.position.set(s * 3.9, F + 17.6, TEMPLE_Z);
      oni.rotation.y = Math.PI / 4;
      g.add(oni);
    });
    runtime.world.templeTop = F + 18.2;

    /* ---- the two flanking wings, lit the same way ------------------------ */
    [-1, 1].forEach((s) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.4, 5.2), timber);
      w.position.set(s * 10.6, F + 1.7, TEMPLE_Z + 1.4);
      w.castShadow = true;
      g.add(w);
      for (let i = 0; i < 3; i++) bay(1.3, 1.6, s * 10.6 + (i - 1) * 2.4, F + 1.8, TEMPLE_Z + 4.06);
      const r = new THREE.Mesh(roofGeo(5.0, 4.0, 1.4, 1.9, 0.32, 0.26), tileMat);
      r.position.set(s * 10.6, F + 3.4, TEMPLE_Z + 1.4);
      r.castShadow = true;
      g.add(r);
    });
    runtime.scene.add(g);
    runtime.world.temple = g;

    /* the glow the hall pushes out over its own steps */
    const spill = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 16),
      new THREE.MeshBasicMaterial({
        map: createTexture(texGlow('rgba(255,150,66,.80)', 'rgba(240,96,26,.24)')),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        opacity: 0.3,
      }),
    );
    spill.position.set(0, F + 3.0, TEMPLE_Z + 5.6);
    spill.renderOrder = 2;
    runtime.scene.add(spill);
    runtime.world.hallHalo = spill;

    /* the band of mist that separates the hall from the trees behind it — the
       one thing that stops the whole background reading as a single flat cut-out */
    const mist = new THREE.Mesh(
      new THREE.PlaneGeometry(64, 20),
      new THREE.MeshBasicMaterial({
        map: createTexture(texGlow('rgba(150,178,190,.62)', 'rgba(104,138,154,.20)')),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        opacity: 0.17,
      }),
    );
    mist.position.set(0, F - 1.4, TEMPLE_Z + 10);
    mist.renderOrder = 2;
    runtime.scene.add(mist);
  }
  function buildTorii() {
    /* the weathering costs the gate a lot of its chroma, so the tint puts it
       back: red lifted well past green and blue rather than a flat brightening,
       or the vermilion comes out of the grade as brick */
    const lac = surface(
      cachedSurface('lacquer', () => texLacquer()),
      [2, 2],
      {
        color: hdrColor(1.72, 1.02, 0.94),
        roughness: 0.92,
        metalness: 0.05,
        normal: 0.75,
      },
    );
    const gold = new THREE.MeshStandardMaterial({
      color: 0x7a5d2a,
      roughness: 0.5,
      metalness: 0.6,
    });
    const g = new THREE.Group();
    const BASE = 0.78,
      H = 8.2,
      SPAN = 3.55;
    [-1, 1].forEach((s) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, H, 26), lac);
      col.position.set(s * SPAN, BASE + H / 2, 0);
      col.castShadow = true;
      g.add(col);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.52, 26), gold);
      foot.position.set(s * SPAN, BASE + 0.26, 0);
      foot.castShadow = true;
      g.add(foot);
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.26, 26), gold);
      collar.position.set(s * SPAN, BASE + H - 1.42, 0);
      g.add(collar);
      /* the ornate bracket where the beams cross the column */
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.3, 0.86), gold);
      br.position.set(s * SPAN, BASE + H - 0.72, 0);
      g.add(br);
      const br2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.52, 0.6), gold);
      br2.position.set(s * SPAN, BASE + H - 0.34, 0);
      g.add(br2);
      [-1, 1].forEach((d) => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.7, 0.18), gold);
        wing.position.set(s * SPAN + d * 0.4, BASE + H - 0.62, 0.3);
        g.add(wing);
        const wing2 = wing.clone();
        wing2.position.z = -0.3;
        g.add(wing2);
      });
    });

    /* nuki — the straight beam that pierces the columns */
    const nuki = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.52, 0.46), lac);
    nuki.position.set(0, BASE + H - 2.15, 0);
    nuki.castShadow = true;
    g.add(nuki);

    /* gakuzuka — the little strut at the centre */
    const gak = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.22, 0.4), lac);
    gak.position.set(0, BASE + H + 0.1, 0);
    g.add(gak);
    const gakG = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.5), gold);
    gakG.position.set(0, BASE + H + 0.68, 0);
    g.add(gakG);

    /* shimaki + kasagi — the two crowning beams, swept upward at the ends */
    function beamPath(half, rise, power) {
      const p = [];
      for (let i = 0; i <= 26; i++) {
        const u = (i / 26) * 2 - 1;
        p.push(new THREE.Vector3(u * half, Math.pow(Math.abs(u), power) * rise, 0));
      }
      return p;
    }
    const shimaki = new THREE.Mesh(
      sweepPoly(beamPath(5.05, 0.4, 2.6), [
        [-0.3, -0.19],
        [0.3, -0.19],
        [0.32, 0.06],
        [0.28, 0.21],
        [-0.28, 0.21],
        [-0.32, 0.06],
      ]),
      lac,
    );
    shimaki.position.set(0, BASE + H - 0.52, 0);
    shimaki.castShadow = true;
    g.add(shimaki);
    const kasagi = new THREE.Mesh(
      sweepPoly(beamPath(5.85, 0.62, 2.4), [
        [-0.42, -0.24],
        [0.42, -0.24],
        [0.46, 0.04],
        [0.3, 0.28],
        [-0.3, 0.28],
        [-0.46, 0.04],
      ]),
      lac,
    );
    kasagi.position.set(0, BASE + H + 0.96, 0);
    kasagi.castShadow = true;
    g.add(kasagi);
    /* a black lacquer cap along the top of the kasagi */
    const cap = new THREE.Mesh(
      sweepPoly(beamPath(5.95, 0.62, 2.4), [
        [-0.48, 0.22],
        [0.48, 0.22],
        [0.48, 0.34],
        [-0.48, 0.34],
      ]),
      new THREE.MeshStandardMaterial({
        color: 0x120c0c,
        roughness: 0.42,
        metalness: 0.14,
      }),
    );
    cap.position.set(0, BASE + H + 0.96, 0);
    g.add(cap);

    /* the gate stands at the foot of the flight, not over the court — small
       enough that the hall keeps the top of the frame to itself */
    /* The lowest thing on the gate is the foot of each column, and it starts
       at BASE — so anchoring the group at y=0 left the whole torii hanging
       BASE*scale above the court. Drop it by exactly that and the feet land. */
    const GS = 0.72;
    g.position.set(0, -BASE * GS, -8.6);
    g.scale.setScalar(GS);
    runtime.scene.add(g);
    runtime.world.torii = g;
  }
  function buildLantern(x, z, s, y) {
    const stone = cachedSurface('lanternStone', () =>
      surface(
        cachedSurface('granite', () => texStone(17)),
        [1.5, 1.5],
        {
          color: 0x9aa5a5,
          metalness: 0,
          normal: 1.45,
        },
      ),
    );
    const dark = cachedSurface('lanternDark', () =>
      surface(postWood(), [0.9, 0.9], {
        color: 0xd8c2b6,
        metalness: 0.1,
        normal: 0.7,
      }),
    );
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.52, 0.26, 20), stone);
    base.position.y = 0.13;
    base.castShadow = true;
    g.add(base);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 1.02, 16), stone);
    post.position.y = 0.77;
    post.castShadow = true;
    g.add(post);
    const shelf = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.13, 20), stone);
    shelf.position.y = 1.34;
    shelf.castShadow = true;
    g.add(shelf);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), dark);
    box.position.y = 1.66;
    box.castShadow = true;
    g.add(box);
    const paneMat = new THREE.MeshBasicMaterial({
      color: hdrColor(2.3, 0.3, 0.085),
      fog: false,
      toneMapped: false,
    });
    [
      [0, 0, 0.256, 0],
      [0, 0, -0.256, Math.PI],
      [0.256, 0, 0, Math.PI / 2],
      [-0.256, 0, 0, -Math.PI / 2],
    ].forEach((p) => {
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), paneMat);
      pane.position.set(p[0], 1.66, p[2]);
      pane.rotation.y = p[3];
      g.add(pane);
    });
    runtime.world.lanternPane = runtime.world.lanternPane || paneMat;
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.62, 0.34, 4, 1), stone);
    roof.position.y = 2.06;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.7, 0.07, 4, 1), stone);
    brim.position.y = 1.93;
    brim.rotation.y = Math.PI / 4;
    g.add(brim);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), stone);
    knob.position.y = 2.28;
    g.add(knob);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 10), stone);
    tip.position.y = 2.4;
    g.add(tip);
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({
        map: createTexture(texGlow('rgba(255,120,60,.9)', 'rgba(255,60,24,.28)')),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        opacity: 0.5,
      }),
    );
    glow.position.y = 1.66;
    glow.renderOrder = 2;
    g.add(glow);
    glow.userData.billboard = true;
    const lt = new THREE.PointLight(0xff5a24, 2.6, 9, 2);
    lt.position.set(0, 1.66, 0);
    g.add(lt);
    runtime.world.lanternLights = runtime.world.lanternLights || [];
    runtime.world.lanternLights.push(lt);
    runtime.world.lanternGlows = runtime.world.lanternGlows || [];
    runtime.world.lanternGlows.push(glow);
    g.position.set(x, y || 0, z);
    g.scale.setScalar(s || 1);
    runtime.scene.add(g);
    return g;
  }
  function buildLights() {
    runtime.scene.add(new THREE.HemisphereLight(0x53838f, 0x060a08, 0.13));
    const key = new THREE.DirectionalLight(0xb6dbe4, 1.22);
    key.position.set(2.6, 21, 2.5);
    key.target.position.set(0, 2.2, -12.5);
    runtime.scene.add(key.target);
    if (useShadows) {
      key.castShadow = true;
      const S = lowQuality ? 1024 : 2048;
      key.shadow.mapSize.set(S, S);
      const c = key.shadow.camera;
      c.left = -26;
      c.right = 26;
      c.top = 34;
      c.bottom = -16;
      c.near = 3;
      c.far = 78;
      key.shadow.bias = -0.0012;
      key.shadow.normalBias = 0.035;
      key.shadow.radius = 2.2;
    }
    runtime.scene.add(key);
    runtime.world.key = key;

    /* moonlight: no shadow, no fill, purely a rim down the right-hand slope of
       every roof — without it the hall is a flat black cut-out against the sky */
    const moonKey = new THREE.DirectionalLight(0xff6a42, 0.52);
    moonKey.position.set(26, 30, -60);
    moonKey.target.position.set(0, 8, -40);
    runtime.scene.add(moonKey.target);
    runtime.scene.add(moonKey);

    /* The hall's own lamps. They light the podium and the top of the flight and
       nothing else — a range that reaches the roof turns the whole building into
       a paper lantern and the silhouette disappears. */
    const hallL = new THREE.PointLight(0xff8a26, 2.3, 15, 2);
    hallL.position.set(0, PODIUM + 1.2, TEMPLE_Z + 8.6);
    runtime.scene.add(hallL);
    runtime.world.hallLight = hallL;
    [-1, 1].forEach((s) => {
      const w = new THREE.PointLight(0xff8420, 2.2, 11, 2);
      w.position.set(s * 11.4, PODIUM + 1.2, TEMPLE_Z + 5.6);
      runtime.scene.add(w);
    });

    /* the moon throws almost nothing, but a trace of red high on the right
       keeps it attached to the scene instead of floating on top of it */
    const moonL = new THREE.PointLight(0xff3a1c, 3.0, 46, 2);
    moonL.position.set(11.0, 17.0, -24.0);
    runtime.scene.add(moonL);
    runtime.world.moonLight = moonL;
    const fill = new THREE.PointLight(0x86c6d2, 0.95, 30, 2);
    fill.position.set(-1, 13.5, -16.0);
    runtime.scene.add(fill);

    /* the flight is the spine of the composition — without a lamp of its own it
       falls into the same black as the ground and the eye has nothing to climb */
    const stairL = new THREE.PointLight(0xffa049, 4.2, 17, 2);
    stairL.position.set(0, 7.6, -26.0);
    runtime.scene.add(stairL);
  }
  return {
    buildShell,
    buildTemple,
    buildTorii,
    buildLantern,
    buildLights,
  };
}
