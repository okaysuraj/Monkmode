import { lowQuality, selectAll, viewportWidth, viewportHeight } from './settings.js';
import * as THREE from 'three';
// Composites the HDR scene, bloom, film grain, and cached card viewports.

export function createPostProcessing(runtime) {
  const lifecycle = runtime.lifecycle;
  const QUAD_VS =
    'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }';
  function initPost() {
    runtime.post.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    runtime.post.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    runtime.post.quad.frustumCulled = false;
    runtime.post.qScene = new THREE.Scene();
    runtime.post.qScene.add(runtime.post.quad);
    runtime.post.up = new THREE.ShaderMaterial({
      uniforms: {
        tS: {
          value: null,
        },
        uAmt: {
          value: 1,
        },
      },
      vertexShader: QUAD_VS,
      fragmentShader:
        'uniform sampler2D tS; uniform float uAmt; varying vec2 vUv;\nvoid main(){ gl_FragColor = vec4(texture2D(tS,vUv).rgb*uAmt, 1.0); }',
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const w = runtime.renderer.domElement.width,
      h = runtime.renderer.domElement.height;
    const O = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    runtime.post.scene = new THREE.WebGLRenderTarget(
      w,
      h,
      Object.assign({}, O, {
        depthBuffer: true,
        samples: lowQuality ? 0 : 2,
      }),
    );
    let lw = Math.max(2, w >> 1),
      lh = Math.max(2, h >> 1);
    const N = 4;
    for (let i = 0; i < N; i++) {
      runtime.post.levels.push({
        a: new THREE.WebGLRenderTarget(lw, lh, O),
        b: new THREE.WebGLRenderTarget(lw, lh, O),
        w: lw,
        h: lh,
      });
      lw = Math.max(2, lw >> 1);
      lh = Math.max(2, lh >> 1);
    }
    runtime.post.bright = new THREE.ShaderMaterial({
      uniforms: {
        tS: {
          value: null,
        },
        uThr: {
          value: 0.86,
        },
        uKnee: {
          value: 0.5,
        },
      },
      vertexShader: QUAD_VS,
      fragmentShader:
        'uniform sampler2D tS; uniform float uThr; uniform float uKnee; varying vec2 vUv;\n' +
        'void main(){ vec3 c = texture2D(tS, vUv).rgb;\n' +
        ' float l = dot(c, vec3(0.2126,0.7152,0.0722));\n' +
        ' float k = smoothstep(uThr, uThr+uKnee, l);\n' +
        ' gl_FragColor = vec4(c*k, 1.0); }',
    });
    runtime.post.blur = new THREE.ShaderMaterial({
      uniforms: {
        tS: {
          value: null,
        },
        uDir: {
          value: new THREE.Vector2(1, 0),
        },
      },
      vertexShader: QUAD_VS,
      fragmentShader:
        'uniform sampler2D tS; uniform vec2 uDir; varying vec2 vUv;\n' +
        'void main(){ vec3 c = texture2D(tS, vUv).rgb * 0.2270270270;\n' +
        ' c += texture2D(tS, vUv + uDir*1.3846153846).rgb * 0.3162162162;\n' +
        ' c += texture2D(tS, vUv - uDir*1.3846153846).rgb * 0.3162162162;\n' +
        ' c += texture2D(tS, vUv + uDir*3.2307692308).rgb * 0.0702702703;\n' +
        ' c += texture2D(tS, vUv - uDir*3.2307692308).rgb * 0.0702702703;\n' +
        ' gl_FragColor = vec4(c, 1.0); }',
    });
    runtime.post.comp = new THREE.ShaderMaterial({
      uniforms: {
        tS: {
          value: null,
        },
        tB: {
          value: null,
        },
        uRes: {
          value: new THREE.Vector2(w, h),
        },
        uT: {
          value: 0,
        },
        uBloom: {
          value: 0.34,
        },
        uCA: {
          value: 1,
        },
        uGrain: {
          value: 0.02,
        },
        uVig: {
          value: 1,
        },
        uExp: {
          value: 0.62,
        },
        uFade: {
          value: 1,
        },
        uSat: {
          value: 1.05,
        },
      },
      vertexShader: QUAD_VS,
      fragmentShader:
        'uniform sampler2D tS; uniform sampler2D tB; uniform vec2 uRes;\n' +
        'uniform float uT, uBloom, uCA, uGrain, uVig, uExp, uFade, uSat;\n' +
        'varying vec2 vUv;\n' +
        'vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }\n' +
        'void main(){\n' +
        ' vec2 d = vUv - 0.5; float r2 = dot(d,d);\n' +
        ' float ca = uCA * (0.30 + r2*2.6) * 0.0013;\n' +
        ' vec3 c;\n' +
        ' c.r = texture2D(tS, vUv + d*ca).r;\n' +
        ' c.g = texture2D(tS, vUv).g;\n' +
        ' c.b = texture2D(tS, vUv - d*ca).b;\n' +
        ' c += texture2D(tB, vUv).rgb * uBloom;\n' +
        ' c *= uExp;\n' +
        ' c = aces(c);\n' +
        ' float l = dot(c, vec3(0.2126,0.7152,0.0722));\n' +
        ' c = mix(vec3(l), c, uSat);\n' +
        ' c = mix(c, c*vec3(0.74,1.03,1.11), smoothstep(0.55,0.0,l)*0.80);\n' /* teal shadows */ +
        ' c = mix(c, c*vec3(1.035,0.995,0.968), smoothstep(0.50,1.0,l)*0.26);\n' /* warm highs   */ +
        ' float v = smoothstep(1.22, 0.26, length(d*vec2(1.0,0.94))*1.42);\n' +
        ' c *= mix(1.0, v, uVig);\n' +
        ' float g = fract(sin(dot(vUv*uRes + uT*137.0, vec2(12.9898,78.233)))*43758.5453);\n' +
        ' c += (g-0.5)*uGrain;\n' +
        ' c *= uFade;\n' +
        ' vec3 e = pow(max(c,0.0), vec3(1.0/2.2));\n' +
        /* A touch of contrast, applied after the encode rather than before it:
       in linear the same curve mostly crushes the shadows, and this frame is
       nearly all shadow. Pivoted low, at 0.30, so it deepens the night
       without pulling the lit paper of the hall down with it. */
        ' e = clamp((e - 0.30) * 1.00 + 0.30, 0.0, 1.0);\n' +
        ' gl_FragColor = vec4( e, 1.0 );\n' +
        '}',
    });
  }
  function pass(mat, target, additive) {
    runtime.post.quad.material = mat;
    runtime.renderer.setRenderTarget(target || null);
    if (!additive) runtime.renderer.clear(true, false, false);
    runtime.renderer.render(runtime.post.qScene, runtime.post.cam);
  }
  function renderPost() {
    const L = runtime.post.levels;
    runtime.post.bright.uniforms.tS.value = runtime.post.scene.texture;
    pass(runtime.post.bright, L[0].a);
    for (let i = 0; i < L.length; i++) {
      if (i > 0) {
        runtime.post.up.blending = THREE.NoBlending;
        runtime.post.up.uniforms.uAmt.value = 1;
        runtime.post.up.uniforms.tS.value = L[i - 1].a;
        pass(runtime.post.up, L[i].a);
      }
      runtime.post.blur.uniforms.tS.value = L[i].a;
      runtime.post.blur.uniforms.uDir.value.set(1 / L[i].w, 0);
      pass(runtime.post.blur, L[i].b);
      runtime.post.blur.uniforms.tS.value = L[i].b;
      runtime.post.blur.uniforms.uDir.value.set(0, 1 / L[i].h);
      pass(runtime.post.blur, L[i].a);
    }
    runtime.post.up.blending = THREE.AdditiveBlending;
    runtime.post.up.uniforms.uAmt.value = 0.52;
    for (let i = L.length - 1; i > 0; i--) {
      runtime.post.up.uniforms.tS.value = L[i].a;
      pass(runtime.post.up, L[i - 1].a, true);
    }
    runtime.post.comp.uniforms.tS.value = runtime.post.scene.texture;
    runtime.post.comp.uniforms.tB.value = L[0].a;
    pass(runtime.post.comp, null);
  }
  function buildCards() {
    const defs = [
      {
        p: [-2.0, 1.6, -2.0],
        t: [0, 10.0, -34.0],
        fov: 40,
      } /* the long climb */,
      {
        p: [4.2, 2.9, -9.5],
        t: [6.4, 2.9, -14.4],
        fov: 40,
      } /* lantern court  */,
      {
        p: [3.4, 2.4, 2.0],
        t: [-1.0, -0.6, -6.0],
        fov: 40,
      } /* the wet court  */,
      {
        p: [0.6, 3.4, -12.0],
        t: [0, 12.0, -40.0],
        fov: 26,
      } /* hero window    */,
    ];
    selectAll('[data-view]').forEach((el) => {
      const d = defs[+el.dataset.view];
      if (!d) return;
      const c = new THREE.PerspectiveCamera(d.fov, 4 / 5, 0.3, 200);
      c.position.set(d.p[0], d.p[1], d.p[2]);
      c.lookAt(d.t[0], d.t[1], d.t[2]);
      c.layers.set(0);
      c.userData = {
        home: c.position.clone(),
        look: new THREE.Vector3(d.t[0], d.t[1], d.t[2]),
        push: 0,
        want: 0,
      };
      runtime.cards.push({
        cam: c,
        el: el.querySelector('[data-frame]') || el,
        rect: null,
      });
      lifecycle.listen(el, 'mouseenter', () => (c.userData.want = 1));
      lifecycle.listen(el, 'mouseleave', () => (c.userData.want = 0));
    });
  }
  /* A render target keeps its own viewport/scissor — renderer.setScissor()
     only ever reaches the default framebuffer, so the region has to be set on
     whichever surface we are actually drawing into, and re-bound to take. */
  const _push = new THREE.Vector3();
  function setRegion(rt, x, y, w, h) {
    if (rt) {
      const pr = runtime.renderer.getPixelRatio();
      rt.viewport.set(x * pr, y * pr, w * pr, h * pr);
      rt.scissor.set(x * pr, y * pr, w * pr, h * pr);
      rt.scissorTest = true;
      runtime.renderer.setRenderTarget(rt);
    } else {
      runtime.renderer.setViewport(x, y, w, h);
      runtime.renderer.setScissor(x, y, w, h);
      runtime.renderer.setScissorTest(true);
    }
  }
  function clearRegion(rt) {
    if (rt) {
      rt.viewport.set(0, 0, rt.width, rt.height);
      rt.scissor.set(0, 0, rt.width, rt.height);
      rt.scissorTest = false;
      runtime.renderer.setRenderTarget(rt);
    } else {
      runtime.renderer.setScissorTest(false);
      runtime.renderer.setViewport(0, 0, viewportWidth(), viewportHeight());
      runtime.renderer.setScissor(0, 0, viewportWidth(), viewportHeight());
    }
  }
  function cardBuffer(C, w, h) {
    const pr = Math.min(runtime.renderer.getPixelRatio(), 2);
    const W = Math.max(8, Math.round(w * pr)),
      H = Math.max(8, Math.round(h * pr));
    if (C.rt && C.rt.width === W && C.rt.height === H) return C.rt;
    if (C.rt) C.rt.dispose();
    C.rt = new THREE.WebGLRenderTarget(W, H, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.HalfFloatType,
      depthBuffer: true,
      stencilBuffer: false,
    });
    C.dirty = true;
    return C.rt;
  }
  function aimCard(C, aspect) {
    const c = C.cam,
      u = c.userData;
    c.aspect = aspect;
    c.updateProjectionMatrix();
    _push.subVectors(u.look, u.home).normalize();
    c.position.copy(u.home).addScaledVector(_push, u.push * 0.55);
    c.lookAt(u.look);
  }
  /* Each viewport keeps its own buffer and only re-renders when it is moving
     or when its slot in the refresh rota comes round — the views are static,
     so paying for four scene traversals every frame buys nothing. */
  /* The blit lands in the composite at the element's screen rect, and the canvas knows nothing about the DOM stacked over it — so a card the page has faded goes on painting a live view into the frame with no card around it, which is what put a second lit hall in the corner once the hero exit started dimming the preview. */
  function cardAlpha(el) {
    let a = 1;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden') return 0;
      a *= +s.opacity;
      if (a < 0.001) return 0;
    }
    return a;
  }
  function renderCards(rt) {
    if (!runtime.cards.length) return;
    let drew = false;
    for (let i = 0; i < runtime.cards.length; i++) {
      const C = runtime.cards[i],
        r = C.el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > viewportHeight() + 40 || r.width < 4) continue;
      if (cardAlpha(C.el) < 0.995) continue;
      /* a card carrying cloth has no background left of its own, so the blit
         would show through the fabric's rounded corners and past its edges */
      if (C.el.classList.contains('on-cloth')) continue;
      const buf = cardBuffer(C, r.width, r.height);
      const u = C.cam.userData;
      if (
        C.dirty ||
        Math.abs(u.push - u.want) > 0.002 ||
        (runtime.frameNumber + i * 7) % 24 === 0
      ) {
        aimCard(C, r.width / r.height);
        runtime.renderer.setRenderTarget(buf);
        runtime.renderer.clear(true, true, false);
        runtime.renderer.render(runtime.scene, C.cam);
        C.dirty = false;
      }
      setRegion(rt, r.left, viewportHeight() - r.bottom, r.width, r.height);
      runtime.post.up.blending = THREE.NoBlending;
      runtime.post.up.uniforms.uAmt.value = 1;
      runtime.post.up.uniforms.tS.value = buf.texture;
      pass(runtime.post.up, rt);
      drew = true;
    }
    if (drew) clearRegion(rt);
  }
  return {
    initPost,
    renderPost,
    buildCards,
    renderCards,
  };
}
