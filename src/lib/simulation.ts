import type { Robot, Task, WarehouseCell, Position, PerformanceMetrics } from './types'
import { findPath, calculateDistance, findNearestRobot } from './pathfinding'

export function createWarehouse(width: number, height: number): WarehouseCell[][] {
  const warehouse: WarehouseCell[][] = []
  
  for (let y = 0; y < height; y++) {
    const row: WarehouseCell[] = []
    for (let x = 0; x < width; x++) {
      let type: WarehouseCell['type'] = 'empty'
      
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        if (!(x === 1 && y === 1) && !(x === width - 2 && y === 1) && 
            !(x === 1 && y === height - 2) && !(x === width - 2 && y === height - 2)) {
          type = 'obstacle'
        }
      }
      
      if (x === 1 && y === 1) type = 'charging'
      if (x === width - 2 && y === 1) type = 'charging'
      if (x === 1 && y === height - 2) type = 'charging'
      if (x === width - 2 && y === height - 2) type = 'charging'
      
      if ((x >= 5 && x <= 7) && (y >= 3 && y <= 5)) type = 'storage'
      if ((x >= 10 && x <= 12) && (y >= 3 && y <= 5)) type = 'storage'
      if ((x >= 5 && x <= 7) && (y >= 8 && y <= 10)) type = 'storage'
      if ((x >= 10 && x <= 12) && (y >= 8 && y <= 10)) type = 'storage'
      
      if ((x === 3 || x === 14) && y >= 2 && y <= 11) type = 'obstacle'
      
      row.push({
        type,
        occupied: false
      })
    }
    warehouse.push(row)
  }
  
  return warehouse
}

export function createRobot(id: string, position: Position, color: string): Robot {
  return {
    id,
    position,
    targetPosition: null,
    path: [],
    status: 'idle',
    battery: 100,
    currentTask: null,
    speed: 1,
    color
  }
}

export function assignTaskToRobot(
  task: Task,
  robots: Robot[],
  warehouse: WarehouseCell[][]
): { robotId: string; path: Position[] } | null {
  const robotId = findNearestRobot(task.position, robots)
  
  if (!robotId) return null
  
  const robot = robots.find(r => r.id === robotId)
  if (!robot) return null
  
  const path = findPath(robot.position, task.position, warehouse, robot.id)
  
  if (path.length === 0) return null
  
  return { robotId, path }
}

export function updateRobotPosition(
  robot: Robot,
  warehouse: WarehouseCell[][],
  deltaTime: number,
  speed: number
): { robot: Robot; metrics: Partial<PerformanceMetrics> } {
  const metrics: Partial<PerformanceMetrics> = {}
  
  if (robot.status !== 'moving' || robot.path.length === 0) {
    return { robot, metrics }
  }
  
  const target = robot.path[0]
  const distance = calculateDistance(robot.position, target)
  
  const moveSpeed = robot.speed * speed * deltaTime * 60
  
  if (distance <= moveSpeed) {
    warehouse[robot.position.y][robot.position.x].occupied = false
    warehouse[robot.position.y][robot.position.x].robotId = undefined
    
    robot.position = { ...target }
    robot.path.shift()
    
    warehouse[robot.position.y][robot.position.x].occupied = true
    warehouse[robot.position.y][robot.position.x].robotId = robot.id
    
    metrics.totalDistance = (metrics.totalDistance || 0) + 1
    
    if (robot.path.length === 0) {
      robot.status = 'idle'
      robot.targetPosition = null
      
      if (robot.currentTask) {
        robot.currentTask.status = 'completed'
        robot.currentTask.completedAt = Date.now()
        robot.currentTask = null
      }
    }
  } else {
    const angle = Math.atan2(target.y - robot.position.y, target.x - robot.position.x)
    const dx = Math.cos(angle) * moveSpeed
    const dy = Math.sin(angle) * moveSpeed
    
    robot.position = {
      x: robot.position.x + dx,
      y: robot.position.y + dy
    }
  }
  
  robot.battery = Math.max(0, robot.battery - 0.01 * deltaTime * speed)
  
  if (robot.battery < 20) {
    metrics.pathsCalculated = (metrics.pathsCalculated || 0) + 1
  }
  
  return { robot, metrics }
}

