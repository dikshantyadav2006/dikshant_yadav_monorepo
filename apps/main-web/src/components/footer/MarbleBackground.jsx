import { useRef, useEffect, useMemo } from 'react';

/* ─── GLSL Sources ─────────────────────────────────────────────────── */

const QUAD_VS = `
attribute vec2 aPosition;
varying vec2 vUv;
void main(){
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const DROP_FS = `
precision highp float;
varying vec2 vUv;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;
void main(){
  vec2 d = vUv - uCenter;
  float dist = dot(d, d);
  float drop = uStrength * exp(-dist / (uRadius * uRadius));
  gl_FragColor = vec4(drop, drop, 0.0, 1.0);
}`;

const RIPPLE_FS = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uTexelSize;
void main(){
  float hL = texture2D(uTexture, vUv - vec2(uTexelSize.x, 0.0)).r;
  float hR = texture2D(uTexture, vUv + vec2(uTexelSize.x, 0.0)).r;
  float hB = texture2D(uTexture, vUv - vec2(0.0, uTexelSize.y)).r;
  float hT = texture2D(uTexture, vUv + vec2(0.0, uTexelSize.y)).r;
  vec4 c = texture2D(uTexture, vUv);
  float h  = c.r;
  float v  = c.g;
  float lap = hL + hR + hB + hT - 4.0 * h;
  v += lap * 0.5;
  v *= 0.985;
  h += v;
  gl_FragColor = vec4(h, v, 0.0, 1.0);
}`;

const DISPLAY_FS = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uRipple;
uniform vec2 uTexelSize;
uniform float uTime;
uniform float uDark;

// ── simplex noise ──
vec3 mod289(vec3 x){return x - floor(x/289.0)*289.0;}
vec2 mod289(vec2 x){return x - floor(x/289.0)*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m; m=m*m;
  vec3 x2=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x2)-0.5;
  vec3 ox=floor(x2+0.5);
  vec3 a0=x2-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

float fbm(vec2 p){
  float v=0.0; float a=0.5;
  vec2 shift=vec2(100.0);
  mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
  for(int i=0;i<4;i++){v+=a*snoise(p);p=rot*p*2.0+shift;a*=0.5;}
  return v;
}

