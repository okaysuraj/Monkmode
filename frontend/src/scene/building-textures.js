// Canvas textures for concrete, slate, paper screens, and roof tiles.
import { mulberry32, TAU } from './math.js';
import {
  createCanvas,
  fbmCanvas,
  releaseCanvas,
  normalFromHeight,
  hex,
} from './canvas-textures.js';
/* long, wet, board-formed concrete — the sanctuary walls */
function texWall() {
  const W = 1024,
    H = 1024;
  const c = createCanvas(W, H),
    x = c.getContext('2d');
  x.fillStyle = '#10161a';
  x.fillRect(0, 0, W, H);

  /* mottling */
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = 0.82;
  const fbW1 = fbmCanvas(W, H, 41, 6, 3, 1);
  x.drawImage(fbW1, 0, 0);
  releaseCanvas(fbW1);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';

  /* board-form seams every sixth */
  const rnd = mulberry32(7);
  for (let i = 1; i < 6; i++) {
    const y = (H / 6) * i;
    x.fillStyle = 'rgba(0,0,0,.45)';
    x.fillRect(0, y - 1.5, W, 3);
    x.fillStyle = 'rgba(190,205,205,.05)';
    x.fillRect(0, y + 2, W, 2);
  }
  /* form-tie dimples */
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 4; j++) {
      const cx2 = (W / 4) * (j + 0.5) + (rnd() - 0.5) * 14,
        cy = (H / 6) * (i + 0.5);
      const g = x.createRadialGradient(cx2, cy, 1, cx2, cy, 11);
      g.addColorStop(0, 'rgba(0,0,0,.5)');
      g.addColorStop(0.7, 'rgba(0,0,0,.18)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g;
      x.beginPath();
      x.arc(cx2, cy, 11, 0, TAU);
      x.fill();
    }
  /* rain streaks running the full height */
  for (let i = 0; i < 190; i++) {
    const sx = rnd() * W,
      w = 0.6 + rnd() * 3.4,
      top = rnd() * H * 0.5,
      len = H * (0.4 + rnd() * 0.7);
    const g = x.createLinearGradient(0, top, 0, top + len);
    const dark = rnd() > 0.45;
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.25, dark ? 'rgba(0,0,0,.20)' : 'rgba(170,195,200,.045)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(sx, top, w, len);
  }
  /* fine tooth */
  x.globalAlpha = 0.16;
  x.globalCompositeOperation = 'overlay';
  const fbW2 = fbmCanvas(512, 512, 91, 3, 128, 1.4);
  x.drawImage(fbW2, 0, 0, W, H);
  releaseCanvas(fbW2);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';

  /* height for the normal map: seams + streaks only */
  const h = createCanvas(W, H),
    hx = h.getContext('2d');
  hx.fillStyle = '#808080';
  hx.fillRect(0, 0, W, H);
  hx.globalAlpha = 0.5;
  const fbW3 = fbmCanvas(W, H, 41, 5, 6, 1);
  hx.drawImage(fbW3, 0, 0);
  releaseCanvas(fbW3);
  hx.globalAlpha = 1;
  for (let i = 1; i < 6; i++) {
    hx.fillStyle = '#2a2a2a';
    hx.fillRect(0, (H / 6) * i - 2, W, 4);
  }
  const normal = normalFromHeight(h, 2.0);
  releaseCanvas(h);
  return {
    map: c,
    normal: normal,
  };
}

