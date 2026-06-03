'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid3x3,
  Download,
  Upload,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CADViewerProps {
  modelUrl?: string
  height?: string
  showControls?: boolean
  backgroundColor?: string
  onMeasure?: (dimensions: { x: number; y: number; z: number }) => void
}

export default function CADViewer({
  modelUrl,
  height = '600px',
  showControls = true,
  backgroundColor = '#1a1a1a',
  onMeasure: _onMeasure,
}: CADViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)

  const [showGrid, setShowGrid] = useState(true)
  const [showAxes] = useState(true)
  const [wireframe, setWireframe] = useState(false)
  const [modelInfo, _setModelInfo] = useState<{
    vertices: number
    faces: number
    dimensions: { x: number; y: number; z: number }
  } | null>(null)
  const [zoom, setZoom] = useState(1)

  const loadModel = (url: string, scene: THREE.Scene) => {
    const extension = url.split('.').pop()?.toLowerCase()

    if (extension === 'stl') {
      const loader = new STLLoader()
      loader.load(url, (geometry) => {
        const material = new THREE.MeshPhongMaterial({
          color: 0x2563eb,
          specular: 0x111111,
          shininess: 200,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        const group = new THREE.Group()
        group.add(mesh)
        scene.add(group)
        modelRef.current = group
      })
    } else if (extension === 'obj') {
      const loader = new OBJLoader()
      loader.load(url, (obj) => {
        scene.add(obj)
        const group = new THREE.Group()
        group.add(obj)
        modelRef.current = group
      })
    }
  }

  const createDefaultModel = (scene: THREE.Scene) => {
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      specular: 0x111111,
      shininess: 200,
    })
    const cube = new THREE.Mesh(geometry, material)
    cube.castShadow = true
    cube.receiveShadow = true
    scene.add(cube)
    modelRef.current = cube
  }

useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(backgroundColor)
    sceneRef.current = scene

    // Initialize Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(5, 5, 5)
    cameraRef.current = camera

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Initialize Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 1
    controls.maxDistance = 100
    controlsRef.current = controls

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 10)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const pointLight1 = new THREE.PointLight(0xffffff, 0.5)
    pointLight1.position.set(-10, 10, -10)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xffffff, 0.3)
    pointLight2.position.set(10, -10, 10)
    scene.add(pointLight2)

    // Add Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
    gridHelper.name = 'grid'
    scene.add(gridHelper)

    // Add Axes
    const axesHelper = new THREE.AxesHelper(5)
    axesHelper.name = 'axes'
    scene.add(axesHelper)

    // Load Model
    if (modelUrl) {
      loadModel(modelUrl, scene)
    } else {
      // Create default cube
      createDefaultModel(scene)
    }

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return

      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [modelUrl, backgroundColor])

  // Update grid visibility
  useEffect(() => {
    if (!sceneRef.current) return
    const grid = sceneRef.current.getObjectByName('grid')
    if (grid) grid.visible = showGrid
  }, [showGrid])

  // Update axes visibility
  useEffect(() => {
    if (!sceneRef.current) return
    const axes = sceneRef.current.getObjectByName('axes')
    if (axes) axes.visible = showAxes
  }, [showAxes])

  // Update wireframe
  useEffect(() => {
    if (!modelRef.current) return

    modelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material instanceof THREE.Material) {
          ;(mesh.material as any).wireframe = wireframe
        }
      }
    })
  }, [wireframe])

  // Update zoom
  useEffect(() => {
    if (!cameraRef.current) return
    cameraRef.current.zoom = zoom
    cameraRef.current.updateProjectionMatrix()
  }, [zoom])

  const handleReset = () => {
    if (!cameraRef.current || !controlsRef.current) return

    cameraRef.current.position.set(5, 5, 5)
    controlsRef.current.reset()
    setZoom(1)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleExport = () => {
    if (!rendererRef.current) return

    const link = document.createElement('a')
    link.download = 'model-screenshot.png'
    link.href = rendererRef.current.domElement.toDataURL()
    link.click()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)

    if (sceneRef.current && modelRef.current) {
      sceneRef.current.remove(modelRef.current)
    }

    loadModel(url, sceneRef.current!)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      {/* Toolbar */}
      {showControls && (
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">3D CAD Viewer</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Upload */}
            <label>
              <input
                type="file"
                accept=".stl,.obj"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">
                  <Upload className="mr-1 h-4 w-4" />
                  Load
                </span>
              </Button>
            </label>

            {/* Zoom Controls */}
            <Button onClick={handleZoomIn} variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button onClick={handleZoomOut} variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>

            {/* Reset View */}
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Toggle Grid */}
            <Button
              onClick={() => setShowGrid(!showGrid)}
              variant={showGrid ? 'default' : 'outline'}
              size="sm"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>

            {/* Toggle Wireframe */}
            <Button
              onClick={() => setWireframe(!wireframe)}
              variant={wireframe ? 'default' : 'outline'}
              size="sm"
            >
              <Layers className="h-4 w-4" />
            </Button>

            {/* Export */}
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div ref={containerRef} style={{ height }} className="flex-1 bg-black" />

      {/* Model Info Panel */}
      {modelInfo && (
        <div className="border-t border-gray-700 bg-gray-800 px-4 py-3">
          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
            <Card className="bg-gray-700 p-2">
              <div className="text-gray-400">Vertices</div>
              <div className="font-semibold text-white">{modelInfo.vertices.toLocaleString()}</div>
            </Card>
            <Card className="bg-gray-700 p-2">
              <div className="text-gray-400">Faces</div>
              <div className="font-semibold text-white">{modelInfo.faces.toLocaleString()}</div>
            </Card>
            <Card className="bg-gray-700 p-2">
              <div className="text-gray-400">Width (X)</div>
              <div className="font-semibold text-white">{modelInfo.dimensions.x}mm</div>
            </Card>
            <Card className="bg-gray-700 p-2">
              <div className="text-gray-400">Dimensions</div>
              <div className="font-semibold text-white">
                {modelInfo.dimensions.y} × {modelInfo.dimensions.z}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
