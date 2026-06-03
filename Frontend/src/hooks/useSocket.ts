'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

let globalSocket: Socket | null = null

function getSocket(): Socket {
  if (!globalSocket || !globalSocket.connected) {
    globalSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return globalSocket
}

/**
 * Hook for Socket.IO real-time events.
 *
 * Usage:
 *   const { emit, on, off, connected } = useSocket()
 *
 *   // Listen for an event
 *   on('quiz:user-joined', (data) => console.log(data))
 *
 *   // Emit an event
 *   emit('quiz:start', { quizId: 1 })
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      // Don't disconnect the shared socket on unmount — other components may still use it.
      // Individual listeners are cleaned up via the returned `off` function.
    }
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data)
  }, [])

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler)
  }, [])

  const off = useCallback((event: string, handler?: (...args: unknown[]) => void) => {
    if (handler) {
      socketRef.current?.off(event, handler)
    } else {
      socketRef.current?.off(event)
    }
  }, [])

  const connected = socketRef.current?.connected ?? false

  return {
    emit,
    on,
    off,
    connected,
  }
}

/**
 * Hook for joining a Socket.IO room and handling room-specific events.
 *
 * Automatically joins the room on mount and leaves on unmount.
 *
 * Usage:
 *   useSocketRoom('quiz:1', {
 *     'quiz:user-joined': (data) => setParticipants(data),
 *     'quiz:answer-received': (data) => handleAnswer(data),
 *   })
 */
export function useSocketRoom(
  room: string | null,
  handlers: Record<string, (...args: unknown[]) => void> = {}
) {
  const { emit, on, off } = useSocket()

  useEffect(() => {
    if (!room) return

    emit('join:room', { room })

    for (const [event, handler] of Object.entries(handlers)) {
      on(event, handler)
    }

    return () => {
      emit('leave:room', { room })
      for (const [event, handler] of Object.entries(handlers)) {
        off(event, handler)
      }
    }
    // handlers is intentionally excluded — callers should memoize with useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, emit, on, off])
}
