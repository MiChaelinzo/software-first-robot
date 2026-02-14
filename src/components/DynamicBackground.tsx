import { useEffect, useRef } from 'react'

export type BackgroundTheme = 'circuit-board' | 'warehouse-blueprint' | 'satellite-view'

interface DynamicBackgroundProps {
  theme?: BackgroundTheme
}

export function DynamicBackground({ theme = 'circuit-board' }: DynamicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let time = 0
    let animationFrameId: number

    if (theme === 'circuit-board') {
      const particles: Array<{
        x: number
        y: number
        vx: number
        vy: number
        radius: number
        opacity: number
        hue: number
      }> = []

      const circuitNodes: Array<{
        x: number
        y: number
        size: number
        pulsePhase: number
        connections: number[]
      }> = []

      const gridLines: Array<{
        x1: number
        y1: number
        x2: number
        y2: number
        opacity: number
        pulsePhase: number
      }> = []

      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          hue: Math.random() * 60 + 120
        })
      }

      for (let i = 0; i < 30; i++) {
        circuitNodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          pulsePhase: Math.random() * Math.PI * 2,
          connections: []
        })
      }

      circuitNodes.forEach((node, index) => {
        const nearbyNodes = circuitNodes
          .map((n, i) => ({ node: n, index: i, dist: Math.hypot(n.x - node.x, n.y - node.y) }))
          .filter(({ index: i, dist }) => i !== index && dist < 200)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 3)
        
        node.connections = nearbyNodes.map(({ index: i }) => i)
      })

      const gridSpacing = 80
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        gridLines.push({
          x1: x,
          y1: 0,
          x2: x,
          y2: canvas.height,
          opacity: 0.03,
          pulsePhase: Math.random() * Math.PI * 2
        })
      }
      for (let y = 0; y < canvas.height; y += gridSpacing) {
        gridLines.push({
          x1: 0,
          y1: y,
          x2: canvas.width,
          y2: y,
          opacity: 0.03,
          pulsePhase: Math.random() * Math.PI * 2
        })
      }

      const animate = () => {
        time += 0.01

        ctx.fillStyle = 'oklch(0.25 0.02 265)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.6
        )
        gradient.addColorStop(0, 'oklch(0.28 0.04 265 / 0.3)')
        gradient.addColorStop(1, 'oklch(0.25 0.02 265 / 0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        gridLines.forEach((line) => {
          const pulse = Math.sin(time * 2 + line.pulsePhase) * 0.02 + 0.03
          ctx.strokeStyle = `oklch(0.75 0.20 145 / ${pulse})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(line.x1, line.y1)
          ctx.lineTo(line.x2, line.y2)
          ctx.stroke()
        })

        circuitNodes.forEach((node, index) => {
          node.connections.forEach((connIndex) => {
            const targetNode = circuitNodes[connIndex]
            const pulse = Math.sin(time * 3 + node.pulsePhase) * 0.15 + 0.2
            
            ctx.strokeStyle = `oklch(0.75 0.20 145 / ${pulse})`
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(targetNode.x, targetNode.y)
            ctx.stroke()

            const dataPacketPos = ((time * 50 + index * 10) % 100) / 100
            const packetX = node.x + (targetNode.x - node.x) * dataPacketPos
            const packetY = node.y + (targetNode.y - node.y) * dataPacketPos
            
            ctx.fillStyle = `oklch(0.75 0.20 145 / ${pulse * 2})`
            ctx.beginPath()
            ctx.arc(packetX, packetY, 2, 0, Math.PI * 2)
            ctx.fill()
          })

          const nodePulse = Math.sin(time * 4 + node.pulsePhase) * 0.3 + 0.5
          const nodeGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 3)
          nodeGradient.addColorStop(0, `oklch(0.75 0.20 145 / ${nodePulse})`)
          nodeGradient.addColorStop(1, `oklch(0.75 0.20 145 / 0)`)
          ctx.fillStyle = nodeGradient
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = `oklch(0.75 0.20 145 / ${nodePulse})`
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
          ctx.fill()
        })

        particles.forEach((particle) => {
          particle.x += particle.vx
          particle.y += particle.vy

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.radius * 3
          )
          gradient.addColorStop(0, `oklch(0.75 0.20 ${particle.hue} / ${particle.opacity})`)
          gradient.addColorStop(1, `oklch(0.75 0.20 ${particle.hue} / 0)`)

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2)
          ctx.fill()
        })

        animationFrameId = requestAnimationFrame(animate)
      }

      animate()
    } else if (theme === 'warehouse-blueprint') {
      const blueprintLines: Array<{
        x1: number
        y1: number
        x2: number
        y2: number
        type: 'major' | 'minor' | 'dimension'
      }> = []

      const annotations: Array<{
        x: number
        y: number
        text: string
        size: number
      }> = []

      const warehouseZones: Array<{
        x: number
        y: number
        width: number
        height: number
        label: string
      }> = []

      const majorSpacing = 120
      const minorSpacing = 30

      for (let x = 0; x <= canvas.width; x += majorSpacing) {
        blueprintLines.push({
          x1: x,
          y1: 0,
          x2: x,
          y2: canvas.height,
          type: 'major'
        })
      }
      for (let y = 0; y <= canvas.height; y += majorSpacing) {
        blueprintLines.push({
          x1: 0,
          y1: y,
          x2: canvas.width,
          y2: y,
          type: 'major'
        })
      }

      for (let x = 0; x <= canvas.width; x += minorSpacing) {
        if (x % majorSpacing !== 0) {
          blueprintLines.push({
            x1: x,
            y1: 0,
            x2: x,
            y2: canvas.height,
            type: 'minor'
          })
        }
      }
      for (let y = 0; y <= canvas.height; y += minorSpacing) {
        if (y % majorSpacing !== 0) {
          blueprintLines.push({
            x1: 0,
            y1: y,
            x2: canvas.width,
            y2: y,
            type: 'minor'
          })
        }
      }

      const zones = [
        { label: 'RECEIVING', x: 0.1, y: 0.1, w: 0.2, h: 0.3 },
        { label: 'STORAGE A', x: 0.35, y: 0.1, w: 0.25, h: 0.35 },
        { label: 'STORAGE B', x: 0.65, y: 0.1, w: 0.25, h: 0.35 },
        { label: 'PACKING', x: 0.1, y: 0.5, w: 0.3, h: 0.35 },
        { label: 'SHIPPING', x: 0.5, y: 0.6, w: 0.4, h: 0.3 }
      ]

      zones.forEach(zone => {
        warehouseZones.push({
          x: canvas.width * zone.x,
          y: canvas.height * zone.y,
          width: canvas.width * zone.w,
          height: canvas.height * zone.h,
          label: zone.label
        })
      })

      for (let i = 0; i < 40; i++) {
        annotations.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          text: `${Math.floor(Math.random() * 20)}m`,
          size: Math.random() * 8 + 6
        })
      }

      const animate = () => {
        time += 0.005

        ctx.fillStyle = 'oklch(0.18 0.04 230)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const vignette = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.7
        )
        vignette.addColorStop(0, 'oklch(0.20 0.05 230 / 0)')
        vignette.addColorStop(1, 'oklch(0.12 0.03 230 / 0.5)')
        ctx.fillStyle = vignette
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        blueprintLines.forEach((line) => {
          if (line.type === 'major') {
            ctx.strokeStyle = 'oklch(0.85 0.08 200 / 0.2)'
            ctx.lineWidth = 1.5
          } else {
            ctx.strokeStyle = 'oklch(0.75 0.08 200 / 0.08)'
            ctx.lineWidth = 0.5
          }
          ctx.beginPath()
          ctx.moveTo(line.x1, line.y1)
          ctx.lineTo(line.x2, line.y2)
          ctx.stroke()
        })

        warehouseZones.forEach((zone) => {
          const pulse = Math.sin(time * 2) * 0.05 + 0.15
          
          ctx.strokeStyle = `oklch(0.75 0.15 180 / ${pulse})`
          ctx.lineWidth = 2
          ctx.setLineDash([10, 5])
          ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)
          ctx.setLineDash([])

          ctx.fillStyle = `oklch(0.75 0.15 180 / ${pulse * 0.3})`
          ctx.fillRect(zone.x, zone.y, zone.width, zone.height)

          ctx.fillStyle = 'oklch(0.85 0.08 200 / 0.7)'
          ctx.font = 'bold 14px JetBrains Mono, monospace'
          ctx.textAlign = 'center'
          ctx.fillText(zone.label, zone.x + zone.width / 2, zone.y + zone.height / 2)

          ctx.fillStyle = 'oklch(0.75 0.08 200 / 0.4)'
          ctx.font = '10px JetBrains Mono, monospace'
          ctx.fillText(
            `${Math.floor(zone.width / 10)}m × ${Math.floor(zone.height / 10)}m`,
            zone.x + zone.width / 2,
            zone.y + zone.height / 2 + 20
          )
        })

        annotations.forEach((annotation, index) => {
          const opacity = Math.sin(time + index * 0.5) * 0.2 + 0.3
          ctx.fillStyle = `oklch(0.75 0.08 200 / ${opacity})`
          ctx.font = `${annotation.size}px JetBrains Mono, monospace`
          ctx.textAlign = 'center'
          ctx.fillText(annotation.text, annotation.x, annotation.y)
        })

        ctx.fillStyle = 'oklch(0.85 0.08 200 / 0.5)'
        ctx.font = 'bold 12px JetBrains Mono, monospace'
        ctx.textAlign = 'left'
        ctx.fillText('AUTONOMOUS WAREHOUSE FACILITY - BLUEPRINT REV 2.4', 20, canvas.height - 20)
        ctx.textAlign = 'right'
        ctx.fillText(`SCALE: 1:${Math.floor(canvas.width / 50)}`, canvas.width - 20, canvas.height - 20)

        animationFrameId = requestAnimationFrame(animate)
      }

      animate()
    } else if (theme === 'satellite-view') {
      const buildings: Array<{
        x: number
        y: number
        width: number
        height: number
        color: string
        shadow: boolean
      }> = []

      const roads: Array<{
        x1: number
        y1: number
        x2: number
        y2: number
        width: number
      }> = []

      const vehicles: Array<{
        x: number
        y: number
        vx: number
        vy: number
        color: string
      }> = []

      const facilityZones: Array<{
        x: number
        y: number
        width: number
        height: number
        highlight: boolean
        pulsePhase: number
      }> = []

      const mainBuilding = {
        x: canvas.width * 0.3,
        y: canvas.height * 0.25,
        width: canvas.width * 0.4,
        height: canvas.height * 0.45
      }

      facilityZones.push({
        x: mainBuilding.x,
        y: mainBuilding.y,
        width: mainBuilding.width,
        height: mainBuilding.height,
        highlight: true,
        pulsePhase: 0
      })

      buildings.push({
        x: mainBuilding.x,
        y: mainBuilding.y,
        width: mainBuilding.width,
        height: mainBuilding.height,
        color: 'oklch(0.35 0.03 265)',
        shadow: true
      })

      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const inMainBuilding = 
          x > mainBuilding.x && 
          x < mainBuilding.x + mainBuilding.width &&
          y > mainBuilding.y && 
          y < mainBuilding.y + mainBuilding.height

        if (!inMainBuilding) {
          buildings.push({
            x,
            y,
            width: Math.random() * 80 + 40,
            height: Math.random() * 80 + 40,
            color: 'oklch(0.30 0.02 265)',
            shadow: true
          })
        }
      }

      const horizontalRoads = [0.2, 0.5, 0.8]
      const verticalRoads = [0.25, 0.5, 0.75]

      horizontalRoads.forEach(pos => {
        roads.push({
          x1: 0,
          y1: canvas.height * pos,
          x2: canvas.width,
          y2: canvas.height * pos,
          width: 20
        })
      })

      verticalRoads.forEach(pos => {
        roads.push({
          x1: canvas.width * pos,
          y1: 0,
          x2: canvas.width * pos,
          y2: canvas.height,
          width: 20
        })
      })

      for (let i = 0; i < 15; i++) {
        const roadChoice = Math.random()
        let x, y, vx, vy

        if (roadChoice < 0.5) {
          const road = horizontalRoads[Math.floor(Math.random() * horizontalRoads.length)]
          x = Math.random() * canvas.width
          y = canvas.height * road
          vx = (Math.random() - 0.5) * 2
          vy = 0
        } else {
          const road = verticalRoads[Math.floor(Math.random() * verticalRoads.length)]
          x = canvas.width * road
          y = Math.random() * canvas.height
          vx = 0
          vy = (Math.random() - 0.5) * 2
        }

        vehicles.push({
          x,
          y,
          vx,
          vy,
          color: `oklch(0.7 0.15 ${Math.random() * 360})`
        })
      }

      const animate = () => {
        time += 0.01

        ctx.fillStyle = 'oklch(0.45 0.06 140)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const noisePattern = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        noisePattern.addColorStop(0, 'oklch(0.42 0.05 135 / 0.3)')
        noisePattern.addColorStop(0.5, 'oklch(0.48 0.07 145 / 0.3)')
        noisePattern.addColorStop(1, 'oklch(0.40 0.05 130 / 0.3)')
        ctx.fillStyle = noisePattern
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        roads.forEach((road) => {
          ctx.strokeStyle = 'oklch(0.35 0.02 265)'
          ctx.lineWidth = road.width
          ctx.beginPath()
          ctx.moveTo(road.x1, road.y1)
          ctx.lineTo(road.x2, road.y2)
          ctx.stroke()

          ctx.strokeStyle = 'oklch(0.55 0.03 85 / 0.3)'
          ctx.lineWidth = road.width * 0.1
          ctx.setLineDash([10, 10])
          ctx.beginPath()
          ctx.moveTo(road.x1, road.y1)
          ctx.lineTo(road.x2, road.y2)
          ctx.stroke()
          ctx.setLineDash([])
        })

        buildings.forEach((building) => {
          if (building.shadow) {
            ctx.fillStyle = 'oklch(0 0 0 / 0.4)'
            ctx.fillRect(building.x + 5, building.y + 5, building.width, building.height)
          }

          ctx.fillStyle = building.color
          ctx.fillRect(building.x, building.y, building.width, building.height)

          ctx.strokeStyle = 'oklch(0.20 0.02 265 / 0.6)'
          ctx.lineWidth = 1
          ctx.strokeRect(building.x, building.y, building.width, building.height)
        })

        facilityZones.forEach((zone) => {
          const pulse = Math.sin(time * 3 + zone.pulsePhase) * 0.3 + 0.5
          
          ctx.strokeStyle = `oklch(0.75 0.20 145 / ${pulse * 0.6})`
          ctx.lineWidth = 3
          ctx.strokeRect(zone.x - 10, zone.y - 10, zone.width + 20, zone.height + 20)

          ctx.fillStyle = `oklch(0.75 0.20 145 / ${pulse * 0.2})`
          ctx.fillRect(zone.x, zone.y, zone.width, zone.height)

          ctx.fillStyle = `oklch(0.75 0.20 145 / ${pulse})`
          ctx.font = 'bold 16px Space Grotesk, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('⦿ AUTONOMOUS FACILITY', zone.x + zone.width / 2, zone.y - 20)

          const cornerSize = 15
          const corners = [
            [zone.x - 10, zone.y - 10],
            [zone.x + zone.width + 10, zone.y - 10],
            [zone.x - 10, zone.y + zone.height + 10],
            [zone.x + zone.width + 10, zone.y + zone.height + 10]
          ]

          ctx.strokeStyle = `oklch(0.75 0.20 145 / ${pulse})`
          ctx.lineWidth = 2
          corners.forEach(([cx, cy]) => {
            ctx.beginPath()
            ctx.moveTo(cx - cornerSize, cy)
            ctx.lineTo(cx, cy)
            ctx.lineTo(cx, cy - cornerSize)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(cx + cornerSize, cy)
            ctx.lineTo(cx, cy)
            ctx.lineTo(cx, cy + cornerSize)
            ctx.stroke()
          })
        })

        vehicles.forEach((vehicle) => {
          vehicle.x += vehicle.vx
          vehicle.y += vehicle.vy

          if (vehicle.x < 0) vehicle.x = canvas.width
          if (vehicle.x > canvas.width) vehicle.x = 0
          if (vehicle.y < 0) vehicle.y = canvas.height
          if (vehicle.y > canvas.height) vehicle.y = 0

          ctx.fillStyle = vehicle.color
          ctx.fillRect(vehicle.x - 3, vehicle.y - 3, 6, 6)

          const glowGradient = ctx.createRadialGradient(vehicle.x, vehicle.y, 0, vehicle.x, vehicle.y, 8)
          glowGradient.addColorStop(0, vehicle.color.replace(')', ' / 0.6)'))
          glowGradient.addColorStop(1, vehicle.color.replace(')', ' / 0)'))
          ctx.fillStyle = glowGradient
          ctx.fillRect(vehicle.x - 8, vehicle.y - 8, 16, 16)
        })

        ctx.fillStyle = 'oklch(0.85 0.05 145 / 0.4)'
        ctx.font = '11px JetBrains Mono, monospace'
        ctx.textAlign = 'left'
        ctx.fillText(`SAT VIEW - ${new Date().toISOString().split('T')[0]}`, 15, canvas.height - 15)
        ctx.textAlign = 'right'
        ctx.fillText('LAT: 37.7749° N  LONG: 122.4194° W', canvas.width - 15, canvas.height - 15)

        animationFrameId = requestAnimationFrame(animate)
      }

      animate()
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  )
}
