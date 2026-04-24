'use client'

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useStore } from './store'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002'

const SocketContext = createContext<Socket | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null)
  const store = useStore()

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      store.setReconnecting(false)
      const savedSeat = localStorage.getItem('sc_seat_id')
      if (savedSeat && store.participantId) {
        socket.emit('join', {
          sessionId: 'default',
          seatId: savedSeat,
          participantId: store.participantId,
        })
      }
    })

    socket.on('disconnect', () => {
      store.setReconnecting(true)
    })

    socket.on('participant:assigned', (data) => {
      if (data.galaxy) store.setGalaxy(data.galaxy)
      if (data.joinOrder) store.setJoinOrder(data.joinOrder)
      if (data.pairColor) store.setPairColor(data.pairColor)
      store.setJoined(true)
    })

    socket.on('entanglement:paired', (data) => {
      if (data.pairColor) store.setPairColor(data.pairColor)
    })

    socket.on('entanglement:unpaired', () => {
      store.setPairColor(null)
    })

    socket.on('session:state', (state) => {
      store.setSessionState(state)
    })

    socket.on('scene:change', (scene) => {
      store.setScene(scene)
    })

    socket.on('poll:results', (results) => {
      store.setPollResults(results)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
