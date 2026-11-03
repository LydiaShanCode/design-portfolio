import { useEffect, useRef } from 'react'

// Heightfield runs on the CPU (two wave steps a frame) and is shaded on the GPU.
// Avoids float render targets, so the pond doesn't depend on color-buffer extensions.

const VERT = `#version 300 es
void main() {
  int id = gl_VertexID;
  vec2 p = vec2(float((id << 1) & 2), float(id & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;

uniform sampler2D uHeight;
uniform vec2 uSimSize;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uActive;
uniform float uTime;

out vec4 fragColor;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p * 2.02;
    a *= 0.5;
  }
  return v;
}

float sampleHeight(vec2 cell) {
  return texture(uHeight, (cell + 0.5) / uSimSize).r;
}

float heightAt(vec2 uv) {
  vec2 p = uv * uSimSize - 0.5;
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float h00 = sampleHeight(i);
  float h10 = sampleHeight(i + vec2(1.0, 0.0));
  float h01 = sampleHeight(i + vec2(0.0, 1.0));
  float h11 = sampleHeight(i + vec2(1.0, 1.0));
  return mix(mix(h00, h10, f.x), mix(h01, h11, f.x), f.y);
}

void main() {
  float dist = distance(gl_FragCoord.xy, uPointer);
  float hover = (1.0 - smoothstep(uRadius * 0.28, uRadius, dist)) * uActive;
  if (hover <= 0.001) {
    fragColor = vec4(0.0);
    return;
  }

  vec2 uv = gl_FragCoord.xy / uResolution;
  float h = heightAt(uv);
  vec2 cell = vec2(1.0 / uSimSize.x, 1.0 / uSimSize.y);
  float hx = heightAt(uv + vec2(cell.x, 0.0));
  float hy = heightAt(uv + vec2(0.0, cell.y));
  vec3 normal = normalize(vec3((h - hx) * 3.2, (h - hy) * 3.2, 1.0));

  vec2 flow = vec2(uTime * 0.02, uTime * 0.015);
  vec2 refr = uv + normal.xy * 0.16;
  float fine = fbm(refr * 10.0 + flow);

  float around = heightAt(uv + vec2(cell.x * 3.0, 0.0))
    + heightAt(uv - vec2(cell.x * 3.0, 0.0))
    + heightAt(uv + vec2(0.0, cell.y * 3.0))
    + heightAt(uv - vec2(0.0, cell.y * 3.0));
  float ridge = h - around * 0.25;
  float crest = smoothstep(0.008, 0.04, ridge);

  vec3 blue = vec3(0.0, 0.114, 0.851);
  vec3 color = mix(vec3(0.42, 0.58, 1.0), blue, 0.4 + crest * 0.6);
  float alpha = hover * (smoothstep(0.18, 0.62, fine) * 0.55 + crest * 0.9);
  fragColor = vec4(color, alpha);
}
`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function PondCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    })
    if (!gl) return undefined

    const vert = compile(gl, gl.VERTEX_SHADER, VERT)
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vert || !frag) return undefined

    const program = gl.createProgram()
    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      return undefined
    }

    const loc = {
      height: gl.getUniformLocation(program, 'uHeight'),
      simSize: gl.getUniformLocation(program, 'uSimSize'),
      resolution: gl.getUniformLocation(program, 'uResolution'),
      pointer: gl.getUniformLocation(program, 'uPointer'),
      radius: gl.getUniformLocation(program, 'uRadius'),
      active: gl.getUniformLocation(program, 'uActive'),
      time: gl.getUniformLocation(program, 'uTime'),
    }

    const heightTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, heightTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.useProgram(program)
    gl.uniform1i(loc.height, 0)
    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    let simW = 0
    let simH = 0
    let curr = new Float32Array(0)
    let prev = new Float32Array(0)
    let next = new Float32Array(0)
    let disposed = false
    let raf = 0
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduce = motionQuery.matches
    const started = performance.now()
    let pointer = null
    let cursorPx = null

    const disturb = (sx, sy, radius, strength) => {
      const r2 = radius * radius
      const x0 = Math.max(1, Math.floor(sx - radius))
      const x1 = Math.min(simW - 2, Math.ceil(sx + radius))
      const y0 = Math.max(1, Math.floor(sy - radius))
      const y1 = Math.min(simH - 2, Math.ceil(sy + radius))
      for (let y = y0; y <= y1; y++) {
        const row = y * simW
        for (let x = x0; x <= x1; x++) {
          const dx = x - sx
          const dy = y - sy
          const d2 = dx * dx + dy * dy
          if (d2 > r2) continue
          const i = row + x
          const added = curr[i] + Math.exp(-d2 / (r2 * 0.32)) * strength
          curr[i] = added < -1 ? -1 : added > 1 ? 1 : added
        }
      }
    }

    const step = () => {
      const w = simW
      const h = simH
      for (let y = 1; y < h - 1; y++) {
        const row = y * w
        for (let x = 1; x < w - 1; x++) {
          const i = row + x
      const n = (curr[i - 1] + curr[i + 1] + curr[i - w] + curr[i + w]) * 0.5 - prev[i]
      next[i] = n * 0.995
        }
      }
      const swap = prev
      prev = curr
      curr = next
      next = swap
    }

    const alloc = (w, h) => {
      simW = w
      simH = h
      const n = w * h
      curr = new Float32Array(n)
      prev = new Float32Array(n)
      next = new Float32Array(n)
      gl.bindTexture(gl.TEXTURE_2D, heightTex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, w, h, 0, gl.RED, gl.FLOAT, curr)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const width = Math.max(1, Math.floor(window.innerWidth * dpr))
      const height = Math.max(1, Math.floor(window.innerHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
      const nextW = 520
      const nextH = Math.max(96, Math.round(nextW * (window.innerHeight / Math.max(window.innerWidth, 1))))
      if (Math.abs(nextW - simW) > 4 || Math.abs(nextH - simH) > 4) alloc(nextW, nextH)
    }

    const draw = (now) => {
      gl.useProgram(program)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, heightTex)
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, simW, simH, gl.RED, gl.FLOAT, curr)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(loc.simSize, simW, simH)
      gl.uniform2f(loc.resolution, canvas.width, canvas.height)
      gl.uniform2f(loc.pointer, cursorPx ? cursorPx[0] : 0, cursorPx ? cursorPx[1] : 0)
      gl.uniform1f(loc.radius, 220 * (canvas.width / Math.max(window.innerWidth, 1)))
      gl.uniform1f(loc.active, cursorPx ? 1 : 0)
      gl.uniform1f(loc.time, reduce ? 0 : (now - started) * 0.001)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const toSim = (clientX, clientY) => [
      (clientX / Math.max(window.innerWidth, 1)) * simW,
      (1 - clientY / Math.max(window.innerHeight, 1)) * simH,
    ]

    const placeCursor = (event) => {
      const scaleX = canvas.width / Math.max(window.innerWidth, 1)
      const scaleY = canvas.height / Math.max(window.innerHeight, 1)
      cursorPx = [event.clientX * scaleX, (window.innerHeight - event.clientY) * scaleY]
    }

    const onPointer = (event) => {
      placeCursor(event)
      if (reduce || disposed) return
      const [x, y] = toSim(event.clientX, event.clientY)
      const pressing = event.buttons > 0 || event.type === 'pointerdown'
      if (event.type === 'pointerdown') disturb(x, y, 14, 0.2)
      if (!pointer) {
        pointer = [x, y]
        return
      }
      const dx = x - pointer[0]
      const dy = y - pointer[1]
      const dist = Math.hypot(dx, dy)
      if (dist < (pressing ? 1.4 : 5)) return
      const steps = Math.min(10, Math.ceil(dist / (pressing ? 4 : 8)))
      const radius = pressing ? 9 : 7
      const strength = pressing ? 0.05 : 0.03
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        disturb(pointer[0] + dx * t, pointer[1] + dy * t, radius, strength)
      }
      pointer = [x, y]
    }

    const frame = (now) => {
      raf = 0
      if (disposed) return
      if (reduce || document.hidden) {
        if (!document.hidden) draw(now)
        return
      }
      step()
      step()
      draw(now)
      raf = requestAnimationFrame(frame)
    }

    const kick = () => {
      if (raf || disposed || reduce || document.hidden) return
      raf = requestAnimationFrame(frame)
    }

    const onMotion = () => {
      reduce = motionQuery.matches
      kick()
    }

    const onVisibility = () => kick()

    resize()
    if (reduce) draw(performance.now())
    else kick()

    const onLeave = () => {
      cursorPx = null
    }

    window.addEventListener('resize', resize)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('pointermove', onPointer)
    window.addEventListener('pointerleave', onLeave)
    motionQuery.addEventListener('change', onMotion)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerleave', onLeave)
      motionQuery.removeEventListener('change', onMotion)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteTexture(heightTex)
      gl.deleteProgram(program)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
    }
  }, [])

  return <canvas ref={canvasRef} className="pond-canvas" aria-hidden="true" />
}

export default PondCanvas
