import { useEffect, useRef, useState } from 'react'

interface MouseTrailPoint {
  x: number
  y: number
  timestamp: number
  vx: number
  vy: number
}

export function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<MouseTrailPoint[]>([])
  const [isActive, setIsActive] = useState(false)

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

    let lastX = 0
    let lastY = 0
    let lastTime = Date.now()

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      const dt = now - lastTime
      const vx = dt > 0 ? (e.clientX - lastX) / dt : 0
      const vy = dt > 0 ? (e.clientY - lastY) / dt : 0

      trailRef.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: now,
        vx,
        vy
      })

      lastX = e.clientX
      lastY = e.clientY
      lastTime = now

      if (trailRef.current.length > 50) {
        trailRef.current.shift()
      }

      setIsActive(true)
    }

    const handleMouseLeave = () => {
      setIsActive(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = Date.now()
      trailRef.current = trailRef.current.filter((point) => now - point.timestamp < 1000)

      if (trailRef.current.length > 1) {
        for (let i = 0; i < trailRef.current.length - 1; i++) {
          const point = trailRef.current[i]
          const nextPoint = trailRef.current[i + 1]
          const age = now - point.timestamp
          const maxAge = 1000
          const normalizedAge = age / maxAge
          const opacity = (1 - normalizedAge) * 0.6

          const speed = Math.sqrt(point.vx * point.vx + point.vy * point.vy)
          const hue = Math.min(145 + speed * 100, 265)

          const gradient = ctx.createLinearGradient(point.x, point.y, nextPoint.x, nextPoint.y)
          gradient.addColorStop(0, `oklch(0.75 0.20 ${hue} / ${opacity})`)
          gradient.addColorStop(1, `oklch(0.75 0.20 ${hue} / ${opacity * 0.5})`)

          ctx.strokeStyle = gradient
          ctx.lineWidth = 3 * (1 - normalizedAge) + 1
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'

          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
          ctx.lineTo(nextPoint.x, nextPoint.y)
          ctx.stroke()

          const glowGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 15)
          glowGradient.addColorStop(0, `oklch(0.75 0.20 ${hue} / ${opacity * 0.3})`)
          glowGradient.addColorStop(1, `oklch(0.75 0.20 ${hue} / 0)`)

          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(point.x, point.y, 15, 0, Math.PI * 2)
          ctx.fill()
        }

        if (trailRef.current.length > 0) {
          const lastPoint = trailRef.current[trailRef.current.length - 1]
          const age = now - lastPoint.timestamp

          if (age < 100) {
            const cursorGradient = ctx.createRadialGradient(
              lastPoint.x,
              lastPoint.y,
              0,
              lastPoint.x,
              lastPoint.y,
              20
            )
            cursorGradient.addColorStop(0, 'oklch(0.75 0.20 145 / 0.4)')
            cursorGradient.addColorStop(0.5, 'oklch(0.75 0.20 145 / 0.2)')
            cursorGradient.addColorStop(1, 'oklch(0.75 0.20 145 / 0)')

            ctx.fillStyle = cursorGradient
            ctx.beginPath()
            ctx.arc(lastPoint.x, lastPoint.y, 20, 0, Math.PI * 2)
            ctx.fill()

            ctx.strokeStyle = 'oklch(0.75 0.20 145 / 0.6)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2)
            ctx.stroke()

            ctx.fillStyle = 'oklch(0.75 0.20 145 / 0.8)'
            ctx.beginPath()
            ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
