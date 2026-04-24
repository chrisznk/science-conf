import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Server } from 'socket.io'
import { createSession } from './session.ts'

const PORT = parseInt(process.env.PORT || '3002')

const fastify = Fastify({ logger: true })

await fastify.register(cors, { origin: true })

const io = new Server(fastify.server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingInterval: 10000,
  pingTimeout: 5000,
})

const session = createSession(io)

fastify.get('/api/health', async () => ({ status: 'ok', clients: session.getClientCount() }))

fastify.get('/api/session', async () => session.getState())

fastify.get('/api/galaxies', async () => session.getGalaxies())

fastify.get('/api/admin/participants', async () => session.getParticipants())

fastify.get('/api/participants', async () => session.getParticipants())

fastify.post('/api/admin/session/start', async () => {
  session.setSessionState('active')
  return { ok: true }
})

fastify.post('/api/admin/scene/launch', async (req) => {
  const body = req.body as { type: string; name: string; params: Record<string, unknown> }
  session.launchScene({
    id: Date.now().toString(),
    type: body.type,
    name: body.name,
    params: body.params || {},
    state: 'running',
  })
  return { ok: true }
})

fastify.post('/api/admin/scene/stop', async () => {
  session.stopScene()
  return { ok: true }
})

fastify.post('/api/admin/blackout', async () => {
  session.blackout()
  return { ok: true }
})

fastify.post('/api/admin/schrodinger/open', async () => {
  session.openSchrodinger()
  return { ok: true }
})

fastify.get('/api/admin/poll-results', async () => session.getPollResults())

io.on('connection', (socket) => {
  session.handleConnection(socket)
})

try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`Server running on port ${PORT}`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
