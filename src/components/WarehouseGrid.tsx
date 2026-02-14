import { motion } from 'framer-motion'
import type { Robot, WarehouseCell, Task } from '@/lib/types'
import type { CongestionZone } from '@/lib/congestion-learning'
import { Lightning, Package, Circle } from '@phosphor-icons/react'
import { SpeedOverlay } from './SpeedOverlay'

interface WarehouseGridProps {
  warehouse: WarehouseCell[][]
  robots: Robot[]
  tasks: Task[]
  cellSize?: number
  congestionZones?: CongestionZone[]
  showCongestionZones?: boolean
  showRobotSpeeds?: boolean
  showSpeedIndicators?: boolean
}

export function WarehouseGrid({ 
  warehouse, 
  robots, 
  tasks,
  cellSize = 40,
  congestionZones = [],
  showCongestionZones = false,
  showRobotSpeeds = false,
  showSpeedIndicators = false
}: WarehouseGridProps) {
  const width = warehouse[0]?.length || 0
  const height = warehouse.length

  const getCellColor = (cell: WarehouseCell) => {
    switch (cell.type) {
      case 'obstacle':
        return 'bg-secondary/80'
      case 'charging':
        return 'bg-charging/20 border border-charging/40'
      case 'storage':
        return 'bg-primary/10 border border-primary/30'
      case 'pickup':
        return 'bg-accent/20 border border-accent/40'
      case 'delivery':
        return 'bg-success/20 border border-success/40'
      default:
        return 'bg-muted/20 border border-border/30'
    }
  }

  const renderCellIcon = (cell: WarehouseCell, x: number, y: number) => {
    if (cell.type === 'charging') {
      return <Lightning size={cellSize * 0.5} className="text-charging" weight="fill" />
    }
    if (cell.type === 'storage') {
      return <Package size={cellSize * 0.4} className="text-primary/60" weight="duotone" />
    }
    return null
  }

  const getRobotAtPosition = (x: number, y: number) => {
    return robots.find(robot => {
      const rx = Math.round(robot.position.x)
      const ry = Math.round(robot.position.y)
      return rx === x && ry === y
    })
  }

  return (
    <div 
      className="relative"
      style={{
        width: width * cellSize,
        height: height * cellSize
      }}
    >
      {warehouse.map((row, y) => (
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`absolute grid-cell ${getCellColor(cell)} flex items-center justify-center transition-colors`}
            style={{
              left: x * cellSize,
              top: y * cellSize,
              width: cellSize,
              height: cellSize
            }}
          >
            {renderCellIcon(cell, x, y)}
          </div>
        ))
      ))}

      <SpeedOverlay 
        robots={robots}
        zones={congestionZones}
        cellSize={cellSize}
        showZones={showCongestionZones}
        showRobotSpeeds={showRobotSpeeds}
        showSpeedIndicators={showSpeedIndicators}
      />

      {tasks
        .filter(task => task.status === 'pending' || task.status === 'assigned')
        .map(task => (
          <motion.div
            key={task.id}
            className="absolute flex items-center justify-center"
            style={{
              left: task.position.x * cellSize,
              top: task.position.y * cellSize,
              width: cellSize,
              height: cellSize
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Package 
                size={cellSize * 0.6} 
                className={`
                  ${task.priority === 'critical' ? 'text-destructive' : ''}
                  ${task.priority === 'high' ? 'text-warning' : ''}
                  ${task.priority === 'medium' ? 'text-accent' : ''}
                  ${task.priority === 'low' ? 'text-muted-foreground' : ''}
                `}
                weight="duotone"
              />
            </motion.div>
          </motion.div>
        ))
      }

      {robots.map(robot => (
        <g key={robot.id}>
          {robot.path.length > 1 && (
            <motion.svg
              className="absolute top-0 left-0 pointer-events-none"
              width={width * cellSize}
              height={height * cellSize}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            >
              <motion.path
                d={`M ${robot.position.x * cellSize + cellSize / 2} ${robot.position.y * cellSize + cellSize / 2} ${robot.path
                  .map(p => `L ${p.x * cellSize + cellSize / 2} ${p.y * cellSize + cellSize / 2}`)
                  .join(' ')}`}
                stroke={robot.color}
                strokeWidth="3"
                fill="none"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.svg>
          )}

          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: robot.position.x * cellSize,
              top: robot.position.y * cellSize,
              width: cellSize,
              height: cellSize
            }}
            animate={{
              x: 0,
              y: 0
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                className="relative"
                animate={{
                  scale: robot.status === 'moving' ? [1, 1.05, 1] : 1
                }}
                transition={{
                  duration: 0.5,
                  repeat: robot.status === 'moving' ? Infinity : 0
                }}
              >
                <Circle
                  size={cellSize * 0.7}
                  weight="fill"
                  className="robot-glow"
                  style={{ color: robot.color }}
                />
                <div 
                  className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold"
                  style={{ color: 'oklch(0.2 0.02 265)' }}
                >
                  {robot.id.split('-')[1]}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </g>
      ))}
    </div>
  )
}
