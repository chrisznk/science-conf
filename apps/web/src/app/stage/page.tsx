'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'

const API = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002'

type Scene = { id: string; type: string; name: string; params: Record<string, unknown>; state: string }
type PollResults = { votes: Record<string, number>; total: number }

export default function StagePage() {
  const [scene, setScene] = useState<Scene | null>(null)
  const [clients, setClients] = useState(0)
  const [pollResults, setPollResults] = useState<PollResults | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(API, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Stage] Connected to server')
      fetch(`${API}/api/session`)
        .then(r => r.json())
        .then(data => {
          setClients(data.clients)
          if (data.scene) setScene(data.scene)
        })
        .catch(() => {})
    })

    socket.on('scene:change', (s: Scene) => {
      setScene(s)
      setPollResults(null)
    })
    socket.on('poll:results', (r: PollResults) => setPollResults(r))
    socket.on('stats:update', (d: { connected: number }) => setClients(d.connected))

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/session`)
        const data = await res.json()
        setClients(data.clients)
        if (data.scene) setScene(data.scene)
      } catch {}
      if (scene?.type?.includes('poll')) {
        try {
          const res = await fetch(`${API}/api/admin/poll-results`)
          const data = await res.json()
          if (data.total > 0) setPollResults(data)
        } catch {}
      }
    }, 3000)

    return () => { socket.disconnect(); clearInterval(interval) }
  }, [])

  const t = scene?.type
  const question = (scene?.params?.question as string) || ''
  const isBinary = t === 'binary_poll'
  const options = isBinary
    ? [{ id: 'yes', label: 'Oui' }, { id: 'no', label: 'Non' }]
    : ((scene?.params?.options as { id: string; label: string }[]) || [])
  const total = pollResults?.total || 0
  const votes = pollResults?.votes || {}
  const opened = scene?.params?.opened === true

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000', color: '#E8E6E1',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Logo top */}
      {t !== 'blackout' && (
        <div style={{ padding: '40px 0 0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <img src="/logo-conference.png" alt="Science & Vie" style={{ width: 300, height: 'auto', opacity: 0.5 }} draggable={false} />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        <AnimatePresence mode="wait">
          {/* POLL WITH RESULTS */}
          {(t === 'binary_poll' || t === 'multi_poll') && pollResults && total > 0 ? (
            <motion.div
              key={`results-${scene?.id}`}
              style={{ width: '100%', maxWidth: 900 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2
                style={{
                  fontFamily: 'Source Serif 4, Georgia, serif',
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 700, textAlign: 'center', marginBottom: 60,
                  letterSpacing: '-0.02em', lineHeight: 1.3,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                {question}
              </motion.h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {options.map((opt, i) => {
                  const count = votes[opt.id] || 0
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <motion.div
                      key={opt.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                        <span style={{
                          fontFamily: 'Source Serif 4, Georgia, serif',
                          fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                          fontWeight: 600,
                        }}>
                          {opt.label}
                        </span>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 'clamp(2rem, 5vw, 4rem)',
                          fontWeight: 700,
                        }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 8, background: '#1A1A1D', borderRadius: 4, overflow: 'hidden' }}>
                        <motion.div
                          style={{ height: '100%', borderRadius: 4, background: '#E8E6E1' }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <motion.p
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 18, color: '#4A4A52', textAlign: 'center', marginTop: 48,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {total} vote{total > 1 ? 's' : ''}
              </motion.p>
            </motion.div>

          ) : (t === 'binary_poll' || t === 'multi_poll') ? (
            <motion.div
              key={`question-${scene?.id}`}
              style={{ textAlign: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 style={{
                fontFamily: 'Source Serif 4, Georgia, serif',
                fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2,
              }}>
                {question}
              </h2>
              <p style={{
                fontSize: 18, color: '#4A4A52', marginTop: 24,
                textTransform: 'uppercase', letterSpacing: '0.2em',
              }}>
                Votez sur votre téléphone
              </p>
            </motion.div>

          ) : t === 'galaxy_reveal' ? (
            <motion.div key="galaxy" style={{ textAlign: 'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            >
              <h2 style={{
                fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(2rem, 4vw, 4rem)',
                fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em',
              }}>
                Découvrez votre galaxie
              </h2>
              <p style={{ fontSize: 18, color: '#4A4A52', marginTop: 20 }}>
                Chaque spectateur découvre sa galaxie personnelle
              </p>
            </motion.div>

          ) : t === 'schrodinger' ? (
            <motion.div key="schrodinger" style={{ textAlign: 'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            >
              {!opened ? (
                <>
                  <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '30vw', maxWidth: 400, height: 'auto', margin: '0 auto 40px' }}>
                    <g fill="none" stroke="#E8E6E1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
                      <rect x="100" y="180" width="300" height="240" />
                      <line x1="100" y1="180" x2="175" y2="110" /><line x1="400" y1="180" x2="475" y2="110" />
                      <line x1="400" y1="420" x2="475" y2="350" /><line x1="175" y1="110" x2="475" y2="110" />
                      <line x1="475" y1="110" x2="475" y2="350" />
                    </g>
                    <text x="290" y="340" textAnchor="middle" fontFamily="Source Serif 4, serif" fontSize="120" fontWeight="700" fill="none" stroke="#4A4A52" strokeWidth="1.5" opacity="0.6">?</text>
                  </svg>
                  <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 700 }}>
                    Le chat de Schrödinger
                  </h2>
                  <p style={{ fontSize: 20, fontStyle: 'italic', color: '#4A4A52', marginTop: 16, fontFamily: 'Source Serif 4, serif' }}>
                    Le chat est-il vivant ou mort ?
                  </p>
                </>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 800 }}>
                    Regardez votre écran.
                  </h2>
                </>
              )}
            </motion.div>

          ) : t === 'entanglement_pair' ? (
            <motion.div key="entanglement" style={{ textAlign: 'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            >
              <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 700 }}>
                Intrication quantique
              </h2>
              <p style={{ fontSize: 20, color: '#4A4A52', marginTop: 20, fontFamily: 'Source Serif 4, serif', fontStyle: 'italic' }}>
                Trouvez votre paire quantique dans la salle.
              </p>
            </motion.div>

          ) : t === 'planet' ? (
            <motion.div key="planet" style={{ textAlign: 'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            >
              <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(2.5rem, 5vw, 5rem)', fontWeight: 700 }}>
                {scene?.name}
              </h2>
            </motion.div>

          ) : t === 'galaxy_wall' ? (
            <motion.div key="wall" style={{ textAlign: 'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            >
              <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 700 }}>
                Mur de Galaxies
              </h2>
              <p style={{ fontSize: 20, color: '#4A4A52', marginTop: 20, fontStyle: 'italic', fontFamily: 'Source Serif 4, serif' }}>
                Brandissez votre galaxie
              </p>
            </motion.div>

          ) : t === 'blackout' ? (
            <motion.div key="blackout" initial={{ opacity: 1 }} animate={{ opacity: 1 }} />

          ) : (
            <motion.div key="waiting" style={{ textAlign: 'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            >
              <motion.div
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8E6E1', margin: '0 auto 24px' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <p style={{ fontSize: 16, color: '#1A1A1D' }}>En attente d'une scène…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      {t !== 'blackout' && (
        <div style={{
          padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid #0A0A0B', flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#4A4A52', letterSpacing: '0.1em' }}>
            {clients} connecté{clients > 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: 11, color: '#4A4A52', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            {scene?.name || ''}
          </span>
        </div>
      )}
    </div>
  )
}
