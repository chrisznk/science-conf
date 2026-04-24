'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'

const PLANETS = {
  mars: { name: 'Mars', subtitle: 'La planète rouge', texture: '/mars_map.jpg', data: [{ v: '6 779', l: 'km diamètre' }, { v: '227,9', l: 'millions km' }, { v: '687', l: 'jours / orbite' }] },
  earth: { name: 'Terre', subtitle: 'Notre vaisseau spatial', texture: '/earth_map.jpg', data: [{ v: '12 742', l: 'km diamètre' }, { v: '149,6', l: 'millions km' }, { v: '365,25', l: 'jours / orbite' }] },
  jupiter: { name: 'Jupiter', subtitle: 'La géante gazeuse', texture: '/jupiter_map.jpg', data: [{ v: '139 820', l: 'km diamètre' }, { v: '778,5', l: 'millions km' }, { v: '4 333', l: 'jours / orbite' }] },
  saturn: { name: 'Saturne', subtitle: 'Le seigneur des anneaux', texture: '/saturn_map.jpg', data: [{ v: '116 460', l: 'km diamètre' }, { v: '1 434', l: 'millions km' }, { v: '10 759', l: 'jours / orbite' }] },
  moon: { name: 'Lune', subtitle: 'Notre satellite naturel', texture: '/moon_map.jpg', data: [{ v: '3 474', l: 'km diamètre' }, { v: '384 400', l: 'km distance' }, { v: '27,3', l: 'jours / orbite' }] },
  sun: { name: 'Soleil', subtitle: 'Notre étoile', texture: '/sun_map.jpg', data: [{ v: '1 392 700', l: 'km diamètre' }, { v: '0', l: 'km distance' }, { v: '—', l: 'centre du système' }] },
  venus: { name: 'Vénus', subtitle: 'L\'étoile du berger', texture: '/venus_map.jpg', data: [{ v: '12 104', l: 'km diamètre' }, { v: '108,2', l: 'millions km' }, { v: '225', l: 'jours / orbite' }] },
  neptune: { name: 'Neptune', subtitle: 'La géante de glace', texture: '/neptune_map.jpg', data: [{ v: '49 528', l: 'km diamètre' }, { v: '4 495', l: 'millions km' }, { v: '60 190', l: 'jours / orbite' }] },
  milkyway: { name: 'Voie Lactée', subtitle: 'Notre galaxie', texture: '/galaxy_map.jpg', isDisc: true, data: [{ v: '100 000', l: 'années-lumière' }, { v: '200–400', l: 'milliards d\'étoiles' }, { v: '13,6', l: 'milliards d\'années' }] },
}