/* wet slate paving — big slabs, tight joints, standing water */
function texFloor() {
  const W = 1024,
    H = 1024;
  const c = createCanvas(W, H),
    x = c.getContext('2d');
  const rnd = mulberry32(23);
  x.fillStyle = '#0a0f12';
  x.fillRect(0, 0, W, H);
  const N = 4,
    S = W / N;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const t = 0.82 + rnd() * 0.36;
      x.fillStyle = hex(12 * t, 17 * t, 20 * t);
      x.fillRect(i * S + 1.5, j * S + 1.5, S - 3, S - 3);
    }
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = 0.55;
  const fbFl1 = fbmCanvas(W, H, 63, 6, 4, 1);
  x.drawImage(fbFl1, 0, 0);
  releaseCanvas(fbFl1);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';
  /* joints */
  x.strokeStyle = 'rgba(0,0,0,.72)';
  x.lineWidth = 3;
  for (let i = 0; i <= N; i++) {
    x.beginPath();
    x.moveTo(i * S, 0);
    x.lineTo(i * S, H);
    x.stroke();
    x.beginPath();
    x.moveTo(0, i * S);
    x.lineTo(W, i * S);
    x.stroke();
  }
  /* height map: joints recessed, grain */
  const h = createCanvas(W, H),
    hx = h.getContext('2d');
  hx.fillStyle = '#8c8c8c';
  hx.fillRect(0, 0, W, H);
  hx.globalAlpha = 0.35;
  const fbFl2 = fbmCanvas(W, H, 63, 5, 8, 1);
  hx.drawImage(fbFl2, 0, 0);
  releaseCanvas(fbFl2);
  hx.globalAlpha = 1;
  hx.strokeStyle = '#303030';
  hx.lineWidth = 5;
  for (let i = 0; i <= N; i++) {
    hx.beginPath();
    hx.moveTo(i * S, 0);
    hx.lineTo(i * S, H);
    hx.stroke();
    hx.beginPath();
    hx.moveTo(0, i * S);
    hx.lineTo(W, i * S);
    hx.stroke();
  }
  /* roughness: mostly glass, drier patches where the rain missed */
  const r = createCanvas(512, 512),
    rx = r.getContext('2d');
  rx.fillStyle = '#1c1c1c';
  rx.fillRect(0, 0, 512, 512);
  rx.globalAlpha = 0.95;
  rx.globalCompositeOperation = 'lighten';
  const fbFl3 = fbmCanvas(512, 512, 77, 4, 3, 1.5);
  rx.drawImage(fbFl3, 0, 0);
  releaseCanvas(fbFl3);
  rx.globalAlpha = 1;
  rx.globalCompositeOperation = 'source-over';
  const normal = normalFromHeight(h, 1.5);
  releaseCanvas(h);
  return {
    map: c,
    normal: normal,
    rough: r,
  };
}
/* the shoji screen the sun burns through */
function texShoji() {
  const W = 1024,
    H = 768,
    c = createCanvas(W, H),
    x = c.getContext('2d');
  x.clearRect(0, 0, W, H);
  x.fillStyle = 'rgba(228,222,206,.055)';
  x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(10,8,7,.88)';
  const cols = 12,
    rows = 9;
  x.lineWidth = 5;
  for (let i = 1; i < cols; i++) {
    x.beginPath();
    x.moveTo((W / cols) * i, 0);
    x.lineTo((W / cols) * i, H);
    x.stroke();
  }
  for (let j = 1; j < rows; j++) {
    x.beginPath();
    x.moveTo(0, (H / rows) * j);
    x.lineTo(W, (H / rows) * j);
    x.stroke();
  }
  x.lineWidth = 13;
  x.strokeStyle = 'rgba(8,6,5,.95)';
  x.strokeRect(0, 0, W, H);
  x.beginPath();
  x.moveTo(W / 2, 0);
  x.lineTo(W / 2, H);
  x.stroke();
  return c;
}

/* one maple leaf, white on transparent — tinted per instance */

/* glazed roof tile — half-round caps running down the slope, weathered */
function texRoof() {
  const W = 512,
    H = 512,
    c = createCanvas(W, H),
    x = c.getContext('2d');
  const h = createCanvas(W, H),
    hx = h.getContext('2d');
  x.fillStyle = '#151c20';
  x.fillRect(0, 0, W, H);
  hx.fillStyle = '#606060';
  hx.fillRect(0, 0, W, H);
  const ribs = 14,
    s = W / ribs;
  for (let i = 0; i < ribs; i++) {
    const g = x.createLinearGradient(i * s, 0, (i + 1) * s, 0);
    g.addColorStop(0, 'rgba(0,0,0,.62)');
    g.addColorStop(0.3, 'rgba(148,178,192,.13)');
    g.addColorStop(0.66, 'rgba(84,110,124,.05)');
    g.addColorStop(1, 'rgba(0,0,0,.62)');
    x.fillStyle = g;
    x.fillRect(i * s, 0, s, H);
    x.fillStyle = 'rgba(0,0,0,.50)';
    x.fillRect(i * s - 3, 0, 6, H);
    x.fillStyle = 'rgba(168,196,208,.09)';
    x.fillRect(i * s - 1.2, 0, 1.6, H);
    /* the half-round cap itself, as height: the valley between two tiles is
       the only reason a tiled roof reads as tiled at this distance */
    const hg = hx.createLinearGradient(i * s, 0, (i + 1) * s, 0);
    hg.addColorStop(0, '#2c2c2c');
    hg.addColorStop(0.5, '#eaeaea');
    hg.addColorStop(1, '#2c2c2c');
    hx.fillStyle = hg;
    hx.fillRect(i * s, 0, s, H);
  }
  /* the courses running down the slope — each tile overlaps the one below */
  const rnd = mulberry32(211);
  for (let y = 0; y < H; y += H / 9) {
    x.fillStyle = 'rgba(0,0,0,.34)';
    x.fillRect(0, y, W, 3.5);
    hx.fillStyle = 'rgba(0,0,0,.55)';
    hx.fillRect(0, y, W, 3.5);
    hx.fillStyle = 'rgba(255,255,255,.28)';
    hx.fillRect(0, y + 3.5, W, 2);
    for (let i = 0; i < 26; i++) {
      /* chipped, mossed edges */
      x.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,.30)' : 'rgba(96,116,92,.10)';
      x.fillRect(rnd() * W, y + 1, 2 + rnd() * 9, 2 + rnd() * 3);
    }
  }
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = 0.46;
  const fbRf1 = fbmCanvas(256, 256, 211, 5, 3, 1);
  x.drawImage(fbRf1, 0, 0, W, H);
  releaseCanvas(fbRf1);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';
  hx.globalAlpha = 0.3;
  const fbRf2 = fbmCanvas(256, 256, 213, 4, 16, 1.2);
  hx.drawImage(fbRf2, 0, 0, W, H);
  releaseCanvas(fbRf2);
  hx.globalAlpha = 1;
  const normal = normalFromHeight(h, 2.2);
  releaseCanvas(h);
  return {
    map: c,
    normal: normal,
  };
}
export { texWall, texFloor, texShoji, texRoof };
