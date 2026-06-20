'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Play, Pause, Square } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth'

export default function Oscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const [isRunning, setIsRunning] = useState(false)
  const [waveform, setWaveform] = useState<WaveformType>('sine')
  const [frequency, setFrequency] = useState([1])
  const [amplitude, setAmplitude] = useState([50])
  const [timeScale, setTimeScale] = useState([1])
  const [voltageScale, setVoltageScale] = useState([1])
  const [offset, setOffset] = useState([0])
  const [phase, setPhase] = useState(0)
  const [measurements, setMeasurements] = useState({
    vpp: 0,
    vrms: 0,
    freq: 0,
    period: 0,
  })

  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const animate = () => {
      drawWaveform()
      setPhase((prev) => (prev + frequency[0] * 0.05) % (2 * Math.PI))
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2

    // Clear canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    drawGrid(ctx, width, height)

    // Draw waveform
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 2
    ctx.beginPath()

    const points = width
    const timeSpan = (4 * Math.PI) / timeScale[0]
    const amp = amplitude[0] * voltageScale[0]
    const offsetY = offset[0]

    let maxValue = 0
    let minValue = 0

    for (let i = 0; i < points; i++) {
      const t = (i / points) * timeSpan
      let y = 0

      switch (waveform) {
        case 'sine':
          y = Math.sin(frequency[0] * t + phase) * amp
          break
        case 'square':
          y = Math.sign(Math.sin(frequency[0] * t + phase)) * amp
          break
        case 'triangle':
          y = ((2 * amp) / Math.PI) * Math.asin(Math.sin(frequency[0] * t + phase))
          break
        case 'sawtooth':
          y = ((2 * amp) / Math.PI) * Math.atan(Math.tan((frequency[0] * t + phase) / 2))
          break
      }

      y += offsetY
      maxValue = Math.max(maxValue, y)
      minValue = Math.min(minValue, y)

      const x = i
      const pixelY = centerY - y

      if (i === 0) {
        ctx.moveTo(x, pixelY)
      } else {
        ctx.lineTo(x, pixelY)
      }
    }

    ctx.stroke()

    // Update measurements
    const vpp = maxValue - minValue
    const vrms = vpp / (2 * Math.sqrt(2))
    const freq = frequency[0]
    const period = 1 / freq

    setMeasurements({
      vpp: vpp,
      vrms: vrms,
      freq: freq,
      period: period,
    })
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x <= width; x += width / 10) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += height / 8) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Center line
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }

  const handleStartStop = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setPhase(0)
    setFrequency([1])
    setAmplitude([50])
    setTimeScale([1])
    setVoltageScale([1])
    setOffset([0])
  }

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Oscilloscope Display */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
          <span className="text-sm font-semibold text-white">Virtual Oscilloscope</span>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleStartStop}
              variant={isRunning ? 'destructive' : 'default'}
              size="sm"
            >
              {isRunning ? (
                <>
                  <Pause className="mr-1 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-1 h-4 w-4" />
                  Run
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <Square className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-black p-4">
          <canvas ref={canvasRef} width={800} height={400} className="h-full w-full" />
        </div>

        {/* Measurements Display */}
        <div className="border-t border-gray-700 bg-gray-800 px-4 py-2">
          <div className="grid grid-cols-4 gap-4 font-mono text-xs">
            <div>
              <span className="text-gray-400">Vpp:</span>{' '}
              <span className="text-sky-400">{measurements.vpp.toFixed(2)} V</span>
            </div>
            <div>
              <span className="text-gray-400">Vrms:</span>{' '}
              <span className="text-sky-400">{measurements.vrms.toFixed(2)} V</span>
            </div>
            <div>
              <span className="text-gray-400">Freq:</span>{' '}
              <span className="text-sky-400">{measurements.freq.toFixed(2)} Hz</span>
            </div>
            <div>
              <span className="text-gray-400">Period:</span>{' '}
              <span className="text-sky-400">{measurements.period.toFixed(3)} s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <Card className="w-full space-y-6 border-gray-700 bg-gray-800 p-4 lg:w-80">
        <div>
          <h3 className="mb-3 font-semibold text-white">Signal Generator</h3>

          <div className="space-y-4">
            {/* Waveform Type */}
            <div>
              <Label className="text-sm text-white">Waveform</Label>
              <Select value={waveform} onValueChange={(v: WaveformType) => setWaveform(v)}>
                <SelectTrigger className="mt-1 border-gray-600 bg-gray-900 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sine">Sine</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                  <SelectItem value="sawtooth">Sawtooth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frequency */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label className="text-sm text-white">Frequency</Label>
                <span className="text-xs text-gray-400">{frequency[0].toFixed(2)} Hz</span>
              </div>
              <Slider
                value={frequency}
                onValueChange={setFrequency}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Amplitude */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label className="text-sm text-white">Amplitude</Label>
                <span className="text-xs text-gray-400">{amplitude[0]} V</span>
              </div>
              <Slider
                value={amplitude}
                onValueChange={setAmplitude}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Offset */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label className="text-sm text-white">DC Offset</Label>
                <span className="text-xs text-gray-400">{offset[0]} V</span>
              </div>
              <Slider
                value={offset}
                onValueChange={setOffset}
                min={-50}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="mb-3 font-semibold text-white">Oscilloscope Settings</h3>

          <div className="space-y-4">
            {/* Time Scale */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label className="text-sm text-white">Time/Div</Label>
                <span className="text-xs text-gray-400">{timeScale[0]}x</span>
              </div>
              <Slider
                value={timeScale}
                onValueChange={setTimeScale}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Voltage Scale */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label className="text-sm text-white">Volts/Div</Label>
                <span className="text-xs text-gray-400">{voltageScale[0]}x</span>
              </div>
              <Slider
                value={voltageScale}
                onValueChange={setVoltageScale}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
