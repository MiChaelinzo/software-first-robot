import { useEffect, useRef } from 'react'

interface DataStream {
  x: number
  y: number
  speed: number
  characters: string[]
  currentIndex: number
  opacity: number
  color: string
}

export function DataStreams() {
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

    const streams: DataStream[] = []
    const streamCount = 8
    const chars = '01ABCDEF↑↓←→⚡⚙✓✗'

    for (let i = 0; i < streamCount; i++) {
      streams.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        speed: Math.random() * 0.5 + 0.3,
        characters: Array.from({ length: 15 }, () => chars[Math.floor(Math.random() * chars.length)]),
        currentIndex: 0,
        opacity: Math.random() * 0.3 + 0.1,
        color: Math.random() > 0.5 ? 'oklch(0.75 0.20 145)' : 'oklch(0.75 0.20 265)'
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      streams.forEach((stream) => {
        stream.y += stream.speed

        if (stream.y > canvas.height + 200) {
          stream.y = -200
          stream.x = Math.random() * canvas.width
          stream.speed = Math.random() * 0.5 + 0.3
        }

        ctx.font = '12px "JetBrains Mono", monospace'
        ctx.textAlign = 'center'

        stream.characters.forEach((char, index) => {
          const charY = stream.y + index * 16
          if (charY < 0 || charY > canvas.height) return

          const distanceFromHead = index / stream.characters.length
          const charOpacity = stream.opacity * (1 - distanceFromHead * 0.8)

          ctx.fillStyle = stream.color.replace(')', ` / ${charOpacity})`)
          ctx.fillText(char, stream.x, charY)

          if (index === 0) {
            const glowGradient = ctx.createRadialGradient(stream.x, charY, 0, stream.x, charY, 20)
            glowGradient.addColorStop(0, stream.color.replace(')', ` / ${charOpacity * 0.3})`))
            glowGradient.addColorStop(1, stream.color.replace(')', ' / 0)'))
            ctx.fillStyle = glowGradient
            ctx.fillRect(stream.x - 20, charY - 20, 40, 40)
          }
        })

        if (Math.random() < 0.05) {
          stream.characters.shift()
          stream.characters.push(chars[Math.floor(Math.random() * chars.length)])
        }
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
      className="fixed inset-0 -z-5 pointer-events-none"
      style={{ opacity: 0.25 }}
    />
  )
}
