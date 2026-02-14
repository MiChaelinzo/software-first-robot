import type { Robot, Task, PerformanceMetrics, Position } from './types'

export interface TwinSnapshot {
  timestamp: number
  robots: Robot[]
  tasks: Task[]
  metrics: PerformanceMetrics
}

export interface SimulationScenario {
  id: string
  name: string
  description: string
  duration: number
  modifications: {
    robotCount?: number
    taskRate?: number
    speedMultiplier?: number
  }
  results?: {
    efficiency: number
    throughput: number
    reliability: number
  }
}

export interface WhatIfAnalysis {
  scenario: string
  baselineMetrics: PerformanceMetrics
  projectedMetrics: PerformanceMetrics
  deltaPercentages: {
    efficiency: number
    throughput: number
    reliability: number
  }
  confidence: number
  timeToImplement: number
}

export class DigitalTwinEngine {
  private snapshots: TwinSnapshot[] = []
  private maxSnapshots = 100
  private scenarios: Map<string, SimulationScenario> = new Map()

  captureSnapshot(robots: Robot[], tasks: Task[], metrics: PerformanceMetrics): void {
    this.snapshots.push({
      timestamp: Date.now(),
      robots: JSON.parse(JSON.stringify(robots)),
      tasks: JSON.parse(JSON.stringify(tasks)),
      metrics: { ...metrics }
    })

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift()
    }
  }

  getSnapshot(timestamp: number): TwinSnapshot | null {
    return this.snapshots.find(s => Math.abs(s.timestamp - timestamp) < 1000) || null
  }

  getRecentSnapshots(count: number): TwinSnapshot[] {
    return this.snapshots.slice(-count)
  }

  compareSnapshots(timestamp1: number, timestamp2: number): {
    timeDelta: number
    tasksCompletedDelta: number
    efficiencyChange: number
    utilizationChange: number
  } | null {
    const snap1 = this.getSnapshot(timestamp1)
    const snap2 = this.getSnapshot(timestamp2)

    if (!snap1 || !snap2) return null

    return {
      timeDelta: snap2.timestamp - snap1.timestamp,
      tasksCompletedDelta: snap2.metrics.tasksCompleted - snap1.metrics.tasksCompleted,
      efficiencyChange: ((snap2.metrics.efficiencyGain - snap1.metrics.efficiencyGain) / (snap1.metrics.efficiencyGain || 1)) * 100,
      utilizationChange: snap2.metrics.robotUtilization - snap1.metrics.robotUtilization
    }
  }

  simulateWhatIf(
    scenario: string,
    currentMetrics: PerformanceMetrics,
    modifications: {
      addRobots?: number
      removeRobots?: number
      increaseSpeed?: number
      addChargingStations?: number
    }
  ): WhatIfAnalysis {
    const projected = { ...currentMetrics }
    let efficiencyDelta = 0
    let throughputDelta = 0
    let reliabilityDelta = 0
    let confidence = 0.8

    if (modifications.addRobots) {
      const currentUtil = currentMetrics.robotUtilization
      if (currentUtil > 80) {
        throughputDelta += modifications.addRobots * 15
        efficiencyDelta += modifications.addRobots * 8
        reliabilityDelta += 5
      } else {
        efficiencyDelta -= modifications.addRobots * 5
        throughputDelta += modifications.addRobots * 5
      }
      projected.robotUtilization = currentUtil * (1 / (1 + modifications.addRobots * 0.1))
    }

    if (modifications.removeRobots) {
      const currentUtil = currentMetrics.robotUtilization
      if (currentUtil < 60) {
        efficiencyDelta += modifications.removeRobots * 10
        throughputDelta -= modifications.removeRobots * 8
      } else {
        efficiencyDelta -= modifications.removeRobots * 15
        throughputDelta -= modifications.removeRobots * 20
        reliabilityDelta -= 10
      }
      projected.robotUtilization = Math.min(100, currentUtil * (1 + modifications.removeRobots * 0.15))
    }

    if (modifications.increaseSpeed) {
      const speedFactor = modifications.increaseSpeed
      throughputDelta += speedFactor * 20
      efficiencyDelta += speedFactor * 10
      projected.averageCompletionTime *= (1 - speedFactor * 0.15)
      projected.avgCongestionLevel *= (1 + speedFactor * 0.3)
      
      if (speedFactor > 2) {
        reliabilityDelta -= 15
        confidence *= 0.9
      }
    }

    if (modifications.addChargingStations) {
      reliabilityDelta += modifications.addChargingStations * 8
      efficiencyDelta += modifications.addChargingStations * 5
      throughputDelta += modifications.addChargingStations * 3
    }

    projected.efficiencyGain += efficiencyDelta
    projected.tasksCompleted = Math.floor(projected.tasksCompleted * (1 + throughputDelta / 100))

    return {
      scenario,
      baselineMetrics: currentMetrics,
      projectedMetrics: projected,
      deltaPercentages: {
        efficiency: efficiencyDelta,
        throughput: throughputDelta,
        reliability: reliabilityDelta
      },
      confidence: Math.max(0.6, Math.min(0.95, confidence)),
      timeToImplement: Object.keys(modifications).length * 5
    }
  }

  createScenario(
    name: string,
    description: string,
    modifications: SimulationScenario['modifications']
  ): SimulationScenario {
    const scenario: SimulationScenario = {
      id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      duration: 60,
      modifications
    }

    this.scenarios.set(scenario.id, scenario)
    return scenario
  }

  getPredefinedScenarios(): SimulationScenario[] {
    return [
      {
        id: 'peak-hours',
        name: 'Peak Hours Simulation',
        description: 'Simulate 3x task load during peak operational hours',
        duration: 120,
        modifications: {
          taskRate: 3.0,
          speedMultiplier: 1.2
        }
      },
      {
        id: 'robot-failure',
        name: 'Robot Failure Scenario',
        description: 'Test resilience with 30% robot fleet unavailable',
        duration: 90,
        modifications: {
          robotCount: -3
        }
      },
      {
        id: 'efficiency-max',
        name: 'Maximum Efficiency',
        description: 'Optimize for maximum task throughput',
        duration: 180,
        modifications: {
          robotCount: 15,
          speedMultiplier: 1.5,
          taskRate: 2.0
        }
      },
      {
        id: 'energy-saving',
        name: 'Energy Saving Mode',
        description: 'Reduce speed and robot count for energy conservation',
        duration: 120,
        modifications: {
          robotCount: 6,
          speedMultiplier: 0.7
        }
      },
      {
        id: 'stress-test',
        name: 'System Stress Test',
        description: 'Push system to limits with maximum load',
        duration: 60,
        modifications: {
          taskRate: 5.0,
          speedMultiplier: 2.0
        }
      }
    ]
  }

  analyzeSystemBottlenecks(
    robots: Robot[],
    tasks: Task[],
    metrics: PerformanceMetrics
  ): Array<{ bottleneck: string; severity: 'low' | 'medium' | 'high' | 'critical'; impact: string }> {
    const bottlenecks: Array<{ bottleneck: string; severity: 'low' | 'medium' | 'high' | 'critical'; impact: string }> = []

    const idleRobots = robots.filter(r => r.status === 'idle').length
    const idlePercentage = (idleRobots / robots.length) * 100

    if (idlePercentage > 50) {
      bottlenecks.push({
        bottleneck: 'Excessive Idle Capacity',
        severity: 'high',
        impact: `${idlePercentage.toFixed(0)}% of fleet underutilized - consider reducing fleet size`
      })
    }

    const chargingRobots = robots.filter(r => r.status === 'charging').length
    if (chargingRobots > robots.length * 0.4) {
      bottlenecks.push({
        bottleneck: 'Charging Queue Congestion',
        severity: 'critical',
        impact: `${chargingRobots} robots charging simultaneously - add charging stations`
      })
    }

    if (metrics.avgCongestionLevel > 7) {
      bottlenecks.push({
        bottleneck: 'Traffic Congestion',
        severity: 'high',
        impact: 'High congestion causing delays - optimize routing algorithms'
      })
    }

    const lowBatteryRobots = robots.filter(r => r.battery < 25).length
    if (lowBatteryRobots > robots.length * 0.3) {
      bottlenecks.push({
        bottleneck: 'Battery Management',
        severity: 'medium',
        impact: `${lowBatteryRobots} robots with low battery - improve charging schedule`
      })
    }

    if (metrics.averageCompletionTime > 60) {
      bottlenecks.push({
        bottleneck: 'Long Task Duration',
        severity: 'medium',
        impact: `Average ${metrics.averageCompletionTime.toFixed(0)}s per task - optimize pathfinding`
      })
    }

    const pendingTasks = tasks.filter(t => t.status === 'pending').length
    if (pendingTasks > 10) {
      bottlenecks.push({
        bottleneck: 'Task Queue Backlog',
        severity: 'high',
        impact: `${pendingTasks} pending tasks - increase fleet or task assignment rate`
      })
    }

    if (bottlenecks.length === 0) {
      bottlenecks.push({
        bottleneck: 'No Bottlenecks',
        severity: 'low',
        impact: 'System operating efficiently'
      })
    }

    return bottlenecks
  }

  generateOptimizationPath(
    currentMetrics: PerformanceMetrics,
    targetEfficiency: number
  ): Array<{
    step: number
    action: string
    expectedResult: string
    estimatedTime: number
  }> {
    const steps: Array<{
      step: number
      action: string
      expectedResult: string
      estimatedTime: number
    }> = []

    const efficiencyGap = targetEfficiency - currentMetrics.efficiencyGain
    
    if (efficiencyGap <= 0) {
      return [{
        step: 1,
        action: 'Target already achieved',
        expectedResult: 'Maintain current performance',
        estimatedTime: 0
      }]
    }

    let stepNum = 1

    if (currentMetrics.avgCongestionLevel > 5) {
      steps.push({
        step: stepNum++,
        action: 'Implement advanced traffic routing',
        expectedResult: 'Reduce congestion by 40%',
        estimatedTime: 15
      })
    }

    if (currentMetrics.robotUtilization < 70) {
      steps.push({
        step: stepNum++,
        action: 'Optimize task assignment algorithm',
        expectedResult: `Increase utilization to ${Math.min(85, currentMetrics.robotUtilization + 20)}%`,
        estimatedTime: 20
      })
    }

    if (currentMetrics.averageCompletionTime > 40) {
      steps.push({
        step: stepNum++,
        action: 'Enhance pathfinding with A* improvements',
        expectedResult: 'Reduce completion time by 25%',
        estimatedTime: 10
      })
    }

    steps.push({
      step: stepNum++,
      action: 'Deploy machine learning optimization',
      expectedResult: `Achieve ${targetEfficiency}% efficiency target`,
      estimatedTime: 30
    })

    return steps
  }

  reset(): void {
    this.snapshots = []
    this.scenarios.clear()
  }

  exportTwin(): string {
    return JSON.stringify({
      snapshots: this.snapshots,
      scenarios: Array.from(this.scenarios.values()),
      exportedAt: Date.now()
    })
  }

  importTwin(data: string): void {
    try {
      const parsed = JSON.parse(data)
      this.snapshots = parsed.snapshots || []
      this.scenarios = new Map((parsed.scenarios || []).map((s: SimulationScenario) => [s.id, s]))
    } catch (error) {
      console.error('Failed to import twin data:', error)
    }
  }
}
