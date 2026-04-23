'use client'

import { motion } from 'framer-motion'
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

  const question = (scene.params.question as string) || ''
  const isBinary = scene.type === 'binary_poll'
  const options = isBinary
    ? [{ id: 'yes', label: 'Oui' }, { id: 'no', label: 'Non' }]
    : ((scene.params.options as { id: string; label: string; description?: string }[]) || [])

  function vote(optionId: string) {
    if (pollVoted) {
      setPollVoted(optionId)
      socket?.emit('poll:vote', { sceneId: scene.id, optionId })
      return
    }
    setPollVoted(optionId)
    socket?.emit('poll:vote', { sceneId: scene.id, optionId })
  }

  if (pollVoted) {
    return (
      <div className="screen">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-serif text-2xl" style={{ color: '#E8E6E1' }}>Merci.</p>
          <p className="text-subtitle">En attente des résultats.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ justifyContent: 'space-between', padding: '3rem 2rem' }}>
      {/* Question */}
      <motion.div
        className="flex-1 flex items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2
          className="font-serif text-center leading-snug"
          style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)', letterSpacing: '-0.01em' }}
        >
          {question}
        </h2>
      </motion.div>

      {/* Options */}
      <motion.div
        className="flex flex-col gap-0 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            onClick={() => vote(opt.id)}
            className="w-full flex flex-col items-center justify-center py-6 transition-all duration-300"
            style={{
              borderTop: i > 0 ? '1px solid #1A1A1D' : 'none',
              borderBottom: i === options.length - 1 ? 'none' : undefined,
            }}
            whileTap={{ backgroundColor: 'rgba(232, 230, 225, 0.03)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
          >
            <span className="font-serif text-2xl" style={{ color: '#E8E6E1' }}>
              {opt.label}
            </span>
            {(opt as { description?: string }).description && (
              <span className="text-subtitle mt-1" style={{ fontSize: '0.8125rem' }}>
                {(opt as { description?: string }).description}
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
