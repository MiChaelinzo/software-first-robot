import type { Robot, Task, PerformanceMetrics } from './types'

export interface BenchmarkMetric {
  category: string
  ourValue: number
  industryAverage: number
  worldClass: number
  percentile: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface CompetitorProfile {
  name: string
  type: 'amazon' | 'alibaba' | 'walmart' | 'target' | 'custom'
  metrics: {
    throughput: number
    accuracy: number
    efficiency: number
    robotDensity: number
  }
}

export interface BenchmarkReport {
  timestamp: number
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  competitivePosition: 'leader' | 'challenger' | 'follower' | 'emerging'
  metrics: BenchmarkMetric[]
}

export class BenchmarkingEngine {
  private historicalScores: number[] = []
  private competitors: CompetitorProfile[] = []
  private industryStandards: Map<string, number> = new Map()

  constructor() {
    this.initializeCompetitors()
    this.initializeIndustryStandards()
  }

  private initializeCompetitors() {
    this.competitors = [
      {
        name: 'Amazon Robotics',
        type: 'amazon',
        metrics: {
          throughput: 450,
          accuracy: 99.9,
          efficiency: 92,
          robotDensity: 0.85
        }
      },
      {
        name: 'Alibaba Smart Logistics',
        type: 'alibaba',
        metrics: {
          throughput: 420,
          accuracy: 99.7,
          efficiency: 90,
          robotDensity: 0.80
        }
      },
      {
        name: 'Walmart Automation',
        type: 'walmart',
        metrics: {
          throughput: 380,
          accuracy: 99.5,
          efficiency: 88,
          robotDensity: 0.75
        }
      },
      {
        name: 'Target Fulfillment',
        type: 'target',
        metrics: {
          throughput: 350,
          accuracy: 99.3,
          efficiency: 85,
          robotDensity: 0.70
        }
      }
    ]
  }

  private initializeIndustryStandards() {
    this.industryStandards.set('throughput', 300)
    this.industryStandards.set('accuracy', 98.5)
    this.industryStandards.set('efficiency', 80)
    this.industryStandards.set('robotUtilization', 75)
    this.industryStandards.set('taskCompletionRate', 95)
    this.industryStandards.set('collisionAvoidanceRate', 99)
    this.industryStandards.set('energyEfficiency', 70)
  }

  generateBenchmarkReport(
    robots: Robot[],
    tasks: Task[],
    metrics: PerformanceMetrics,
    simulationTime: number
  ): BenchmarkReport {
    const benchmarkMetrics: BenchmarkMetric[] = []

    const throughput = this.calculateThroughput(metrics, simulationTime)
    benchmarkMetrics.push(this.createBenchmarkMetric(
      'Throughput',
      throughput,
      this.industryStandards.get('throughput')!,
      450,
      'tasks/hour'
    ))

    const accuracy = this.calculateAccuracy(metrics)
    benchmarkMetrics.push(this.createBenchmarkMetric(
      'Accuracy',
      accuracy,
      this.industryStandards.get('accuracy')!,
      99.9,
      '%'
    ))

    const efficiency = this.calculateEfficiency(metrics, robots)
    benchmarkMetrics.push(this.createBenchmarkMetric(
      'Efficiency',
      efficiency,
      this.industryStandards.get('efficiency')!,
      92,
      '%'
    ))

    const utilization = metrics.robotUtilization
    benchmarkMetrics.push(this.createBenchmarkMetric(
      'Robot Utilization',
      utilization,
      this.industryStandards.get('robotUtilization')!,
      85,
      '%'
    ))

    const collisionRate = this.calculateCollisionAvoidanceRate(metrics)
    benchmarkMetrics.push(this.createBenchmarkMetric(
      'Collision Avoidance',
      collisionRate,
      this.industryStandards.get('collisionAvoidanceRate')!,
      99.9,
      '%'
    ))

    const energyEff = this.calculateEnergyEfficiency(robots)
    benchmarkMetrics.push(this.createBenchmarkMetric(
      'Energy Efficiency',
      energyEff,
      this.industryStandards.get('energyEfficiency')!,
      85,
      '%'
    ))

    const overallScore = this.calculateOverallScore(benchmarkMetrics)
    this.historicalScores.push(overallScore)

    const competitivePosition = this.determineCompetitivePosition(overallScore)
    const { strengths, weaknesses } = this.analyzePerformance(benchmarkMetrics)
    const recommendations = this.generateRecommendations(benchmarkMetrics, weaknesses)

    return {
      timestamp: Date.now(),
      overallScore,
      strengths,
      weaknesses,
      recommendations,
      competitivePosition,
      metrics: benchmarkMetrics
    }
  }

  private calculateThroughput(metrics: PerformanceMetrics, simulationTime: number): number {
    if (simulationTime === 0) return 0
    const hoursElapsed = simulationTime / 3600000
    return metrics.tasksCompleted / (hoursElapsed || 1)
  }

  private calculateAccuracy(metrics: PerformanceMetrics): number {
    const totalOperations = metrics.tasksCompleted + metrics.collisionsAvoided
    if (totalOperations === 0) return 100
    return (metrics.tasksCompleted / totalOperations) * 100
  }

