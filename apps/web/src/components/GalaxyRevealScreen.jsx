'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_LABELS = {
  spiral: 'Spirale', elliptical: 'Elliptique', irregular: 'Irrégulière', lenticular: 'Lenticulaire',
}

export function GalaxyRevealScreen({ galaxy }) {
  const [visible] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)

  const imageUrl = galaxy.imageId
    ? `https://cdn.esahubble.org/archives/images/screen/${galaxy.imageId}.jpg`
    : null

  return (
    <div className="screen" style={{ justifyContent: 'flex-start', padding: 0 }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={galaxy.id || galaxy.name}
            style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Galaxy image — fills available space above info */}
            {imageUrl && (
              <div style={{
                width: '100%', flex: '1 1 0',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingTop: 50, overflow: 'hidden', minHeight: 0,
              }}>
                <motion.img
                  src={imageUrl}
                  alt={galaxy.name}
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    maxWidth: '100%', maxHeight: '100%',
                    objectFit: 'contain',
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 1.5s ease',
                  }}
                  draggable={false}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: imgLoaded ? 1 : 0, scale: 1 }}
                  transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )}

            {/* Fallback glow if no image */}
            {!imageUrl && (
              <div style={{
                width: '100%', flex: '0 0 250px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                paddingTop: 60,
              }}>
                <div style={{
                  width: '70vw', height: '70vw', maxWidth: 300, maxHeight: 300,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(232,230,225,0.1) 0%, rgba(232,230,225,0.03) 40%, transparent 70%)',
                }} />
              </div>
            )}

            {/* Info — compact, no flex-grow */}
            <div style={{
              flex: '0 0 auto', display: 'flex', flexDirection: 'column',
              alignItems: 'center',
              gap: 10, padding: '0.8rem 2rem 1.5rem',
            }}>
              <motion.div
                style={{ width: 28, height: 1, background: '#1A1A1D' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />

              <motion.h1
                style={{
                  fontFamily: 'Source Serif 4, serif', fontSize: 'clamp(1.8rem, 8vw, 2.8rem)',
                  fontWeight: 700, letterSpacing: '-0.02em', color: '#E8E6E1', textAlign: 'center',
                  margin: 0,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.8 }}
              >
                {galaxy.name}
              </motion.h1>

              {galaxy.commonName && (
                <motion.p
                  style={{ fontFamily: 'Source Serif 4, serif', fontSize: 18, fontStyle: 'italic', color: '#4A4A52', margin: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                >
                  {galaxy.commonName}
                </motion.p>
              )}

              <motion.div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 2 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.6 }}
              >
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 700, color: '#E8E6E1' }}>
                  {galaxy.distanceMly.toLocaleString('fr-FR')}
                </span>
                <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#4A4A52', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  millions d'années-lumière
                </span>
              </motion.div>

              <motion.div
                style={{ display: 'flex', gap: 24, marginTop: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#4A4A52', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Type</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: '#E8E6E1' }}>{TYPE_LABELS[galaxy.type] || galaxy.type}</span>
                </div>
                <div style={{ width: 1, height: 28, background: '#1A1A1D' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#4A4A52', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Constellation</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: '#E8E6E1' }}>{galaxy.constellation}</span>
                </div>
              </motion.div>

              <motion.p
                style={{
                  fontFamily: 'Source Serif 4, serif', fontSize: 15,
                  fontStyle: 'italic', color: '#4A4A52', lineHeight: 1.6,
                  textAlign: 'center', maxWidth: 300, margin: '0',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 2.8 }}
              >
                Cette galaxie, seule, est la vôtre ce soir.
              </motion.p>

              {galaxy.isRare && galaxy.rareLabel && (
                <motion.div
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5, delay: 4 }}
                >
                  <span style={{ width: 10, height: 1, background: '#D4B896' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4B896' }}>
                    {galaxy.rareLabel}
                  </span>
                  <span style={{ width: 10, height: 1, background: '#D4B896' }} />
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
