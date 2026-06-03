'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

type OutputHandler = (chunk: string) => void;
type ResultHandler = (result: any) => void;

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export function useExecutionStream(sessionId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const outputHandlersRef = useRef<Map<string, Set<OutputHandler>>>(new Map());
  const resultHandlersRef = useRef<Map<string, Set<ResultHandler>>>(new Map());

  useEffect(() => {
    if (!sessionId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('sandbox:join', { sessionId });
    });

    socket.on('sandbox:output', (data: { sessionId: string; chunk: string }) => {
      const handlers = outputHandlersRef.current.get(data.sessionId);
      handlers?.forEach((h) => h(data.chunk));
    });

    socket.on('sandbox:result', (data: { sessionId: string; result: any }) => {
      const handlers = resultHandlersRef.current.get(data.sessionId);
      handlers?.forEach((h) => h(data.result));
    });

    socket.on('disconnect', () => {
      socket.emit('sandbox:leave', { sessionId });
    });

    socketRef.current = socket;

    return () => {
      socket.emit('sandbox:leave', { sessionId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId]);

  const onOutput = useCallback((sid: string, handler: OutputHandler) => {
    if (!outputHandlersRef.current.has(sid)) {
      outputHandlersRef.current.set(sid, new Set());
    }
    outputHandlersRef.current.get(sid)!.add(handler);
    return () => { outputHandlersRef.current.get(sid)?.delete(handler); };
  }, []);

  const onResult = useCallback((sid: string, handler: ResultHandler) => {
    if (!resultHandlersRef.current.has(sid)) {
      resultHandlersRef.current.set(sid, new Set());
    }
    resultHandlersRef.current.get(sid)!.add(handler);
    return () => { resultHandlersRef.current.get(sid)?.delete(handler); };
  }, []);

  return { onOutput, onResult, socket: socketRef };
}
