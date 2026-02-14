import { useEffect, useRef } from 'react'

export function DynamicBackground() {
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

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      hue: number
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

    const robots: Array<{
      x: number
      y: number
      targetX: number
      targetY: number
      color: string
      trail: Array<{ x: number; y: number }>
    }> = []

    for (let i = 0; i < 5; i++) {
      robots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        color: `oklch(0.7 0.2 ${100 + i * 50})`,
        trail: []
      })
    }

    let time = 0

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

      robots.forEach((robot) => {
        const dx = robot.targetX - robot.x
        const dy = robot.targetY - robot.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 5) {
          robot.targetX = Math.random() * canvas.width
          robot.targetY = Math.random() * canvas.height
        } else {
          robot.x += (dx / dist) * 0.8
          robot.y += (dy / dist) * 0.8
        }

        robot.trail.push({ x: robot.x, y: robot.y })
        if (robot.trail.length > 30) robot.trail.shift()

        robot.trail.forEach((point, index) => {
          const alpha = (index / robot.trail.length) * 0.15
          ctx.fillStyle = robot.color.replace(')', ` / ${alpha})`)
          ctx.beginPath()
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2)
          ctx.fill()
        })

        const robotGradient = ctx.createRadialGradient(robot.x, robot.y, 0, robot.x, robot.y, 8)
        robotGradient.addColorStop(0, robot.color.replace(')', ' / 0.4)'))
        robotGradient.addColorStop(1, robot.color.replace(')', ' / 0)'))
        ctx.fillStyle = robotGradient
        ctx.beginPath()
        ctx.arc(robot.x, robot.y, 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = robot.color.replace(')', ' / 0.8)')
        ctx.beginPath()
        ctx.arc(robot.x, robot.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  )
}
