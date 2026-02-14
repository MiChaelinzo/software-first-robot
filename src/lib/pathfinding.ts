import type { Position, WarehouseCell } from './types'

interface PathNode {
  position: Position
  g: number
  h: number
  f: number
  parent: PathNode | null
}

function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function positionEquals(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}

function isValidPosition(
  pos: Position,
  warehouse: WarehouseCell[][],
  excludeRobotId?: string
): boolean {
  if (pos.y < 0 || pos.y >= warehouse.length) return false
  if (pos.x < 0 || pos.x >= warehouse[0].length) return false
  
  const cell = warehouse[pos.y][pos.x]
  
  if (cell.type === 'obstacle') return false
  
  if (cell.occupied && cell.robotId !== excludeRobotId) return false
  
  return true
}

function getNeighbors(
  pos: Position,
  warehouse: WarehouseCell[][],
  excludeRobotId?: string
): Position[] {
  const neighbors: Position[] = []
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ]
  
  for (const dir of directions) {
    const newPos = { x: pos.x + dir.x, y: pos.y + dir.y }
    if (isValidPosition(newPos, warehouse, excludeRobotId)) {
      neighbors.push(newPos)
    }
  }
  
  return neighbors
}

function reconstructPath(node: PathNode): Position[] {
  const path: Position[] = []
  let current: PathNode | null = node
  
  while (current !== null) {
    path.unshift(current.position)
    current = current.parent
  }
  
  return path
}

export function findPath(
  start: Position,
  goal: Position,
  warehouse: WarehouseCell[][],
  excludeRobotId?: string
): Position[] {
  if (positionEquals(start, goal)) {
    return [start]
  }
  
  if (!isValidPosition(goal, warehouse, excludeRobotId)) {
    return []
  }
  
  const openSet: PathNode[] = []
  const closedSet = new Set<string>()
  
  const startNode: PathNode = {
    position: start,
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null
  }
  
  openSet.push(startNode)
  
  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f)
    const current = openSet.shift()!
    
    if (positionEquals(current.position, goal)) {
      return reconstructPath(current)
    }
    
    const posKey = `${current.position.x},${current.position.y}`
    closedSet.add(posKey)
    
    const neighbors = getNeighbors(current.position, warehouse, excludeRobotId)
    
    for (const neighborPos of neighbors) {
      const neighborKey = `${neighborPos.x},${neighborPos.y}`
      
      if (closedSet.has(neighborKey)) continue
      
      const gScore = current.g + 1
      const hScore = heuristic(neighborPos, goal)
      const fScore = gScore + hScore
      
      const existingNode = openSet.find(n =>
        positionEquals(n.position, neighborPos)
      )
      
      if (existingNode) {
        if (gScore < existingNode.g) {
          existingNode.g = gScore
          existingNode.f = fScore
          existingNode.parent = current
        }
      } else {
        const newNode: PathNode = {
          position: neighborPos,
          g: gScore,
          h: hScore,
          f: fScore,
          parent: current
        }
        openSet.push(newNode)
      }
    }
  }
  
  return []
}

export function calculateDistance(a: Position, b: Position): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}

export function findNearestRobot(
  position: Position,
  robots: Array<{ id: string; position: Position; status: string }>
): string | null {
  const availableRobots = robots.filter(r => r.status === 'idle')
  
  if (availableRobots.length === 0) return null
  
  let nearest = availableRobots[0]
  let minDistance = calculateDistance(position, nearest.position)
  
  for (let i = 1; i < availableRobots.length; i++) {
    const dist = calculateDistance(position, availableRobots[i].position)
    if (dist < minDistance) {
      minDistance = dist
      nearest = availableRobots[i]
    }
  }
  
  return nearest.id
}
