import type { Robot, Position } from './types'

export interface EnergyProfile {
  robotId: string
  currentBattery: number
  batteryCapacity: number
  consumptionRate: number
  chargingRate: number
  estimatedRuntime: number
  efficiencyScore: number
}

export interface ChargingStation {
  id: string
  position: Position
  capacity: number
  currentLoad: number
  queue: string[]
  powerOutput: number
}

export interface EnergyOptimizationPlan {
  robotId: string
  action: 'continue' | 'charge_now' | 'charge_soon' | 'optimize_route'
  priority: number
  estimatedSavings: number
  reasoning: string
}

export class EnergyOptimizer {
  private chargingStations: Map<string, ChargingStation> = new Map()
  private energyHistory: Map<string, number[]> = new Map()
  private consumptionPatterns: Map<string, { avg: number; peak: number }> = new Map()

  constructor(stationPositions: Position[] = []) {
    stationPositions.forEach((pos, idx) => {
      this.chargingStations.set(`charging-${idx}`, {
        id: `charging-${idx}`,
        position: pos,
        capacity: 4,
        currentLoad: 0,
        queue: [],
        powerOutput: 20
      })
    })

    if (stationPositions.length === 0) {
      this.chargingStations.set('charging-0', {
        id: 'charging-0',
        position: { x: 1, y: 1 },
        capacity: 4,
        currentLoad: 0,
        queue: [],
        powerOutput: 20
      })
    }
  }

  analyzeEnergyProfile(robot: Robot): EnergyProfile {
    const history = this.energyHistory.get(robot.id) || []
    
    let consumptionRate = 0.5
    if (history.length >= 2) {
      const recentConsumption = history.slice(-10)
      const avgDelta = recentConsumption.reduce((sum, val, idx) => {
        if (idx === 0) return 0
        return sum + Math.abs(recentConsumption[idx - 1] - val)
      }, 0) / Math.max(1, recentConsumption.length - 1)
      consumptionRate = avgDelta * 10
    }

    const pattern = this.consumptionPatterns.get(robot.id)
    if (pattern) {
      consumptionRate = pattern.avg
    }

    const estimatedRuntime = robot.battery / Math.max(0.1, consumptionRate)

    let efficiencyScore = 100
    if (robot.status === 'idle' && robot.battery > 80) {
      efficiencyScore = 70
    } else if (robot.status === 'moving' && robot.battery < 30) {
      efficiencyScore = 60
    } else if (robot.status === 'moving' && robot.battery > 50) {
      efficiencyScore = 95
    }

    return {
      robotId: robot.id,
      currentBattery: robot.battery,
      batteryCapacity: 100,
      consumptionRate,
      chargingRate: 15,
      estimatedRuntime,
      efficiencyScore
    }
  }

  optimizeChargingSchedule(robots: Robot[]): EnergyOptimizationPlan[] {
    const plans: EnergyOptimizationPlan[] = []

    robots.forEach(robot => {
      const profile = this.analyzeEnergyProfile(robot)
      let action: EnergyOptimizationPlan['action'] = 'continue'
      let priority = 0
      let estimatedSavings = 0
      let reasoning = 'Battery level adequate'

      if (robot.battery < 15) {
        action = 'charge_now'
        priority = 100
        estimatedSavings = 0
        reasoning = 'Critical battery level - immediate charging required'
      } else if (robot.battery < 30 && robot.status !== 'charging') {
        action = 'charge_soon'
        priority = 70
        estimatedSavings = 5
        reasoning = 'Low battery - schedule charging to avoid emergency situation'
      } else if (robot.battery < 50 && robot.status === 'idle') {
        action = 'charge_now'
        priority = 40
        estimatedSavings = 10
        reasoning = 'Robot idle with medium battery - opportunistic charging'
      } else if (robot.status === 'moving' && robot.battery > 80 && robot.speed > 1.5) {
        action = 'optimize_route'
        priority = 20
        estimatedSavings = 15
        reasoning = 'High speed with good battery - optimize for energy efficiency'
      }

      plans.push({
        robotId: robot.id,
        action,
        priority,
        estimatedSavings,
        reasoning
      })
    })

    return plans.sort((a, b) => b.priority - a.priority)
  }

  findOptimalChargingStation(robot: Robot): ChargingStation | null {
    let bestStation: ChargingStation | null = null
    let bestScore = -Infinity

    this.chargingStations.forEach(station => {
      if (station.currentLoad >= station.capacity) return

      const dx = station.position.x - robot.position.x
      const dy = station.position.y - robot.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      const loadFactor = 1 - (station.currentLoad / station.capacity)
      const distancePenalty = distance * 2
      const queuePenalty = station.queue.length * 5

      const score = loadFactor * 100 - distancePenalty - queuePenalty

      if (score > bestScore) {
        bestScore = score
        bestStation = station
      }
    })

    return bestStation
  }

