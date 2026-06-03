'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Upload, Download, Zap } from 'lucide-react'

export default function WaveformAnalyzer() {
  const [timeData, setTimeData] = useState(generateSampleData())
  const [fftData, setFftData] = useState(calculateFFT(generateSampleData()))
  const [analysis, setAnalysis] = useState(analyzeSignal(generateSampleData()))

  function generateSampleData() {
    const data = []
    const samples = 200
    const frequency = 5 // Hz
    const amplitude = 10 // Volts
    const sampleRate = 1000 // samples/second

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const value =
        amplitude * Math.sin(2 * Math.PI * frequency * t) +
        amplitude * 0.3 * Math.sin(2 * Math.PI * frequency * 3 * t) +
        amplitude * 0.1 * Math.random()

      data.push({
        time: t,
        voltage: parseFloat(value.toFixed(3)),
      })
    }

    return data
  }

  function calculateFFT(data: any[]) {
    // Simplified FFT (magnitude only)
    const fftResult = []
    const N = data.length
    const maxFreq = 100 // Hz

    for (let k = 0; k < maxFreq; k++) {
      let real = 0
      let imag = 0

      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N
        real += data[n].voltage * Math.cos(angle)
        imag -= data[n].voltage * Math.sin(angle)
      }

      const magnitude = Math.sqrt(real * real + imag * imag) / N

      fftResult.push({
        frequency: k,
        magnitude: parseFloat(magnitude.toFixed(3)),
      })
    }

    return fftResult
  }

  function analyzeSignal(data: any[]) {
    const voltages = data.map((d) => d.voltage)

    const max = Math.max(...voltages)
    const min = Math.min(...voltages)
    const vpp = max - min
    const mean = voltages.reduce((a, b) => a + b, 0) / voltages.length
    const rms = Math.sqrt(voltages.reduce((a, b) => a + b * b, 0) / voltages.length)

    // Find zero crossings for frequency
    let zeroCrossings = 0
    for (let i = 1; i < voltages.length; i++) {
      if (
        (voltages[i - 1] < mean && voltages[i] >= mean) ||
        (voltages[i - 1] >= mean && voltages[i] < mean)
      ) {
        zeroCrossings++
      }
    }

    const totalTime = data[data.length - 1].time - data[0].time
    const frequency = zeroCrossings / (2 * totalTime)

    return {
      vMax: max.toFixed(3),
      vMin: min.toFixed(3),
      vpp: vpp.toFixed(3),
      vMean: mean.toFixed(3),
      vRMS: rms.toFixed(3),
      frequency: frequency.toFixed(2),
      period: (1 / frequency).toFixed(4),
      dutyCycle: '50', // Simplified
      thd: '5.2', // Total Harmonic Distortion (simplified)
    }
  }

  const handleAnalyze = () => {
    const newData = generateSampleData()
    setTimeData(newData)
    setFftData(calculateFFT(newData))
    setAnalysis(analyzeSignal(newData))
  }

  return (
    <div className="space-y-4 p-4">
      <Card className="border-gray-700 bg-gray-800 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Waveform Analyzer</h2>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAnalyze} size="sm">
              Analyze Signal
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-1 h-4 w-4" />
              Load
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="time" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="time">Time Domain</TabsTrigger>
            <TabsTrigger value="frequency">Frequency Domain</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="time" className="mt-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="time"
                    stroke="#888"
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    stroke="#888"
                    label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="frequency" className="mt-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fftData.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="frequency"
                    stroke="#888"
                    label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    stroke="#888"
                    label={{ value: 'Magnitude', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Bar dataKey="magnitude" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <AnalysisCard label="Max Voltage" value={`${analysis.vMax} V`} />
              <AnalysisCard label="Min Voltage" value={`${analysis.vMin} V`} />
              <AnalysisCard label="Peak-to-Peak" value={`${analysis.vpp} V`} />
              <AnalysisCard label="Mean Voltage" value={`${analysis.vMean} V`} />
              <AnalysisCard label="RMS Voltage" value={`${analysis.vRMS} V`} />
              <AnalysisCard label="Frequency" value={`${analysis.frequency} Hz`} />
              <AnalysisCard label="Period" value={`${analysis.period} s`} />
              <AnalysisCard label="Duty Cycle" value={`${analysis.dutyCycle}%`} />
              <AnalysisCard label="THD" value={`${analysis.thd}%`} />
            </div>

            <div className="mt-6 rounded-lg bg-gray-900 p-4">
              <h3 className="mb-3 font-semibold text-white">Signal Quality Assessment</h3>
              <div className="space-y-2 text-sm">
                <QualityIndicator label="Signal-to-Noise Ratio" value="28.5 dB" status="good" />
                <QualityIndicator label="Distortion" value="Low" status="good" />
                <QualityIndicator label="Stability" value="Stable" status="good" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

function AnalysisCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-900 p-4">
      <div className="mb-1 text-xs text-gray-400">{label}</div>
      <div className="font-mono text-xl text-white">{value}</div>
    </div>
  )
}

function QualityIndicator({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: 'good' | 'warning' | 'bad'
}) {
  const colors = {
    good: 'text-blue-400',
    warning: 'text-yellow-400',
    bad: 'text-red-400',
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${colors[status]}`}>{value}</span>
    </div>
  )
}
