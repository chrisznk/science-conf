export type SessionState = 'waiting' | 'active' | 'ended'

export type Session = {
  id: string
  name: string
  startedAt: string
  endedAt: string | null
  state: SessionState
}

export type SeatSection = 'orchestra' | 'balcony' | 'mezzanine'

export type Seat = {
  id: string
  row: string
  number: number
  section: SeatSection
  x: number
  y: number
}

export type Participant = {
  id: string
  sessionId: string
  seatId: string | null
  galaxyId: string
  pairId: string | null
  hiddenState: Record<string, unknown>
  connectedAt: string
  lastSeenAt: string
}

export type GalaxyType = 'spiral' | 'elliptical' | 'irregular' | 'lenticular'

export type Galaxy = {
  id: string
  name: string
  commonName: string | null
  type: GalaxyType
  distanceMly: number
  constellation: string
  imageUrl: string
  description: string
  isRare: boolean
  rareLabel: string | null
}

export type SceneType =
  | 'welcome'
  | 'galaxy_reveal'
  | 'binary_poll'
  | 'multi_poll'
  | 'schrodinger'
  | 'entanglement_pair'
  | 'entanglement_measure'
  | 'pixel_wall'
  | 'light_wave'
  | 'cosmic_orchestra'
  | 'galaxy_wall'
  | 'blackout'

export type SceneState = 'idle' | 'armed' | 'running' | 'done'

export type Scene = {
  id: string
  type: SceneType
  name: string
  params: Record<string, unknown>
  state: SceneState
}

export type PollOption = {
  id: string
  label: string
  description?: string
}

export type BinaryPollParams = {
  question: string
}

export type MultiPollParams = {
  question: string
  options: PollOption[]
  correctOptionId?: string
}

// Socket events
export type ServerToClientEvents = {
  'session:state': (state: SessionState) => void
  'scene:change': (scene: Scene) => void
  'scene:data': (data: Record<string, unknown>) => void
  'participant:assigned': (data: { galaxyId: string; pairId: string | null; hiddenState: Record<string, unknown> }) => void
  'poll:results': (data: { votes: Record<string, number>; total: number }) => void
  'entanglement:tap': () => void
  'entanglement:found': (data: { distance: number }) => void
  'pixel:color': (data: { r: number; g: number; b: number }) => void
  'wave:trigger': (data: { delay: number; duration: number }) => void
  'orchestra:note': (data: { frequency: number; volume: number }) => void
  'ping': () => void
}

export type ClientToServerEvents = {
  'join': (data: { sessionId: string; seatId: string; participantId: string }) => void
  'poll:vote': (data: { sceneId: string; optionId: string }) => void
  'entanglement:tap': () => void
  'entanglement:found': () => void
  'pong': () => void
}
