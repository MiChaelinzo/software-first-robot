import type { Robot, Task, PerformanceMetrics } from './types'

export interface PredictionResult {
  predictedCompletionTime: number
  confidence: number
  riskFactors: string[]
  optimizationSuggestions: string[]
}

export interface MaintenancePrediction {
  robotId: string
  predictedFailureTime: number
  maintenanceUrgency: 'low' | 'medium' | 'high' | 'critical'
  estimatedDowntime: number
  recommendedActions: string[]
  reliability: number
}

export interface TrafficPrediction {
  timestamp: number
  expectedCongestion: number
  hotspots: Array<{ x: number; y: number; severity: number }>
  recommendedRoutes: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>
}

export class MLPredictionEngine {
  private historicalData: Array<{
    timestamp: number
    robots: number
    tasks: number
    completionTime: number
    congestionLevel: number
  }> = []
  
  private maintenanceHistory: Map<string, Array<{
    timestamp: number
    battery: number
    distance: number
    collisions: number
  }>> = new Map()
  
  private trafficPatterns: Map<string, number> = new Map()

  recordSimulationState(
    robots: Robot[],
    tasks: Task[],
    metrics: PerformanceMetrics
  ): void {
    this.historicalData.push({
      timestamp: Date.now(),
      robots: robots.length,
      tasks: tasks.length,
      completionTime: metrics.averageCompletionTime,
      congestionLevel: metrics.avgCongestionLevel
    })

    if (this.historicalData.length > 1000) {
      this.historicalData.shift()
    }

    robots.forEach(robot => {
      if (!this.maintenanceHistory.has(robot.id)) {
        this.maintenanceHistory.set(robot.id, [])
      }
      
      const history = this.maintenanceHistory.get(robot.id)!
      history.push({
        timestamp: Date.now(),
        battery: robot.battery,
        distance: 0,
        collisions: 0
      })

      if (history.length > 500) {
        history.shift()
      }
    })
  }

  predictTaskCompletion(task: Task, robots: Robot[]): PredictionResult {
    if (this.historicalData.length < 10) {
      return {
        predictedCompletionTime: 30,
        confidence: 0.5,
        riskFactors: ['Insufficient historical data'],
        optimizationSuggestions: ['Collect more simulation data for better predictions']
      }
    }

    const recentData = this.historicalData.slice(-50)
    const avgCompletionTime = recentData.reduce((sum, d) => sum + d.completionTime, 0) / recentData.length
    const avgCongestion = recentData.reduce((sum, d) => sum + d.congestionLevel, 0) / recentData.length

    const availableRobots = robots.filter(r => r.status === 'idle' || r.status === 'moving')
    const robotCount = availableRobots.length

    let predictedTime = avgCompletionTime
    let confidence = 0.7

    const riskFactors: string[] = []
    const suggestions: string[] = []

    if (task.priority === 'critical') {
      predictedTime *= 0.8
      riskFactors.push('Critical priority task - expedited processing')
    }

    if (robotCount < 3) {
      predictedTime *= 1.5
      confidence *= 0.8
      riskFactors.push('Low robot availability')
      suggestions.push('Add more robots to the fleet')
    }

    if (avgCongestion > 5) {
      predictedTime *= 1.3
      riskFactors.push('High congestion levels detected')
      suggestions.push('Optimize traffic flow patterns')
    }

    const lowBatteryRobots = robots.filter(r => r.battery < 30).length
    if (lowBatteryRobots > robots.length * 0.3) {
      predictedTime *= 1.2
      riskFactors.push('Multiple robots need charging')
      suggestions.push('Schedule charging cycles more efficiently')
    }

    if (riskFactors.length === 0) {
      riskFactors.push('No significant risks detected')
      confidence = Math.min(0.95, confidence + 0.1)
    }

    if (suggestions.length === 0) {
      suggestions.push('System operating optimally')
    }

    return {
      predictedCompletionTime: Math.max(5, predictedTime),
      confidence: Math.max(0.5, Math.min(0.99, confidence)),
      riskFactors,
      optimizationSuggestions: suggestions
    }
  }

  predictMaintenance(robot: Robot): MaintenancePrediction {
    const history = this.maintenanceHistory.get(robot.id) || []
    
    if (history.length < 10) {
      return {
        robotId: robot.id,
        predictedFailureTime: Date.now() + 3600000,
        maintenanceUrgency: 'low',
        estimatedDowntime: 5,
        recommendedActions: ['Continue monitoring - insufficient data'],
        reliability: 0.95
      }
    }

    const recentHistory = history.slice(-50)
    const avgBattery = recentHistory.reduce((sum, h) => sum + h.battery, 0) / recentHistory.length
    const batteryTrend = (recentHistory[recentHistory.length - 1].battery - recentHistory[0].battery) / recentHistory.length

    let urgency: MaintenancePrediction['maintenanceUrgency'] = 'low'
    let reliability = 0.95
    const actions: string[] = []
    let estimatedDowntime = 5

    if (robot.battery < 20) {
      urgency = 'critical'
      reliability = 0.6
      actions.push('Immediate charging required')
      estimatedDowntime = 15
    } else if (robot.battery < 40) {
      urgency = 'high'
      reliability = 0.75
      actions.push('Schedule charging soon')
      estimatedDowntime = 10
    } else if (avgBattery < 60 || batteryTrend < -0.5) {
      urgency = 'medium'
      reliability = 0.85
      actions.push('Monitor battery degradation')
      estimatedDowntime = 5
    }

    if (robot.status === 'error') {
      urgency = 'critical'
      reliability = 0.4
      actions.push('System diagnostics required', 'Check error logs')
      estimatedDowntime = 30
    }

    if (actions.length === 0) {
      actions.push('No maintenance required')
      reliability = 0.98
    }

    const timeToFailure = robot.battery < 20 ? 300000 : robot.battery < 50 ? 900000 : 3600000

    return {
      robotId: robot.id,
      predictedFailureTime: Date.now() + timeToFailure,
      maintenanceUrgency: urgency,
      estimatedDowntime,
      recommendedActions: actions,
      reliability
    }
  }

