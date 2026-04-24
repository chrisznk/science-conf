import { create } from 'zustand'

type Galaxy = {
  id: string
  name: string
  commonName: string | null
  type: string
  distanceMly: number
  constellation: string
  description: string
  imageId: string | null
  isRare: boolean
  rareLabel: string | null
}

type Scene = {
  id: string
  type: string
  name: string
  params: Record<string, unknown>
  state: string
}

type AppStore = {
  participantId: string
  seatId: string | null
  joined: boolean
  joinOrder: number
  galaxy: Galaxy | null
  scene: Scene | null
  sessionState: 'waiting' | 'active' | 'ended'
  pollVoted: string | null
  pollResults: { votes: Record<string, number>; total: number } | null
  pairColor: string | null
  reconnecting: boolean

  setParticipantId: (id: string) => void
  setSeatId: (id: string) => void
  setJoined: (joined: boolean) => void
  setJoinOrder: (order: number) => void
  setGalaxy: (galaxy: Galaxy) => void
  setScene: (scene: Scene | null) => void
  setSessionState: (state: 'waiting' | 'active' | 'ended') => void
  setPollVoted: (optionId: string | null) => void
  setPollResults: (results: { votes: Record<string, number>; total: number }) => void
  setPairColor: (color: string | null) => void
  setReconnecting: (val: boolean) => void
}

function getOrCreateId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('sc_participant_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('sc_participant_id', id)
  }
  return id
}

export const useStore = create<AppStore>((set) => ({
  participantId: typeof window !== 'undefined' ? getOrCreateId() : '',
  seatId: null,
  joined: false,
  joinOrder: 0,
  galaxy: null,
  scene: null,
  sessionState: 'waiting',
  pollVoted: null,
  pollResults: null,
  pairColor: null,
  reconnecting: false,

  setParticipantId: (id) => set({ participantId: id }),
  setSeatId: (id) => set({ seatId: id }),
  setJoined: (joined) => set({ joined }),
  setJoinOrder: (order) => set({ joinOrder: order }),
  setGalaxy: (galaxy) => set({ galaxy }),
  setScene: (scene) => set({ scene, pollVoted: null, pollResults: null }),
  setSessionState: (state) => set({ sessionState: state }),
  setPollVoted: (optionId) => set({ pollVoted: optionId }),
  setPollResults: (results) => set({ pollResults: results }),
  setPairColor: (color) => set({ pairColor: color }),
  setReconnecting: (val) => set({ reconnecting: val }),
}))
