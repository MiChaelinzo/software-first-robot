import { useEffect, useRef, useState } from 'react'

interface ParticleExplosion {
  x: number
  y: number
  timestamp: number
  particles: Array<{
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    color: string
    size: number
  }>
}

interface ParticleEffectsProps {
  explosions: Array<{ x: number; y: number; timestamp: number; color?: string }>
}

export function ParticleEffects({ explosions }: ParticleEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const explosionsRef = useRef<ParticleExplosion[]>([])

  useEffect(() => {
    explosions.forEach((explosion) => {
      const existingExplosion = explosionsRef.current.find(
        (e) => e.x === explosion.x && e.y === explosion.y && e.timestamp === explosion.timestamp
      )

      if (!existingExplosion) {
        const particles: ParticleExplosion['particles'] = []
        const particleCount = 20

        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
          const speed = Math.random() * 3 + 2
          const life = Math.random() * 40 + 30

          particles.push({
            x: explosion.x,
            y: explosion.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: life,
            maxLife: life,
            color: explosion.color || 'oklch(0.75 0.20 145)',
            size: Math.random() * 3 + 2
          })
        }

        explosionsRef.current.push({
          x: explosion.x,
          y: explosion.y,
          timestamp: explosion.timestamp,
          particles
        })
      }
    })
  }, [explosions])

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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      explosionsRef.current.forEach((explosion, explosionIndex) => {
        explosion.particles.forEach((particle, particleIndex) => {
          particle.x += particle.vx
          particle.y += particle.vy
          particle.vy += 0.1
          particle.vx *= 0.98
          particle.vy *= 0.98
          particle.life -= 1

          if (particle.life > 0) {
            const alpha = particle.life / particle.maxLife
            ctx.fillStyle = particle.color.replace(')', ` / ${alpha * 0.8})`)
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()

            const glowGradient = ctx.createRadialGradient(
              particle.x,
              particle.y,
              0,
              particle.x,
              particle.y,
              particle.size * 3
            )
            glowGradient.addColorStop(0, particle.color.replace(')', ` / ${alpha * 0.4})`))
            glowGradient.addColorStop(1, particle.color.replace(')', ' / 0)'))
            ctx.fillStyle = glowGradient
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
            ctx.fill()
          }
        })

        explosion.particles = explosion.particles.filter((p) => p.life > 0)

        if (explosion.particles.length === 0) {
          explosionsRef.current.splice(explosionIndex, 1)
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
      className="fixed inset-0 pointer-events-none z-40"
    />
  )
}
