// Seeded sky, moon, leaf, rock, and glow textures for the landscape and weather.
import { mulberry32, TAU, noise2D, fbm, clamp, saturate } from './math.js';
import { createCanvas, fbmCanvas, releaseCanvas, hex } from './canvas-textures.js';
/* one maple leaf, white on transparent — tinted per instance */
function texLeaf() {
  const S = 128,
    c = createCanvas(S, S),
    x = c.getContext('2d');
  x.translate(S / 2, S * 0.92);
  x.scale(S / 2.2, -S / 2.2);
  x.beginPath();
  const lobes = 5,
    spread = 1.9;
  for (let i = 0; i < lobes; i++) {
    const a = -spread / 2 + spread * (i / (lobes - 1)) + Math.PI / 2;
    const len = i === 2 ? 0.96 : i === 1 || i === 3 ? 0.82 : 0.6;
    const wob = 0.17;
    x.moveTo(0, 0.02);
    x.lineTo(Math.cos(a - wob) * len * 0.55, Math.sin(a - wob) * len * 0.55);
    x.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    x.lineTo(Math.cos(a + wob) * len * 0.55, Math.sin(a + wob) * len * 0.55);
    x.closePath();
  }
  x.fillStyle = '#fff';
  x.fill();
  x.lineWidth = 0.05;
  x.strokeStyle = '#fff';
  x.stroke();
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = 'destination-out';
  const rnd = mulberry32(3);
  for (let i = 0; i < 40; i++) {
    x.beginPath();
    x.arc(rnd() * S, rnd() * S, rnd() * 3, 0, TAU);
    x.fill();
  }
  return c;
}

/* the night sky itself: black at altitude, going to the fog colour at the
   horizon so the backdrop and the depth cue meet without a seam */
function texSky() {
  const W = 512,
    H = 512,
    c = createCanvas(W, H),
    x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgb(6,10,15)');
  g.addColorStop(0.34, 'rgb(13,22,31)');
  g.addColorStop(0.66, 'rgb(17,26,34)');
  g.addColorStop(0.88, 'rgb(24,35,42)');
  g.addColorStop(1, 'rgb(14,22,28)');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  /* cloud, and a low warm bloom off the valley behind the ridge */
  x.globalAlpha = 0.34;
  x.globalCompositeOperation = 'overlay';
  const fbSky = fbmCanvas(W, H, 313, 5, 3, 0.9);
  x.drawImage(fbSky, 0, 0);
  releaseCanvas(fbSky);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';
  const wg = x.createRadialGradient(W * 0.68, H * 0.95, 4, W * 0.68, H * 0.95, W * 0.44);
  wg.addColorStop(0, 'rgba(150,66,26,.30)');
  wg.addColorStop(0.5, 'rgba(96,44,22,.12)');
  wg.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = wg;
  x.fillRect(0, 0, W, H);
  /* a scatter of stars, faint enough to survive the bloom */
  const rnd = mulberry32(881);
  for (let i = 0; i < 420; i++) {
    const sx = rnd() * W,
      sy = rnd() * H * 0.78,
      r = 0.5 + rnd() * rnd() * 1.7;
    x.fillStyle = 'rgba(214,232,240,' + (0.12 + rnd() * 0.42) * (1 - sy / H) + ')';
    x.beginPath();
    x.arc(sx, sy, r, 0, TAU);
    x.fill();
  }
  return c;
}

