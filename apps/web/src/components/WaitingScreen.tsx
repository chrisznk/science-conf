'use client'

import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

export function WaitingScreen() {
  const seatId = useStore((s) => s.seatId) || (typeof window !== 'undefined' ? localStorage.getItem('sc_seat_id') : '') || ''
  const reconnecting = useStore((s) => s.reconnecting)

  return (
    <div className="screen" style={{ justifyContent: 'space-between', padding: '3rem 2rem' }}>
      <div style={{ height: 40 }} />

      {/* Center */}
      <div className="flex flex-col items-center gap-14 relative z-10">
        {/* Breathing star */}
        <motion.div
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'radial-gradient(circle, #E8E6E1 0%, rgba(232,230,225,0.3) 60%, transparent 100%)',
            boxShadow: '0 0 20px rgba(232,230,225,0.15)',
          }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.p
          style={{
            fontFamily: 'Source Serif 4, serif',
            fontSize: 15, fontWeight: 300, fontStyle: 'italic',
            color: '#4A4A52', letterSpacing: '0.02em',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          En attente du début de la conférence.
        </motion.p>
      </div>

      {/* Bottom status */}
      <motion.div
        className="flex flex-col items-center gap-2 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
      >
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#1A1A1D', letterSpacing: '0.1em' }}>
          {seatId}
        </span>
        <div className="flex items-center gap-2">
          <span style={{
            width: 4, height: 4, borderRadius: '50%',
            background: reconnecting ? '#D4B896' : '#1A1A1D',
            display: 'inline-block',
          }} />
          <span style={{
            fontFamily: 'Inter', fontSize: 9, fontWeight: 500,
            textTransform: 'uppercase' as const, letterSpacing: '0.2em',
            color: reconnecting ? '#D4B896' : '#1A1A1D',
          }}>
            {reconnecting ? 'Reconnexion' : 'Connecté'}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
