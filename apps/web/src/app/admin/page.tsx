'use client'

import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002'

const SCENES = [
  // — Général —
  { type: 'welcome', name: 'Accueil', description: 'Écran d\'attente', params: {}, group: 'general' },
  { type: 'galaxy_reveal', name: 'Révélation Galaxie', description: 'Chaque spectateur découvre sa galaxie personnelle', params: {}, group: 'general' },

  // — Sondages —
  { type: 'binary_poll', name: 'Sondage 1 : Vie extraterrestre', description: 'Pensez-vous qu\'il existe de la vie ailleurs ?', params: { question: 'Pensez-vous qu\'il existe de la vie ailleurs dans l\'univers ?' }, group: 'sondages' },
  { type: 'binary_poll', name: 'Sondage 2 : Voyage interstellaire', description: 'L\'humanité atteindra-t-elle un jour une autre étoile ?', params: { question: 'L\'humanité atteindra-t-elle un jour une autre étoile ?' }, group: 'sondages' },
  { type: 'binary_poll', name: 'Sondage 3 : Multivers', description: 'Croyez-vous aux univers parallèles ?', params: { question: 'Croyez-vous à l\'existence de plusieurs univers parallèles ?' }, group: 'sondages' },

  // — QCM —
  { type: 'multi_poll', name: 'QCM 1 : Étoiles', description: 'Combien d\'étoiles dans la Voie lactée ?', params: { question: 'Combien d\'étoiles contient notre galaxie, la Voie lactée ?', options: [{ id: 'a', label: '1 milliard' }, { id: 'b', label: '100 milliards', description: 'Estimation basse' }, { id: 'c', label: '400 milliards', description: 'Estimation haute' }, { id: 'd', label: '1 000 milliards' }], correctOptionId: 'c' }, group: 'qcm' },
  { type: 'multi_poll', name: 'QCM 2 : Température', description: 'Quelle est la température du vide spatial ?', params: { question: 'Quelle est la température moyenne du vide spatial ?', options: [{ id: 'a', label: '0 °C' }, { id: 'b', label: '−100 °C' }, { id: 'c', label: '−270 °C', description: '2,7 K — le fond diffus cosmologique' }, { id: 'd', label: 'Le vide n\'a pas de température' }], correctOptionId: 'c' }, group: 'qcm' },
  { type: 'multi_poll', name: 'QCM 3 : Âge', description: 'Quel âge a notre univers ?', params: { question: 'Quel est l\'âge estimé de notre univers ?', options: [{ id: 'a', label: '4,5 milliards d\'années', description: 'L\'âge de la Terre' }, { id: 'b', label: '10 milliards d\'années' }, { id: 'c', label: '13,8 milliards d\'années', description: 'Mesuré grâce au fond diffus cosmologique' }, { id: 'd', label: '20 milliards d\'années' }], correctOptionId: 'c' }, group: 'qcm' },

  // — Planètes —
  { type: 'planet', name: 'Mars', description: 'Mars en 3D', params: { planet: 'mars' }, group: 'planetes' },
  { type: 'planet', name: 'Terre', description: 'La Terre en 3D', params: { planet: 'earth' }, group: 'planetes' },
  { type: 'planet', name: 'Jupiter', description: 'La géante gazeuse', params: { planet: 'jupiter' }, group: 'planetes' },
  { type: 'planet', name: 'Lune', description: 'Notre satellite', params: { planet: 'moon' }, group: 'planetes' },
  { type: 'planet', name: 'Soleil', description: 'Notre étoile', params: { planet: 'sun' }, group: 'planetes' },
  { type: 'planet', name: 'Vénus', description: 'L\'étoile du berger', params: { planet: 'venus' }, group: 'planetes' },
  { type: 'planet', name: 'Neptune', description: 'La géante de glace', params: { planet: 'neptune' }, group: 'planetes' },
  { type: 'planet', name: 'Voie Lactée', description: 'Notre galaxie', params: { planet: 'milkyway' }, group: 'planetes' },

  // — Expériences —
  { type: 'schrodinger', name: 'Schrödinger — Boîte fermée', description: 'Présente la boîte fermée aux spectateurs', params: {}, group: 'experiences' },
  { type: 'entanglement_pair', name: 'Intrication quantique', description: 'Chaque spectateur cherche sa paire dans la salle', params: {}, group: 'experiences' },
  { type: 'galaxy_wall', name: 'Mur de Galaxies', description: 'Tous brandissent leur galaxie', params: {}, group: 'experiences' },

  // — Contrôle —
  { type: 'blackout', name: 'Blackout', description: 'Extinction totale des écrans', params: {}, group: 'controle' },
]

