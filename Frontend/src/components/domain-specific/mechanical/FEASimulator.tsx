'use client'

import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, RotateCcw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FEASimulatorProps {
  height?: string
}

export default function FEASimulator({ height = '600px' }: FEASimulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [analysisType, setAnalysisType] = useState('stress')
  const [loadValue, setLoadValue] = useState([50])
  const [simulationTime, setSimulationTime] = useState(0)
  const [results, setResults] = useState({
    maxStress: 0,
    maxDisplacement: 0,
    safetyFactor: 0,
  })

  const updateStressColors = (geometry: THREE.BoxGeometry, load: number = 0) => {
    const positions = geometry.attributes.position
    const colors = new Float32Array(positions.count * 3)

    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i)
      const stress = Math.sin(y * 3) * load * 0.01
      const normalizedStress = Math.min(1, Math.max(0, (stress + load) / (load * 2)))

      colors[i * 3] = normalizedStress
      colors[i * 3 + 1] = 1 - normalizedStress
      colors[i * 3 + 2] = 0
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a1a)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 3, 5)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create beam for FEA analysis
    const geometry = new THREE.BoxGeometry(4, 0.3, 0.3, 40, 3, 3)
    const material = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      vertexColors: true,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    meshRef.current = mesh

    // Initialize colors
    updateStressColors(geometry, 0)

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10)
    scene.add(gridHelper)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      renderer.dispose()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const container = containerRef.current
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Stress calculation functions - defined before useEffect to avoid lint errors
  const calculateMaxStress = (load: number): number => {
    const length = 4
    const force = load * 10
    const moment = (force * length) / 4
    const c = 0.15
    const I = (0.3 * 0.3 ** 3) / 12
    return (moment * c) / I
  }

  const calculateMaxDisplacement = (load: number): number => {
    const length = 4
    const force = load * 10
    const E = 200e9
    const I = (0.3 * 0.3 ** 3) / 12
    return (force * length ** 3) / (3 * E * I)
  }

  const calculateSafetyFactor = (maxStress: number): number => {
    const yieldStrength = 250e6
    return yieldStrength / maxStress
  }

  const deformMesh = (geometry: THREE.BoxGeometry, load: number, time: number) => {
    const positions = geometry.attributes.position
    const originalPositions = geometry.attributes.position.clone()

    for (let i = 0; i < positions.count; i++) {
      const x = originalPositions.getX(i)
      const y = originalPositions.getY(i)
      const displacement = ((x + 2) / 4) ** 2 * (load / 100) * 0.5 * Math.sin(time)
      positions.setY(i, y - displacement)
    }
    positions.needsUpdate = true
  }

  // Simulate stress analysis
  useEffect(() => {
    if (!isSimulating || !meshRef.current) return

    const interval = setInterval(() => {
      setSimulationTime((prev) => {
        const newTime = prev + 0.1

        // Update stress visualization
        const geometry = meshRef.current!.geometry as THREE.BoxGeometry
        updateStressColors(geometry, loadValue[0])

        // Calculate results
        const maxStress = calculateMaxStress(loadValue[0])
        const maxDisplacement = calculateMaxDisplacement(loadValue[0])
        const safetyFactor = calculateSafetyFactor(maxStress)

        setResults({
          maxStress,
          maxDisplacement,
          safetyFactor,
        })

        // Deform mesh based on load
        deformMesh(geometry, loadValue[0], newTime)

        return newTime > 5 ? 0 : newTime
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isSimulating, loadValue])

  const handleStartSimulation = () => {
    setIsSimulating(true)
    setSimulationTime(0)
  }

  const handleStopSimulation = () => {
    setIsSimulating(false)
  }

  const handleReset = () => {
    setIsSimulating(false)
    setSimulationTime(0)
    setLoadValue([50])

    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.BoxGeometry
      updateStressColors(geometry, 0)

      // Reset deformation
      const positions = geometry.attributes.position
      const count = positions.count

      for (let i = 0; i < count; i++) {
        positions.setY(i, 0)
      }
      positions.needsUpdate = true
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Viewer */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
          <span className="text-sm font-semibold text-white">FEA Simulator</span>

          <div className="flex items-center gap-2">
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-32 border-gray-600 bg-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stress">Stress</SelectItem>
                <SelectItem value="displacement">Displacement</SelectItem>
                <SelectItem value="strain">Strain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div ref={containerRef} className="flex-1" style={{ height }} />

        {/* Legend */}
        <div className="border-t border-gray-700 bg-gray-800 px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-400">Low Stress</span>
            <div
              className="mx-4 h-4 flex-1 rounded"
              style={{
                background: 'linear-gradient(to right, #3b82f6, #eab308, #ef4444)',
              }}
            />
            <span className="text-red-400">High Stress</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="w-full space-y-4 border-gray-700 bg-gray-800 p-4 lg:w-80">
        <div>
          <h3 className="mb-4 font-semibold text-white">Simulation Controls</h3>

          {/* Load Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Applied Load</span>
              <span className="font-mono text-white">{loadValue[0]} N</span>
            </div>
            <Slider
              value={loadValue}
              onValueChange={setLoadValue}
              max={100}
              step={1}
              className="w-full"
              disabled={isSimulating}
            />
          </div>

          {/* Simulation Controls */}
          <div className="mt-4 flex gap-2">
            {!isSimulating ? (
              <Button onClick={handleStartSimulation} className="flex-1">
                <Play className="mr-1 h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button onClick={handleStopSimulation} variant="destructive" className="flex-1">
                <Pause className="mr-1 h-4 w-4" />
                Stop
              </Button>
            )}

            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Simulation Time */}
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-400">Simulation Time</div>
            <div className="font-mono text-2xl text-white">{simulationTime.toFixed(1)}s</div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3 border-t border-gray-700 pt-4">
          <h3 className="font-semibold text-white">Analysis Results</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded bg-gray-900 p-2">
              <span className="text-sm text-gray-400">Max Stress</span>
              <span className="font-mono text-white">{results.maxStress.toExponential(2)} Pa</span>
            </div>

            <div className="flex items-center justify-between rounded bg-gray-900 p-2">
              <span className="text-sm text-gray-400">Max Displacement</span>
              <span className="font-mono text-white">{results.maxDisplacement.toFixed(4)} mm</span>
            </div>

            <div className="flex items-center justify-between rounded bg-gray-900 p-2">
              <span className="text-sm text-gray-400">Safety Factor</span>
              <span
                className={`font-mono ${
                  results.safetyFactor > 2
                    ? 'text-blue-400'
                    : results.safetyFactor > 1
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }`}
              >
                {results.safetyFactor === Infinity ? '∞' : results.safetyFactor.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Safety Status */}
          <div
            className={`rounded p-3 text-center text-sm font-semibold ${
              results.safetyFactor > 2
                ? 'bg-blue-900/30 text-blue-400'
                : results.safetyFactor > 1
                  ? 'bg-yellow-900/30 text-yellow-400'
                  : 'bg-red-900/30 text-red-400'
            }`}
          >
            {results.safetyFactor > 2
              ? '✓ Safe Design'
              : results.safetyFactor > 1
                ? '⚠ Marginal Safety'
                : '✗ Unsafe - Redesign Required'}
          </div>
        </div>
      </Card>
    </div>
  )
}
