import { Server, Socket } from 'socket.io'
import { GALAXIES } from './galaxies.js'

type Participant = {
  id: string
  socketId: string
  seatId: string | null
  galaxyId: string
  pairId: string | null
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

  function assignGalaxy(): string {
    const galaxy = GALAXIES[galaxyIndex % GALAXIES.length]
    galaxyIndex++
    return galaxy.id
  }

  function assignPairs() {
    const ids = Array.from(participants.keys())
    for (let i = 0; i < ids.length - 1; i += 2) {
      const p1 = participants.get(ids[i])!
      const p2 = participants.get(ids[i + 1])!
      p1.pairId = ids[i + 1]
      p2.pairId = ids[i]
    }
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

      const galaxyId = assignGalaxy()
      const participant: Participant = {
        id: participantId,
        socketId: socket.id,
        seatId,
        galaxyId,
        pairId: null,
        hiddenState: { schrodinger: Math.random() < 0.002 ? 'signal' : 'silence' },
        connectedAt: new Date(),
      }

      participants.set(participantId, participant)
      seatToParticipant.set(seatId, participantId)

      const galaxy = GALAXIES.find((g) => g.id === galaxyId)

      socket.emit('participant:assigned', {
        galaxyId,
        galaxy,
        pairId: null,
        hiddenState: {},
      })

      socket.emit('session:state', sessionState)
      if (currentScene) socket.emit('scene:change', currentScene)

      io.emit('stats:update', { connected: participants.size })
      console.log(`Participant ${participantId} joined seat ${seatId}, galaxy ${galaxyId}`)
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
        pairSocket?.emit('entanglement:tap')
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

  // Admin functions
  function launchScene(scene: ActiveScene) {
    currentScene = { ...scene, state: 'running' }
    pollVotes = new Map()
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
