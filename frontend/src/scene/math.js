// Small numeric helpers for procedural geometry and frame-rate independent motion.
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const saturate = (v) => clamp(v, 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => {
  const t = saturate((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const TAU = Math.PI * 2;
/* frame-rate independent damping */
const damp = (cur, to, rate, dt) => lerp(cur, to, 1 - Math.exp(-rate * dt));
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* classic 2-D gradient noise */
function noise2D(seed) {
  const rnd = mulberry32(seed),
    p = new Uint8Array(256),
    perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0,
      t = p[i];
    p[i] = p[j];
    p[j] = t;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const G = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return function (x, y) {
    const xi = Math.floor(x),
      yi = Math.floor(y);
    const X = xi & 255,
      Y = yi & 255,
      xf = x - xi,
      yf = y - yi;
    const u = fade(xf),
      v = fade(yf);
    const g = (h, dx, dy) => {
      const q = G[h & 7];
      return q[0] * dx + q[1] * dy;
    };
    const aa = perm[perm[X] + Y],
      ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y],
      bb = perm[perm[X + 1] + Y + 1];
    return lerp(
      lerp(g(aa, xf, yf), g(ba, xf - 1, yf), u),
      lerp(g(ab, xf, yf - 1), g(bb, xf - 1, yf - 1), u),
      v,
    );
  };
}
function fbm(n, x, y, oct, lac, gain) {
  let a = 0.5,
    f = 1,
    s = 0,
    m = 0;
  for (let i = 0; i < (oct || 4); i++) {
    s += a * n(x * f, y * f);
    m += a;
    a *= gain || 0.5;
    f *= lac || 2;
  }
  return s / m; /* −1 … 1 */
}
export { clamp, saturate, lerp, smooth, easeOut, TAU, damp, mulberry32, noise2D, fbm };
