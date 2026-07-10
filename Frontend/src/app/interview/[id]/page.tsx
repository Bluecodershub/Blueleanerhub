'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ScreenShare,
  ScreenShareOff,
  PhoneOff,
  MessageSquare,
  Users,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface InterviewMeta {
  id: number
  title: string
  interviewer_name?: string
  candidate_name?: string
  duration_min?: number
}

export default function InterviewRoomPage() {
  const { id } = useParams<{ id: string }>()
  const [meta, setMeta] = useState<InterviewMeta | null>(null)
  const [connecting, setConnecting] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [screenOn, setScreenOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    api
      .get(`/interviews/${id}`)
      .then((r) => setMeta(r.data?.data ?? r.data))
      .catch(() => setMeta(null))
  }, [id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        // permissions denied — user can still see the shell
      } finally {
        if (!cancelled) setConnecting(false)
      }
    })()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const toggleCam = () => {
    const v = streamRef.current?.getVideoTracks()[0]
    if (!v) return
    v.enabled = !v.enabled
    setCamOn(v.enabled)
  }
  const toggleMic = () => {
    const a = streamRef.current?.getAudioTracks()[0]
    if (!a) return
    a.enabled = !a.enabled
    setMicOn(a.enabled)
  }
  const toggleShare = async () => {
    if (screenOn) {
      setScreenOn(false)
      return
    }
    try {
      await navigator.mediaDevices.getDisplayMedia({ video: true })
      setScreenOn(true)
    } catch {}
  }
  const leave = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    history.back()
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3 text-sm">
        <div>
          <p className="font-bold">
            {meta?.title ?? 'Interview Room'}{' '}
            <span className="ml-2 text-xs text-white/60">#{id}</span>
          </p>
          {meta?.interviewer_name && (
            <p className="text-xs text-white/60">
              With {meta.interviewer_name} • {meta.duration_min ?? 45} min
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> LIVE
        </div>
      </header>

      <main className="flex flex-1 flex-col md:flex-row">
        <div className="relative flex flex-1 items-center justify-center bg-black">
          {connecting ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-2 text-sm text-white/60">Connecting camera & mic…</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-cover ${camOn ? '' : 'opacity-30'}`}
              />
              {!camOn && (
                <div className="absolute inset-0 flex items-center justify-center text-white/60">
                  <VideoOff className="h-12 w-12" />
                </div>
              )}
            </>
          )}
        </div>

        <aside className="w-full border-l border-white/10 bg-neutral-900 md:w-80">
          <div className="border-b border-white/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase text-white/60">
              <Users className="h-3 w-3" /> Participants
            </div>
            <ul className="space-y-1 text-sm">
              <li>• You</li>
              {meta?.interviewer_name && <li>• {meta.interviewer_name}</li>}
              {meta?.candidate_name && meta.candidate_name !== 'You' && (
                <li>• {meta.candidate_name}</li>
              )}
            </ul>
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase text-white/60">
              <MessageSquare className="h-3 w-3" /> Chat
            </div>
            <p className="text-xs text-white/40">
              Live chat opens when both participants join.
            </p>
          </div>
        </aside>
      </main>

      <footer className="flex items-center justify-center gap-3 border-t border-white/10 bg-neutral-900 py-4">
        <Button variant="secondary" size="icon" onClick={toggleMic}>
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-red-400" />}
        </Button>
        <Button variant="secondary" size="icon" onClick={toggleCam}>
          {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4 text-red-400" />}
        </Button>
        <Button variant="secondary" size="icon" onClick={toggleShare}>
          {screenOn ? (
            <ScreenShareOff className="h-4 w-4" />
          ) : (
            <ScreenShare className="h-4 w-4" />
          )}
        </Button>
        <Button variant="destructive" onClick={leave}>
          <PhoneOff className="mr-2 h-4 w-4" />
          Leave
        </Button>
      </footer>
    </div>
  )
}
