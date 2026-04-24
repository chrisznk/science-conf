'use client'

import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

export function GalaxyWallScreen() {
  const galaxy = useStore((s) => s.galaxy)

  return (
    <div className="screen" style={{ padding: '2rem' }}>
      {/* Full screen galaxy glow */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(232,230,225,0.08) 0%, rgba(232,230,225,0.02) 30%, transparent 60%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.p
          style={{
            fontFamily: 'Inter', fontSize: 10, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.25em', color: '#4A4A52',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
        >
          Levez votre téléphone
        </motion.p>

        <motion.h1
          style={{
            fontFamily: 'Source Serif 4, serif',
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            fontWeight: 700, color: '#E8E6E1',
            letterSpacing: '-0.02em', textAlign: 'center',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.8 }}
        >
          {galaxy?.name || 'Votre galaxie'}
        </motion.h1>

        {galaxy?.commonName && (
          <motion.p
            style={{ fontFamily: 'Source Serif 4, serif', fontSize: 16, fontStyle: 'italic', color: '#4A4A52' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1.5 }}
          >
            {galaxy.commonName}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
