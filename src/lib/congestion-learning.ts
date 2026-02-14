import type { Robot, Position, WarehouseCell } from './types'
import { calculateDistance } from './pathfinding'

export interface CongestionZone {
  x: number
  y: number
  width: number
  height: number
  congestionLevel: number
  robotCount: number
  historicalTraffic: number[]
  avgSpeed: number
  collisionCount: number
}

export interface AdaptiveLearningMetrics {
  totalCongestionEvents: number
  speedAdjustments: number
  avgCongestionLevel: number
  highTrafficZones: number
  learningRate: number
  efficiencyGain: number
}

export class CongestionLearningSystem {
  private zones: Map<string, CongestionZone> = new Map()
  private zoneSize: number = 3
  private gridWidth: number
  private gridHeight: number
  private historicalData: Map<string, number[]> = new Map()
  private learningRate: number = 0.1
  private speedAdjustments: number = 0
  private totalCongestionEvents: number = 0
  private baselineEfficiency: number = 0
  private currentEfficiency: number = 0

  constructor(gridWidth: number, gridHeight: number, zoneSize: number = 3) {
    this.gridWidth = gridWidth
    this.gridHeight = gridHeight
    this.zoneSize = zoneSize
    this.initializeZones()
  }

  private initializeZones(): void {
    const zonesX = Math.ceil(this.gridWidth / this.zoneSize)
    const zonesY = Math.ceil(this.gridHeight / this.zoneSize)

    for (let y = 0; y < zonesY; y++) {
      for (let x = 0; x < zonesX; x++) {
        const zoneKey = `${x},${y}`
        this.zones.set(zoneKey, {
          x: x * this.zoneSize,
          y: y * this.zoneSize,
          width: this.zoneSize,
          height: this.zoneSize,
          congestionLevel: 0,
          robotCount: 0,
          historicalTraffic: [],
          avgSpeed: 1.0,
          collisionCount: 0
        })
        this.historicalData.set(zoneKey, [])
      }
    }
  }

  private getZoneKey(position: Position): string {
    const zoneX = Math.floor(position.x / this.zoneSize)
    const zoneY = Math.floor(position.y / this.zoneSize)
    return `${zoneX},${zoneY}`
  }

  public analyzeTrafficPatterns(robots: Robot[]): void {
    this.zones.forEach(zone => {
      zone.robotCount = 0
      zone.congestionLevel = 0
    })

    robots.forEach(robot => {
      if (robot.status === 'moving') {
        const zoneKey = this.getZoneKey(robot.position)
        const zone = this.zones.get(zoneKey)
        
        if (zone) {
          zone.robotCount++
          
          const nearbyRobots = robots.filter(other => 
            other.id !== robot.id && 
            other.status === 'moving' &&
            calculateDistance(robot.position, other.position) < this.zoneSize
          ).length

          const congestion = Math.min(1, (nearbyRobots / 3))
          zone.congestionLevel = Math.max(zone.congestionLevel, congestion)
        }
      }
    })

    this.zones.forEach((zone, key) => {
      const historical = this.historicalData.get(key) || []
      historical.push(zone.congestionLevel)
      
      if (historical.length > 50) {
        historical.shift()
      }
      
      this.historicalData.set(key, historical)

      if (historical.length > 0) {
        const avgTraffic = historical.reduce((a, b) => a + b, 0) / historical.length
        zone.historicalTraffic = historical
        
        zone.avgSpeed = this.calculateOptimalSpeed(avgTraffic, zone.congestionLevel)
      }
    })
  }

  private calculateOptimalSpeed(historicalAvg: number, currentCongestion: number): number {
    const predictedCongestion = (historicalAvg * 0.7) + (currentCongestion * 0.3)
    
    if (predictedCongestion > 0.7) {
      return 0.4
    } else if (predictedCongestion > 0.5) {
      return 0.6
    } else if (predictedCongestion > 0.3) {
      return 0.8
    } else {
      return 1.0
    }
  }

