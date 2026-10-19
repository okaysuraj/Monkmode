import { texWood } from './wood-textures.js';
import { releaseCanvas } from './canvas-textures.js';
import * as THREE from 'three';
// Owns GPU texture uploads and the small cache of reusable building surfaces.

export function createMaterials(runtime) {
  function createTexture(canvasEl, o) {
    o = o || {};
    const t = new THREE.CanvasTexture(canvasEl);
    t.wrapS = t.wrapT = o.wrap || THREE.ClampToEdgeWrapping;
    if (o.repeat) t.repeat.set(o.repeat[0], o.repeat[1]);
    t.anisotropy = Math.min(o.aniso || 8, runtime.maxAniso);
    if (o.srgb !== false) {
      t.colorSpace = THREE.SRGBColorSpace;
    }
    t.needsUpdate = true;
    if (runtime.renderer) runtime.renderer.initTexture(t);
    if (runtime.running) releaseCanvas(canvasEl);
    else runtime.uploadedCanvases.add(canvasEl);
    return t;
  }
  /* HDR-bright emitters: values above 1 survive because the scene is rendered
     into a half-float buffer, and they are what the bloom feeds on */

  /* A {map, normal, rough} set hung on a standard material at one tiling. The colour is a multiplier on an already-dark albedo, so it is how a shared board or block library is re-tinted per use rather than regenerated. roughness stays at 1: the map carries the variation, and anything less scales the whole surface toward a polish it should not have. */
  function surface(t, rep, o) {
    o = o || {};
    const wrap = THREE.RepeatWrapping,
      aniso = o.aniso || 8;
    const m = new THREE.MeshStandardMaterial({
      map: createTexture(t.map, {
        wrap: wrap,
        repeat: rep,
        aniso: aniso,
      }),
      normalMap: createTexture(t.normal, {
        wrap: wrap,
        repeat: rep,
        srgb: false,
        aniso: aniso,
      }),
      normalScale: new THREE.Vector2(
        o.normal === undefined ? 0.8 : o.normal,
        o.normal === undefined ? 0.8 : o.normal,
      ),
      color: o.color === undefined ? 0xffffff : o.color,
      roughness: o.roughness === undefined ? 1 : o.roughness,
      metalness: o.metalness === undefined ? 0.02 : o.metalness,
    });
    if (t.rough)
      m.roughnessMap = createTexture(t.rough, {
        wrap: wrap,
        repeat: rep,
        srgb: false,
      });
    return m;
  }
  /* The board and block libraries are generated once and shared. buildLantern
     alone is called six times, and a granite per lantern is six pointless
     canvases and six normal-map passes at load. */
  const surfaceCache = {};
  const cachedSurface = (k, f) => surfaceCache[k] || (surfaceCache[k] = f());
  /* the walls are boarded; a column, a sill and a rail are each one stick of
     wood and must not carry a joint down the middle of them */
  const wallWood = () =>
    cachedSurface('wallWood', () =>
      texWood(3, {
        boards: 7,
      }),
    );
  const postWood = () =>
    cachedSurface('postWood', () =>
      texWood(29, {
        boards: 0,
      }),
    );
  return {
    createTexture,
    surface,
    cachedSurface,
    wallWood,
    postWood,
  };
}

// Values above one remain bright enough to feed the bloom pass.
export const hdrColor = (red, green, blue) => new THREE.Color().setRGB(red, green, blue);
