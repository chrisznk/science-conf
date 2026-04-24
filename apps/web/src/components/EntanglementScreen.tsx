'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSocket } from '../lib/socket'
import { useStore } from '../lib/store'

export function EntanglementScreen() {
  const socket = useSocket()
  const pairColor = useStore((s) => s.pairColor)
  const [flash, setFlash] = useState(false)
  const [flashColor, setFlashColor] = useState<string | null>(null)
  const [found, setFound] = useState(false)
  const [distance, setDistance] = useState(0)
  const [tapping, setTapping] = useState(false)

  const paired = !!pairColor

  useEffect(() => {
    if (!socket) return

    const onTap = (data: { color: string }) => {
      setFlashColor(data.color || pairColor)
      setFlash(true)
      setTimeout(() => setFlash(false), 600)
    }

    const onTapSelf = (data: { color: string }) => {
      setFlashColor(data.color || pairColor)
      setFlash(true)
      setTimeout(() => setFlash(false), 400)
    }

    const onFound = (data: { distance: number }) => {
      setFound(true)
      setDistance(data.distance)
    }

    socket.on('entanglement:tap', onTap)
    socket.on('entanglement:tap-self', onTapSelf)
    socket.on('entanglement:found', onFound)

    return () => {
      socket.off('entanglement:tap', onTap)
      socket.off('entanglement:tap-self', onTapSelf)
      socket.off('entanglement:found', onFound)
    }
  }, [socket, pairColor])

  function handleTap() {
    if (found || !paired) return
    setTapping(true)
    socket?.emit('entanglement:tap')
    setTimeout(() => setTapping(false), 300)
  }

  function handleFound() {
    socket?.emit('entanglement:found')
  }

  if (found) {
    return (
      <div className="screen">
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div
            style={{
              width: 60, height: 60, borderRadius: '50%',
              border: `2px solid ${pairColor || '#D4B896'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: pairColor || '#D4B896' }} />
          </motion.div>

          <motion.p
            style={{
              fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
              fontWeight: 700, color: '#E8E6E1', textAlign: 'center',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2 }}
          >
            Intriqués.
          </motion.p>

          <motion.div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 28,
              fontWeight: 700, color: pairColor || '#D4B896',
            }}>
              {distance} m
            </span>
            <span style={{
              fontFamily: 'Inter', fontSize: 12,
              color: '#4A4A52', textTransform: 'uppercase', letterSpacing: '0.2em',
            }}>
              de distance
            </span>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ justifyContent: 'space-between', padding: '3rem 2rem' }}>
      {/* Flash overlay */}
      {flash && (
        <motion.div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: flashColor || pairColor || '#E8E6E1',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}

      <div style={{ height: 40 }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {/* Colored dot — unique per pair */}
        <motion.div
          style={{
            width: 50, height: 50, borderRadius: '50%',
            background: flash
              ? (flashColor || pairColor || 'rgba(232,230,225,0.8)')
              : paired
                ? pairColor!
                : 'rgba(232,230,225,0.05)',
            boxShadow: flash
              ? `0 0 50px ${flashColor || pairColor || 'rgba(232,230,225,0.5)'}`
              : paired
                ? `0 0 20px ${pairColor}40`
                : 'none',
            transition: 'all 0.15s ease-out',
          }}
          animate={!flash ? { scale: [0.95, 1.08, 0.95], opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Status text */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          <span style={{
            fontFamily: 'JetBrains Mono', fontSize: 11, textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: paired ? pairColor! : '#4A4A52',
          }}>
            {paired ? 'Intriqué' : 'En cours d\'intrication…'}
          </span>
        </motion.div>

        <motion.p
          style={{
            fontFamily: 'Source Serif 4, serif',
            fontSize: 'clamp(1.1rem, 4.5vw, 1.6rem)',
            fontWeight: 600, fontStyle: 'italic', color: '#4A4A52',
            textAlign: 'center', lineHeight: 1.6, maxWidth: 300,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          {paired
            ? 'Quelqu\'un dans cette salle partage votre couleur. Tapez pour le trouver.'
            : 'Recherche de votre paire quantique…'}
        </motion.p>

        {/* Tap button */}
        {paired && (
          <motion.button
            onClick={handleTap}
            style={{
              width: 120, height: 120, borderRadius: '50%',
              background: tapping ? `${pairColor}20` : 'transparent',
              border: `1px solid ${pairColor || '#1A1A1D'}`,
              color: pairColor || '#4A4A52',
              fontFamily: 'Inter', fontSize: 13,
              fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            Tapez
          </motion.button>
        )}
      </div>

      {/* Found button */}
      {paired && (
        <motion.button
          onClick={handleFound}
          style={{
            padding: '14px 32px',
            background: 'transparent',
            border: `1px solid ${pairColor || '#1A1A1D'}`,
            color: pairColor || '#4A4A52',
            fontFamily: 'Source Serif 4, serif', fontSize: 16,
            cursor: 'pointer',
          }}
          whileTap={{ background: `${pairColor}20` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
        >
          Je l'ai trouvé
        </motion.button>
      )}
    </div>
  )
}
