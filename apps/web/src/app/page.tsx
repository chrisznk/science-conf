'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { SocketProvider } from '../lib/socket'
import { OnboardingScreen } from '../components/OnboardingScreen'
import { WaitingScreen } from '../components/WaitingScreen'
import { GalaxyRevealScreen } from '../components/GalaxyRevealScreen'
import { PollScreen } from '../components/PollScreen'
import { BlackoutScreen } from '../components/BlackoutScreen'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
}

function AppContent() {
  const joined = useStore((s) => s.joined)
  const scene = useStore((s) => s.scene)
  const galaxy = useStore((s) => s.galaxy)

  if (!joined) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="onboarding" {...fade}><OnboardingScreen /></motion.div>
      </AnimatePresence>
    )
  }

  const t = scene?.type
  return (
    <AnimatePresence mode="wait">
      {t === 'galaxy_reveal' && galaxy ? (
        <motion.div key="galaxy" {...fade}><GalaxyRevealScreen galaxy={galaxy} /></motion.div>
      ) : t === 'binary_poll' || t === 'multi_poll' ? (
        <motion.div key="poll" {...fade}><PollScreen scene={scene!} /></motion.div>
      ) : t === 'blackout' ? (
        <motion.div key="blackout" {...fade}><BlackoutScreen /></motion.div>
      ) : (
        <motion.div key="waiting" {...fade}><WaitingScreen /></motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Home() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  )
}
