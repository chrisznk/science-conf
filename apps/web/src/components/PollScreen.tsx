'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../lib/socket'
import { useStore } from '../lib/store'

type Scene = {
  id: string
  type: string
  params: Record<string, unknown>
  state: string
}

export function PollScreen({ scene }: { scene: Scene }) {
  const socket = useSocket()
  const pollVoted = useStore((s) => s.pollVoted)
  const setPollVoted = useStore((s) => s.setPollVoted)
  const pollResults = useStore((s) => s.pollResults)

  const question = (scene.params.question as string) || ''
  const isBinary = scene.type === 'binary_poll'
  const options = isBinary
    ? [{ id: 'yes', label: 'Oui' }, { id: 'no', label: 'Non' }]
    : ((scene.params.options as { id: string; label: string; description?: string }[]) || [])

  function vote(optionId: string) {
    setPollVoted(optionId)
    socket?.emit('poll:vote', { sceneId: scene.id, optionId })
  }

  // After voting: show live results
  if (pollVoted) {
    const total = pollResults?.total || 0
    const votes = pollResults?.votes || {}

    return (
      <div className="screen" style={{ justifyContent: 'space-between', padding: '2.5rem 1.5rem' }}>
        <div style={{ height: 40 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, width: '100%', maxWidth: 360 }}>
          {/* Question reminder */}
          <motion.p
            style={{
              fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(1.4rem, 5.5vw, 2rem)',
              fontWeight: 600, color: '#E8E6E1', textAlign: 'center',
              lineHeight: 1.4, letterSpacing: '-0.01em',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {question}
          </motion.p>

          {/* Results bars */}
          <motion.div
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {options.map((opt, i) => {
              const count = votes[opt.id] || 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const isMyVote = pollVoted === opt.id

              return (
                <motion.div
                  key={opt.id}
                  style={{ width: '100%' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.15 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{
                      fontFamily: 'Source Serif 4, serif', fontSize: 20, fontWeight: 600,
                      color: isMyVote ? '#E8E6E1' : '#4A4A52',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {opt.label}
                      {isMyVote && (
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: '#D4B896', display: 'inline-block',
                        }} />
                      )}
                    </span>
                    <motion.span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 26,
                        fontWeight: 700, color: '#E8E6E1',
                      }}
                      key={pct}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {pct}%
                    </motion.span>
                  </div>
                  <div style={{
                    width: '100%', height: 5, background: '#1A1A1D',
                    borderRadius: 2, overflow: 'hidden',
                  }}>
                    <motion.div
                      style={{
                        height: '100%', borderRadius: 2,
                        background: isMyVote ? '#D4B896' : '#4A4A52',
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Total votes */}
          <motion.p
            style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
              color: '#4A4A52', letterSpacing: '0.1em',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {total} vote{total > 1 ? 's' : ''}
          </motion.p>
        </div>

        <div />
      </div>
    )
  }

  // Before voting: show options
  return (
    <div className="screen" style={{ justifyContent: 'space-between', padding: '2.5rem 0' }}>
      <div style={{ padding: '0 1.5rem' }}>
        <div style={{ height: 40 }} />
      </div>

      {/* Question */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 2rem' }}>
        <motion.h2
          style={{
            fontFamily: 'Source Serif 4, serif',
            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
            fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.01em',
            color: '#E8E6E1', textAlign: 'center', width: '100%',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const }}
        >
          {question}
        </motion.h2>
      </div>

      {/* Options */}
      <motion.div
        style={{ width: '100%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            onClick={() => vote(opt.id)}
            style={{
              width: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: isBinary ? '2.5rem 2rem' : '1.5rem 2rem',
              borderTop: '1px solid #1A1A1D',
              background: 'transparent', cursor: 'pointer',
              transition: 'background 0.3s',
            }}
            whileTap={{ backgroundColor: 'rgba(232, 230, 225, 0.04)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 + i * 0.12 }}
          >
            <span style={{
              fontFamily: 'Source Serif 4, serif',
              fontSize: isBinary ? 32 : 24,
              fontWeight: 600, color: '#E8E6E1', letterSpacing: '-0.01em',
            }}>
              {opt.label}
            </span>
            {(opt as { description?: string }).description && (
              <span style={{
                fontFamily: 'Inter', fontSize: 15, fontWeight: 300,
                color: '#4A4A52', marginTop: 4,
              }}>
                {(opt as { description?: string }).description}
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