  assignToChargingStation(robotId: string, stationId: string): boolean {
    const station = this.chargingStations.get(stationId)
    if (!station) return false

    if (station.currentLoad >= station.capacity) {
      if (!station.queue.includes(robotId)) {
        station.queue.push(robotId)
      }
      return false
    }

    station.currentLoad++
    return true
  }

  releaseFromChargingStation(robotId: string, stationId: string): void {
    const station = this.chargingStations.get(stationId)
    if (!station) return

    station.currentLoad = Math.max(0, station.currentLoad - 1)

    if (station.queue.length > 0 && station.currentLoad < station.capacity) {
      const nextRobot = station.queue.shift()
      if (nextRobot) {
        station.currentLoad++
      }
    }
  }

  predictEnergyNeeds(robots: Robot[], forecastMinutes: number): {
    totalEnergyNeeded: number
    robotsNeedingCharge: number
    chargingBottlenecks: string[]
    recommendations: string[]
  } {
    let totalEnergyNeeded = 0
    let robotsNeedingCharge = 0
    const chargingBottlenecks: string[] = []
    const recommendations: string[] = []

    robots.forEach(robot => {
      const profile = this.analyzeEnergyProfile(robot)
      const energyNeeded = Math.max(0, 100 - robot.battery)
      
      if (profile.estimatedRuntime < forecastMinutes) {
        totalEnergyNeeded += energyNeeded
        robotsNeedingCharge++
      }
    })

    const totalChargingCapacity = Array.from(this.chargingStations.values()).reduce(
      (sum, station) => sum + station.capacity,
      0
    )

    if (robotsNeedingCharge > totalChargingCapacity) {
      chargingBottlenecks.push(`Insufficient charging capacity: ${robotsNeedingCharge} robots need charging, only ${totalChargingCapacity} stations available`)
      recommendations.push('Add more charging stations')
    }

    const avgBattery = robots.reduce((sum, r) => sum + r.battery, 0) / robots.length
    if (avgBattery < 50) {
      chargingBottlenecks.push('Fleet-wide low battery levels detected')
      recommendations.push('Implement staggered charging schedule')
    }

    const activeStations = Array.from(this.chargingStations.values()).filter(s => s.currentLoad > 0).length
    if (activeStations === 0 && robotsNeedingCharge > 0) {
      chargingBottlenecks.push('No robots currently charging despite demand')
      recommendations.push('Review charging logic and robot behavior')
    }

    if (chargingBottlenecks.length === 0) {
      recommendations.push('Energy management is optimal')
    }

    return {
      totalEnergyNeeded,
      robotsNeedingCharge,
      chargingBottlenecks,
      recommendations
    }
  }

  updateEnergyHistory(robot: Robot): void {
    if (!this.energyHistory.has(robot.id)) {
      this.energyHistory.set(robot.id, [])
    }

    const history = this.energyHistory.get(robot.id)!
    history.push(robot.battery)

    if (history.length > 100) {
      history.shift()
    }

    if (history.length >= 10) {
      const recentValues = history.slice(-20)
      const avgConsumption = recentValues.reduce((sum, val, idx) => {
        if (idx === 0) return 0
        return sum + Math.max(0, recentValues[idx - 1] - val)
      }, 0) / Math.max(1, recentValues.length - 1)

      const peakConsumption = Math.max(...recentValues.map((val, idx) => {
        if (idx === 0) return 0
        return Math.max(0, recentValues[idx - 1] - val)
      }))

      this.consumptionPatterns.set(robot.id, {
        avg: avgConsumption,
        peak: peakConsumption
      })
    }
  }

  calculateFleetEnergyEfficiency(robots: Robot[]): {
    overallEfficiency: number
    averageBattery: number
    energyWaste: number
    utilizationScore: number
  } {
    const avgBattery = robots.reduce((sum, r) => sum + r.battery, 0) / robots.length
    
    const activeRobots = robots.filter(r => r.status === 'moving').length
    const utilizationScore = (activeRobots / robots.length) * 100

    const idleWithHighBattery = robots.filter(r => r.status === 'idle' && r.battery > 80).length
    const energyWaste = (idleWithHighBattery / robots.length) * 100

    const profiles = robots.map(r => this.analyzeEnergyProfile(r))
    const avgEfficiency = profiles.reduce((sum, p) => sum + p.efficiencyScore, 0) / profiles.length

    const overallEfficiency = (avgEfficiency * 0.4) + (utilizationScore * 0.3) + ((100 - energyWaste) * 0.3)

    return {
      overallEfficiency,
      averageBattery: avgBattery,
      energyWaste,
      utilizationScore
    }
  }

  getChargingStationStatus(): Array<ChargingStation & { utilizationPercent: number }> {
    return Array.from(this.chargingStations.values()).map(station => ({
      ...station,
      utilizationPercent: (station.currentLoad / station.capacity) * 100
    }))
  }

  reset(): void {
    this.chargingStations.forEach(station => {
      station.currentLoad = 0
      station.queue = []
    })
    this.energyHistory.clear()
    this.consumptionPatterns.clear()
  }
}
