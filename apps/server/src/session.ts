import { Server, Socket } from 'socket.io'
import { GALAXIES_WITH_IMAGES as GALAXIES } from './galaxies-data.ts'

const PAIR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#D7BDE2',
  '#A3E4D7', '#FAD7A0', '#A9CCE3', '#D5F5E3', '#FADBD8',
  '#E8DAEF', '#D4EFDF', '#FCF3CF', '#D6EAF8', '#F2D7D5',
  '#EBDEF0', '#D1F2EB', '#FEF9E7', '#D4E6F1', '#F5EEF8',
]

type Participant = {
  id: string
  socketId: string
  seatId: string | null
  galaxyId: string
  pairId: string | null
  pairColor: string | null
  joinOrder: number
  hiddenState: Record<string, unknown>
  connectedAt: Date
}

type SceneState = 'idle' | 'armed' | 'running' | 'done'

type ActiveScene = {
  id: string
  type: string
  name: string
  params: Record<string, unknown>
  state: SceneState
}

type PollVotes = Map<string, string>

export function createSession(io: Server) {
  const participants = new Map<string, Participant>()
  const seatToParticipant = new Map<string, string>()
  let sessionState: 'waiting' | 'active' | 'ended' = 'waiting'
  let currentScene: ActiveScene | null = null
  let pollVotes: PollVotes = new Map()
  let galaxyIndex = 0
  let joinCounter = 0
  let colorIndex = 0

  function assignGalaxy(): string {
    const galaxy = GALAXIES[galaxyIndex % GALAXIES.length]
    galaxyIndex++
    return galaxy.id
  }

  function getNextColor(): string {
    const color = PAIR_COLORS[colorIndex % PAIR_COLORS.length]
    colorIndex++
    return color
  }

  function assignPairs() {
    const ids = Array.from(participants.keys())
    for (let i = 0; i < ids.length - 1; i += 2) {
      const p1 = participants.get(ids[i])!
      const p2 = participants.get(ids[i + 1])!
      if (p1.pairId && p2.pairId) continue
      const color = getNextColor()
      p1.pairId = ids[i + 1]
      p2.pairId = ids[i]
      p1.pairColor = color
      p2.pairColor = color
    }
  }

  function findUnpairedParticipant(excludeId: string): Participant | undefined {
    for (const p of participants.values()) {
      if (p.id !== excludeId && !p.pairId) return p
    }
    return undefined
  }

  function pairTwo(p1: Participant, p2: Participant) {
    const color = getNextColor()
    p1.pairId = p2.id
    p2.pairId = p1.id
    p1.pairColor = color
    p2.pairColor = color

    const s1 = io.sockets.sockets.get(p1.socketId)
    const s2 = io.sockets.sockets.get(p2.socketId)
    s1?.emit('entanglement:paired', { pairColor: color })
    s2?.emit('entanglement:paired', { pairColor: color })
  }

  function broadcastPollResults() {
    const votes: Record<string, number> = {}
    pollVotes.forEach((optionId) => {
      votes[optionId] = (votes[optionId] || 0) + 1
    })
    io.emit('poll:results', { votes, total: pollVotes.size })
  }

  function handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`)

    socket.on('join', (data: { sessionId: string; seatId: string; participantId: string }) => {
      const { seatId, participantId } = data

      if (seatToParticipant.has(seatId) && seatToParticipant.get(seatId) !== participantId) {
        socket.emit('error', { message: 'Ce siège est déjà pris.' })
        return
      }

      const existing = participants.get(participantId)
      if (existing) {
        existing.socketId = socket.id
        const galaxy = GALAXIES.find((g) => g.id === existing.galaxyId)
        socket.emit('participant:assigned', {
          galaxyId: existing.galaxyId,
          galaxy,
          pairId: existing.pairId,
          pairColor: existing.pairColor,
          joinOrder: existing.joinOrder,
        })
        socket.emit('session:state', sessionState)
        if (currentScene) socket.emit('scene:change', currentScene)
        io.emit('stats:update', { connected: participants.size })
        return
      }

      joinCounter++
      const galaxyId = assignGalaxy()
      const participant: Participant = {
        id: participantId,
        socketId: socket.id,
        seatId,
        galaxyId,
        pairId: null,
        pairColor: null,
        joinOrder: joinCounter,
        hiddenState: {},
        connectedAt: new Date(),
      }

      participants.set(participantId, participant)
      seatToParticipant.set(seatId, participantId)

      const galaxy = GALAXIES.find((g) => g.id === galaxyId)

      socket.emit('participant:assigned', {
        galaxyId,
        galaxy,
        pairId: null,
        pairColor: null,
        joinOrder: joinCounter,
      })

      socket.emit('session:state', sessionState)
      if (currentScene) socket.emit('scene:change', currentScene)

      const unpaired = findUnpairedParticipant(participantId)
      if (unpaired) {
        pairTwo(participant, unpaired)
      }

      io.emit('stats:update', { connected: participants.size })
      console.log(`Participant ${participantId} joined seat ${seatId}, galaxy ${galaxyId}, order ${joinCounter}`)
    })

    socket.on('galaxy:reroll', (data: { excludeIds: string[] }) => {
      const exclude = new Set(data.excludeIds || [])
      const available = GALAXIES.filter((g) => !exclude.has(g.id))
      if (available.length === 0) return
      const newGalaxy = available[Math.floor(Math.random() * available.length)]
      const participant = findParticipantBySocket(socket.id)
      if (participant) participant.galaxyId = newGalaxy.id
      socket.emit('galaxy:rerolled', { galaxy: newGalaxy })
    })

    socket.on('poll:vote', (data: { sceneId: string; optionId: string }) => {
      const participant = findParticipantBySocket(socket.id)
      if (!participant) return
      pollVotes.set(participant.id, data.optionId)
      broadcastPollResults()
    })

    socket.on('entanglement:tap', () => {
      const participant = findParticipantBySocket(socket.id)
      if (!participant?.pairId) return
      const pair = participants.get(participant.pairId)
      if (pair) {
        const pairSocket = io.sockets.sockets.get(pair.socketId)
        pairSocket?.emit('entanglement:tap', { color: participant.pairColor })
        socket.emit('entanglement:tap-self', { color: participant.pairColor })
      }
    })

    socket.on('entanglement:found', () => {
      const participant = findParticipantBySocket(socket.id)
      if (!participant?.pairId) return
      const pair = participants.get(participant.pairId)
      if (pair) {
        const pairSocket = io.sockets.sockets.get(pair.socketId)
        pairSocket?.emit('entanglement:found', { distance: 43 })
        socket.emit('entanglement:found', { distance: 43 })
      }
    })

    socket.on('disconnect', () => {
      const participant = findParticipantBySocket(socket.id)
      if (participant) {
        if (participant.pairId) {
          const pair = participants.get(participant.pairId)
          if (pair) {
            pair.pairId = null
            pair.pairColor = null
            const pairSocket = io.sockets.sockets.get(pair.socketId)
            pairSocket?.emit('entanglement:unpaired')
            const newMatch = findUnpairedParticipant(pair.id)
            if (newMatch) {
              pairTwo(pair, newMatch)
            }
          }
        }
        participants.delete(participant.id)
        if (participant.seatId) seatToParticipant.delete(participant.seatId)
        io.emit('stats:update', { connected: participants.size })
        console.log(`Client disconnected: ${participant.id}`)
      }
    })
  }

  function findParticipantBySocket(socketId: string): Participant | undefined {
    for (const p of participants.values()) {
      if (p.socketId === socketId) return p
    }
    return undefined
  }

  function launchScene(scene: ActiveScene) {
    currentScene = { ...scene, state: 'running' }
    pollVotes = new Map()

    if (scene.type === 'entanglement_pair') {
      assignPairs()
      for (const p of participants.values()) {
        if (p.pairId && p.pairColor) {
          const s = io.sockets.sockets.get(p.socketId)
          s?.emit('entanglement:paired', { pairColor: p.pairColor })
        }
      }
    }

    io.emit('scene:change', currentScene)
  }

  function openSchrodinger() {
    if (currentScene?.type !== 'schrodinger') return
    currentScene = { ...currentScene, params: { ...currentScene.params, opened: true }, state: 'running' }
    io.emit('scene:change', currentScene)
  }

  function stopScene() {
    if (currentScene) {
      currentScene.state = 'done'
      io.emit('scene:change', { ...currentScene })
    }
    currentScene = null
  }

  function blackout() {
    launchScene({ id: 'blackout', type: 'blackout', name: 'Blackout', params: {}, state: 'running' })
  }

  function setSessionState(state: 'waiting' | 'active' | 'ended') {
    sessionState = state
    io.emit('session:state', state)
  }

  return {
    handleConnection,
    launchScene,
    stopScene,
    blackout,
    openSchrodinger,
    setSessionState,
    assignPairs,
    getClientCount: () => participants.size,
    getState: () => ({ state: sessionState, scene: currentScene, clients: participants.size }),
    getGalaxies: () => GALAXIES.slice(0, 20),
    getParticipants: () => Array.from(participants.values()),
    getPollResults: () => {
      const votes: Record<string, number> = {}
      pollVotes.forEach((v) => { votes[v] = (votes[v] || 0) + 1 })
      return { votes, total: pollVotes.size }
    },
  }
}