  private calculateEfficiency(metrics: PerformanceMetrics, robots: Robot[]): number {
    const avgBattery = robots.reduce((sum, r) => sum + r.battery, 0) / (robots.length || 1)
    const utilization = metrics.robotUtilization
    const completionSpeed = metrics.averageCompletionTime > 0 
      ? 100 / metrics.averageCompletionTime 
      : 0
    
    return (avgBattery * 0.3 + utilization * 0.4 + completionSpeed * 0.3)
  }

  private calculateCollisionAvoidanceRate(metrics: PerformanceMetrics): number {
    const totalInteractions = metrics.collisionsAvoided + metrics.nearMissIncidents
    if (totalInteractions === 0) return 100
    return (metrics.collisionsAvoided / totalInteractions) * 100
  }

  private calculateEnergyEfficiency(robots: Robot[]): number {
    const avgBattery = robots.reduce((sum, r) => sum + r.battery, 0) / (robots.length || 1)
    const activeRobots = robots.filter(r => r.status === 'moving').length
    const utilization = (activeRobots / robots.length) * 100
    
    return (avgBattery * 0.6 + utilization * 0.4)
  }

  private createBenchmarkMetric(
    category: string,
    ourValue: number,
    industryAverage: number,
    worldClass: number,
    unit?: string
  ): BenchmarkMetric {
    const percentile = this.calculatePercentile(ourValue, industryAverage, worldClass)
    const trend = this.determineTrend(category, ourValue)

    return {
      category,
      ourValue: parseFloat(ourValue.toFixed(2)),
      industryAverage,
      worldClass,
      percentile,
      trend
    }
  }

  private calculatePercentile(value: number, average: number, worldClass: number): number {
    if (value >= worldClass) return 99
    if (value <= average * 0.5) return 10
    
    const range = worldClass - (average * 0.5)
    const position = value - (average * 0.5)
    
    return Math.min(Math.max((position / range) * 100, 0), 99)
  }

  private determineTrend(category: string, currentValue: number): BenchmarkMetric['trend'] {
    if (this.historicalScores.length < 2) return 'stable'
    
    const recent = this.historicalScores.slice(-3)
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length
    
    if (currentValue > avg * 1.05) return 'improving'
    if (currentValue < avg * 0.95) return 'declining'
    return 'stable'
  }

  private calculateOverallScore(metrics: BenchmarkMetric[]): number {
    const totalPercentile = metrics.reduce((sum, m) => sum + m.percentile, 0)
    return totalPercentile / metrics.length
  }

  private determineCompetitivePosition(score: number): BenchmarkReport['competitivePosition'] {
    if (score >= 85) return 'leader'
    if (score >= 70) return 'challenger'
    if (score >= 50) return 'follower'
    return 'emerging'
  }

  private analyzePerformance(metrics: BenchmarkMetric[]): {
    strengths: string[]
    weaknesses: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []

    for (const metric of metrics) {
      if (metric.percentile >= 75) {
        strengths.push(`${metric.category} performs in top 25% (${metric.percentile.toFixed(0)}th percentile)`)
      } else if (metric.percentile < 40) {
        weaknesses.push(`${metric.category} below industry average (${metric.percentile.toFixed(0)}th percentile)`)
      }
    }

    if (strengths.length === 0) {
      strengths.push('Operational baseline established')
    }

    return { strengths, weaknesses }
  }

  private generateRecommendations(
    metrics: BenchmarkMetric[],
    weaknesses: string[]
  ): string[] {
    const recommendations: string[] = []

    const sortedMetrics = [...metrics].sort((a, b) => a.percentile - b.percentile)
    
    for (let i = 0; i < Math.min(3, sortedMetrics.length); i++) {
      const metric = sortedMetrics[i]
      const gap = ((metric.worldClass - metric.ourValue) / metric.worldClass * 100).toFixed(0)
      
      recommendations.push(
        `Focus on ${metric.category}: ${gap}% gap to world-class performance`
      )
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current performance levels')
      recommendations.push('Explore advanced optimization techniques')
    }

    return recommendations
  }

  compareToCompetitor(competitorName: string, ourMetrics: any): {
    competitor: CompetitorProfile
    comparison: Array<{
      metric: string
      us: number
      them: number
      difference: number
    }>
  } | null {
    const competitor = this.competitors.find(c => c.name === competitorName)
    if (!competitor) return null

    return {
      competitor,
      comparison: [
        {
          metric: 'Throughput',
          us: ourMetrics.throughput || 0,
          them: competitor.metrics.throughput,
          difference: ((ourMetrics.throughput || 0) - competitor.metrics.throughput)
        },
        {
          metric: 'Accuracy',
          us: ourMetrics.accuracy || 0,
          them: competitor.metrics.accuracy,
          difference: ((ourMetrics.accuracy || 0) - competitor.metrics.accuracy)
        },
        {
          metric: 'Efficiency',
          us: ourMetrics.efficiency || 0,
          them: competitor.metrics.efficiency,
          difference: ((ourMetrics.efficiency || 0) - competitor.metrics.efficiency)
        }
      ]
    }
  }

  getCompetitors(): CompetitorProfile[] {
    return this.competitors
  }

  getHistoricalPerformance(): number[] {
    return this.historicalScores
  }

  reset() {
    this.historicalScores = []
  }
}
