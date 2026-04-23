'use client'

import { motion } from 'framer-motion'

type Galaxy = {
  name: string
  commonName: string | null
  type: string
  distanceMly: number
  constellation: string
  description: string
  isRare: boolean
  rareLabel: string | null
}

const TYPE_LABELS: Record<string, string> = {
  spiral: 'Spirale',
  elliptical: 'Elliptique',
  irregular: 'Irrégulière',
  lenticular: 'Lenticulaire',
}

export function GalaxyRevealScreen({ galaxy }: { galaxy: Galaxy }) {
  return (
    <div className="screen" style={{ justifyContent: 'flex-end', paddingBottom: '4rem' }}>
      {/* Galaxy image placeholder — monochrome deep field */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(232,230,225,0.08) 0%, rgba(232,230,225,0.02) 40%, transparent 70%)',
            filter: 'blur(1px)',
          }}
        />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        {/* Name */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1 }}
        >
          <h1 className="font-serif text-4xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            {galaxy.name}
          </h1>
          {galaxy.commonName && (
            <p className="font-serif text-lg italic" style={{ color: '#4A4A52' }}>
              {galaxy.commonName}
            </p>
          )}
        </motion.div>

        {/* Distance */}
        <motion.p
          className="font-mono text-sm"
          style={{ color: '#4A4A52', letterSpacing: '0.05em' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          {galaxy.distanceMly.toLocaleString('fr-FR')} millions d'années-lumière
        </motion.p>

        {/* Data grid */}
        <motion.div
          className="flex gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-label">Type</span>
            <span className="text-data">{TYPE_LABELS[galaxy.type] || galaxy.type}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-label">Constellation</span>
            <span className="text-data">{galaxy.constellation}</span>
          </div>
        </motion.div>

        {/* Phrase */}
        <motion.p
          className="font-serif text-base italic text-center"
          style={{ color: '#4A4A52', lineHeight: 1.8 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 3 }}
        >
          Cette galaxie, seule, est la vôtre ce soir.
        </motion.p>

        {/* Rare badge */}
        {galaxy.isRare && galaxy.rareLabel && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 4 }}
          >
            <span className="text-label text-accent">{galaxy.rareLabel}</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
