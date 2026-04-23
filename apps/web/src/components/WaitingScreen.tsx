'use client'

import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

export function WaitingScreen() {
  const seatId = useStore((s) => s.seatId) || localStorage.getItem('sc_seat_id') || ''
  const reconnecting = useStore((s) => s.reconnecting)

  return (
    <div className="screen">
      <div className="flex flex-col items-center gap-16">
        {/* Stellar pulse */}
        <motion.div
          className="w-2 h-2 rounded-full bg-moon pulse-stellar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />

        <motion.p
          className="text-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          En attente du début de la conférence.
        </motion.p>

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <span className="text-data" style={{ fontSize: '0.6875rem', color: '#1A1A1D' }}>
            {seatId}
          </span>
          <span className="text-label" style={{ fontSize: '0.5625rem', color: reconnecting ? '#D4B896' : '#1A1A1D' }}>
            {reconnecting ? 'Reconnexion…' : 'Connecté'}
          </span>
        </motion.div>
      </div>
    </div>
  )
}
