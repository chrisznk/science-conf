'use client'

import { useStore } from '../lib/store'

export function CosmicBackground() {
  const scene = useStore((s) => s.scene)
  const hideOn = ['blackout', 'planet', 'galaxy_reveal']
  if (scene && hideOn.includes(scene.type)) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Central nebula glow */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '120vmax', height: '120vmax',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(232,230,225,0.04) 0%, rgba(232,230,225,0.015) 20%, rgba(232,230,225,0.005) 40%, transparent 60%)',
        filter: 'blur(4px)',
      }} />

      {/* Secondary glow offset */}
      <div style={{
        position: 'absolute',
        top: '60%', left: '30%', transform: 'translate(-50%, -50%)',
        width: '80vmax', height: '80vmax',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(212,184,150,0.015) 0%, transparent 50%)',
        filter: 'blur(8px)',
      }} />
    </div>
  )
}
