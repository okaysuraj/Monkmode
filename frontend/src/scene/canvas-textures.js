import { mulberry32, clamp } from './math.js';
// Canvas textures are generated once at startup; release temporary pixel buffers after upload.

function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
/** Release the pixel buffer of a canvas that has been uploaded to the GPU or is no longer needed. */
function releaseCanvas(c) {
  if (c && c.width) {
    c.width = c.height = 0;
  }
}
const hex = (r, g, b) => 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';

/* stacked, up-scaled value noise — 30× faster than a per-pixel fbm and
   indistinguishable once it is multiplied under a dark base colour */
function fbmCanvas(W, H, seed, octaves, baseCells, contrast) {
  const out = createCanvas(W, H),
    o = out.getContext('2d');
  o.fillStyle = '#808080';
  o.fillRect(0, 0, W, H);
  let cells = baseCells || 3,
    alpha = 1;
  for (let i = 0; i < (octaves || 5); i++) {
    const n = createCanvas(cells, cells),
      nx = n.getContext('2d');
    const im = nx.createImageData(cells, cells),
      d = im.data,
      r = mulberry32(seed + i * 977);
    for (let k = 0; k < cells * cells; k++) {
      const v = 128 + (r() - 0.5) * 255 * (contrast || 1);
      d[k * 4] = d[k * 4 + 1] = d[k * 4 + 2] = clamp(v, 0, 255);
      d[k * 4 + 3] = 255;
    }
    nx.putImageData(im, 0, 0);
    o.globalAlpha = alpha;
    o.globalCompositeOperation = i === 0 ? 'source-over' : 'overlay';
    o.imageSmoothingEnabled = true;
    o.imageSmoothingQuality = 'high';
    o.drawImage(n, 0, 0, W, H);
    releaseCanvas(n);
    cells *= 2;
    alpha *= 0.62;
  }
  o.globalAlpha = 1;
  o.globalCompositeOperation = 'source-over';
  return out;
}

/* height → tangent-space normal map (blur first, then Sobel) */
function normalFromHeight(hc, strength) {
  const W = hc.width,
    H = hc.height;
  const b = createCanvas(W, H),
    bx = b.getContext('2d');
  bx.filter = 'blur(1.1px)';
  bx.drawImage(hc, 0, 0);
  bx.filter = 'none';
  const src = bx.getImageData(0, 0, W, H).data;
  releaseCanvas(b);
  const out = createCanvas(W, H),
    ox = out.getContext('2d');
  const im = ox.createImageData(W, H),
    d = im.data;
  const at = (x, y) => src[(((y + H) % H) * W + ((x + W) % W)) * 4] / 255;
  const s = strength || 2.4;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const gx = (at(x + 1, y) - at(x - 1, y)) * s;
      const gy = (at(x, y + 1) - at(x, y - 1)) * s;
      let nx = -gx,
        ny = gy,
        nz = 1;
      const il = 1 / Math.hypot(nx, ny, nz);
      const i = (y * W + x) * 4;
      d[i] = (nx * il * 0.5 + 0.5) * 255;
      d[i + 1] = (ny * il * 0.5 + 0.5) * 255;
      d[i + 2] = (nz * il * 0.5 + 0.5) * 255;
      d[i + 3] = 255;
    }
  ox.putImageData(im, 0, 0);
  return out;
}

/* long, wet, board-formed concrete — the sanctuary walls */
export { createCanvas, releaseCanvas, hex, fbmCanvas, normalFromHeight };