/* the wooded ridge the valley closes with — black, ragged, mostly fog */
function texRidge() {
  const W = 2048,
    H = 512,
    c = createCanvas(W, H),
    x = c.getContext('2d');
  const n = noise2D(1207),
    rnd = mulberry32(1207);
  x.beginPath();
  x.moveTo(0, H);
  for (let i = 0; i <= W; i += 4) {
    const t = i / W;
    const ridge =
      0.46 +
      0.3 * (fbm(n, t * 2.4, 0.5, 4, 2.1, 0.55) * 0.5 + 0.5) +
      0.16 * (fbm(n, t * 7.5, 3.1, 3, 2.2, 0.5) * 0.5 + 0.5);
    x.lineTo(i, H - ridge * H * 0.84);
  }
  x.lineTo(W, H);
  x.closePath();
  x.fillStyle = '#050809';
  x.fill();
  /* conifer spikes along the crest so the silhouette reads as forest */
  x.fillStyle = '#050809';
  for (let i = 0; i < 460; i++) {
    const px = rnd() * W,
      t = px / W;
    const ridge =
      0.46 +
      0.3 * (fbm(n, t * 2.4, 0.5, 4, 2.1, 0.55) * 0.5 + 0.5) +
      0.16 * (fbm(n, t * 7.5, 3.1, 3, 2.2, 0.5) * 0.5 + 0.5);
    const by = H - ridge * H * 0.84,
      hh = 8 + rnd() * 30,
      ww = 3 + rnd() * 6;
    x.beginPath();
    x.moveTo(px, by - hh);
    x.lineTo(px + ww, by + 4);
    x.lineTo(px - ww, by + 4);
    x.closePath();
    x.fill();
  }
  return c;
}

/* glazed roof tile — half-round caps running down the slope, weathered */

