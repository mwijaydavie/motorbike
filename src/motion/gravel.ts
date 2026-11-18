import type { gsap as GSAP } from 'gsap';
import { gsap } from 'gsap/gsap-core';

export type ShiftDirection = -1 | 1;
export interface GravelShift {
  play: (from: HTMLImageElement, to: HTMLImageElement, direction: ShiftDirection, signal: AbortSignal) => Promise<boolean>;
  dispose: () => void;
}

const vertex = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

// The noisy leading edge is dragged along a diagonal like grit thrown up by
// a tire. Away from that edge the original photographs remain untouched.
const fragment = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif
  varying vec2 vUv;
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform vec4 uFromCrop;
  uniform vec4 uToCrop;
  uniform float uProgress;
  uniform float uDirection;
  uniform float uAspect;

  float grain(vec2 cell) {
    vec3 p = fract(vec3(cell.xyx) * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  float haze(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    vec2 w = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(grain(cell), grain(cell + vec2(1.0, 0.0)), w.x),
      mix(grain(cell + vec2(0.0, 1.0)), grain(cell + 1.0), w.x), w.y
    );
  }
  vec2 cover(vec2 uv, vec4 crop) {
    return clamp(uv, 0.0, 1.0) * crop.xy + crop.zw;
  }

  void main() {
    vec2 terrain = vUv * vec2(uAspect, 1.0);
    vec2 wind = vec2(uDirection * uProgress * 1.2, -uProgress * 0.25);
    float side = uDirection > 0.0 ? 1.0 - vUv.x : vUv.x;
    float ridge = (haze((terrain + wind * 0.28) * vec2(5.0, 9.0)) - 0.5) * 0.29;
    float edge = mix(-0.38, 1.38, uProgress) - side + (vUv.y - 0.5) * 0.21 + ridge;
    if (edge < -0.19) {
      gl_FragColor = texture2D(uFrom, cover(vUv, uFromCrop));
    } else if (edge > 0.19) {
      gl_FragColor = texture2D(uTo, cover(vUv, uToCrop));
    } else {
      float band = 1.0 - smoothstep(0.01, 0.19, abs(edge));
      float cloud = haze((terrain + wind) * vec2(12.0, 38.0));
      float grit = grain(floor((terrain + wind * 0.36) * vec2(235.0, 240.0)));
      float reveal = smoothstep(-0.055, 0.078, edge + (grit - 0.5) * 0.062 * band);
      vec2 smear = vec2(-uDirection * 0.066 / max(uAspect, 0.7), (cloud - 0.5) * 0.034) * band;
      vec3 before = texture2D(uFrom, cover(vUv + smear, uFromCrop)).rgb;
      vec3 after = texture2D(uTo, cover(vUv - smear * 0.6, uToCrop)).rgb;
      vec3 color = mix(before, after, reveal);
      float dust = band * (0.2 + 0.43 * cloud) * (1.0 - 0.48 * vUv.y);
      vec3 dustColor = mix(vec3(0.28, 0.23, 0.16), vec3(0.72, 0.62, 0.44), cloud);
      color = mix(color, dustColor, dust);
      color += vec3(0.27, 0.21, 0.13) * smoothstep(0.93, 1.0, grit) * band * cloud;
      gl_FragColor = vec4(color, 1.0);
    }
  }
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGLRenderingContext) {
  const v = compile(gl, gl.VERTEX_SHADER, vertex);
  const f = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = v && f ? gl.createProgram() : null;
  if (program && v && f) {
    gl.attachShader(program, v);
    gl.attachShader(program, f);
    gl.linkProgram(program);
  }
  if (v) gl.deleteShader(v);
  if (f) gl.deleteShader(f);
  if (program && gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  if (program) gl.deleteProgram(program);
  return null;
}

function upload(gl: WebGLRenderingContext, image: HTMLImageElement, unit: number) {
  const texture = gl.createTexture();
  if (!texture) return null;
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  } catch {
    gl.deleteTexture(texture);
    return null;
  }
}