const GROUP_LABELS: Record<string, string> = {
  general: 'Général',
  sondages: 'Sondages',
  qcm: 'QCM',
  planetes: 'Planètes',
  experiences: 'Expériences',
  controle: 'Contrôle',
}

type SessionState = {
  state: string
  scene: { type: string; name: string; state: string; params?: Record<string, unknown> } | null
  clients: number
}

export default function AdminPage() {
  const [session, setSession] = useState<SessionState | null>(null)
  const [pollResults, setPollResults] = useState<{ votes: Record<string, number>; total: number } | null>(null)
  const [loading, setLoading] = useState('')

  useEffect(() => {
    fetchSession()
    const interval = setInterval(fetchSession, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (session?.scene?.type?.includes('poll')) {
      const interval = setInterval(fetchPollResults, 1000)
      return () => clearInterval(interval)
    }
  }, [session?.scene?.type])

  async function fetchSession() {
    try {
      const res = await fetch(`${API}/api/session`)
      setSession(await res.json())
    } catch {}
  }

  async function fetchPollResults() {
    try {
      const res = await fetch(`${API}/api/admin/poll-results`)
      setPollResults(await res.json())
    } catch {}
  }

  async function startSession() {
    setLoading('start')
    await fetch(`${API}/api/admin/session/start`, { method: 'POST' })
    await fetchSession()
    setLoading('')
  }

  async function launchScene(scene: typeof SCENES[0]) {
    setLoading(scene.type)
    await fetch(`${API}/api/admin/scene/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scene),
    })
    await fetchSession()
    setLoading('')
  }

  async function stopScene() {
    setLoading('stop')
    await fetch(`${API}/api/admin/scene/stop`, { method: 'POST' })
    await fetchSession()
    setLoading('')
  }

  async function openSchrodinger() {
    setLoading('schrodinger-open')
    await fetch(`${API}/api/admin/schrodinger/open`, { method: 'POST' })
    await fetchSession()
    setLoading('')
  }

  return (
    <div style={{ background: '#000', color: '#E8E6E1', minHeight: '100vh', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid #1A1A1D', paddingBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 28, fontWeight: 700, margin: 0 }}>Régie</h1>
            <p style={{ color: '#4A4A52', fontSize: 13, marginTop: 4 }}>Dashboard de contrôle</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 32, fontWeight: 700 }}>
                {session?.clients ?? 0}
              </div>
              <div style={{ fontSize: 11, color: '#4A4A52', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Connectés
              </div>
            </div>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: session?.state === 'active' ? '#34d399' : session?.state === 'waiting' ? '#D4B896' : '#4A4A52',
            }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
          {/* Left: Scene list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A52' }}>Scènes</h2>
              {session?.state === 'waiting' && (
                <button
                  onClick={startSession}
                  style={{
                    padding: '8px 20px', background: 'transparent', border: '1px solid #D4B896',
                    color: '#D4B896', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}
                >
                  {loading === 'start' ? '...' : 'Démarrer la session'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: 4 }}>
              {Object.entries(GROUP_LABELS).map(([groupKey, groupLabel]) => {
                const groupScenes = SCENES.filter((s) => s.group === groupKey)
                if (groupScenes.length === 0) return null
                return (
                  <div key={groupKey}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#4A4A52', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '12px 4px 4px', borderTop: '1px solid #1A1A1D' }}>
                      {groupLabel}
                    </div>
                    {groupScenes.map((scene, i) => {
                      const isActive = session?.scene?.type === scene.type && session?.scene?.name === scene.name
                      return (
                        <button
                          key={`${groupKey}-${i}`}
                          onClick={() => launchScene(scene)}
                          disabled={loading !== ''}
                          style={{
                            display: 'flex', flexDirection: 'column', gap: 2,
                            padding: '10px 16px', textAlign: 'left', width: '100%',
                            background: isActive ? 'rgba(212,184,150,0.08)' : '#0A0A0B',
                            border: isActive ? '1px solid rgba(212,184,150,0.3)' : '1px solid #1A1A1D',
                            cursor: 'pointer', transition: 'all 0.2s', marginBottom: 2,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#D4B896' : '#E8E6E1' }}>
                            {scene.name}
                          </span>
                          <span style={{ fontSize: 10, color: '#4A4A52' }}>
                            {scene.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Current scene + controls */}
          <div>
            <div style={{
              padding: 32, background: '#0A0A0B', border: '1px solid #1A1A1D',
              minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              {session?.scene ? (
                <>
                  <div>
                    <div style={{ fontSize: 11, color: '#4A4A52', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
                      Scène active
                    </div>
                    <h3 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                      {session.scene.name}
                    </h3>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px',
                      fontFamily: 'JetBrains Mono', fontSize: 11,
                      border: '1px solid #1A1A1D', color: '#4A4A52',
                    }}>
                      {session.scene.type}
                    </span>

                    {/* Poll results */}
                    {session.scene.type.includes('poll') && pollResults && (
                      <div style={{ marginTop: 24 }}>
                        <div style={{ fontSize: 11, color: '#4A4A52', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>
                          Résultats — {pollResults.total} votes
                        </div>
                        {Object.entries(pollResults.votes).map(([optionId, count]) => {
                          const pct = pollResults.total > 0 ? Math.round((count / pollResults.total) * 100) : 0
                          return (
                            <div key={optionId} style={{ marginBottom: 10 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{optionId.toUpperCase()}</span>
                                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }}>{pct}% ({count})</span>
                              </div>
                              <div style={{ height: 4, background: '#1A1A1D', borderRadius: 2 }}>
                                <div style={{
                                  height: '100%', width: `${pct}%`, borderRadius: 2,
                                  background: '#E8E6E1', transition: 'width 0.5s ease-out',
                                }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                    {session.scene.type === 'schrodinger' && (
                      <button
                        onClick={openSchrodinger}
                        disabled={loading !== ''}
                        style={{
                          padding: '10px 24px', background: 'transparent',
                          border: '1px solid #D4B896', color: '#D4B896',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}
                      >
                        {loading === 'schrodinger-open' ? '...' : 'Ouvrir la boîte'}
                      </button>
                    )}
                    <button
                      onClick={stopScene}
                      style={{
                        padding: '10px 24px', background: 'transparent',
                        border: '1px solid #4A4A52', color: '#E8E6E1',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                      }}
                    >
                      Stopper la scène
                    </button>
                    <button
                      onClick={() => launchScene(SCENES[SCENES.length - 1])}
                      style={{
                        padding: '10px 24px', background: 'transparent',
                        border: '1px solid rgba(255,77,109,0.3)', color: '#FF4D6D',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                      }}
                    >
                      Blackout
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <p style={{ color: '#4A4A52', fontSize: 14 }}>Aucune scène active</p>
                  <p style={{ color: '#1A1A1D', fontSize: 12, marginTop: 8 }}>Sélectionnez une scène à gauche pour la lancer</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
