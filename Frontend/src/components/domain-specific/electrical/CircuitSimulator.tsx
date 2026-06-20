'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Play, Trash2, Download } from 'lucide-react'

interface Component {
  id: string
  type:
    | 'resistor'
    | 'capacitor'
    | 'inductor'
    | 'voltage_source'
    | 'current_source'
    | 'ground'
    | 'wire'
  x: number
  y: number
  rotation: number
  value: number
  connections: string[]
}

interface CircuitSimulatorProps {
  height?: string
}

export default function CircuitSimulator({ height = '600px' }: CircuitSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [components, setComponents] = useState<Component[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<Component['type']>('resistor')
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [componentValue, setComponentValue] = useState('1000')
  const [gridSize] = useState(20)
  const [showGrid] = useState(true)

  const _drawCircuit = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 0.5

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Draw components
    components.forEach((component) => {
      drawComponent(ctx, component)
    })
  }

  const drawComponent = (ctx: CanvasRenderingContext2D, component: Component) => {
    ctx.save()
    ctx.translate(component.x, component.y)
    ctx.rotate((component.rotation * Math.PI) / 180)

    const isSelected = component.id === selectedComponent
    ctx.strokeStyle = isSelected ? '#3b82f6' : '#ffffff'
    ctx.fillStyle = '#ffffff'
    ctx.lineWidth = 2

    switch (component.type) {
      case 'resistor':
        drawResistor(ctx)
        break
      case 'capacitor':
        drawCapacitor(ctx)
        break
      case 'inductor':
        drawInductor(ctx)
        break
      case 'voltage_source':
        drawVoltageSource(ctx)
        break
      case 'current_source':
        drawCurrentSource(ctx)
        break
      case 'ground':
        drawGround(ctx)
        break
      case 'wire':
        drawWire(ctx)
        break
    }

    // Draw value label
    if (component.type !== 'wire' && component.type !== 'ground') {
      ctx.fillStyle = '#60a5fa'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(formatValue(component.value, component.type), 0, -25)
    }

    ctx.restore()
  }

  const drawResistor = (ctx: CanvasRenderingContext2D) => {
    // Zigzag pattern
    ctx.beginPath()
    ctx.moveTo(-30, 0)
    ctx.lineTo(-20, 0)
    ctx.lineTo(-15, -10)
    ctx.lineTo(-5, 10)
    ctx.lineTo(5, -10)
    ctx.lineTo(15, 10)
    ctx.lineTo(20, 0)
    ctx.lineTo(30, 0)
    ctx.stroke()

    // Connection points
    drawConnectionPoint(ctx, -30, 0)
    drawConnectionPoint(ctx, 30, 0)
  }

  const drawCapacitor = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath()
    ctx.moveTo(-30, 0)
    ctx.lineTo(-5, 0)
    ctx.moveTo(-5, -15)
    ctx.lineTo(-5, 15)
    ctx.moveTo(5, -15)
    ctx.lineTo(5, 15)
    ctx.moveTo(5, 0)
    ctx.lineTo(30, 0)
    ctx.stroke()

    drawConnectionPoint(ctx, -30, 0)
    drawConnectionPoint(ctx, 30, 0)
  }

  const drawInductor = (ctx: CanvasRenderingContext2D) => {
    // Coil loops
    ctx.beginPath()
    ctx.moveTo(-30, 0)
    ctx.lineTo(-20, 0)

    for (let i = 0; i < 4; i++) {
      const x = -20 + i * 10
      ctx.arc(x + 5, 0, 5, Math.PI, 0, false)
    }

    ctx.lineTo(30, 0)
    ctx.stroke()

    drawConnectionPoint(ctx, -30, 0)
    drawConnectionPoint(ctx, 30, 0)
  }

  const drawVoltageSource = (ctx: CanvasRenderingContext2D) => {
    // Circle with + and -
    ctx.beginPath()
    ctx.arc(0, 0, 20, 0, Math.PI * 2)
    ctx.stroke()

    ctx.font = '16px Arial'
    ctx.fillText('+', -8, -5)
    ctx.fillText('-', 3, 5)

    // Connection lines
    ctx.beginPath()
    ctx.moveTo(-30, 0)
    ctx.lineTo(-20, 0)
    ctx.moveTo(20, 0)
    ctx.lineTo(30, 0)
    ctx.stroke()

    drawConnectionPoint(ctx, -30, 0)
    drawConnectionPoint(ctx, 30, 0)
  }

  const drawCurrentSource = (ctx: CanvasRenderingContext2D) => {
    // Circle with arrow
    ctx.beginPath()
    ctx.arc(0, 0, 20, 0, Math.PI * 2)
    ctx.stroke()

    // Arrow
    ctx.beginPath()
    ctx.moveTo(0, -10)
    ctx.lineTo(0, 10)
    ctx.lineTo(-5, 5)
    ctx.moveTo(0, 10)
    ctx.lineTo(5, 5)
    ctx.stroke()

    // Connection lines
    ctx.beginPath()
    ctx.moveTo(-30, 0)
    ctx.lineTo(-20, 0)
    ctx.moveTo(20, 0)
    ctx.lineTo(30, 0)
    ctx.stroke()

    drawConnectionPoint(ctx, -30, 0)
    drawConnectionPoint(ctx, 30, 0)
  }

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath()
    ctx.moveTo(0, -20)
    ctx.lineTo(0, 0)
    ctx.moveTo(-15, 0)
    ctx.lineTo(15, 0)
    ctx.moveTo(-10, 5)
    ctx.lineTo(10, 5)
    ctx.moveTo(-5, 10)
    ctx.lineTo(5, 10)
    ctx.stroke()

    drawConnectionPoint(ctx, 0, -20)
  }

  const drawWire = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath()
    ctx.moveTo(-30, 0)
    ctx.lineTo(30, 0)
    ctx.stroke()

    drawConnectionPoint(ctx, -30, 0)
    drawConnectionPoint(ctx, 30, 0)
  }

  const drawConnectionPoint = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  const formatValue = (value: number, type: Component['type']): string => {
    switch (type) {
      case 'resistor':
        return value >= 1000 ? `${value / 1000}kΩ` : `${value}Ω`
      case 'capacitor':
        return value >= 1e-6 ? `${value * 1e6}µF` : `${value * 1e9}nF`
      case 'inductor':
        return value >= 1e-3 ? `${value * 1000}mH` : `${value * 1e6}µH`
      case 'voltage_source':
        return `${value}V`
      case 'current_source':
        return `${value}A`
      default:
        return ''
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.round((e.clientX - rect.left) / gridSize) * gridSize
    const y = Math.round((e.clientY - rect.top) / gridSize) * gridSize

    // Check if clicking on existing component
    const clickedComponent = components.find((c) => {
      const dist = Math.sqrt(Math.pow(c.x - x, 2) + Math.pow(c.y - y, 2))
      return dist < 40
    })

    if (clickedComponent) {
      setSelectedComponent(clickedComponent.id)
    } else {
      // Add new component
      const newComponent: Component = {
        id: `component-${Date.now()}`,
        type: selectedTool,
        x,
        y,
        rotation: 0,
        value: parseFloat(componentValue),
        connections: [],
      }
      setComponents([...components, newComponent])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedComponent) {
      setComponents(components.filter((c) => c.id !== selectedComponent))
      setSelectedComponent(null)
    }
  }

  const handleRotateSelected = () => {
    if (selectedComponent) {
      setComponents(
        components.map((c) =>
          c.id === selectedComponent ? { ...c, rotation: (c.rotation + 90) % 360 } : c
        )
      )
    }
  }

  const handleSimulate = () => {
    setIsSimulating(true)

    // Simple circuit analysis (voltage divider example)
    const resistors = components.filter((c) => c.type === 'resistor')
    const voltageSources = components.filter((c) => c.type === 'voltage_source')

    if (resistors.length === 2 && voltageSources.length === 1) {
      const Vs = voltageSources[0].value
      const R1 = resistors[0].value
      const R2 = resistors[1].value

      // Voltage divider
      const Vout = Vs * (R2 / (R1 + R2))
      const I = Vs / (R1 + R2)

      setSimulationResults({
        outputVoltage: Vout.toFixed(2),
        current: (I * 1000).toFixed(2), // Convert to mA
        power: (I * I * (R1 + R2) * 1000).toFixed(2), // Convert to mW
      })
    } else {
      setSimulationResults({
        message: 'Circuit analysis requires specific configuration',
      })
    }

    setTimeout(() => setIsSimulating(false), 1000)
  }

  const handleClear = () => {
    setComponents([])
    setSelectedComponent(null)
    setSimulationResults(null)
  }

  const handleExport = () => {
    const data = JSON.stringify(components, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'circuit.json'
    a.click()
  }

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* Canvas */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
          <span className="text-sm font-semibold text-white">Circuit Designer</span>

          <div className="flex items-center gap-2">
            <Button onClick={handleSimulate} disabled={isSimulating} size="sm">
              <Play className="mr-1 h-4 w-4" />
              Simulate
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          className="flex-1 cursor-crosshair"
          style={{ height }}
        />
      </div>

      {/* Component Palette & Controls */}
      <Card className="w-full space-y-4 border-gray-700 bg-gray-800 p-4 lg:w-80">
        <div>
          <h3 className="mb-3 font-semibold text-white">Components</h3>

          <div className="grid grid-cols-2 gap-2">
            <ComponentButton
              type="resistor"
              icon="≈"
              label="Resistor"
              selected={selectedTool === 'resistor'}
              onClick={() => setSelectedTool('resistor')}
            />
            <ComponentButton
              type="capacitor"
              icon="||"
              label="Capacitor"
              selected={selectedTool === 'capacitor'}
              onClick={() => setSelectedTool('capacitor')}
            />
            <ComponentButton
              type="inductor"
              icon="∿"
              label="Inductor"
              selected={selectedTool === 'inductor'}
              onClick={() => setSelectedTool('inductor')}
            />
            <ComponentButton
              type="voltage_source"
              icon="⊕"
              label="Voltage"
              selected={selectedTool === 'voltage_source'}
              onClick={() => setSelectedTool('voltage_source')}
            />
            <ComponentButton
              type="current_source"
              icon="⊙"
              label="Current"
              selected={selectedTool === 'current_source'}
              onClick={() => setSelectedTool('current_source')}
            />
            <ComponentButton
              type="ground"
              icon="⏚"
              label="Ground"
              selected={selectedTool === 'ground'}
              onClick={() => setSelectedTool('ground')}
            />
            <ComponentButton
              type="wire"
              icon="—"
              label="Wire"
              selected={selectedTool === 'wire'}
              onClick={() => setSelectedTool('wire')}
            />
          </div>
        </div>

        {selectedTool !== 'wire' && selectedTool !== 'ground' && (
          <div>
            <Label className="text-white">Component Value</Label>
            <Input
              type="number"
              value={componentValue}
              onChange={(e) => setComponentValue(e.target.value)}
              className="mt-2 border-gray-600 bg-gray-900 text-white"
            />
            <p className="mt-1 text-xs text-gray-400">
              {formatValue(parseFloat(componentValue), selectedTool)}
            </p>
          </div>
        )}

        {selectedComponent && (
          <div className="border-t border-gray-700 pt-4">
            <h3 className="mb-3 font-semibold text-white">Selected Component</h3>
            <div className="flex gap-2">
              <Button onClick={handleRotateSelected} variant="outline" className="flex-1">
                Rotate
              </Button>
              <Button onClick={handleDeleteSelected} variant="destructive" className="flex-1">
                Delete
              </Button>
            </div>
          </div>
        )}

        {simulationResults && (
          <div className="border-t border-gray-700 pt-4">
            <h3 className="mb-3 font-semibold text-white">Simulation Results</h3>

            {simulationResults.message ? (
              <p className="text-sm text-gray-400">{simulationResults.message}</p>
            ) : (
              <div className="space-y-2">
                <ResultRow label="Output Voltage" value={`${simulationResults.outputVoltage} V`} />
                <ResultRow label="Current" value={`${simulationResults.current} mA`} />
                <ResultRow label="Power" value={`${simulationResults.power} mW`} />
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-700 pt-4 text-xs text-gray-500">
          <p>Click on canvas to place components</p>
          <p>Click component to select</p>
          <p>Rotate/Delete selected component</p>
        </div>
      </Card>
    </div>
  )
}

function ComponentButton({
  type: _type,
  icon,
  label,
  selected,
  onClick,
}: {
  type: string
  icon: string
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border-2 p-3 transition-all ${
        selected
          ? 'border-sky-500 bg-sky-500/20'
          : 'border-gray-600 bg-gray-900 hover:border-gray-500'
      }`}
    >
      <div className="mb-1 text-2xl">{icon}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </button>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded bg-gray-900 p-2">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  )
}
