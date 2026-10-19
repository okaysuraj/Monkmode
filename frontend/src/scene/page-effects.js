import { createCanvas, releaseCanvas } from './canvas-textures.js';
import { clamp, smooth, damp, mulberry32 } from './math.js';
import { viewportHeight, reducedMotion, viewportWidth, coarsePointer } from './settings.js';
// Connects section navigation, reveals, foreground artwork, and the custom cursor.

export function createPageEffects(runtime) {
  const lifecycle = runtime.lifecycle;
  let sections = [];
  let anchors = [],
    maxScroll = 1,
    activeSec = 0;
  function measure() {
    if (!sections || !sections.length)
      sections = Array.from(document.querySelectorAll('[data-cam]'));
    maxScroll = Math.max(1, document.documentElement.scrollHeight - viewportHeight());
    anchors = sections.map((el, i) => {
      if (i === 0) return 0;
      if (i === sections.length - 1) return maxScroll;
      return clamp(el.offsetTop + el.offsetHeight * 0.5 - viewportHeight() * 0.5, 0, maxScroll);
    });
    for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
  }
  function progressFor(y) {
    if (y <= anchors[0]) return 0;
    for (let i = 0; i < anchors.length - 1; i++)
      if (y <= anchors[i + 1]) return i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
    return anchors.length - 1;
  }
  const select = (s) => document.querySelector(s);
  const selectAll = (s) => Array.from(document.querySelectorAll(s));
  let nav = null;
  function wireReveals() {
    splitHeadingWords();
    const groups = new Map();
    const items = selectAll('[data-rv], .mask-line');
    items.forEach((el) => {
      const key = el.parentElement;
      const arr = groups.get(key) || [];
      arr.push(el);
      groups.set(key, arr);
    });
    groups.forEach((arr) => arr.forEach((el, i) => (el.dataset.rvd = i * 85)));
    const io = lifecycle.observe(
      new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            const d = parseFloat(e.target.dataset.rvd || 0);
            setTimeout(() => e.target.classList.add('rv-in'), reducedMotion ? 0 : d);
          });
        },
        {
          rootMargin: '0px 0px -10% 0px',
          threshold: 0.04,
        },
      ),
    );
    items.forEach((el) => {
      if (!el.closest('#hero')) io.observe(el);
    });
  }

  /* Word-level masks let every display heading arrive at a human reading pace.
     The original text remains the accessible label, while the visual words are
     explicitly presentational. The existing section observer still controls
     when each heading starts. */
  function splitHeadingWords() {
    if (reducedMotion) return;
    selectAll('h1.display, h2.display').forEach((heading) => {
      const lines = heading.querySelectorAll('.mask-line');
      const targets = lines.length ? [].slice.call(lines) : [heading];
      targets.forEach((target) => {
        if (target.dataset.wordReady === 'true') return;
        const phrase = target.textContent.replace(/\s+/g, ' ').trim();
        if (!phrase) return;
        target.dataset.wordReady = 'true';
        target.classList.add('word-reveal');
        target.setAttribute('aria-label', phrase);
        target.textContent = '';
        phrase.split(' ').forEach((word, i) => {
          if (i) target.appendChild(document.createTextNode(' '));
          const mask = document.createElement('span');
          const inner = document.createElement('span');
          mask.className = 'word-mask';
          mask.setAttribute('aria-hidden', 'true');
          inner.className = 'word';
          inner.textContent = word;
          inner.style.setProperty('--word-delay', i * 72 + 'ms');
          mask.appendChild(inner);
          target.appendChild(mask);
        });
      });
    });
  }

  /* Foreground PNGs are section-owned until their chapter is called. At that point the active stage becomes a fixed lower viewport plane; its predecessor remains there just long enough to blur and fade out before returning home. */
  function wireForegroundStages() {
    const pairs = selectAll('.sec .fg, .foot .fg')
      .map((stage) => ({
        section: stage.closest('.sec, .foot'),
        stage,
      }))
      .filter((pair) => pair.section);
    if (!pairs.length) return;
    const sky = select('#fg-sky');
    const ratios = new Map(pairs.map((pair) => [pair.section, 0]));
    const homes = new WeakMap(pairs.map((pair) => [pair.stage, pair.section]));
    const timers = new WeakMap();
    let activeStage = null;
    const lift = (stage) => {
      if (!sky || stage.parentNode === sky) return;
      sky.appendChild(stage);
      /* A re-inserted element has no previous computed style, so the entrance
         would land already finished. Resolve the parked state in its new parent
         first and the pieces have something to rise from. */
      void stage.offsetWidth;
    };
    const park = (stage) => {
      const home = homes.get(stage);
      if (home && stage.parentNode !== home) home.insertBefore(stage, home.firstChild);
    };
    lifecycle.cleanup(() =>
      pairs.forEach(({ stage }) => {
        stage.classList.remove('fg-active', 'fg-retiring');
        park(stage);
      }),
    );
    const retire = (stage) => {
      if (!stage || stage === activeStage) return;
      const pending = timers.get(stage);
      if (pending) lifecycle.cancelDelay(pending);
      stage.classList.remove('fg-active');
      if (reducedMotion) {
        park(stage);
        return;
      }
      stage.classList.add('fg-retiring');
      timers.set(
        stage,
        lifecycle.delay(() => {
          stage.classList.remove('fg-retiring');
          timers.delete(stage);
          park(stage);
        }, 820),
      );
    };
    const activate = (stage) => {
      if (!stage || stage === activeStage) return;
      const pending = timers.get(stage);
      if (pending) lifecycle.cancelDelay(pending);
      stage.classList.remove('fg-retiring');
      lift(stage);
      stage.classList.add('fg-active');
      const prior = activeStage;
      activeStage = stage;
      retire(prior);
    };
    const observer = lifecycle.observe(
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) =>
            ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0),
          );
          const next = pairs.reduce((best, pair) =>
            (ratios.get(pair.section) || 0) > (ratios.get(best.section) || 0) ? pair : best,
          );
          const nextRatio = ratios.get(next.section) || 0;
          if (nextRatio > 0) activate(next.stage);
          else if (activeStage) {
            const prior = activeStage;
            activeStage = null;
            retire(prior);
          }
        },
        {
          rootMargin: '-12% 0px -12% 0px',
          threshold: [0, 0.12, 0.32, 0.55],
        },
      ),
    );
    pairs.forEach((pair) => observer.observe(pair.section));
  }
  function wireHeroExit() {
    const hero = select('#hero');
    if (!hero) return;
    /* at = where in the exit it starts, span = how long it takes to go */
    const seq = [
      {
        el: select('.peek'),
        at: 0.0,
        span: 0.26,
      },
      {
        el: select('.hero-cue'),
        at: 0.1,
        span: 0.3,
        shift: true,
      },
      ...selectAll('.chip').map((el, i) => ({
        el: el,
        at: 0.2 + i * 0.1,
        span: 0.3,
        shift: true,
      })),
      {
        el: select('.chapters'),
        at: 0.6,
        span: 0.3,
      } /* shifting it carries the chips twice */,
      {
        el: select('.hero-side'),
        at: 0.7,
        span: 0.3,
      } /* its transform is the centring -50% */,
    ].filter((o) => o.el);
    let on = false;
    const apply = () => {
      const t = clamp(scrollY / Math.max(1, viewportHeight() * 0.58), 0, 1);
      if (t <= 0) {
        if (!on) return;
        seq.forEach((o) => {
          o.el.style.opacity = '';
          o.el.style.transform = '';
          o.el.style.pointerEvents = '';
          o.el.style.transition = '';
        });
        on = false;
        return;
      }
      on = true;
      seq.forEach((o) => {
        /* these carry the reveal's own .9s opacity transition, which would
           animate every value written here — the fade would then trail the
           scroll by most of a second and stop reading as scroll-driven */
        o.el.style.transition = 'none';
        const a = 1 - smooth(o.at, o.at + o.span, t);
        o.el.style.opacity = a.toFixed(3);
        if (o.shift) o.el.style.transform = 'translate3d(0,' + ((1 - a) * 15).toFixed(1) + 'px,0)';
        o.el.style.pointerEvents = a < 0.05 ? 'none' : '';
      });
    };
    lifecycle.listen(window, 'scroll', apply, {
      passive: true,
    });
    lifecycle.listen(window, 'resize', apply, {
      passive: true,
    });
    apply();
  }
  function wireNav() {
    let last = 0;
    const rail = select('#rail');
    lifecycle.cleanup(() => rail.replaceChildren());
    const names = [
      'The Hidden Gate',
      'The Sanmon',
      'Still Gardens',
      'Sacred Craft',
      'Afterlight',
      'Colophon',
    ];
    sections.forEach((s, i) => {
      const b = document.createElement('button');
      b.innerHTML = '<i></i>';
      b.title = names[i] || '';
      b.setAttribute('aria-label', names[i] || 'section');
      lifecycle.listen(b, 'click', () =>
        scrollTo({
          top: anchors[i],
          behavior: reducedMotion ? 'auto' : 'smooth',
        }),
      );
      rail.appendChild(b);
    });
    const dots = selectAll('#rail button');
    const links = selectAll('.nav-link');
    const burger = select('.nav-burger');
    const closeMenu = () => {
      nav.classList.remove('menu-open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('nav-open');
    };
    const setMenu = (open) => {
      /* clear the scroll-hide before the sheet opens: leaving it set would ease
         the bar back down on close, promoting it again under the outgoing sheet */
      if (open) nav.classList.remove('hide');
      nav.classList.toggle('menu-open', open);
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('nav-open', open);
    };
    burger.setAttribute('aria-controls', 'navlinks');
    burger.setAttribute('aria-expanded', 'false');
    lifecycle.listen(burger, 'click', () => {
      if (viewportWidth() > 820) return;
      setMenu(!nav.classList.contains('menu-open'));
    });
    links.forEach((link) => lifecycle.listen(link, 'click', closeMenu));
    lifecycle.listen(window, 'keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
    lifecycle.listen(
      window,
      'resize',
      () => {
        if (viewportWidth() > 820) closeMenu();
      },
      {
        passive: true,
      },
    );
    /* Which chapter each link actually points at, read off its href. The old rule was positional — link i lit for section i+1 — which silently assumed one link per section in matching order. With five links over four chapters every entry past the third lit for its neighbour: standing in Afterlight highlighted Stories. */
    const linkSec = links.map((l) =>
      sections.indexOf(document.querySelector(l.getAttribute('href'))),
    );
    lifecycle.listen(
      window,
      'scroll',
      () => {
        const y = scrollY;
        nav.classList.toggle('stuck', y > 40);
        /* and don't even mark it hidden while the menu is open, or the class lands
         the moment the sheet closes and the bar blinks away under the thumb */
        nav.classList.toggle(
          'hide',
          !nav.classList.contains('menu-open') && y > last + 4 && y > viewportHeight() * 0.8,
        );
        last = y;
        const a = Math.round(progressFor(y));
        if (a !== activeSec) {
          activeSec = a;
          dots.forEach((d, i) => d.classList.toggle('on', i === a));
          links.forEach((l, i) => l.classList.toggle('on', linkSec[i] === a));
        }
      },
      {
        passive: true,
      },
    );
    selectAll('a[href^="#"]').forEach((a) =>
      lifecycle.listen(a, 'click', (e) => {
        const t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        scrollTo({
          top: a.getAttribute('href') === '#top' ? 0 : t.offsetTop - 40,
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
      }),
    );
  }
  function wireFocus() {
    const set = (i) => {
      runtime.rig.focus = i;
    };
    const targets = ['#gate', '#pathways', '#lessons', '#eternity'];
    selectAll('[data-chip]').forEach((el) => {
      lifecycle.listen(el, 'mouseenter', () => {
        set(+el.dataset.chip);
        selectAll('[data-chip]').forEach((o) => o.classList.toggle('on', o === el));
      });
      lifecycle.listen(el, 'mouseleave', () => {
        set(-1);
        el.classList.remove('on');
      });
      lifecycle.listen(el, 'click', () => {
        const idx = +el.dataset.chip;
        const target = document.querySelector(targets[idx]);
        if (target) {
          scrollTo({
            top: target.offsetTop - 40,
            behavior: reducedMotion ? 'auto' : 'smooth',
          });
        }
      });
    });
    selectAll('[data-les]').forEach((el) => {
      lifecycle.listen(el, 'mouseenter', () => set(+el.dataset.les % 4));
      lifecycle.listen(el, 'mouseleave', () => set(-1));
    });
  }
  function wireCursor() {
    const dot = select('#cursor');
    if (coarsePointer) {
      dot.style.display = 'none';
      return;
    }
    let x = viewportWidth() / 2,
      y = viewportHeight() / 2,
      tx2 = x,
      ty = y;
    let cursorPrev = performance.now();
    lifecycle.listen(
      window,
      'pointermove',
      (e) => {
        tx2 = e.clientX;
        ty = e.clientY;
        runtime.rig.tmx = (e.clientX / viewportWidth()) * 2 - 1;
        runtime.rig.tmy = -((e.clientY / viewportHeight()) * 2 - 1);
      },
      {
        passive: true,
      },
    );
    selectAll('[data-cursor]').forEach((el) => {
      lifecycle.listen(el, 'mouseenter', () => dot.classList.add('act'));
      lifecycle.listen(el, 'mouseleave', () => dot.classList.remove('act'));
    });
    (function tick() {
      const now = performance.now();
      const dt = Math.min((now - cursorPrev) / 1000, 0.05);
      cursorPrev = now;
      x = damp(x, tx2, 12, dt);
      y = damp(y, ty, 12, dt);
      dot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      lifecycle.frame(tick);
    })();
  }
  function makeGrain() {
    const S = 180,
      c = createCanvas(S, S),
      x = c.getContext('2d');
    const im = x.createImageData(S, S),
      d = im.data,
      r = mulberry32(9);
    for (let i = 0; i < S * S; i++) {
      const v = 110 + r() * 90;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
      d[i * 4 + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    const grainEl = select('#grain');
    if (!grainEl) {
      releaseCanvas(c);
      return;
    }
    if (c.toBlob) {
      c.toBlob((blob) => {
        if (lifecycle.disposed) {
          releaseCanvas(c);
          return;
        }
        if (blob) {
          const url = URL.createObjectURL(blob);
          grainEl.style.backgroundImage = 'url(' + url + ')';
          lifecycle.cleanup(() => URL.revokeObjectURL(url));
        } else {
          grainEl.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
        }
        releaseCanvas(c);
      }, 'image/png');
    } else {
      grainEl.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
      releaseCanvas(c);
    }
  }
  function wirePage() {
    sections = Array.from(document.querySelectorAll('[data-cam]'));
    nav = select('#nav');
    makeGrain();
    wireReveals();
    wireForegroundStages();
    wireNav();
    wireHeroExit();
    wireFocus();
    wireCursor();
  }
  return {
    wirePage,
    measure,
    progressFor,
    get sections() {
      return sections;
    },
    get anchors() {
      return anchors;
    },
  };
}
