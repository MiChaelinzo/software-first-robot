import type { Position, Robot } from './types'

export interface TrailPoint {
  x: number
  y: number
  speed: number
  robotId: string
  color: string
  timestamp: number
}

export interface HeatMapCell {
  x: number
  y: number
  frequency: number
  avgSpeed: number
  lastVisited: number
}

export class HeatTrailSystem {
  private trails: Map<string, TrailPoint[]> = new Map()
  private heatMap: Map<string, HeatMapCell> = new Map()
  private maxTrailLength: number
  private decayTime: number
  private cellSize: number

  constructor(maxTrailLength = 50, decayTimeMs = 5000, cellSize = 1) {
    this.maxTrailLength = maxTrailLength
    this.decayTime = decayTimeMs
    this.cellSize = cellSize
  }

  recordPosition(robot: Robot): void {
    const now = Date.now()
    const point: TrailPoint = {
      x: robot.position.x,
      y: robot.position.y,
      speed: robot.speed,
      robotId: robot.id,
      color: robot.color,
      timestamp: now
    }

    if (!this.trails.has(robot.id)) {
      this.trails.set(robot.id, [])
    }

    const robotTrail = this.trails.get(robot.id)!
    robotTrail.push(point)

    if (robotTrail.length > this.maxTrailLength) {
      robotTrail.shift()
    }

    this.updateHeatMap(point)
  }

  private updateHeatMap(point: TrailPoint): void {
    const gridX = Math.round(point.x / this.cellSize)
    const gridY = Math.round(point.y / this.cellSize)
    const key = `${gridX},${gridY}`

    const existing = this.heatMap.get(key)
    if (existing) {
      const totalSpeed = existing.avgSpeed * existing.frequency + point.speed
      existing.frequency += 1
      existing.avgSpeed = totalSpeed / existing.frequency
      existing.lastVisited = point.timestamp
    } else {
      this.heatMap.set(key, {
        x: gridX,
        y: gridY,
        frequency: 1,
        avgSpeed: point.speed,
        lastVisited: point.timestamp
      })
    }
  }

  getTrails(includeDecay = true): Map<string, TrailPoint[]> {
    if (!includeDecay) {
      return this.trails
    }

    const now = Date.now()
    const decayedTrails = new Map<string, TrailPoint[]>()

    this.trails.forEach((trail, robotId) => {
      const validPoints = trail.filter(point => 
        now - point.timestamp < this.decayTime
      )
      if (validPoints.length > 0) {
        decayedTrails.set(robotId, validPoints)
      }
    })

    return decayedTrails
  }

  getTrailForRobot(robotId: string): TrailPoint[] {
    return this.trails.get(robotId) || []
  }

  getHeatMap(): HeatMapCell[] {
    const now = Date.now()
    return Array.from(this.heatMap.values()).filter(
      cell => now - cell.lastVisited < this.decayTime * 2
    )
  }

  getHeatMapNormalized(): Map<string, { intensity: number; speed: number }> {
    const cells = this.getHeatMap()
    if (cells.length === 0) return new Map()

    const maxFrequency = Math.max(...cells.map(c => c.frequency))
    const maxSpeed = Math.max(...cells.map(c => c.avgSpeed))

    const normalized = new Map<string, { intensity: number; speed: number }>()
    cells.forEach(cell => {
      const key = `${cell.x},${cell.y}`
      normalized.set(key, {
        intensity: cell.frequency / maxFrequency,
        speed: maxSpeed > 0 ? cell.avgSpeed / maxSpeed : 0
      })
    })

    return normalized
  }

  getOpacity(point: TrailPoint): number {
    const now = Date.now()
    const age = now - point.timestamp
    return Math.max(0, 1 - (age / this.decayTime))
  }

  cleanup(): void {
    const now = Date.now()

    this.trails.forEach((trail, robotId) => {
      const validPoints = trail.filter(point => 
        now - point.timestamp < this.decayTime
      )
      if (validPoints.length === 0) {
        this.trails.delete(robotId)
      } else {
        this.trails.set(robotId, validPoints)
      }
    })

    Array.from(this.heatMap.entries()).forEach(([key, cell]) => {
      if (now - cell.lastVisited > this.decayTime * 2) {
        this.heatMap.delete(key)
      }
    })
  }

  reset(): void {
    this.trails.clear()
    this.heatMap.clear()
  }

  getStats() {
    const trails = this.getTrails(true)
    const heatMap = this.getHeatMap()
    
    let totalPoints = 0
    trails.forEach(trail => {
      totalPoints += trail.length
    })

    const avgSpeed = heatMap.length > 0
      ? heatMap.reduce((sum, cell) => sum + cell.avgSpeed, 0) / heatMap.length
      : 0

    const hotspots = heatMap.filter(cell => cell.frequency > 5).length

    return {
      activeTrails: trails.size,
      totalTrailPoints: totalPoints,
      heatMapCells: heatMap.length,
      avgSpeed,
      hotspots
    }
  }
}