export default function PlanetView() {
  const scene = useStore((s) => s.scene)
  const planetKey = scene?.params?.planet || 'mars'
  const planet = PLANETS[planetKey] || PLANETS.mars

  const canvasRef = useRef(null)
  const initRx = planet.isDisc ? 0.8 : 0.3
  const stateRef = useRef({ rx: initRx, ry: 0, zoom: 6, dragging: false, lx: 0, ly: 0, pinch: 0 })
  const afRef = useRef(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setLoaded(false)

    function resize() {
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }
    resize()

    const gl = canvas.getContext('webgl', { antialias: true, alpha: false })
    if (!gl) return

    const isDisc = !!planet.isDisc

    gl.clearColor(0, 0, 0, 1)
    gl.enable(gl.DEPTH_TEST)
    if (!isDisc) gl.enable(gl.CULL_FACE)

    function makeShader(type, src) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, `
      attribute vec3 aPos; attribute vec2 aUV;
      uniform mat4 uProj, uView;
      varying vec2 vUV; varying vec3 vNorm;
      void main() { vUV=vec2(1.0-aUV.x, 1.0-aUV.y); vNorm=normalize(aPos); gl_Position=uProj*uView*vec4(aPos,1.0); }
    `))
    gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec2 vUV; varying vec3 vNorm;
      uniform sampler2D uTex;
      uniform float uEmissive;
      void main() {
        vec3 col=texture2D(uTex,vUV).rgb;
        if(uEmissive>0.5){ gl_FragColor=vec4(col,1.0); }
        else {
          float d=max(dot(normalize(vNorm),normalize(vec3(-1.0,0.5,-0.8))),0.0);
          gl_FragColor=vec4(col*(0.1+d*0.9),1.0);
        }
      }
    `))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const SEG = 48
    const pos = [], uvs = [], idx = []

    if (isDisc) {
      // Flattened sphere (galaxy disc shape)
      const FLAT = 0.08
      for (let i = 0; i <= SEG; i++) {
        const t = (i / SEG) * Math.PI, st = Math.sin(t), ct = Math.cos(t)
        for (let j = 0; j <= SEG; j++) {
          const p = (j / SEG) * Math.PI * 2
          pos.push(Math.cos(p) * st, ct * FLAT, Math.sin(p) * st)
          uvs.push(j / SEG, i / SEG)
        }
      }
      for (let i = 0; i < SEG; i++)
        for (let j = 0; j < SEG; j++) {
          const a = i * (SEG + 1) + j, b = a + SEG + 1
          idx.push(a, b, a + 1, b, b + 1, a + 1)
        }
    } else {
      // Sphere
      for (let i = 0; i <= SEG; i++) {
        const t = (i / SEG) * Math.PI, st = Math.sin(t), ct = Math.cos(t)
        for (let j = 0; j <= SEG; j++) {
          const p = (j / SEG) * Math.PI * 2
          pos.push(Math.cos(p) * st, ct, Math.sin(p) * st)
          uvs.push(j / SEG, i / SEG)
        }
      }
      for (let i = 0; i < SEG; i++)
        for (let j = 0; j < SEG; j++) {
          const a = i * (SEG + 1) + j, b = a + SEG + 1
          idx.push(a, b, a + 1, b, b + 1, a + 1)
        }
    }

    const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW)
    const aP = gl.getAttribLocation(prog, 'aPos'); gl.enableVertexAttribArray(aP)
    gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0)

    const ub2 = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ub2)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW)
    const aU = gl.getAttribLocation(prog, 'aUV'); gl.enableVertexAttribArray(aU)
    gl.vertexAttribPointer(aU, 2, gl.FLOAT, false, 0, 0)

    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW)
    const ic = idx.length
    const uProj = gl.getUniformLocation(prog, 'uProj')
    const uView = gl.getUniformLocation(prog, 'uView')
    const uEmissive = gl.getUniformLocation(prog, 'uEmissive')
    const isEmissive = (planetKey === 'sun' || planetKey === 'milkyway') ? 1.0 : 0.0

    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([100, 40, 20, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    const img = new Image()
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      setLoaded(true)
    }
    img.src = planet.texture

    function perspective(fov, a, n, f) {
      const t = 1 / Math.tan(fov / 2), nf = 1 / (n - f)
      return new Float32Array([t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0])
    }

    function lookAt(dist, rx, ry) {
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry)
      const camX = dist * sy * cx, camY = dist * sx, camZ = dist * cy * cx
      const fx = -camX, fy = -camY, fz = -camZ
      const fl = Math.sqrt(fx * fx + fy * fy + fz * fz)
      const fxn = fx / fl, fyn = fy / fl, fzn = fz / fl
      let rrx = -fzn, rry = 0, rrz = fxn
      const rl = Math.sqrt(rrx * rrx + rrz * rrz) || 1
      rrx /= rl; rrz /= rl
      const ux = fyn * rrz - fzn * rry, uy = fzn * rrx - fxn * rrz, uz = fxn * rry - fyn * rrx
      return new Float32Array([
        rrx, ux, -fxn, 0, rry, uy, -fyn, 0, rrz, uz, -fzn, 0,
        -(rrx * camX + rry * camY + rrz * camZ), -(ux * camX + uy * camY + uz * camZ), fxn * camX + fyn * camY + fzn * camZ, 1
      ])
    }

    function frame() {
      if (gl.isContextLost()) return
      resize()
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      stateRef.current.ry += 0.001
      const w = window.innerWidth, h = window.innerHeight
      const fov = w < h ? 1.0 : 0.7
      gl.uniformMatrix4fv(uProj, false, perspective(fov, w / h, 0.1, 100))
      gl.uniformMatrix4fv(uView, false, lookAt(stateRef.current.zoom, stateRef.current.rx, stateRef.current.ry))
      gl.uniform1f(uEmissive, isEmissive)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.drawElements(gl.TRIANGLES, ic, gl.UNSIGNED_SHORT, 0)
      afRef.current = requestAnimationFrame(frame)
    }
    frame()

    window.addEventListener('resize', resize)
    const md = (e) => { stateRef.current.dragging = true; stateRef.current.lx = e.clientX; stateRef.current.ly = e.clientY }
    const mm = (e) => { if (!stateRef.current.dragging) return; stateRef.current.ry += (e.clientX - stateRef.current.lx) * 0.005; stateRef.current.rx = Math.max(-1.4, Math.min(1.4, stateRef.current.rx + (e.clientY - stateRef.current.ly) * 0.005)); stateRef.current.lx = e.clientX; stateRef.current.ly = e.clientY }
    const mu = () => { stateRef.current.dragging = false }
    const wh = (e) => { e.preventDefault(); stateRef.current.zoom = Math.max(2.5, Math.min(12, stateRef.current.zoom + e.deltaY * 0.005)) }
    const ts = (e) => { e.preventDefault(); stateRef.current.dragging = true; stateRef.current.lx = e.touches[0].clientX; stateRef.current.ly = e.touches[0].clientY; stateRef.current.pinch = 0 }
    const tm = (e) => { e.preventDefault(); if (e.touches.length === 1 && stateRef.current.dragging) { stateRef.current.ry += (e.touches[0].clientX - stateRef.current.lx) * 0.005; stateRef.current.rx = Math.max(-1.4, Math.min(1.4, stateRef.current.rx + (e.touches[0].clientY - stateRef.current.ly) * 0.005)); stateRef.current.lx = e.touches[0].clientX; stateRef.current.ly = e.touches[0].clientY }; if (e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (stateRef.current.pinch > 0) stateRef.current.zoom = Math.max(2.5, Math.min(12, stateRef.current.zoom + (stateRef.current.pinch - d) * 0.015)); stateRef.current.pinch = d } }
    const te = () => { stateRef.current.dragging = false; stateRef.current.pinch = 0 }

    canvas.addEventListener('mousedown', md); window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu)
    canvas.addEventListener('wheel', wh, { passive: false })
    canvas.addEventListener('touchstart', ts, { passive: false }); canvas.addEventListener('touchmove', tm, { passive: false }); canvas.addEventListener('touchend', te)

    return () => {
      cancelAnimationFrame(afRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousedown', md); window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu)
      canvas.removeEventListener('wheel', wh); canvas.removeEventListener('touchstart', ts); canvas.removeEventListener('touchmove', tm); canvas.removeEventListener('touchend', te)
    }
  }, [planet.texture])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, pointerEvents: 'none', opacity: loaded ? 1 : 0, transition: 'opacity 1.5s' }}>
        <h1 style={{ fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 'clamp(1.8rem,7vw,3.2rem)', fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>{planet.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 14, height: 1, background: '#1A1A1D' }} />
          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#4A4A52' }}>{planet.subtitle}</span>
          <span style={{ width: 14, height: 1, background: '#1A1A1D' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '1.2rem 1.5rem', pointerEvents: 'none', display: 'flex', justifyContent: 'center', gap: 'clamp(16px,5vw,32px)', opacity: loaded ? 1 : 0, transition: 'opacity 1.5s 0.5s' }}>
        {planet.data.map((d, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(16px,4vw,22px)', fontWeight: 700, color: '#E8E6E1' }}>{d.v}</span>
            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 'clamp(10px,2.5vw,13px)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4A4A52' }}>{d.l}</span>
          </div>
        ))}
      </div>
      {!loaded && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}><span style={{ color: '#4A4A52', fontFamily: 'Inter,sans-serif', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Chargement...</span></div>}
    </div>
  )
}
