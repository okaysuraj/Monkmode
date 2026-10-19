// Seeded timber, granite, and lacquer textures with matching surface maps.
import { mulberry32, TAU, clamp, lerp } from './math.js';
import {
  createCanvas,
  hex,
  normalFromHeight,
  releaseCanvas,
  fbmCanvas,
} from './canvas-textures.js';
function texWood(seed, opt) {
  const o = opt || {},
    W = 512,
    H = 512;
  const c = createCanvas(W, H),
    x = c.getContext('2d');
  const h = createCanvas(W, H),
    hx = h.getContext('2d');
  const r = createCanvas(W, H),
    rx = r.getContext('2d');
  const rnd = mulberry32(seed || 3);
  const base = o.base || [30, 23, 19];
  x.fillStyle = hex(base[0], base[1], base[2]);
  x.fillRect(0, 0, W, H);
  hx.fillStyle = '#808080';
  hx.fillRect(0, 0, W, H);
  rx.fillStyle = o.rough || '#d6d6d6';
  rx.fillRect(0, 0, W, H);

  /* board layout — widths jittered, then normalised so the run closes on the
     tile edge and the map still wraps */
  const nb = o.boards === undefined ? 7 : o.boards;
  const cuts = [0];
  if (nb > 0) {
    const ws = [];
    let sum = 0;
    for (let i = 0; i < nb; i++) {
      const v = 0.7 + rnd() * 0.6;
      ws.push(v);
      sum += v;
    }
    let acc = 0;
    ws.forEach((v) => {
      acc += (v / sum) * W;
      cuts.push(acc);
    });
  } else cuts.push(W);
  const stroke = (pts, ctx, style, w) => {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = style;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.stroke();
  };
  for (let b = 0; b < cuts.length - 1; b++) {
    const x0 = cuts[b],
      x1 = cuts[b + 1],
      bw = x1 - x0;
    /* every board came off a different part of the log */
    const tone = 0.8 + rnd() * 0.44;
    const pith = x0 + bw * (rnd() * 2.8 - 0.9); /* usually outside it */
    const d0 = bw * (0.12 + rnd() * 1.7); /* how deep the cut ran */
    const amp = bw * (0.1 + rnd() * 0.4);
    const per = 1 + ((rnd() * 2) | 0),
      ph = rnd() * TAU;
    const dAt = (y) => d0 + Math.sin((y / H) * TAU * per + ph) * amp;
    const gap = 2.4 + rnd() * 5.0; /* ring spacing */

    [x, hx, rx].forEach((d) => {
      d.save();
      d.beginPath();
      d.rect(x0, 0, bw, H);
      d.clip();
    });
    x.fillStyle = hex(base[0] * tone, base[1] * tone, base[2] * tone);
    x.fillRect(x0, 0, bw, H);
    for (let k = 1; k * gap < bw * 3.4 + d0 + amp; k++) {
      const rr = k * gap * (0.88 + rnd() * 0.24);
      const dark = 0.42 + rnd() * 0.38,
        wide = 0.8 + rnd() * 1.9;
      for (const side of [-1, 1]) {
        let pts = [];
        const flush = () => {
          /* latewood: a narrow dark band, with the pale earlywood just inside */
          stroke(pts, x, 'rgba(0,0,0,' + dark.toFixed(2) + ')', wide);
          stroke(pts, hx, 'rgba(0,0,0,' + (dark * 0.8).toFixed(2) + ')', wide);
          stroke(
            pts.map((q) => [q[0] + side * (wide + 0.6), q[1]]),
            x,
            'rgba(150,120,96,' + (dark * 0.3).toFixed(2) + ')',
            wide * 0.7,
          );
          pts = [];
        };
        for (let y = -3; y <= H + 3; y += 3) {
          const d = dAt(y),
            q = rr * rr - d * d;
          if (q <= 0) {
            flush();
            continue;
          }
          pts.push([pith + side * Math.sqrt(q), y]);
        }
        flush();
      }
    }
    /* pores — the open tooth of cedar, elongated along the grain */
    for (let i = 0; i < 220; i++) {
      const px2 = x0 + rnd() * bw,
        py = rnd() * H,
        ln = 1.5 + rnd() * 6;
      x.fillStyle = 'rgba(0,0,0,' + (0.1 + rnd() * 0.22) + ')';
      x.fillRect(px2, py, 0.7 + rnd() * 0.7, ln);
      hx.fillStyle = 'rgba(0,0,0,.22)';
      hx.fillRect(px2, py, 0.8, ln);
    }
    /* the odd knot, where a branch left the trunk */
    if (rnd() > 0.55) {
      const kx = x0 + bw * (0.2 + rnd() * 0.6),
        ky = rnd() * H,
        kr = 2.5 + rnd() * 5;
      for (let i = 5; i >= 1; i--) {
        const t = i / 5;
        x.strokeStyle = 'rgba(0,0,0,' + (0.5 - t * 0.25).toFixed(2) + ')';
        x.lineWidth = 1.1;
        x.beginPath();
        x.ellipse(kx, ky, kr * t * 1.5, kr * t * 2.4, 0, 0, TAU);
        x.stroke();
        hx.strokeStyle = 'rgba(0,0,0,.30)';
        hx.lineWidth = 1.1;
        hx.beginPath();
        hx.ellipse(kx, ky, kr * t * 1.5, kr * t * 2.4, 0, 0, TAU);
        hx.stroke();
      }
    }
    /* checking: the splits a dried board opens, always along the grain */
    for (let i = 0; i < 5; i++) {
      const sx = x0 + rnd() * bw,
        sy = rnd() * H,
        ln = 20 + rnd() * 120;
      const pts = [];
      for (let y = sy; y < sy + ln; y += 6) pts.push([sx + Math.sin(y * 0.07) * 1.4, y]);
      stroke(pts, x, 'rgba(0,0,0,.62)', 0.7 + rnd() * 1.2);
      stroke(pts, hx, 'rgba(0,0,0,.55)', 0.7 + rnd() * 1.2);
    }
    [x, hx, rx].forEach((d) => d.restore());

    /* the joint, and the board edge that catches light beside it */
    if (nb > 0) {
      x.fillStyle = 'rgba(0,0,0,.80)';
      x.fillRect(x1 - 1.1, 0, 2.2, H);
      x.fillStyle = 'rgba(158,130,106,.14)';
      x.fillRect(x1 + 1.1, 0, 1.1, H);
      hx.fillStyle = 'rgba(0,0,0,.85)';
      hx.fillRect(x1 - 1.3, 0, 2.6, H);
      hx.fillStyle = 'rgba(255,255,255,.35)';
      hx.fillRect(x1 + 1.3, 0, 1.6, H);
      rx.fillStyle = 'rgba(255,255,255,.5)';
      rx.fillRect(x1 - 1.6, 0, 3.2, H);
    }
  }

  /* soot, running down the boards rather than pooling in clouds — this is the
     one weathering pass, and it follows the grain because water does */
  for (let i = 0; i < 90; i++) {
    const sx = rnd() * W,
      top = rnd() * H,
      ln = H * (0.15 + rnd() * 0.5);
    const g = x.createLinearGradient(0, top, 0, top + ln);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.3, 'rgba(0,0,0,' + (0.1 + rnd() * 0.16) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(sx, top, 0.8 + rnd() * 3.4, ln);
  }
  const normal = normalFromHeight(h, o.relief || 2.4);
  releaseCanvas(h);
  return {
    map: c,
    normal: normal,
    rough: r,
  };
}
function texStone(seed, opt) {
  const o = opt || {},
    W = 512,
    H = 512;
  const c = createCanvas(W, H),
    x = c.getContext('2d');
  const h = createCanvas(W, H),
    hx = h.getContext('2d');
  const r = createCanvas(W, H),
    rx = r.getContext('2d');
  const rnd = mulberry32(seed || 17);
  const base = o.base || [46, 51, 53];
  x.fillStyle = hex(base[0], base[1], base[2]);
  x.fillRect(0, 0, W, H);
  hx.fillStyle = '#808080';
  hx.fillRect(0, 0, W, H);
  rx.fillStyle = '#e8e8e8';
  rx.fillRect(0, 0, W, H);

  /* 1 · crystal */
  const speck = (n, fill, smin, smax, hgt) => {
    for (let i = 0; i < n; i++) {
      const s = smin + rnd() * (smax - smin),
        px = rnd() * W,
        py = rnd() * H;
      x.fillStyle = fill(rnd);
      x.beginPath();
      x.ellipse(px, py, s, s * (0.55 + rnd() * 0.85), rnd() * TAU, 0, TAU);
      x.fill();
      if (hgt) {
        hx.fillStyle = hgt;
        hx.beginPath();
        hx.ellipse(px, py, s, s * 0.8, 0, 0, TAU);
        hx.fill();
      }
    }
  };
  speck(
    3400,
    (q) => 'rgba(206,210,204,' + (0.06 + q() * 0.2) + ')',
    0.6,
    2.8,
    'rgba(255,255,255,.13)',
  );
  speck(2000, (q) => 'rgba(126,136,134,' + (0.07 + q() * 0.2) + ')', 0.8, 3.4, null);
  speck(1300, (q) => 'rgba(8,10,12,' + (0.14 + q() * 0.38) + ')', 0.5, 2.4, 'rgba(0,0,0,.16)');

  /* 2 · the chisel */
  for (let i = 0; i < 220; i++) {
    const py = rnd() * H,
      px = rnd() * W,
      len = 5 + rnd() * 24,
      ang = -0.26 + rnd() * 0.52;
    [
      [x, 'rgba(0,0,0,.22)', 'rgba(210,216,212,.08)'],
      [hx, 'rgba(0,0,0,.34)', 'rgba(255,255,255,.26)'],
    ].forEach(([d, dk, lt]) => {
      d.save();
      d.translate(px, py);
      d.rotate(ang);
      d.fillStyle = dk;
      d.fillRect(0, 0, len, 1.5);
      d.fillStyle = lt;
      d.fillRect(0, 1.5, len, 1.0);
      d.restore();
    });
  }
  /* 3 · pitting and fracture */
  for (let i = 0; i < 260; i++) {
    const px = rnd() * W,
      py = rnd() * H,
      rr = 0.8 + rnd() * rnd() * 5;
    const g = x.createRadialGradient(px - rr * 0.3, py - rr * 0.3, rr * 0.1, px, py, rr);
    g.addColorStop(0, 'rgba(0,0,0,.42)');
    g.addColorStop(0.7, 'rgba(0,0,0,.16)');
    g.addColorStop(1, 'rgba(198,204,198,.10)');
    x.fillStyle = g;
    x.beginPath();
    x.arc(px, py, rr, 0, TAU);
    x.fill();
    hx.fillStyle = 'rgba(0,0,0,.40)';
    hx.beginPath();
    hx.arc(px, py, rr * 0.8, 0, TAU);
    hx.fill();
  }
  for (let i = 0; i < 16; i++) {
    let px = rnd() * W,
      py = rnd() * H,
      a = rnd() * TAU;
    const pts = [[px, py]];
    for (let k = 0; k < 24; k++) {
      a += (rnd() - 0.5) * 0.9;
      px += Math.cos(a) * 9;
      py += Math.sin(a) * 9;
      pts.push([px, py]);
    }
    [
      [x, 'rgba(0,0,0,.46)'],
      [hx, 'rgba(0,0,0,.55)'],
    ].forEach(([d, st]) => {
      d.beginPath();
      d.moveTo(pts[0][0], pts[0][1]);
      pts.forEach((q) => d.lineTo(q[0], q[1]));
      d.strokeStyle = st;
      d.lineWidth = 0.7 + rnd() * 0.9;
      d.stroke();
    });
  }

  /* moss, read out of the low ground of the height field */
  const hd = hx.getImageData(0, 0, W, H).data;
  const im = x.getImageData(0, 0, W, H),
    rm = rx.getImageData(0, 0, W, H);
  const amt = o.moss === undefined ? 1 : o.moss;
  for (let i = 0; i < W * H; i++) {
    const t = clamp((0.5 - hd[i * 4] / 255) * 4.2, 0, 1) * amt;
    if (t <= 0) continue;
    const j = i * 4;
    im.data[j] = lerp(im.data[j], 30, t * 0.75);
    im.data[j + 1] = lerp(im.data[j + 1], 44, t * 0.95);
    im.data[j + 2] = lerp(im.data[j + 2], 28, t * 0.85);
    /* moss is matte — through the same buffer, because a fillRect per pixel
       is a quarter of a million canvas calls and costs more than the rest of
       this generator put together */
    rm.data[j] = rm.data[j + 1] = rm.data[j + 2] = lerp(rm.data[j], 255, t * 0.5);
  }
  x.putImageData(im, 0, 0);
  rx.putImageData(rm, 0, 0);
  const normal = normalFromHeight(h, o.relief || 3.2);
  releaseCanvas(h);
  return {
    map: c,
    normal: normal,
    rough: r,
  };
}
function texLacquer() {
  const W = 512,
    H = 512;
  const wood = texWood(131, {
    base: [34, 22, 17],
    boards: 0,
  });
  const c = createCanvas(W, H),
    x = c.getContext('2d');
  const h = createCanvas(W, H),
    hx = h.getContext('2d');
  const r = createCanvas(W, H),
    rx = r.getContext('2d');
  const rnd = mulberry32(5);
  x.drawImage(wood.map, 0, 0);
  hx.fillStyle = '#808080';
  hx.fillRect(0, 0, W, H);
  rx.fillStyle = '#8c8c8c';
  rx.fillRect(0, 0, W, H); /* lacquer half-holds a sheen */

  /* the coat */
  x.globalAlpha = 0.8;
  x.fillStyle = '#7c1610';
  x.fillRect(0, 0, W, H);
  x.globalAlpha = 1;
  /* pull the grain back through it */
  x.globalCompositeOperation = 'multiply';
  x.globalAlpha = 0.42;
  x.drawImage(wood.map, 0, 0);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';
  /* uneven pigment: the brush left it thicker in places */
  x.globalCompositeOperation = 'overlay';
  x.globalAlpha = 0.5;
  const fbLac1 = fbmCanvas(W, H, 313, 5, 3, 1);
  x.drawImage(fbLac1, 0, 0);
  releaseCanvas(fbLac1);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';

  /* craquelure — a wandering net of hairline cracks in the paint film */
  for (let i = 0; i < 190; i++) {
    let px = rnd() * W,
      py = rnd() * H,
      a = rnd() * TAU;
    x.strokeStyle = 'rgba(24,8,6,' + (0.28 + rnd() * 0.4) + ')';
    hx.strokeStyle = 'rgba(0,0,0,.42)';
    x.lineWidth = hx.lineWidth = 0.5 + rnd() * 0.7;
    x.beginPath();
    hx.beginPath();
    x.moveTo(px, py);
    hx.moveTo(px, py);
    for (let k = 0; k < 5 + rnd() * 9; k++) {
      a += (rnd() - 0.5) * 1.5;
      px += Math.cos(a) * (5 + rnd() * 9);
      py += Math.sin(a) * (5 + rnd() * 9);
      x.lineTo(px, py);
      hx.lineTo(px, py);
    }
    x.stroke();
    hx.stroke();
  }

  /* flaking: islands where the coat has lifted, showing the burnt wood, each
     with the pale shoulder of paint still standing at its edge */
  for (let i = 0; i < 40; i++) {
    const px = rnd() * W,
      py = rnd() * H,
      rad = 2 + rnd() * rnd() * 17;
    const pts = [];
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * TAU,
        rr = rad * (0.55 + rnd() * 0.75);
      pts.push([px + Math.cos(a) * rr, py + Math.sin(a) * rr]);
    }
    const path = (d) => {
      d.beginPath();
      d.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) {
        const p = pts[k],
          q = pts[(k + 1) % pts.length];
        d.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
      }
      d.closePath();
    };
    x.save();
    path(x);
    x.clip();
    x.drawImage(wood.map, 0, 0);
    x.fillStyle = 'rgba(0,0,0,.22)';
    x.fillRect(0, 0, W, H);
    x.restore();
    path(x);
    x.strokeStyle = 'rgba(196,110,76,.30)';
    x.lineWidth = 1.2;
    x.stroke();
    path(hx);
    hx.fillStyle = 'rgba(0,0,0,.34)';
    hx.fill();
    hx.strokeStyle = 'rgba(255,255,255,.30)';
    hx.lineWidth = 1.6;
    hx.stroke();
    path(rx);
    rx.fillStyle = 'rgba(240,240,240,.75)';
    rx.fill(); /* bare wood, matte */
  }

  /* rain running down the column */
  for (let i = 0; i < 120; i++) {
    const sx = rnd() * W,
      w = 0.6 + rnd() * 2.6,
      top = rnd() * H,
      len = H * (0.2 + rnd() * 0.6);
    const g = x.createLinearGradient(0, top, 0, top + len);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.3, rnd() > 0.5 ? 'rgba(12,4,4,.24)' : 'rgba(210,150,120,.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(sx, top, w, len);
  }
  rx.globalAlpha = 0.6;
  rx.globalCompositeOperation = 'multiply';
  const fbLac2 = fbmCanvas(W, H, 401, 4, 6, 1.2);
  rx.drawImage(fbLac2, 0, 0);
  releaseCanvas(fbLac2);
  rx.globalAlpha = 1;
  rx.globalCompositeOperation = 'source-over';
  const normal = normalFromHeight(h, 2.2);
  releaseCanvas(h);
  releaseCanvas(wood.map);
  releaseCanvas(wood.normal);
  releaseCanvas(wood.rough);
  return {
    map: c,
    normal: normal,
    rough: r,
  };
}

/* the shoji screen the sun burns through */
export { texWood, texStone, texLacquer };
