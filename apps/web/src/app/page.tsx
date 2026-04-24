'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { SocketProvider } from '../lib/socket'
import { OnboardingScreen } from '../components/OnboardingScreen'
import { WaitingScreen } from '../components/WaitingScreen'
import { GalaxyRevealScreen } from '../components/GalaxyRevealScreen'
import { PollScreen } from '../components/PollScreen'
import { SchrodingerScreen } from '../components/SchrodingerScreen'
import { GalaxyWallScreen } from '../components/GalaxyWallScreen'
import { EntanglementScreen } from '../components/EntanglementScreen'
import { BlackoutScreen } from '../components/BlackoutScreen'
import { ScreenLogo } from '../components/ScreenLogo'
import { CosmicBackground } from '../components/CosmicBackground'
import { StarField } from '../components/StarField'
import dynamic from 'next/dynamic'

const PlanetView = dynamic(() => import('../components/PlanetView'), { ssr: false })

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
        <motion.div key={`poll-${scene!.id}`} {...fade}><PollScreen scene={scene!} /></motion.div>
      ) : t === 'schrodinger' ? (
        <motion.div key="schrodinger" {...fade}><SchrodingerScreen scene={scene!} /></motion.div>
      ) : t === 'entanglement_pair' ? (
        <motion.div key="entanglement" {...fade}><EntanglementScreen /></motion.div>
      ) : t === 'galaxy_wall' ? (
        <motion.div key="galaxywall" {...fade}><GalaxyWallScreen /></motion.div>
      ) : t === 'planet' ? (
        <motion.div key="planet" {...fade}><PlanetView /></motion.div>
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
      <CosmicBackground />
      <StarField />
      <ScreenLogo />
      <AppContent />
    </SocketProvider>
  )
}
