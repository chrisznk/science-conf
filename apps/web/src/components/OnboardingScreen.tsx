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

  const ready = row && number

  return (
    <div className="screen" style={{ justifyContent: 'space-between', padding: '3rem 1.5rem' }}>


      {/* spacer for global logo */}
      <div style={{ height: 40 }} />

      {/* Center content */}
      <motion.div
        className="flex flex-col items-center gap-10 w-full max-w-xs relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
      >
        {/* Title */}
        <div className="flex flex-col items-center gap-4">
          <motion.h1
            className="text-title"
            style={{ fontSize: 'clamp(2.2rem, 10vw, 3.5rem)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.8 }}
          >
            L'Univers
          </motion.h1>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4 }}
          >
            <span style={{ width: 20, height: 1, background: '#1A1A1D' }} />
            <p className="text-label" style={{ fontSize: '0.6rem', letterSpacing: '0.25em' }}>
              Conférence interactive
            </p>
            <span style={{ width: 20, height: 1, background: '#1A1A1D' }} />
          </motion.div>
        </div>

        {/* Seat input */}
        <motion.div
          className="w-full flex flex-col gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <p className="text-label text-center" style={{ color: '#4A4A52' }}>Votre place</p>

          <div className="flex gap-3 justify-center items-end">
            <div className="flex flex-col items-center gap-2">
              <label className="text-label" style={{ fontSize: '0.55rem', color: '#1A1A1D' }}>Rangée</label>
              <select
                value={row}
                onChange={(e) => setRow(e.target.value)}
                style={{
                  width: 72, height: 56, textAlign: 'center',
                  fontFamily: 'JetBrains Mono', fontSize: 20,
                  background: '#0A0A0B', border: '1px solid #1A1A1D',
                  color: row ? '#E8E6E1' : '#4A4A52',
                  borderRadius: 0, appearance: 'none' as const,
                  WebkitAppearance: 'none' as const,
                }}
              >
                <option value="">—</option>
                {ROWS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <span style={{ color: '#1A1A1D', fontSize: 28, lineHeight: '56px', fontWeight: 200 }}>–</span>

            <div className="flex flex-col items-center gap-2">
              <label className="text-label" style={{ fontSize: '0.55rem', color: '#1A1A1D' }}>Numéro</label>
              <input
                type="number"
                min={1}
                max={50}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="—"
                style={{
                  width: 72, height: 56, textAlign: 'center',
                  fontFamily: 'JetBrains Mono', fontSize: 20,
                  background: '#0A0A0B', border: '1px solid #1A1A1D',
                  color: '#E8E6E1', borderRadius: 0,
                }}
              />
            </div>
          </div>

          {error && <p className="text-center text-sm" style={{ color: '#D4B896' }}>{error}</p>}

          <motion.button
            onClick={handleJoin}
            disabled={!ready || joining}
            whileTap={ready ? { scale: 0.98 } : {}}
            style={{
              width: '100%', height: 52,
              fontFamily: 'Source Serif 4, serif', fontSize: 16, letterSpacing: '0.05em',
              background: 'transparent',
              border: `1px solid ${ready ? '#E8E6E1' : '#1A1A1D'}`,
              color: ready ? '#E8E6E1' : '#4A4A52',
              cursor: ready ? 'pointer' : 'default',
              transition: 'all 0.6s ease',
              opacity: joining ? 0.4 : 1,
            }}
          >
            {joining ? (
              <span className="font-mono text-sm pulse-stellar">Connexion…</span>
            ) : (
              'Rejoindre'
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Bottom version */}
      <motion.p
        style={{ fontSize: '0.55rem', color: '#0A0A0B', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        v1.0
      </motion.p>
    </div>
  )
}