function texMoon() {
  const S = 512,
    c = createCanvas(S, S),
    x = c.getContext('2d');
  const R = S / 2 - 1,
    rnd = mulberry32(91);
  const px = (u, v) => [S / 2 + u * R, S / 2 + v * R]; /* disc coords */

  x.beginPath();
  x.arc(S / 2, S / 2, R, 0, TAU);
  x.closePath();
  x.save();
  x.clip();

  /* highland base. The reference disc is very slightly brighter at the limb,
     not darker — during totality the rim keeps its forward scatter — so this
     ramp opens outward instead of falling off. */
  const g = x.createRadialGradient(S * 0.46, S * 0.44, S * 0.05, S / 2, S / 2, R);
  g.addColorStop(0, 'rgb(150,150,150)');
  g.addColorStop(0.55, 'rgb(158,158,158)');
  g.addColorStop(0.86, 'rgb(178,178,178)');
  g.addColorStop(1, 'rgb(196,196,196)');
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);

  /* fine highland mottle */
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = 0.5;
  const fbMn1 = fbmCanvas(256, 256, 517, 6, 4, 1.1);
  x.drawImage(fbMn1, 0, 0, S, S);
  releaseCanvas(fbMn1);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';

  /* --- 1 · the maria, at their near-side places (u right, v down) --------- */
  const seas = [
    [-0.52, -0.06, 0.46, 0.8] /* Oceanus Procellarum */,
    [-0.26, -0.38, 0.31, 0.92] /* Imbrium             */,
    [0.13, -0.31, 0.2, 0.88] /* Serenitatis         */,
    [0.3, -0.08, 0.23, 0.84] /* Tranquillitatis     */,
    [0.45, 0.12, 0.15, 0.78] /* Fecunditatis        */,
    [0.27, 0.27, 0.12, 0.74] /* Nectaris            */,
    [0.57, -0.3, 0.12, 0.95] /* Crisium, the one that stands on its own */,
    [-0.27, 0.3, 0.19, 0.7] /* Nubium              */,
    [-0.47, 0.25, 0.13, 0.72] /* Humorum             */,
  ];
  const sea = createCanvas(S, S),
    sx = sea.getContext('2d');
  seas.forEach(([u, v, rad, dk]) => {
    /* a basin is a cluster of lobes, never a circle */
    for (let i = 0; i < 22; i++) {
      const a = rnd() * TAU,
        off = rnd() * rad * 0.66;
      const [bx, by] = px(u + Math.cos(a) * off, v + Math.sin(a) * off * 0.8);
      const rr = rad * R * (0.3 + rnd() * 0.46);
      const bg = sx.createRadialGradient(bx, by, rr * 0.2, bx, by, rr);
      bg.addColorStop(0, 'rgba(0,0,0,' + (dk * 0.14).toFixed(3) + ')');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      sx.fillStyle = bg;
      sx.beginPath();
      sx.arc(bx, by, rr, 0, TAU);
      sx.fill();
    }
  });
  /* a sea is dark, not black: the real mare/highland contrast is about 4:3,
     and anything heavier turns the disc into a skull */
  x.save();
  x.filter = 'blur(9px)';
  x.globalAlpha = 0.9;
  x.drawImage(sea, 0, 0);
  x.restore();
  releaseCanvas(sea);
  /* mottle riding on top of the basins so their floors are not flat washes */
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = 0.18;
  const fbMn2 = fbmCanvas(256, 256, 811, 4, 11, 1.2);
  x.drawImage(fbMn2, 0, 0, S, S);
  releaseCanvas(fbMn2);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';

  /* --- 2 · ray systems, thrown clear across the disc ---------------------- */
  const ray = createCanvas(S, S),
    rx2 = ray.getContext('2d');
  [
    [-0.1, 0.54, 150, 1],
    [-0.28, -0.07, 80, 0.6],
    [-0.46, -0.04, 60, 0.45],
  ].forEach(([u, v, n, str]) => {
    const [ox, oy] = px(u, v);
    for (let i = 0; i < n; i++) {
      const a = rnd() * TAU,
        len = R * (0.3 + rnd() * rnd() * 1.3);
      /* start clear of the crater — rays converging on a point read as a
         lens flare, and the real ones begin outside the ejecta blanket */
      const t0 = R * (0.08 + rnd() * 0.06);
      const p0 = [ox + Math.cos(a) * t0, oy + Math.sin(a) * t0];
      const p1 = [ox + Math.cos(a) * len, oy + Math.sin(a) * len];
      const rg = rx2.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
      rg.addColorStop(0, 'rgba(255,255,255,' + (0.085 * str).toFixed(3) + ')');
      rg.addColorStop(0.4, 'rgba(255,255,255,' + (0.055 * str).toFixed(3) + ')');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      rx2.strokeStyle = rg;
      rx2.lineWidth = 0.8 + rnd() * 2.4;
      rx2.lineCap = 'round';
      rx2.beginPath();
      rx2.moveTo(p0[0], p0[1]);
      rx2.quadraticCurveTo(
        ox + Math.cos(a + 0.06) * len * 0.55,
        oy + Math.sin(a + 0.06) * len * 0.55,
        p1[0],
        p1[1],
      );
      rx2.stroke();
    }
  });
  x.save();
  x.filter = 'blur(2.4px)';
  x.globalCompositeOperation = 'lighter';
  x.globalAlpha = 0.62;
  x.drawImage(ray, 0, 0);
  x.restore();
  releaseCanvas(ray);

  /* --- 3 · the crater field ----------------------------------------------
     A crater is not a ring. Stroked with a gradient running across it, the
     same circle gives a rim lit on the sun side and thrown into shadow on the
     other — which is the read — where a radial ring gives a bubble. */
  const inSea = (u, v) =>
    seas.some(([su, sv, rad]) => Math.hypot(u - su, (v - sv) * 1.15) < rad * 0.82);
  for (let i = 0; i < 620; i++) {
    const a = rnd() * TAU,
      rr = Math.sqrt(rnd()) * 0.97;
    const u = Math.cos(a) * rr,
      v = Math.sin(a) * rr;
    /* the seas are young and nearly unmarked — that contrast is the point */
    if (inSea(u, v) && rnd() > 0.12) continue;
    const [cx2, cy] = px(u, v);
    const big = rnd() > 0.975;
    const r = (1 + rnd() * rnd() * rnd() * (big ? 34 : 11)) * (S / 512);
    const fade = 0.55 + 0.45 * Math.sqrt(Math.max(0, 1 - rr * rr)); /* limb falloff */
    /* foreshortened toward the limb, like anything on a sphere */
    const sq = Math.sqrt(Math.max(0, 1 - rr * rr)) * 0.72 + 0.28;
    x.save();
    x.translate(cx2, cy);
    x.rotate(Math.atan2(v, u));
    x.scale(sq, 1);
    x.rotate(-Math.atan2(v, u)); /* keep the sun direction */
    const rimW = Math.max(0.8, r * 0.26);
    const lg = x.createLinearGradient(-r, -r, r, r); /* sun sits up-left */
    lg.addColorStop(0, 'rgba(255,255,255,' + (0.34 * fade).toFixed(3) + ')');
    lg.addColorStop(0.5, 'rgba(255,255,255,0)');
    lg.addColorStop(1, 'rgba(0,0,0,' + (0.38 * fade).toFixed(3) + ')');
    x.strokeStyle = lg;
    x.lineWidth = rimW;
    x.beginPath();
    x.arc(0, 0, Math.max(0.6, r - rimW * 0.5), 0, TAU);
    x.stroke();
    if (r > 3) {
      /* the floor it encloses */
      const fg = x.createLinearGradient(-r, -r, r, r);
      fg.addColorStop(0, 'rgba(0,0,0,' + (0.21 * fade).toFixed(3) + ')');
      fg.addColorStop(1, 'rgba(255,255,255,' + (0.07 * fade).toFixed(3) + ')');
      x.fillStyle = fg;
      x.beginPath();
      x.arc(0, 0, r - rimW, 0, TAU);
      x.fill();
    }
    if (r > 13) {
      /* central peak */
      x.fillStyle = 'rgba(255,255,255,' + (0.14 * fade).toFixed(3) + ')';
      x.beginPath();
      x.arc(-r * 0.04, -r * 0.04, r * 0.11, 0, TAU);
      x.fill();
    }
    x.restore();
  }

  /* surface tooth: genuinely fine, or it just adds another layer of cloud
     and the basins disappear under it */
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = 0.13;
  const fbMn3 = fbmCanvas(S, S, 977, 2, 210, 1.3);
  x.drawImage(fbMn3, 0, 0, S, S);
  releaseCanvas(fbMn3);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';

  /* the terminator side: the disc is not lit dead-on */
  const sh = x.createRadialGradient(S * 0.4, S * 0.38, S * 0.18, S * 0.52, S * 0.56, S * 0.72);
  sh.addColorStop(0, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(0,0,0,.30)');
  x.fillStyle = sh;
  x.fillRect(0, 0, S, S);
  x.restore();

  /* a one-pixel feather on the limb so it is a moon in air, not a cut disc */
  const fe = x.createRadialGradient(S / 2, S / 2, R - 2.5, S / 2, S / 2, R);
  fe.addColorStop(0, 'rgba(0,0,0,1)');
  fe.addColorStop(1, 'rgba(0,0,0,0)');
  x.globalCompositeOperation = 'destination-in';
  x.fillStyle = fe;
  x.fillRect(0, 0, S, S);
  x.globalCompositeOperation = 'source-over';
  return c;
}

