'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export function StarField() {
  const scene = useStore((s) => s.scene)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const stars = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 3 + 1) * 100,
      y: seededRandom(i * 3 + 2) * 100,
      size: seededRandom(i * 3 + 3) > 0.85 ? 3.5 : seededRandom(i * 3 + 3) > 0.6 ? 2.5 : 1.5,
      maxOpacity: 0.15 + seededRandom(i * 7) * 0.35,
      duration: 2.5 + seededRandom(i * 7 + 1) * 4,
      delay: seededRandom(i * 7 + 2) * 6,
    })),
    []
  )

  const hideOn = ['blackout', 'planet', 'galaxy_reveal']
  if (!mounted || (scene && hideOn.includes(scene.type))) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map((s) => (
        <motion.div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#E8E6E1',
            boxShadow: s.size > 2 ? '0 0 4px rgba(232,230,225,0.35)' : 'none',
          }}
          animate={{ opacity: [0, s.maxOpacity, 0] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