export function checkCollisions(robots: Robot[]): { 
  collisionsAvoided: number
  nearMissIncidents: number
  criticalAvoidances: number
  events: Array<{
    type: 'near-miss' | 'collision-avoided' | 'critical-avoidance'
    robotIds: string[]
    distance: number
    description: string
  }>
} {
  let collisionsAvoided = 0
  let nearMissIncidents = 0
  let criticalAvoidances = 0
  const events: Array<{
    type: 'near-miss' | 'collision-avoided' | 'critical-avoidance'
    robotIds: string[]
    distance: number
    description: string
  }> = []
  
  const CRITICAL_DISTANCE = 1.0
  const WARNING_DISTANCE = 2.0
  const COLLISION_DISTANCE = 0.5
  
  for (let i = 0; i < robots.length; i++) {
    let nearestDistance = Infinity
    let shouldYield = false
    
    for (let j = 0; j < robots.length; j++) {
      if (i === j) continue
      
      const distance = calculateDistance(robots[i].position, robots[j].position)
      nearestDistance = Math.min(nearestDistance, distance)
      
      if (distance < COLLISION_DISTANCE) {
        criticalAvoidances++
        events.push({
          type: 'critical-avoidance',
          robotIds: [robots[i].id, robots[j].id],
          distance,
          description: `Emergency stop initiated to prevent collision`
        })
        
        const robotIPriority = getPriority(robots[i])
        const robotJPriority = getPriority(robots[j])
        
        if (robotIPriority < robotJPriority) {
          shouldYield = true
        } else if (robotIPriority === robotJPriority) {
          if (i > j) shouldYield = true
        }
      }
      
      if (robots[i].status === 'moving' && robots[j].status === 'moving') {
        if (distance < CRITICAL_DISTANCE) {
          collisionsAvoided++
          
          const iMovingToward = isMovingToward(robots[i], robots[j])
          const jMovingToward = isMovingToward(robots[j], robots[i])
          
          if (iMovingToward || jMovingToward) {
            events.push({
              type: 'collision-avoided',
              robotIds: [robots[i].id, robots[j].id],
              distance,
              description: `Robots adjusted speed to maintain safe distance`
            })
          }
          
          if (iMovingToward && jMovingToward) {
            const robotIPriority = getPriority(robots[i])
            const robotJPriority = getPriority(robots[j])
            
            if (robotIPriority < robotJPriority) {
              robots[i].speed = 0.3
            } else if (robotIPriority > robotJPriority) {
              robots[j].speed = 0.3
            } else {
              if (i > j) {
                robots[i].speed = 0.3
              } else {
                robots[j].speed = 0.3
              }
            }
          } else if (iMovingToward) {
            robots[i].speed = 0.4
          } else if (jMovingToward) {
            robots[j].speed = 0.4
          }
        } else if (distance < WARNING_DISTANCE) {
          if (isMovingToward(robots[i], robots[j])) {
            nearMissIncidents++
            events.push({
              type: 'near-miss',
              robotIds: [robots[i].id, robots[j].id],
              distance,
              description: `Robots detected in proximity, monitoring closely`
            })
            robots[i].speed = Math.min(robots[i].speed, 0.7)
          }
        }
      }
    }
    
    if (shouldYield && robots[i].status === 'moving') {
      robots[i].speed = 0.2
    }
    
    if (nearestDistance > WARNING_DISTANCE && robots[i].speed < 1) {
      robots[i].speed = Math.min(1, robots[i].speed + 0.15)
    }
  }
  
  return { collisionsAvoided, nearMissIncidents, criticalAvoidances, events }
}

function getPriority(robot: Robot): number {
  if (!robot.currentTask) return 0
  
  const priorityMap = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1
  }
  
  return priorityMap[robot.currentTask.priority] || 0
}

function isMovingToward(robotA: Robot, robotB: Robot): boolean {
  if (robotA.path.length === 0) return false
  
  const nextPos = robotA.path[0]
  const currentDist = calculateDistance(robotA.position, robotB.position)
  const nextDist = calculateDistance(nextPos, robotB.position)
  
  return nextDist < currentDist
}

export function generateRandomTask(
  warehouse: WarehouseCell[][],
  existingTasks: Task[]
): Task {
  const types: Task['type'][] = ['pickup', 'delivery', 'scan']
  const priorities: Task['priority'][] = ['low', 'medium', 'high', 'critical']
  
  let position: Position
  let attempts = 0
  
  do {
    position = {
      x: Math.floor(Math.random() * warehouse[0].length),
      y: Math.floor(Math.random() * warehouse.length)
    }
    attempts++
  } while (
    (warehouse[position.y][position.x].type === 'obstacle' ||
     warehouse[position.y][position.x].type === 'charging') &&
    attempts < 100
  )
  
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: types[Math.floor(Math.random() * types.length)],
    position,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: 'pending',
    createdAt: Date.now()
  }
}