  public getAdaptiveSpeed(robot: Robot, robots: Robot[]): number {
    const zoneKey = this.getZoneKey(robot.position)
    const zone = this.zones.get(zoneKey)
    
    if (!zone) return robot.speed

    let targetSpeed = zone.avgSpeed

    const nearbyRobots = robots.filter(other => 
      other.id !== robot.id && 
      other.status === 'moving' &&
      calculateDistance(robot.position, other.position) < 2
    )

    if (nearbyRobots.length > 0) {
      const avgNearbySpeed = nearbyRobots.reduce((sum, r) => sum + r.speed, 0) / nearbyRobots.length
      targetSpeed = (targetSpeed + avgNearbySpeed) / 2
    }

    const pathAhead = robot.path.slice(0, 5)
    let pathCongestion = 0
    pathAhead.forEach(pos => {
      const pathZoneKey = this.getZoneKey(pos)
      const pathZone = this.zones.get(pathZoneKey)
      if (pathZone) {
        pathCongestion = Math.max(pathCongestion, pathZone.congestionLevel)
      }
    })

    if (pathCongestion > 0.6) {
      targetSpeed = Math.min(targetSpeed, 0.5)
    }

    if (robot.currentTask?.priority === 'critical') {
      targetSpeed = Math.min(1.0, targetSpeed * 1.2)
    } else if (robot.currentTask?.priority === 'low' && zone.congestionLevel > 0.5) {
      targetSpeed = Math.min(targetSpeed, 0.5)
    }

    const speedDiff = targetSpeed - robot.speed
    const adjustedSpeed = robot.speed + (speedDiff * this.learningRate)

    if (Math.abs(speedDiff) > 0.05) {
      this.speedAdjustments++
    }

    if (zone.congestionLevel > 0.5) {
      this.totalCongestionEvents++
    }

    return Math.max(0.2, Math.min(1.2, adjustedSpeed))
  }

  public recordCollision(position: Position): void {
    const zoneKey = this.getZoneKey(position)
    const zone = this.zones.get(zoneKey)
    
    if (zone) {
      zone.collisionCount++
      
      zone.avgSpeed = Math.max(0.3, zone.avgSpeed * 0.85)
      
      this.learningRate = Math.min(0.3, this.learningRate * 1.1)
    }
  }

  public getMetrics(): AdaptiveLearningMetrics {
    const allZones = Array.from(this.zones.values())
    const avgCongestion = allZones.reduce((sum, z) => sum + z.congestionLevel, 0) / allZones.length
    const highTrafficZones = allZones.filter(z => z.congestionLevel > 0.6).length

    if (this.baselineEfficiency === 0 && avgCongestion > 0) {
      this.baselineEfficiency = avgCongestion
    }

    this.currentEfficiency = avgCongestion

    let efficiencyGain = 0
    if (this.baselineEfficiency > 0) {
      efficiencyGain = ((this.baselineEfficiency - this.currentEfficiency) / this.baselineEfficiency) * 100
    }

    return {
      totalCongestionEvents: this.totalCongestionEvents,
      speedAdjustments: this.speedAdjustments,
      avgCongestionLevel: avgCongestion,
      highTrafficZones,
      learningRate: this.learningRate,
      efficiencyGain: Math.max(0, efficiencyGain)
    }
  }

  public getZones(): CongestionZone[] {
    return Array.from(this.zones.values())
  }

  public getZoneAtPosition(position: Position): CongestionZone | undefined {
    const zoneKey = this.getZoneKey(position)
    return this.zones.get(zoneKey)
  }

  public updateLearningRate(successRate: number): void {
    if (successRate > 0.9) {
      this.learningRate = Math.max(0.05, this.learningRate * 0.95)
    } else if (successRate < 0.7) {
      this.learningRate = Math.min(0.3, this.learningRate * 1.1)
    }
  }

  public reset(): void {
    this.zones.clear()
    this.historicalData.clear()
    this.speedAdjustments = 0
    this.totalCongestionEvents = 0
    this.baselineEfficiency = 0
    this.currentEfficiency = 0
    this.learningRate = 0.1
    this.initializeZones()
  }
}
