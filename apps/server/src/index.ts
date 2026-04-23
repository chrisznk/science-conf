import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Server } from 'socket.io'
import { createSession } from './session.js'

const PORT = parseInt(process.env.PORT || '3001')

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