// Match the DOM's object-fit: cover and percent-based object-position so the
// canvas can take over, then hand back to the picture without a crop jump.
function coverCrop(image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const w = width / (scale * image.naturalWidth);
  const h = height / (scale * image.naturalHeight);
  const offsets = getComputedStyle(image).objectPosition.split(/\s+/).map(value => value.endsWith('%') ? parseFloat(value) / 100 : 0.5);
  return [w, h, (1 - w) * (offsets[0] ?? 0.5), (1 - h) * (1 - (offsets[1] ?? 0.5))];
}

export function createGravelShift(canvas: HTMLCanvasElement): GravelShift | null {
  const context = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power',
  });
  if (!context) return null;
  const gl = context;
  const program = createProgram(gl);
  if (!program) return null;
  const triangle = gl.createBuffer();
  const position = gl.getAttribLocation(program, 'aPosition');
  if (!triangle || position < 0) {
    if (triangle) gl.deleteBuffer(triangle);
    gl.deleteProgram(program);
    return null;
  }
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    from: uniform('uFrom'), to: uniform('uTo'), fromCrop: uniform('uFromCrop'), toCrop: uniform('uToCrop'),
    progress: uniform('uProgress'), direction: uniform('uDirection'), aspect: uniform('uAspect'),
  };
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  let stopActive: (() => void) | undefined;

  return {
    play(from, to, direction, signal) {
      stopActive?.();
      return new Promise<boolean>(resolve => {
        const { width, height } = canvas.getBoundingClientRect();
        if (signal.aborted || gl.isContextLost() || width < 1 || height < 1) return resolve(false);
        const dpr = Math.min(window.devicePixelRatio, 1.25, Math.sqrt(1_350_000 / (width * height)));
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(position);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        const first = upload(gl, from, 0);
        const second = upload(gl, to, 1);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let tween: ReturnType<typeof GSAP.to> | undefined;
        let settled = false;

        function finish(played: boolean) {
          if (settled) return;
          settled = true;
          stopActive = undefined;
          if (!played) {
            tween?.kill();
            canvas.removeAttribute('data-running');
          }
          signal.removeEventListener('abort', stop);
          window.removeEventListener('resize', stop);
          document.removeEventListener('visibilitychange', onVisibility);
          canvas.removeEventListener('webglcontextlost', stop);
          reducedMotion.removeEventListener('change', stop);
          if (first) gl.deleteTexture(first);
          if (second) gl.deleteTexture(second);
          resolve(played);
        }
        function stop() { finish(false); }
        function onVisibility() { if (document.hidden) stop(); }
        if (!first || !second || gl.getError() !== gl.NO_ERROR) return stop();
        gl.uniform1i(uniforms.from, 0);
        gl.uniform1i(uniforms.to, 1);
        gl.uniform4fv(uniforms.fromCrop, coverCrop(from, width, height));
        gl.uniform4fv(uniforms.toCrop, coverCrop(to, width, height));
        gl.uniform1f(uniforms.direction, direction);
        gl.uniform1f(uniforms.aspect, width / height);
        const phase = { progress: 0 };
        function draw() {
          if (gl.isContextLost()) return stop();
          gl.uniform1f(uniforms.progress, phase.progress);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        stopActive = stop;
        signal.addEventListener('abort', stop, { once: true });
        window.addEventListener('resize', stop, { once: true });
        document.addEventListener('visibilitychange', onVisibility);
        canvas.addEventListener('webglcontextlost', stop, { once: true });
        reducedMotion.addEventListener('change', stop, { once: true });
        draw();
        if (settled || gl.getError() !== gl.NO_ERROR) return stop();
        canvas.dataset.running = '';
        tween = gsap.to(phase, { progress: 1, duration: 0.94, ease: 'power2.inOut', onUpdate: draw, onComplete: () => finish(true) });
      });
    },
    dispose() {
      stopActive?.();
      gl.deleteBuffer(triangle);
      gl.deleteProgram(program);
      canvas.width = canvas.height = 1;
    },
  };
}
