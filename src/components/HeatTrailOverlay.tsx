import { memo } from 'react'
import { motion } from 'framer-motion'
import type { TrailPoint, HeatMapCell } from '@/lib/heat-trail'

interface HeatTrailOverlayProps {
  trails: Map<string, TrailPoint[]>
  heatMap: HeatMapCell[]
  cellSize: number
  width: number
  height: number
  showTrails: boolean
  showHeatMap: boolean
  getOpacity: (point: TrailPoint) => number
}

export const HeatTrailOverlay = memo(function HeatTrailOverlay({
  trails,
  heatMap,
  cellSize,
  width,
  height,
  showTrails,
  showHeatMap,
  getOpacity
}: HeatTrailOverlayProps) {
  const maxFrequency = heatMap.length > 0 
    ? Math.max(...heatMap.map(c => c.frequency))
    : 1

  const getHeatColor = (frequency: number, avgSpeed: number): string => {
    const intensity = frequency / maxFrequency
    
    if (avgSpeed < 0.5) {
      const lightness = 0.35 + (intensity * 0.15)
      return `oklch(${lightness} 0.22 25 / ${0.3 + intensity * 0.4})`
    } else if (avgSpeed < 0.8) {
      const lightness = 0.65 + (intensity * 0.1)
      return `oklch(${lightness} 0.18 100 / ${0.3 + intensity * 0.4})`
    } else {
      const lightness = 0.65 + (intensity * 0.1)
      return `oklch(${lightness} 0.20 145 / ${0.3 + intensity * 0.4})`
    }
  }

  const getSpeedColor = (speed: number): string => {
    if (speed < 0.5) {
      return 'oklch(0.55 0.22 25)'
    } else if (speed < 0.8) {
      return 'oklch(0.75 0.18 100)'
    } else {
      return 'oklch(0.75 0.20 145)'
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {showHeatMap && (
        <svg
          className="absolute top-0 left-0"
          width={width}
          height={height}
          style={{ mixBlendMode: 'screen' }}
        >
          {heatMap.map((cell) => {
            const color = getHeatColor(cell.frequency, cell.avgSpeed)
            return (
              <motion.rect
                key={`${cell.x}-${cell.y}`}
                x={cell.x * cellSize}
                y={cell.y * cellSize}
                width={cellSize}
                height={cellSize}
                fill={color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )
          })}
        </svg>
      )}

      {showTrails && (
        <svg
          className="absolute top-0 left-0"
          width={width}
          height={height}
        >
          {Array.from(trails.entries()).map(([robotId, trail]) => {
            if (trail.length < 2) return null

            const pathData = trail.map((point, i) => {
              const x = point.x * cellSize + cellSize / 2
              const y = point.y * cellSize + cellSize / 2
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            }).join(' ')

            return (
              <g key={`trail-${robotId}`}>
                {trail.map((point, i) => {
                  if (i === trail.length - 1) return null
                  const nextPoint = trail[i + 1]
                  
                  const x1 = point.x * cellSize + cellSize / 2
                  const y1 = point.y * cellSize + cellSize / 2
                  const x2 = nextPoint.x * cellSize + cellSize / 2
                  const y2 = nextPoint.y * cellSize + cellSize / 2

                  const opacity = getOpacity(point)
                  const avgSpeed = (point.speed + nextPoint.speed) / 2
                  const color = getSpeedColor(avgSpeed)
                  const width = 2 + (avgSpeed * 2)

                  return (
                    <motion.line
                      key={`${robotId}-segment-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={color}
                      strokeWidth={width}
                      strokeLinecap="round"
                      opacity={opacity * 0.7}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: opacity * 0.7 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )
                })}

                {trail.map((point, i) => {
                  const opacity = getOpacity(point)
                  const color = getSpeedColor(point.speed)
                  const radius = 1.5 + (point.speed * 1.5)

                  return (
                    <motion.circle
                      key={`${robotId}-point-${i}`}
                      cx={point.x * cellSize + cellSize / 2}
                      cy={point.y * cellSize + cellSize / 2}
                      r={radius}
                      fill={color}
                      opacity={opacity * 0.8}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: opacity * 0.8 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )
                })}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
})