void main(){
  // sample ripple height field
  float hL=texture2D(uRipple,vUv-vec2(uTexelSize.x,0.0)).r;
  float hR=texture2D(uRipple,vUv+vec2(uTexelSize.x,0.0)).r;
  float hB=texture2D(uRipple,vUv-vec2(0.0,uTexelSize.y)).r;
  float hT=texture2D(uRipple,vUv+vec2(0.0,uTexelSize.y)).r;
  float hC=texture2D(uRipple,vUv).r;

  // subtle surface normal from height gradient
  vec3 normal = normalize(vec3(
    (hL - hR) * 2.4,
    (hB - hT) * 2.4,
    1.0
  ));

  // small refraction — the ripple gently warps the marble UVs
  vec2 uv = vUv + normal.xy * 0.05;

  // low-contrast marble, close to each footer background
  float t = uTime * 0.04;
  float m = fbm(uv * 3.0 + vec2(t));
  float veining = smoothstep(0.15, 0.5, m);
  float flow = smoothstep(-0.2, 0.4, m);

  // DARK #121315: near-black stone, faint lighter veins
  vec3 darkStone = vec3(0.070, 0.074, 0.080);
  vec3 darkVein  = vec3(0.16, 0.17, 0.19);
  // LIGHT #EEF4F4: near-white stone, faint darker veins
  vec3 lightStone = vec3(0.933, 0.958, 0.958);
  vec3 lightVein  = vec3(0.76, 0.79, 0.79);

  vec3 darkColor = mix(darkStone, darkVein, veining);
  vec3 lightColor = mix(lightStone, lightVein, veining);
  vec3 baseColor = mix(lightColor, darkColor, uDark);

  // soft specular to give the liquid surface a hint of gloss
  vec3 lightDir = normalize(vec3(-0.4, 0.4, 0.9));
  float spec = pow(max(dot(normal, lightDir), 0.0), 48.0) * 0.10;

  vec3 finalColor = baseColor + spec;

  gl_FragColor = vec4(finalColor, flow * 0.28 + veining * 0.5);
}`;

/* ─── WebGL Helpers ────────────────────────────────────────────────── */

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

function createFBO(gl, w, h, texType) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, texType, null);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { texture: tex, fbo, width: w, height: h };
}

function destroyFBO(gl, fbo) {
  if (!fbo) return;
  gl.deleteTexture(fbo.texture);
  gl.deleteFramebuffer(fbo.fbo);
}

/* ─── Component ────────────────────────────────────────────────────── */

const MarbleBackground = ({ isDarkMode = false }) => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return undefined;

    /* ── Sizing ── */
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const isMobile = window.innerWidth < 768;
    const SIM_SIZE = isMobile ? 192 : 384;

    function resizeCanvas() {
      const rect = wrapper.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }
    resizeCanvas();

    /* ── GL Context ── */
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return undefined;

    // Extensions — try to get renderable half-float for ripple precision.
    // Fall back to unsigned byte if not renderable.
    const halfFloatExt = gl.getExtension('OES_texture_half_float');
    const halfFloatRender = gl.getExtension('EXT_color_buffer_half_float');
    const halfFloatLinear = gl.getExtension('OES_texture_half_float_linear');
    const useHalfFloat = !!(halfFloatExt && halfFloatRender);
    const texType = useHalfFloat ? halfFloatExt.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;

    /* ── Programs ── */
    const dropProg = createProgram(gl, QUAD_VS, DROP_FS);
    const rippleProg = createProgram(gl, QUAD_VS, RIPPLE_FS);
    const displayProg = createProgram(gl, QUAD_VS, DISPLAY_FS);
    if (!dropProg || !rippleProg || !displayProg) return undefined;

    /* ── Quad geometry ── */
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    function bindQuad(prog) {
      gl.useProgram(prog);
      const loc = gl.getAttribLocation(prog, 'aPosition');
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    /* ── FBOs ── */
    let fboA = createFBO(gl, SIM_SIZE, SIM_SIZE, texType);
    let fboB = createFBO(gl, SIM_SIZE, SIM_SIZE, texType);

    // Sanity check: ensure FBOs are complete. If half-float isn't renderable,
    // destroy and recreate with unsigned byte.
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboA.fbo);
    const fboStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (useHalfFloat && fboStatus !== gl.FRAMEBUFFER_COMPLETE) {
      destroyFBO(gl, fboA);
      destroyFBO(gl, fboB);
      fboA = createFBO(gl, SIM_SIZE, SIM_SIZE, gl.UNSIGNED_BYTE);
      fboB = createFBO(gl, SIM_SIZE, SIM_SIZE, gl.UNSIGNED_BYTE);
    }

    // Clear both
    [fboA, fboB].forEach(f => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, f.fbo);
      gl.viewport(0, 0, SIM_SIZE, SIM_SIZE);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const texelSize = [1.0 / SIM_SIZE, 1.0 / SIM_SIZE];

    /* ── Pointer state ── */
    const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, vx: 0, vy: 0, active: false };
    let hasDrop = false;
    let dropData = { cx: 0.5, cy: 0.5, r: 0.015, s: 0.0 };

    function onPointerMove(e) {
      const rect = wrapper.getBoundingClientRect();
      // Ignore pointer events that are outside the footer area
      if (e.clientX < rect.left || e.clientX > rect.right ||
          e.clientY < rect.top || e.clientY > rect.bottom) return;

      const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const ny = Math.max(0, Math.min(1, 1.0 - (e.clientY - rect.top) / rect.height));

      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x = nx;
      pointer.y = ny;

      const dx = nx - pointer.px;
      const dy = ny - pointer.py;
      const speed = Math.sqrt(dx * dx + dy * dy);

      pointer.vx = dx;
      pointer.vy = dy;
      pointer.active = true;

      if (speed > 0.0025 && !reducedMotion) {
        const strength = Math.min(speed * 6.0, 1.0);
        dropData = {
          cx: nx,
          cy: ny,
          r: 0.03 + speed * 0.02,
          s: 0.14 + strength * 0.15,
        };
        hasDrop = true;
      }
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    // Listen on window — the wrapper/canvas are pointer-events:none, so we
    // capture globally and gate by the footer's bounding rect.
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerLeave, { passive: true });

    /* ── Simulation loop ── */
    let running = true;
    let lastFrame = performance.now();
    const FRAME_BUDGET = 1000 / 30; // cap sim at 30fps for perf
    let currentFBO = fboA;

    function renderDrop() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, currentFBO.fbo);
      gl.viewport(0, 0, SIM_SIZE, SIM_SIZE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);

      bindQuad(dropProg);
      gl.uniform2f(gl.getUniformLocation(dropProg, 'uCenter'), dropData.cx, dropData.cy);
      gl.uniform1f(gl.getUniformLocation(dropProg, 'uRadius'), dropData.r);
      gl.uniform1f(gl.getUniformLocation(dropProg, 'uStrength'), dropData.s);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.disable(gl.BLEND);
      hasDrop = false;
    }

    function renderRipple(src, dst) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
      gl.viewport(0, 0, SIM_SIZE, SIM_SIZE);

      bindQuad(rippleProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.texture);
      gl.uniform1i(gl.getUniformLocation(rippleProg, 'uTexture'), 0);
      gl.uniform2f(gl.getUniformLocation(rippleProg, 'uTexelSize'), texelSize[0], texelSize[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function renderDisplay() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);

      bindQuad(displayProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, currentFBO.texture);
      gl.uniform1i(gl.getUniformLocation(displayProg, 'uRipple'), 0);
      gl.uniform2f(gl.getUniformLocation(displayProg, 'uTexelSize'), texelSize[0], texelSize[1]);
      gl.uniform1f(gl.getUniformLocation(displayProg, 'uTime'), performance.now() * 0.001);
      gl.uniform1f(gl.getUniformLocation(displayProg, 'uDark'), isDarkMode ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function tick(now) {
      if (!running) return;
      rafRef.current = requestAnimationFrame(tick);

      const elapsed = now - lastFrame;
      if (elapsed < FRAME_BUDGET) return;
      lastFrame = now - (elapsed % FRAME_BUDGET);

      if (reducedMotion) {
        // Static marble render (no ripple simulation)
        renderDisplay();
        return;
      }

      // 1. Drop splat
      if (hasDrop) renderDrop();

      // 2. Ripple propagation × 2
      const nextA = currentFBO === fboA ? fboB : fboA;
      const nextB = currentFBO === fboA ? fboA : fboB;
      renderRipple(currentFBO, nextA);
      renderRipple(nextA, nextB);
      currentFBO = nextB;

      // 3. Composite
      renderDisplay();
    }

    rafRef.current = requestAnimationFrame(tick);

    /* ── Resize observer ── */
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(wrapper);

    /* ── Cleanup ── */
    stateRef.current = { gl, dropProg, rippleProg, displayProg, quadBuf, fboA, fboB };

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerLeave);
      ro.disconnect();

      // Delete everything
      destroyFBO(gl, fboA);
      destroyFBO(gl, fboB);
      gl.deleteBuffer(quadBuf);
      gl.deleteProgram(dropProg);
      gl.deleteProgram(rippleProg);
      gl.deleteProgram(displayProg);
      stateRef.current = null;
    };
  }, [isDarkMode, reducedMotion]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 select-none overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};

export default MarbleBackground;
