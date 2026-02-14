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

export function checkCollisions(robots: Robot[]): number {
  let collisionsAvoided = 0
  
  for (let i = 0; i < robots.length; i++) {
    for (let j = i + 1; j < robots.length; j++) {
      const distance = calculateDistance(robots[i].position, robots[j].position)
      
      if (distance < 1.5 && (robots[i].status === 'moving' || robots[j].status === 'moving')) {
        collisionsAvoided++
        
        if (robots[i].status === 'moving' && robots[i].path.length > 0) {
          robots[i].speed = 0.5
        }
        if (robots[j].status === 'moving' && robots[j].path.length > 0) {
          robots[j].speed = 0.5
        }
      } else {
        if (robots[i].speed < 1) robots[i].speed = Math.min(1, robots[i].speed + 0.1)
        if (robots[j].speed < 1) robots[j].speed = Math.min(1, robots[j].speed + 0.1)
      }
    }
  }
  
  return collisionsAvoided
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
