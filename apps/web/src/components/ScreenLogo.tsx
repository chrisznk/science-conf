'use client'

import { useStore } from '../lib/store'

export function ScreenLogo() {
  const scene = useStore((s) => s.scene)
  const hideOn = ['blackout', 'planet']
  if (scene && hideOn.includes(scene.type)) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', justifyContent: 'center',
      padding: '16px 0 0',
      pointerEvents: 'none',
    }}>
      <img
        src="/logo-conference.png"
        alt="Science & Vie Conférence"
        style={{ width: 'clamp(250px, 60vw, 400px)', height: 'auto', opacity: 0.75 }}
        draggable={false}
      />
    </div>
  )
}
