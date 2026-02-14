import { useEffect, useRef, useMemo, useState, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'
import type { Robot, Task, WarehouseCell } from '@/lib/types'

interface Warehouse3DProps {
  warehouse: WarehouseCell[][]
  robots: Robot[]
  tasks: Task[]
  isRunning: boolean
  showPaths?: boolean
  showGrid?: boolean
}

interface CameraControls {
  azimuthAngle: number
  polarAngle: number
  distance: number
  targetPosition: THREE.Vector3
  isDragging: boolean
  isPanning: boolean
  lastMouseX: number
  lastMouseY: number
}

export interface Warehouse3DHandle {
  resetCamera: () => void
}

export const Warehouse3D = forwardRef<Warehouse3DHandle, Warehouse3DProps>(({
  warehouse,
  robots,
  tasks,
  isRunning,
  showPaths = true,
  showGrid = true
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const robotMeshesRef = useRef<Map<string, THREE.Group>>(new Map())
  const pathLinesRef = useRef<Map<string, THREE.Line>>(new Map())
  const taskMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const animationFrameRef = useRef<number | undefined>(undefined)

  const gridWidth = warehouse[0]?.length || 0
  const gridHeight = warehouse.length || 0

  const getDefaultCameraState = () => ({
    azimuthAngle: Math.PI / 4,
    polarAngle: Math.PI / 3,
    distance: Math.max(gridWidth, gridHeight) * 1.8,
    targetPosition: new THREE.Vector3(gridWidth / 2, 0, gridHeight / 2),
    isDragging: false,
    isPanning: false,
    lastMouseX: 0,
    lastMouseY: 0
  })

  const cameraControlsRef = useRef<CameraControls>(getDefaultCameraState())

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      const defaultState = getDefaultCameraState()
      cameraControlsRef.current.azimuthAngle = defaultState.azimuthAngle
      cameraControlsRef.current.polarAngle = defaultState.polarAngle
      cameraControlsRef.current.distance = defaultState.distance
      cameraControlsRef.current.targetPosition = defaultState.targetPosition
    }
  }))

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0f)
    scene.fog = new THREE.Fog(0x0a0a0f, 30, 100)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    
    const controls = cameraControlsRef.current
    const updateCameraPosition = () => {
      const x = controls.targetPosition.x + controls.distance * Math.sin(controls.polarAngle) * Math.cos(controls.azimuthAngle)
      const y = controls.targetPosition.y + controls.distance * Math.cos(controls.polarAngle)
      const z = controls.targetPosition.z + controls.distance * Math.sin(controls.polarAngle) * Math.sin(controls.azimuthAngle)
      
      camera.position.set(x, y, z)
      camera.lookAt(controls.targetPosition)
    }
    updateCameraPosition()
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
    mainLight.position.set(gridWidth / 2, gridHeight * 2, gridHeight / 2)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    mainLight.shadow.camera.left = -gridWidth
    mainLight.shadow.camera.right = gridWidth * 2
    mainLight.shadow.camera.top = gridHeight * 2
    mainLight.shadow.camera.bottom = -gridHeight
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3)
    fillLight.position.set(-gridWidth, gridHeight, -gridHeight)
    scene.add(fillLight)

    const accentLight = new THREE.PointLight(0x00ffff, 0.6, gridWidth * 2)
    accentLight.position.set(gridWidth / 2, gridHeight, gridHeight / 2)
    scene.add(accentLight)

    const floorGeometry = new THREE.PlaneGeometry(gridWidth, gridHeight)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.2
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.set(gridWidth / 2, 0, gridHeight / 2)
    floor.receiveShadow = true
    scene.add(floor)

    if (showGrid) {
      const gridHelper = new THREE.GridHelper(
        Math.max(gridWidth, gridHeight),
        Math.max(gridWidth, gridHeight),
        0x00ffff,
        0x1a3a5a
      )
      gridHelper.position.set(gridWidth / 2, 0.01, gridHeight / 2)
      gridHelper.material.opacity = 0.3
      gridHelper.material.transparent = true
      scene.add(gridHelper)
    }

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cell = warehouse[y][x]
        
        if (cell.type === 'obstacle') {
          const obstacleGeometry = new THREE.BoxGeometry(0.8, 2, 0.8)
          const obstacleMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a3e,
            roughness: 0.7,
            metalness: 0.3
          })
          const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial)
          obstacle.position.set(x, 1, y)
          obstacle.castShadow = true
          obstacle.receiveShadow = true
          scene.add(obstacle)

          const edgeGeometry = new THREE.EdgesGeometry(obstacleGeometry)
          const edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x4466ff,
            linewidth: 1
          })
          const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
          obstacle.add(edges)
        } else if (cell.type === 'storage') {
          const shelfGeometry = new THREE.BoxGeometry(0.7, 1.5, 0.7)
          const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a4a6a,
            roughness: 0.6,
            metalness: 0.4
          })
          const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial)
          shelf.position.set(x, 0.75, y)
          shelf.castShadow = true
          shelf.receiveShadow = true
          scene.add(shelf)
        } else if (cell.type === 'charging') {
          const chargingGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.2, 8)
          const chargingMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.3,
            roughness: 0.3,
            metalness: 0.7
          })
          const chargingStation = new THREE.Mesh(chargingGeometry, chargingMaterial)
          chargingStation.position.set(x, 0.1, y)
          chargingStation.receiveShadow = true
          scene.add(chargingStation)

          const chargingLight = new THREE.PointLight(0xffaa00, 0.5, 3)
          chargingLight.position.set(x, 0.5, y)
          scene.add(chargingLight)
        }
      }
    }

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    const handleMouseDown = (e: MouseEvent) => {
      const controls = cameraControlsRef.current
      if (e.button === 0) {
        controls.isDragging = true
      } else if (e.button === 1 || e.button === 2) {
        e.preventDefault()
        controls.isPanning = true
      }
      controls.lastMouseX = e.clientX
      controls.lastMouseY = e.clientY
    }

    const handleMouseMove = (e: MouseEvent) => {
      const controls = cameraControlsRef.current
      if (!controls.isDragging && !controls.isPanning) return

      const deltaX = e.clientX - controls.lastMouseX
      const deltaY = e.clientY - controls.lastMouseY

      if (controls.isPanning) {
        const panSpeed = 0.02
        const right = new THREE.Vector3()
        const up = new THREE.Vector3(0, 1, 0)
        
        camera.getWorldDirection(new THREE.Vector3())
        right.crossVectors(camera.up, new THREE.Vector3().subVectors(camera.position, controls.targetPosition).normalize())
        right.normalize()
        
        const panX = right.clone().multiplyScalar(-deltaX * panSpeed)
        const panZ = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), controls.azimuthAngle).multiplyScalar(deltaY * panSpeed)
        
        controls.targetPosition.add(panX).add(panZ)
        
        const maxX = gridWidth
        const maxZ = gridHeight
        controls.targetPosition.x = Math.max(0, Math.min(maxX, controls.targetPosition.x))
        controls.targetPosition.z = Math.max(0, Math.min(maxZ, controls.targetPosition.z))
      } else if (controls.isDragging) {
        controls.azimuthAngle -= deltaX * 0.005
        controls.polarAngle = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, controls.polarAngle - deltaY * 0.005))
      }

      controls.lastMouseX = e.clientX
      controls.lastMouseY = e.clientY

      updateCameraPosition()
    }

    const handleMouseUp = () => {
      cameraControlsRef.current.isDragging = false
      cameraControlsRef.current.isPanning = false
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const controls = cameraControlsRef.current
      const zoomSpeed = 0.1
      const minDistance = Math.max(gridWidth, gridHeight) * 0.8
      const maxDistance = Math.max(gridWidth, gridHeight) * 3.5

      controls.distance = Math.max(minDistance, Math.min(maxDistance, controls.distance + e.deltaY * zoomSpeed))
      updateCameraPosition()
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const controls = cameraControlsRef.current
        controls.isDragging = true
        controls.lastMouseX = e.touches[0].clientX
        controls.lastMouseY = e.touches[0].clientY
      } else if (e.touches.length === 2) {
        const controls = cameraControlsRef.current
        controls.isPanning = true
        controls.lastMouseX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        controls.lastMouseY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const controls = cameraControlsRef.current
        if (!controls.isDragging) return

        const deltaX = e.touches[0].clientX - controls.lastMouseX
        const deltaY = e.touches[0].clientY - controls.lastMouseY

        controls.azimuthAngle -= deltaX * 0.005
        controls.polarAngle = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, controls.polarAngle - deltaY * 0.005))

        controls.lastMouseX = e.touches[0].clientX
        controls.lastMouseY = e.touches[0].clientY

        updateCameraPosition()
      } else if (e.touches.length === 2) {
        const controls = cameraControlsRef.current
        if (!controls.isPanning) return

        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        
        const deltaX = centerX - controls.lastMouseX
        const deltaY = centerY - controls.lastMouseY

        const panSpeed = 0.02
        const right = new THREE.Vector3()
        
        camera.getWorldDirection(new THREE.Vector3())
        right.crossVectors(camera.up, new THREE.Vector3().subVectors(camera.position, controls.targetPosition).normalize())
        right.normalize()
        
        const panX = right.clone().multiplyScalar(-deltaX * panSpeed)
        const panZ = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), controls.azimuthAngle).multiplyScalar(deltaY * panSpeed)
        
        controls.targetPosition.add(panX).add(panZ)
        
        const maxX = gridWidth
        const maxZ = gridHeight
        controls.targetPosition.x = Math.max(0, Math.min(maxX, controls.targetPosition.x))
        controls.targetPosition.z = Math.max(0, Math.min(maxZ, controls.targetPosition.z))

        controls.lastMouseX = centerX
        controls.lastMouseY = centerY

        updateCameraPosition()
      }
    }

    const handleTouchEnd = () => {
      cameraControlsRef.current.isDragging = false
      cameraControlsRef.current.isPanning = false
    }

    const canvas = renderer.domElement
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('contextmenu', handleContextMenu)
    canvas.addEventListener('touchstart', handleTouchStart)
    canvas.addEventListener('touchmove', handleTouchMove)
    canvas.addEventListener('touchend', handleTouchEnd)

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      updateCameraPosition()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('contextmenu', handleContextMenu)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [gridWidth, gridHeight, warehouse, showGrid])

  useEffect(() => {
    if (!sceneRef.current) return

    const scene = sceneRef.current

    robots.forEach(robot => {
      let robotGroup = robotMeshesRef.current.get(robot.id)

      if (!robotGroup) {
        robotGroup = new THREE.Group()

        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.6)
        const bodyMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(robot.color),
          emissive: new THREE.Color(robot.color),
          emissiveIntensity: 0.3,
          roughness: 0.4,
          metalness: 0.6
        })
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
        body.castShadow = true
        body.receiveShadow = true
        robotGroup.add(body)

        const topGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 8)
        const topMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0x00ffff,
          emissiveIntensity: 0.5,
          roughness: 0.3,
          metalness: 0.7
        })
        const top = new THREE.Mesh(topGeometry, topMaterial)
        top.position.set(0, 0.35, 0)
        top.castShadow = true
        robotGroup.add(top)

        const edgeGeometry = new THREE.EdgesGeometry(bodyGeometry)
        const edgeMaterial = new THREE.LineBasicMaterial({ 
          color: 0xffffff,
          linewidth: 2
        })
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
        edges.position.y = 0
        robotGroup.add(edges)

        const light = new THREE.PointLight(new THREE.Color(robot.color), 1, 3)
        light.position.set(0, 0.8, 0)
        robotGroup.add(light)

        scene.add(robotGroup)
        robotMeshesRef.current.set(robot.id, robotGroup)
      }

      const targetX = robot.position.x
      const targetZ = robot.position.y
      const targetY = 0.2

      robotGroup.position.x += (targetX - robotGroup.position.x) * 0.15
      robotGroup.position.z += (targetZ - robotGroup.position.z) * 0.15
      robotGroup.position.y += (targetY - robotGroup.position.y) * 0.15

      if (robot.status === 'moving') {
        robotGroup.rotation.y += 0.05
        robotGroup.position.y = 0.2 + Math.sin(Date.now() * 0.005) * 0.05
      } else {
        robotGroup.position.y += (0.2 - robotGroup.position.y) * 0.1
      }

      const bodyMesh = robotGroup.children[0] as THREE.Mesh
      const material = bodyMesh.material as THREE.MeshStandardMaterial
      material.color.set(robot.color)
      material.emissive.set(robot.color)
      material.emissiveIntensity = robot.status === 'moving' ? 0.5 : 0.2

      const light = robotGroup.children.find(child => child instanceof THREE.PointLight) as THREE.PointLight
      if (light) {
        light.color.set(robot.color)
        light.intensity = robot.status === 'moving' ? 1.5 : 0.8
      }
    })

    robotMeshesRef.current.forEach((robotGroup, robotId) => {
      if (!robots.find(r => r.id === robotId)) {
        scene.remove(robotGroup)
        robotMeshesRef.current.delete(robotId)
      }
    })
  }, [robots])

  useEffect(() => {
    if (!sceneRef.current || !showPaths) return

    const scene = sceneRef.current

    robots.forEach(robot => {
      if (robot.path && robot.path.length > 1) {
        const points = robot.path.map(
          pos => new THREE.Vector3(pos.x, 0.15, pos.y)
        )
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(robot.color),
          linewidth: 2,
          transparent: true,
          opacity: 0.6
        })

        let line = pathLinesRef.current.get(robot.id)
        if (line) {
          scene.remove(line)
        }

        line = new THREE.Line(geometry, material)
        scene.add(line)
        pathLinesRef.current.set(robot.id, line)
      } else {
        const line = pathLinesRef.current.get(robot.id)
        if (line) {
          scene.remove(line)
          pathLinesRef.current.delete(robot.id)
        }
      }
    })

    pathLinesRef.current.forEach((line, robotId) => {
      if (!robots.find(r => r.id === robotId)) {
        scene.remove(line)
        pathLinesRef.current.delete(robotId)
      }
    })
  }, [robots, showPaths])

  useEffect(() => {
    if (!sceneRef.current) return

    const scene = sceneRef.current

    tasks.forEach(task => {
      if (task.status === 'pending' || task.status === 'assigned') {
        let taskMesh = taskMeshesRef.current.get(task.id)

        if (!taskMesh) {
          const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4)
          let color = 0x00ff00
          if (task.priority === 'high') color = 0xff9900
          if (task.priority === 'critical') color = 0xff0000

          const material = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.8,
            roughness: 0.3,
            metalness: 0.7
          })
          taskMesh = new THREE.Mesh(geometry, material)
          taskMesh.position.set(task.position.x, 0.5, task.position.y)
          taskMesh.castShadow = true

          scene.add(taskMesh)
          taskMeshesRef.current.set(task.id, taskMesh)
        }

        taskMesh.rotation.y += 0.02
        taskMesh.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.1
      } else {
        const taskMesh = taskMeshesRef.current.get(task.id)
        if (taskMesh) {
          scene.remove(taskMesh)
          taskMeshesRef.current.delete(task.id)
        }
      }
    })

    taskMeshesRef.current.forEach((taskMesh, taskId) => {
      if (!tasks.find(t => t.id === taskId)) {
        scene.remove(taskMesh)
        taskMeshesRef.current.delete(taskId)
      }
    })
  }, [tasks])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ minHeight: '600px' }}
    />
  )
})
