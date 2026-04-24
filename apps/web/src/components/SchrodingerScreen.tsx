'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

function ClosedBox() {
  return (
    <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '65vw', maxWidth: 320, height: 'auto' }}>
      <g fill="none" stroke="#E8E6E1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <rect x="100" y="180" width="300" height="240" />
        <line x1="100" y1="180" x2="175" y2="110" />
        <line x1="400" y1="180" x2="475" y2="110" />
        <line x1="400" y1="420" x2="475" y2="350" />
        <line x1="175" y1="110" x2="475" y2="110" />
        <line x1="475" y1="110" x2="475" y2="350" />
      </g>
      <text
        x="290" y="340"
        textAnchor="middle"
        fontFamily="Source Serif 4, serif"
        fontSize="120"
        fontWeight="700"
        fill="none"
        stroke="#4A4A52"
        strokeWidth="1.5"
        opacity="0.6"
      >
        ?
      </text>
    </svg>
  )
}

function AliveCat() {
  return (
    <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '65vw', maxWidth: 320, height: 'auto' }}>
      <g fill="none" stroke="#E8E6E1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <rect x="100" y="180" width="300" height="240" />
        <line x1="100" y1="180" x2="175" y2="110" />
        <line x1="400" y1="180" x2="475" y2="110" />
        <line x1="400" y1="420" x2="475" y2="350" />
        <line x1="175" y1="110" x2="475" y2="110" />
        <line x1="475" y1="110" x2="475" y2="350" />
        <g transform="translate(260 380)">
          <path d="M -42 0 C -50 -18, -48 -28, -36 -38 L -28 -86 L -10 -58 C -4 -62, 4 -62, 10 -58 L 28 -86 L 36 -38 C 50 -32, 58 -18, 58 -4 C 68 -14, 86 -30, 98 -70 C 104 -92, 96 -98, 88 -90 C 78 -60, 68 -30, 54 -10 L 54 0 Z" />
          <circle cx="-12" cy="-66" r="3" fill="#E8E6E1" />
          <circle cx="12" cy="-66" r="3" fill="#E8E6E1" />
        </g>
      </g>
    </svg>
  )
}

function DeadCat() {
  return (
    <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '65vw', maxWidth: 320, height: 'auto' }}>
      <g fill="none" stroke="#E8E6E1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <rect x="100" y="180" width="300" height="240" />
        <line x1="100" y1="180" x2="175" y2="110" />
        <line x1="400" y1="180" x2="475" y2="110" />
        <line x1="400" y1="420" x2="475" y2="350" />
        <line x1="175" y1="110" x2="475" y2="110" />
        <line x1="475" y1="110" x2="475" y2="350" />
        <g transform="translate(260 380)" opacity="0.4">
          <path d="M -42 0 C -50 -18, -48 -28, -36 -38 L -28 -86 L -10 -58 C -4 -62, 4 -62, 10 -58 L 28 -86 L 36 -38 C 50 -32, 58 -18, 58 -4 C 68 -14, 86 -30, 98 -70 C 104 -92, 96 -98, 88 -90 C 78 -60, 68 -30, 54 -10 L 54 0 Z" />
          <line x1="-18" y1="-72" x2="-6" y2="-60" />
          <line x1="-6" y1="-72" x2="-18" y2="-60" />
          <line x1="6" y1="-72" x2="18" y2="-60" />
          <line x1="18" y1="-72" x2="6" y2="-60" />
        </g>
      </g>
    </svg>
  )
}

export function SchrodingerScreen({ scene }: { scene: { params: Record<string, unknown> } }) {
  const joinOrder = useStore((s) => s.joinOrder)
  const isAlive = joinOrder % 2 === 0
  const opened = scene.params?.opened === true

  const [countdown, setCountdown] = useState(3)
  const [phase, setPhase] = useState<'waiting' | 'countdown' | 'flash' | 'revealed'>('waiting')

  useEffect(() => {
    if (opened && phase === 'waiting') {
      setPhase('countdown')
    }
  }, [opened, phase])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(t)
    } else {
      setPhase('flash')
      setTimeout(() => setPhase('revealed'), 200)
    }
  }, [phase, countdown])

  if (phase === 'waiting') {
    return (
      <div className="screen">
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ClosedBox />
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <motion.h2
              style={{
                fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(1.6rem, 7vw, 2.4rem)',
                fontWeight: 700, color: '#E8E6E1', textAlign: 'center', margin: 0,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            >
              Le chat de Schrödinger
            </motion.h2>

            <motion.p
              style={{
                fontFamily: 'Source Serif 4, serif', fontSize: 16,
                fontStyle: 'italic', color: '#4A4A52', textAlign: 'center',
                maxWidth: 300, lineHeight: 1.8, margin: 0,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1 }}
            >
              Le chat est-il vivant ou mort ?{'\n'}Personne ne le sait… tant que la boîte est fermée.
            </motion.p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (phase === 'countdown') {
    return (
      <div className="screen">
        <motion.div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ClosedBox />
          </motion.div>

          <p style={{
            fontFamily: 'Source Serif 4, serif', fontSize: 16,
            fontStyle: 'italic', color: '#4A4A52', textAlign: 'center',
          }}>
            Ouverture de la boîte…
          </p>
          <motion.span
            key={countdown}
            style={{
              fontFamily: 'JetBrains Mono', fontSize: 72,
              fontWeight: 700, color: '#E8E6E1',
            }}
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {countdown}
          </motion.span>
        </motion.div>
      </div>
    )
  }

  if (phase === 'flash') {
    return <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 100 }} />
  }

  return (
    <div className="screen">
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        >
          {isAlive ? <AliveCat /> : <DeadCat />}
        </motion.div>

        <motion.div
          style={{ width: 28, height: 1, background: isAlive ? '#D4B896' : '#4A4A52' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        <motion.h1
          style={{
            fontFamily: 'Source Serif 4, serif',
            fontSize: 'clamp(2.2rem, 10vw, 3.5rem)',
            fontWeight: 800, letterSpacing: '-0.02em', margin: 0, textAlign: 'center',
            color: isAlive ? '#E8E6E1' : '#4A4A52',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        >
          {isAlive ? 'Vivant.' : 'Mort.'}
        </motion.h1>

        <motion.p
          style={{
            fontFamily: 'Source Serif 4, serif', fontSize: 15,
            fontStyle: 'italic', textAlign: 'center',
            color: '#4A4A52', maxWidth: 280, lineHeight: 1.8, margin: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 2 }}
        >
          {isAlive
            ? 'L\'observation a fixé le destin du chat. Il est vivant — pour vous.'
            : 'L\'observation a fixé le destin du chat. Il est mort — pour vous.'}
        </motion.p>
      </motion.div>
    </div>
  )
}
