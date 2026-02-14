import { motion, AnimatePresence } from 'framer-motion'
import type { Robot } from '@/lib/types'
import type { CongestionZone } from '@/lib/congestion-learning'
import { Gauge, ArrowDown, ArrowUp, Minus, Warning } from '@phosphor-icons/react'

interface SpeedOverlayProps {
  robots: Robot[]
  zones: CongestionZone[]
  cellSize: number
  showZones: boolean
  showRobotSpeeds: boolean
  showSpeedIndicators: boolean
}

export function SpeedOverlay({ 
  robots, 
  zones, 
  cellSize,
  showZones,
  showRobotSpeeds,
  showSpeedIndicators
}: SpeedOverlayProps) {
  const getSpeedColor = (speed: number) => {
    if (speed >= 1.0) return 'oklch(0.75 0.20 145)'
    if (speed >= 0.8) return 'oklch(0.75 0.18 100)'
    if (speed >= 0.6) return 'oklch(0.75 0.15 85)'
    if (speed >= 0.4) return 'oklch(0.75 0.22 25)'
    return 'oklch(0.70 0.22 325)'
  }

  const getCongestionColor = (level: number) => {
    if (level >= 0.7) return 'oklch(0.55 0.22 25)'
    if (level >= 0.5) return 'oklch(0.75 0.22 25)'
    if (level >= 0.3) return 'oklch(0.75 0.15 85)'
    return 'oklch(0.75 0.18 100)'
  }

  const getCongestionOpacity = (level: number) => {
    return Math.min(0.5, level * 0.7)
  }

  const getSpeedIcon = (currentSpeed: number, baseSpeed: number = 1.0) => {
    if (currentSpeed > baseSpeed * 0.95) return <Minus size={12} weight="bold" />
    if (currentSpeed < baseSpeed * 0.7) return <ArrowDown size={12} weight="bold" />
    if (currentSpeed > baseSpeed * 1.05) return <ArrowUp size={12} weight="bold" />
    return <Minus size={12} weight="bold" />
  }

  return (
    <>
      <AnimatePresence>
        {showZones && zones.map((zone, idx) => {
          if (zone.congestionLevel < 0.2) return null
          
          return (
            <motion.div
              key={`zone-${idx}`}
              className="absolute pointer-events-none"
              style={{
                left: zone.x * cellSize,
                top: zone.y * cellSize,
                width: zone.width * cellSize,
                height: zone.height * cellSize,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="absolute inset-0 border-2 rounded-lg"
                style={{
                  backgroundColor: `${getCongestionColor(zone.congestionLevel)}`,
                  opacity: getCongestionOpacity(zone.congestionLevel),
                  borderColor: `${getCongestionColor(zone.congestionLevel)}88`
                }}
                animate={{
                  opacity: [
                    getCongestionOpacity(zone.congestionLevel) * 0.7,
                    getCongestionOpacity(zone.congestionLevel),
                    getCongestionOpacity(zone.congestionLevel) * 0.7
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {zone.congestionLevel > 0.5 && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-white bg-destructive/90 px-2 py-1 rounded-md shadow-lg backdrop-blur-sm">
                    {zone.congestionLevel > 0.7 && (
                      <Warning size={12} weight="fill" />
                    )}
                    {Math.round(zone.congestionLevel * 100)}%
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      <AnimatePresence>
        {showRobotSpeeds && robots.filter(r => r.status === 'moving').map(robot => (
          <motion.div
            key={`speed-${robot.id}`}
            className="absolute pointer-events-none z-10"
            style={{
              left: robot.position.x * cellSize + cellSize / 2,
              top: robot.position.y * cellSize - cellSize * 0.65,
            }}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap shadow-lg backdrop-blur-sm border"
              style={{
                backgroundColor: `${getSpeedColor(robot.speed)}`,
                color: 'oklch(0.98 0 0)',
                transform: 'translateX(-50%)',
                borderColor: `${getSpeedColor(robot.speed)}cc`
              }}
              animate={{
                y: [0, -2, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Gauge size={12} weight="bold" />
              <span>{robot.speed.toFixed(2)}x</span>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showSpeedIndicators && robots.map(robot => {
          const baseSpeed = 1.0
          const speedDiff = robot.speed - baseSpeed
          const isAdjusted = Math.abs(speedDiff) > 0.05

          if (!isAdjusted || robot.status !== 'moving') return null

          return (
            <motion.div
              key={`indicator-${robot.id}`}
              className="absolute pointer-events-none z-10"
              style={{
                left: robot.position.x * cellSize + cellSize * 0.82,
                top: robot.position.y * cellSize + cellSize * 0.05,
              }}
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: 0,
                y: speedDiff < 0 ? [0, 4, 0] : [0, -4, 0]
              }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ 
                scale: { duration: 0.3, ease: "backOut" },
                opacity: { duration: 0.2 },
                rotate: { duration: 0.3 },
                y: { 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <motion.div 
                className="flex items-center justify-center w-6 h-6 rounded-full shadow-lg border-2"
                style={{
                  backgroundColor: getSpeedColor(robot.speed),
                  color: 'oklch(0.98 0 0)',
                  borderColor: 'oklch(0.98 0 0 / 0.3)'
                }}
                whileHover={{ scale: 1.2 }}
              >
                {getSpeedIcon(robot.speed, baseSpeed)}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </>
  )
}