  predictTraffic(currentTime: number): TrafficPrediction {
    const hotspots: Array<{ x: number; y: number; severity: number }> = []
    const routes: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }> = []

    this.trafficPatterns.forEach((count, key) => {
      const [x, y] = key.split(',').map(Number)
      if (count > 10) {
        hotspots.push({ x, y, severity: Math.min(count / 20, 1) })
      }
    })

    hotspots.sort((a, b) => b.severity - a.severity)

    if (hotspots.length >= 2) {
      routes.push({
        from: { x: 2, y: 2 },
        to: { x: 15, y: 11 }
      })
    }

    const recentData = this.historicalData.slice(-20)
    const avgCongestion = recentData.length > 0
      ? recentData.reduce((sum, d) => sum + d.congestionLevel, 0) / recentData.length
      : 0

    return {
      timestamp: currentTime,
      expectedCongestion: avgCongestion,
      hotspots: hotspots.slice(0, 10),
      recommendedRoutes: routes
    }
  }

  recordTrafficAt(x: number, y: number): void {
    const key = `${Math.floor(x)},${Math.floor(y)}`
    this.trafficPatterns.set(key, (this.trafficPatterns.get(key) || 0) + 1)
  }

  getSystemHealthScore(robots: Robot[], metrics: PerformanceMetrics): number {
    let score = 100

    const avgBattery = robots.reduce((sum, r) => sum + r.battery, 0) / robots.length
    score -= Math.max(0, 50 - avgBattery) * 0.5

    const utilization = metrics.robotUtilization
    if (utilization < 50) {
      score -= (50 - utilization) * 0.3
    } else if (utilization > 95) {
      score -= (utilization - 95) * 0.5
    }

    if (metrics.avgCongestionLevel > 5) {
      score -= (metrics.avgCongestionLevel - 5) * 2
    }

    const errorRobots = robots.filter(r => r.status === 'error').length
    score -= errorRobots * 10

    return Math.max(0, Math.min(100, score))
  }

  generateOptimizationReport(robots: Robot[], tasks: Task[], metrics: PerformanceMetrics): {
    overallScore: number
    bottlenecks: string[]
    recommendations: Array<{ priority: string; action: string; expectedImpact: string }>
    predictedImprovements: { efficiency: number; throughput: number; reliability: number }
  } {
    const bottlenecks: string[] = []
    const recommendations: Array<{ priority: string; action: string; expectedImpact: string }> = []

    const healthScore = this.getSystemHealthScore(robots, metrics)
    const idleRobots = robots.filter(r => r.status === 'idle').length
    const pendingTasks = tasks.filter(t => t.status === 'pending').length

    if (idleRobots > robots.length * 0.4 && pendingTasks > 5) {
      bottlenecks.push('Task assignment latency')
      recommendations.push({
        priority: 'high',
        action: 'Optimize task assignment algorithm',
        expectedImpact: '+15% throughput'
      })
    }

    if (metrics.avgCongestionLevel > 6) {
      bottlenecks.push('High traffic congestion')
      recommendations.push({
        priority: 'high',
        action: 'Implement dynamic routing with congestion avoidance',
        expectedImpact: '+20% efficiency'
      })
    }

    const lowBatteryCount = robots.filter(r => r.battery < 30).length
    if (lowBatteryCount > robots.length * 0.3) {
      bottlenecks.push('Insufficient charging capacity')
      recommendations.push({
        priority: 'medium',
        action: 'Add charging stations or optimize charging schedule',
        expectedImpact: '+10% availability'
      })
    }

    if (metrics.robotUtilization < 60) {
      bottlenecks.push('Low robot utilization')
      recommendations.push({
        priority: 'medium',
        action: 'Increase task generation rate or reduce fleet size',
        expectedImpact: '+25% cost efficiency'
      })
    }

    if (bottlenecks.length === 0) {
      bottlenecks.push('No significant bottlenecks detected')
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        action: 'System operating within optimal parameters',
        expectedImpact: 'Maintain current configuration'
      })
    }

    return {
      overallScore: healthScore,
      bottlenecks,
      recommendations,
      predictedImprovements: {
        efficiency: recommendations.length > 0 ? 15 + Math.random() * 10 : 5,
        throughput: recommendations.length > 0 ? 20 + Math.random() * 15 : 3,
        reliability: healthScore > 80 ? 5 + Math.random() * 5 : 10 + Math.random() * 10
      }
    }
  }

  reset(): void {
    this.historicalData = []
    this.maintenanceHistory.clear()
    this.trafficPatterns.clear()
  }
}