/* soft round falloff — haze, embers, glows */
function texGlow(inner, mid) {
  const S = 256,
    c = createCanvas(S, S),
    x = c.getContext('2d');
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, inner || 'rgba(255,255,255,1)');
  g.addColorStop(0.28, mid || 'rgba(255,255,255,.36)');
  g.addColorStop(0.62, 'rgba(255,255,255,.07)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  return c;
}

/* one wisp — a round mote, not a streak. The whole read is a hard bright point sitting in a soft halo, so the falloff is deliberately uneven: almost all of the light is spent inside the first eighth of the radius and the rest is a wide, very faint bloom. A smooth gradient across the full radius gives an evenly lit blob with no centre to it. */
function texWisp() {
  const S = 128,
    c = createCanvas(S, S),
    x = c.getContext('2d');
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); /* the point itself */
  g.addColorStop(0.07, 'rgba(236,250,250,.92)');
  g.addColorStop(0.16, 'rgba(190,230,238,.40)');
  g.addColorStop(0.34, 'rgba(132,192,212,.13)');
  g.addColorStop(0.62, 'rgba(88,146,172,.035)');
  g.addColorStop(1, 'rgba(70,120,142,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);
  return c;
}
function texGrassCutout(seed, opt) {
  opt = opt || {};
  const W = opt.w || 2048,
    H = opt.h || 1024;
  const c = createCanvas(W, H),
    x = c.getContext('2d');
  const rnd = mulberry32(seed),
    n = noise2D(seed * 13 + 5);

  /* --- silhouette ------------------------------------------------- */
  const crest = opt.crest !== undefined ? opt.crest : 0.46;
  const peak = opt.peak !== undefined ? opt.peak : 0.6;
  const wide = opt.wide !== undefined ? opt.wide : 0.4;
  const prof = new Float32Array(W);
  for (let i = 0; i < W; i++) {
    const t = i / W;
    let m = Math.exp(-Math.pow((t - crest) / wide, 2) * 2.1);
    m += 0.46 * Math.exp(-Math.pow((t - crest - (opt.crest2 || 0.4)) / (wide * 0.62), 2) * 3.1);
    m += 0.3 * Math.exp(-Math.pow((t - crest + (opt.crest3 || 0.46)) / (wide * 0.7), 2) * 3.4);
    const g = fbm(n, t * 4.2, 0.5, 4, 2.05, 0.52) * 0.5 + 0.5;
    prof[i] = m * (0.8 + 0.38 * g);
  }
  let pk = 0;
  for (let i = 0; i < W; i++) pk = Math.max(pk, prof[i]);
  for (let i = 0; i < W; i++) prof[i] *= (H * peak) / pk;
  const surf = (i) => H - prof[clamp(i | 0, 0, W - 1)];

  /* --- body ------------------------------------------------------- */
  x.beginPath();
  x.moveTo(0, H);
  for (let i = 0; i < W; i += 3) x.lineTo(i, surf(i));
  x.lineTo(W, surf(W - 1));
  x.lineTo(W, H);
  x.closePath();
  const bg = x.createLinearGradient(0, H - H * peak, 0, H);
  bg.addColorStop(0, '#1a2416');
  bg.addColorStop(0.38, '#0e150c');
  bg.addColorStop(1, '#040604');
  x.fillStyle = bg;
  x.fill();
  x.save();
  x.clip();
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = 0.5;
  const fbGr = fbmCanvas(1024, 512, seed + 3, 5, 3, 1);
  x.drawImage(fbGr, 0, 0, W, H);
  releaseCanvas(fbGr);
  x.restore();
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';

  /* --- blades ----------------------------------------------------- */
  const LIGHT = opt.light || [-0.42, -0.91]; /* light comes from up-left */
  const N = opt.blades || 15000;
  const blades = [];
  for (let k = 0; k < N; k++) {
    const i = (rnd() * W) | 0;
    const s = surf(i);
    /* bias the population toward the silhouette so the edge stays ragged */
    const depth = Math.pow(rnd(), 2.3);
    const by = s + depth * (H - s) + (rnd() - 0.5) * 6;
    if (by > H + 20) continue;
    blades.push({
      i: i,
      by: by,
      depth: depth,
      r: rnd(),
      r2: rnd(),
      r3: rnd(),
    });
  }
  blades.sort((a, b) => a.by - b.by); /* far (high) first */

  const LEN = (opt.len || 46) * (W / 2048);
  for (let k = 0; k < blades.length; k++) {
    const b = blades[k];
    const bx = b.i + (b.r - 0.5) * 5;
    const grow = 1 - 0.52 * b.depth;
    const len = LEN * (0.36 + 1.05 * b.r2 * b.r2) * grow;
    let lean = (b.r3 - 0.5) * 1.5 + (opt.wind || 0.16);
    /* blades on the sunward flank lean into frame */
    const tipx = bx + lean * len * 0.95,
      tipy = b.by - len;
    const cx2 = bx + lean * len * 0.3,
      cy2 = b.by - len * 0.62;
    const w = (0.9 + 1.9 * b.r) * grow * (W / 2048);

    /* shade: facing the key light, plus exposure to the sky at the crest */
    const dx = tipx - bx,
      dy = tipy - b.by,
      il = 1 / Math.hypot(dx, dy);
    const ndl = saturate((-(dx * il) * LIGHT[0] - dy * il * LIGHT[1]) * 0.5 + 0.5);
    const open = Math.pow(1 - b.depth, 1.35);
    let l = 0.1 + 0.46 * open + 0.34 * ndl * open;
    const warm = saturate(open * 1.25 - 0.42) * (opt.warm !== undefined ? opt.warm : 1);
    const r = (10 + 78 * l + 44 * warm) * (opt.tintR || 1);
    const g = (16 + 106 * l + 24 * warm) * (opt.tintG || 1);
    const bl = (12 + 80 * l + 16 * warm) * (opt.tintB || 1);
    x.fillStyle = hex(r, g, bl);
    x.beginPath();
    x.moveTo(bx - w, b.by);
    x.quadraticCurveTo(cx2 - w * 0.35, cy2, tipx, tipy);
    x.quadraticCurveTo(cx2 + w * 0.35, cy2, bx + w, b.by);
    x.closePath();
    x.fill();
  }

  /* --- grade: red bounce from the sun, cold sky on the crest ------- */
  x.globalCompositeOperation = 'source-atop';
  const rb = x.createLinearGradient(opt.bounceFrom || W, 0, opt.bounceTo || 0, 0);
  rb.addColorStop(0, 'rgba(180,40,16,.24)');
  rb.addColorStop(0.55, 'rgba(140,32,14,.07)');
  rb.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = rb;
  x.fillRect(0, 0, W, H);
  const sk = x.createLinearGradient(0, H - H * peak * 1.05, 0, H);
  sk.addColorStop(0, 'rgba(146,182,180,.13)');
  sk.addColorStop(0.5, 'rgba(0,0,0,0)');
  sk.addColorStop(1, 'rgba(0,0,0,.70)');
  x.fillStyle = sk;
  x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  return c;
}

