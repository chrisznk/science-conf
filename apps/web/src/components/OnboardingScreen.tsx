'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSocket } from '../lib/socket'
import { useStore } from '../lib/store'

const ROWS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function OnboardingScreen() {
  const socket = useSocket()
  const { participantId } = useStore()
  const [row, setRow] = useState('')
  const [number, setNumber] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  function handleJoin() {
    if (!row || !number) return
    const seatId = `${row}-${number}`
    setJoining(true)
    setError('')
    localStorage.setItem('sc_seat_id', seatId)

    if (socket) {
      socket.emit('join', { sessionId: 'default', seatId, participantId })

      socket.once('error', (data: { message: string }) => {
        setError(data.message)
        setJoining(false)
      })
    }
  }

  return (
    <div className="screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-12 w-full max-w-sm"
      >
        {/* Title */}
        <div className="flex flex-col items-center gap-3">
          <motion.h1
            className="text-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            L'Univers
          </motion.h1>
          <motion.p
            className="text-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
          >
            Astrophysique · Physique Quantique · Espace
          </motion.p>
        </div>

        {/* Seat input */}
        <motion.div
          className="w-full flex flex-col gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <p className="text-label text-center">Votre place</p>

          <div className="flex gap-4 justify-center">
            <div className="flex flex-col items-center gap-2">
              <label className="text-label" style={{ fontSize: '0.6rem' }}>Rangée</label>
              <select
                value={row}
                onChange={(e) => setRow(e.target.value)}
                className="w-20 h-14 text-center font-mono text-xl bg-stellar border border-nebula rounded-none appearance-none focus:border-accent transition-colors"
                style={{ color: row ? '#E8E6E1' : '#4A4A52' }}
              >
                <option value="">—</option>
                {ROWS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end pb-0" style={{ color: '#1A1A1D', fontSize: '2rem', lineHeight: '3.5rem' }}>–</div>

            <div className="flex flex-col items-center gap-2">
              <label className="text-label" style={{ fontSize: '0.6rem' }}>Numéro</label>
              <input
                type="number"
                min={1}
                max={50}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="—"
                className="w-20 h-14 text-center font-mono text-xl bg-stellar border border-nebula rounded-none focus:border-accent transition-colors placeholder:text-dust"
              />
            </div>
          </div>

          {error && (
            <p className="text-center text-sm" style={{ color: '#D4B896' }}>{error}</p>
          )}

          <button
            onClick={handleJoin}
            disabled={!row || !number || joining}
            className="w-full h-14 font-serif text-lg tracking-wide transition-all duration-500 disabled:opacity-20"
            style={{
              background: row && number ? 'transparent' : 'transparent',
              border: '1px solid',
              borderColor: row && number ? '#E8E6E1' : '#1A1A1D',
              color: row && number ? '#E8E6E1' : '#4A4A52',
            }}
          >
            {joining ? (
              <span className="text-data pulse-stellar">Connexion…</span>
            ) : (
              'Rejoindre'
            )}
          </button>
        </motion.div>

        {/* Version */}
        <motion.p
          className="text-data"
          style={{ fontSize: '0.625rem', color: '#1A1A1D' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          v1.0
        </motion.p>
      </motion.div>
    </div>
  )
}
