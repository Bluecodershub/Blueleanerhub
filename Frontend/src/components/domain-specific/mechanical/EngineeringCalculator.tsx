'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator } from 'lucide-react'

export default function EngineeringCalculator() {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <Card className="border-gray-700 bg-gray-800 p-6">
        <div className="mb-6 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-sky-400" />
          <h2 className="text-2xl font-bold text-white">Engineering Calculator</h2>
        </div>

        <Tabs defaultValue="beam" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="beam">Beam</TabsTrigger>
            <TabsTrigger value="stress">Stress</TabsTrigger>
            <TabsTrigger value="thermal">Thermal</TabsTrigger>
            <TabsTrigger value="fluid">Fluid</TabsTrigger>
          </TabsList>

          <TabsContent value="beam">
            <BeamCalculator />
          </TabsContent>

          <TabsContent value="stress">
            <StressCalculator />
          </TabsContent>

          <TabsContent value="thermal">
            <ThermalCalculator />
          </TabsContent>

          <TabsContent value="fluid">
            <FluidCalculator />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

function BeamCalculator() {
  const [length, setLength] = useState('')
  const [load, setLoad] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const L = parseFloat(length)
    const F = parseFloat(load)
    const b = parseFloat(width)
    const h = parseFloat(height)

    if (!L || !F || !b || !h) return

    // Moment of inertia (rectangular cross-section)
    const I = (b * Math.pow(h, 3)) / 12

    // Maximum bending moment (for simply supported beam with point load at center)
    const M = (F * L) / 4

    // Maximum bending stress
    const c = h / 2
    const sigma = (M * c) / I

    // Maximum deflection
    const E = 200e9 // Steel Young's modulus
    const delta = (F * Math.pow(L, 3)) / (48 * E * I)

    setResult({
      moment: M,
      stress: sigma,
      deflection: delta * 1000, // Convert to mm
      momentOfInertia: I,
    })
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Beam Length (m)</Label>
          <Input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="e.g., 5"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Applied Load (N)</Label>
          <Input
            type="number"
            value={load}
            onChange={(e) => setLoad(e.target.value)}
            placeholder="e.g., 1000"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Width (m)</Label>
          <Input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="e.g., 0.1"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Height (m)</Label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g., 0.2"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
      </div>

      <Button onClick={calculate} className="w-full">
        Calculate
      </Button>

      {result && (
        <div className="mt-6 space-y-2">
          <h3 className="mb-3 font-semibold text-white">Results:</h3>
          <ResultRow label="Maximum Moment" value={`${result.moment.toFixed(2)} N·m`} />
          <ResultRow label="Maximum Stress" value={`${(result.stress / 1e6).toFixed(2)} MPa`} />
          <ResultRow label="Maximum Deflection" value={`${result.deflection.toFixed(4)} mm`} />
          <ResultRow
            label="Moment of Inertia"
            value={`${result.momentOfInertia.toExponential(3)} m⁴`}
          />
        </div>
      )}
    </div>
  )
}

function StressCalculator() {
  const [force, setForce] = useState('')
  const [area, setArea] = useState('')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const F = parseFloat(force)
    const A = parseFloat(area)

    if (!F || !A) return

    const stress = F / A

    setResult({
      stress,
      stressMPa: stress / 1e6,
    })
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Force (N)</Label>
          <Input
            type="number"
            value={force}
            onChange={(e) => setForce(e.target.value)}
            placeholder="e.g., 50000"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Area (m²)</Label>
          <Input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g., 0.01"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
      </div>

      <Button onClick={calculate} className="w-full">
        Calculate
      </Button>

      {result && (
        <div className="mt-6 space-y-2">
          <h3 className="mb-3 font-semibold text-white">Results:</h3>
          <ResultRow label="Stress" value={`${result.stress.toFixed(2)} Pa`} />
          <ResultRow label="Stress (MPa)" value={`${result.stressMPa.toFixed(2)} MPa`} />
        </div>
      )}
    </div>
  )
}

function ThermalCalculator() {
  const [Q] = useState('')
  const [A, setA] = useState('')
  const [deltaT, setDeltaT] = useState('')
  const [L, setL] = useState('')
  const [k, setK] = useState('401') // Copper default

  // Use Q for display purposes only
  void Q

  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const kVal = parseFloat(k)
    const AVal = parseFloat(A)
    const dT = parseFloat(deltaT)
    const LVal = parseFloat(L)

    if (!kVal || !AVal || !dT || !LVal) return

    // Heat transfer rate: Q = k * A * ΔT / L
    const heatTransfer = (kVal * AVal * dT) / LVal

    setResult({
      heatTransfer,
    })
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Thermal Conductivity (W/m·K)</Label>
          <Input
            type="number"
            value={k}
            onChange={(e) => setK(e.target.value)}
            placeholder="e.g., 401 (Copper)"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Area (m²)</Label>
          <Input
            type="number"
            value={A}
            onChange={(e) => setA(e.target.value)}
            placeholder="e.g., 0.5"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Temperature Difference (K)</Label>
          <Input
            type="number"
            value={deltaT}
            onChange={(e) => setDeltaT(e.target.value)}
            placeholder="e.g., 50"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Thickness (m)</Label>
          <Input
            type="number"
            value={L}
            onChange={(e) => setL(e.target.value)}
            placeholder="e.g., 0.05"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
      </div>

      <Button onClick={calculate} className="w-full">
        Calculate
      </Button>

      {result && (
        <div className="mt-6 space-y-2">
          <h3 className="mb-3 font-semibold text-white">Results:</h3>
          <ResultRow label="Heat Transfer Rate" value={`${result.heatTransfer.toFixed(2)} W`} />
        </div>
      )}
    </div>
  )
}

function FluidCalculator() {
  const [rho, setRho] = useState('1000') // Water default
  const [v, setV] = useState('')
  const [h, setH] = useState('')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const density = parseFloat(rho)
    const velocity = parseFloat(v)
    const height = parseFloat(h)

    if (!density || !velocity || !height) return

    const g = 9.81 // Gravity

    // Bernoulli's equation: P + 0.5*ρ*v² + ρ*g*h = constant
    const dynamicPressure = 0.5 * density * Math.pow(velocity, 2)
    const staticPressure = density * g * height
    const totalPressure = dynamicPressure + staticPressure

    setResult({
      dynamicPressure,
      staticPressure,
      totalPressure,
    })
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Density (kg/m³)</Label>
          <Input
            type="number"
            value={rho}
            onChange={(e) => setRho(e.target.value)}
            placeholder="e.g., 1000 (Water)"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Velocity (m/s)</Label>
          <Input
            type="number"
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="e.g., 5"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-white">Height (m)</Label>
          <Input
            type="number"
            value={h}
            onChange={(e) => setH(e.target.value)}
            placeholder="e.g., 10"
            className="border-gray-600 bg-gray-900 text-white"
          />
        </div>
      </div>

      <Button onClick={calculate} className="w-full">
        Calculate
      </Button>

      {result && (
        <div className="mt-6 space-y-2">
          <h3 className="mb-3 font-semibold text-white">Results:</h3>
          <ResultRow label="Dynamic Pressure" value={`${result.dynamicPressure.toFixed(2)} Pa`} />
          <ResultRow label="Static Pressure" value={`${result.staticPressure.toFixed(2)} Pa`} />
          <ResultRow label="Total Pressure" value={`${result.totalPressure.toFixed(2)} Pa`} />
        </div>
      )}
    </div>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded bg-gray-900 p-3">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono font-semibold text-white">{value}</span>
    </div>
  )
}