/* wet foreground boulders */
function texRockCutout(seed, opt) {
  opt = opt || {};
  const W = opt.w || 1536,
    H = opt.h || 1024;
  const c = createCanvas(W, H),
    x = c.getContext('2d');
  const rnd = mulberry32(seed),
    n = noise2D(seed * 7 + 11);
  const blobs = opt.blobs || [
    [0.3, 0.7, 0.4, 0.34],
    [0.66, 0.82, 0.38, 0.28],
    [0.46, 0.96, 0.52, 0.34],
  ];
  blobs.forEach((b, bi) => {
    const cx2 = b[0] * W,
      cy = b[1] * H,
      rx = b[2] * W * 0.5,
      ry = b[3] * H * 0.8;
    x.beginPath();
    for (let a = 0; a <= 128; a++) {
      const t = (a / 128) * TAU;
      const k = 1 + 0.17 * fbm(n, Math.cos(t) * 1.7 + bi * 9, Math.sin(t) * 1.7, 4, 2.1, 0.55);
      const px = cx2 + Math.cos(t) * rx * k,
        py = cy + Math.sin(t) * ry * k;
      if (a === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.closePath();
    const g = x.createLinearGradient(cx2 - rx, cy - ry, cx2 + rx * 0.4, cy + ry);
    const s = 1 - bi * 0.16;
    g.addColorStop(0, hex(30 * s, 39 * s, 40 * s));
    g.addColorStop(0.42, hex(14 * s, 19 * s, 20 * s));
    g.addColorStop(1, hex(6, 9, 9));
    x.fillStyle = g;
    x.fill();
    x.save();
    x.clip();
    x.globalCompositeOperation = 'overlay';
    x.globalAlpha = 0.62;
    const fbRk = fbmCanvas(768, 512, seed + bi * 31, 6, 4, 1.1);
    x.drawImage(fbRk, 0, 0, W, H);
    releaseCanvas(fbRk);
    x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over';
    /* facets */
    for (let f = 0; f < 26; f++) {
      x.beginPath();
      const fx = cx2 + (rnd() - 0.5) * rx * 2,
        fy = cy + (rnd() - 0.5) * ry * 1.6;
      x.moveTo(fx, fy);
      for (let v = 0; v < 3; v++)
        x.lineTo(fx + (rnd() - 0.5) * rx * 0.8, fy + (rnd() - 0.5) * ry * 0.6);
      x.closePath();
      x.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,.030)' : 'rgba(0,0,0,.14)';
      x.fill();
    }
    /* wet highlight along the upper rim */
    x.lineWidth = 3 + rnd() * 4;
    x.strokeStyle = 'rgba(178,206,206,.20)';
    x.beginPath();
    for (let a = 0; a <= 60; a++) {
      const t = Math.PI + (a / 60) * Math.PI * 0.78;
      const k = 1 + 0.17 * fbm(n, Math.cos(t) * 1.7 + bi * 9, Math.sin(t) * 1.7, 4, 2.1, 0.55);
      const px = cx2 + Math.cos(t) * rx * k * 0.97,
        py = cy + Math.sin(t) * ry * k * 0.97;
      if (a === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.stroke();
    x.restore();
  });

  /* a little moss where they meet the ground */
  x.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 2600; i++) {
    const px = rnd() * W,
      py = H - Math.pow(rnd(), 1.7) * H * 0.5;
    x.fillStyle =
      'rgba(' +
      ((40 + rnd() * 40) | 0) +
      ',' +
      ((60 + rnd() * 46) | 0) +
      ',34,' +
      (0.05 + rnd() * 0.22) +
      ')';
    x.fillRect(px, py, 1.6 + rnd() * 2.4, 3 + rnd() * 9);
  }
  const rb = x.createLinearGradient(W, 0, 0, 0);
  rb.addColorStop(0, 'rgba(190,48,22,.16)');
  rb.addColorStop(0.7, 'rgba(0,0,0,0)');
  x.fillStyle = rb;
  x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  return c;
}

/* a maple bough leaning into the top of frame */
function texBranchCutout(seed) {
  const W = 1536,
    H = 1024;
  const c = createCanvas(W, H),
    x = c.getContext('2d');
  const rnd = mulberry32(seed);
  const leaves = [];
  function bough(px, py, ang, len, wid, depth) {
    const steps = 7;
    let cx2 = px,
      cy = py,
      a = ang;
    x.beginPath();
    x.moveTo(cx2, cy);
    for (let s = 0; s < steps; s++) {
      a += (rnd() - 0.5) * 0.3;
      cx2 += (Math.cos(a) * len) / steps;
      cy += (Math.sin(a) * len) / steps;
      x.lineTo(cx2, cy);
    }
    x.lineCap = 'round';
    x.lineWidth = wid;
    x.strokeStyle =
      'rgba(' +
      ((26 + depth * 5) | 0) +
      ',' +
      ((22 + depth * 4) | 0) +
      ',' +
      ((22 + depth * 4) | 0) +
      ',1)';
    x.stroke();
    if (depth < 4 && len > 34) {
      const k = depth === 0 ? 3 : 2;
      for (let i = 0; i < k; i++)
        bough(
          cx2,
          cy,
          a + (rnd() - 0.5) * 1.25,
          len * (0.58 + rnd() * 0.18),
          wid * 0.58,
          depth + 1,
        );
    } else {
      for (let i = 0; i < 9; i++)
        leaves.push([
          cx2 + (rnd() - 0.5) * 78,
          cy + (rnd() - 0.5) * 78,
          rnd() * TAU,
          12 + rnd() * 20,
          rnd(),
        ]);
    }
  }
  bough(W * 1.02, H * 0.06, Math.PI * 0.78, 420, 26, 0);
  bough(W * 0.86, -H * 0.02, Math.PI * 0.62, 330, 18, 1);
  const leafImg = texLeaf();
  const tint = createCanvas(128, 128),
    createTexture = tint.getContext('2d');
  leaves.forEach((l) => {
    createTexture.clearRect(0, 0, 128, 128);
    createTexture.drawImage(leafImg, 0, 0);
    createTexture.globalCompositeOperation = 'source-in';
    const v = l[4];
    createTexture.fillStyle = hex(96 + v * 96, 14 + v * 22, 16 + v * 18);
    createTexture.fillRect(0, 0, 128, 128);
    createTexture.globalCompositeOperation = 'source-over';
    x.save();
    x.translate(l[0], l[1]);
    x.rotate(l[2]);
    x.globalAlpha = 0.78 + v * 0.22;
    x.drawImage(tint, -l[3], -l[3], l[3] * 2, l[3] * 2);
    x.restore();
  });
  x.globalAlpha = 1;
  releaseCanvas(leafImg);
  releaseCanvas(tint);
  return c;
}
export {
  texLeaf,
  texSky,
  texRidge,
  texMoon,
  texGlow,
  texWisp,
  texGrassCutout,
  texRockCutout,
  texBranchCutout,
};
