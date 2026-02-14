import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendUp, TrendDown, Brain, Lightning, Target, Clock } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

interface PredictiveAnalyticsProps {
  tasksCompleted: number
  averageCompletionTime: number
  robotUtilization: number
  totalDistance: number
  collisionsAvoided: number
  efficiencyGain: number
}

interface Prediction {
  metric: string
  value: number
  trend: 'up' | 'down' | 'stable'
  confidence: number
  recommendation: string
}

export function PredictiveAnalytics({
  tasksCompleted,
  averageCompletionTime,
  robotUtilization,
  totalDistance,
  collisionsAvoided,
  efficiencyGain
}: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])

  useEffect(() => {
    const calculatePredictions = () => {
      const newPredictions: Prediction[] = []

      const efficiencyTrend = efficiencyGain > 5 ? 'up' : efficiencyGain < -5 ? 'down' : 'stable'
      newPredictions.push({
        metric: 'Task Throughput',
        value: Math.round((tasksCompleted / Math.max(averageCompletionTime, 1)) * 60),
        trend: efficiencyTrend,
        confidence: Math.min(95, 60 + tasksCompleted),
        recommendation: efficiencyTrend === 'down' ? 'Consider adding more robots or optimizing paths' : 'System performing optimally'
      })

      const utilizationTrend = robotUtilization > 75 ? 'up' : robotUtilization < 50 ? 'down' : 'stable'
      newPredictions.push({
        metric: 'Fleet Efficiency',
        value: Math.round(robotUtilization),
        trend: utilizationTrend,
        confidence: 88,
        recommendation: utilizationTrend === 'down' ? 'Reduce fleet size or increase task generation rate' : 'Fleet size is optimal'
      })

      const distancePerTask = totalDistance / Math.max(tasksCompleted, 1)
      const distanceTrend = distancePerTask < 20 ? 'up' : distancePerTask > 40 ? 'down' : 'stable'
      newPredictions.push({
        metric: 'Path Efficiency',
        value: Math.round(Math.max(0, 100 - (distancePerTask - 15) * 2)),
        trend: distanceTrend,
        confidence: 82,
        recommendation: distanceTrend === 'down' ? 'Optimize warehouse layout or improve task allocation' : 'Path planning is efficient'
      })

      const collisionRate = (collisionsAvoided / Math.max(totalDistance / 10, 1))
      const collisionTrend = collisionRate > 2 ? 'down' : collisionRate < 0.5 ? 'up' : 'stable'
      newPredictions.push({
        metric: 'Safety Score',
        value: Math.round(Math.max(0, 100 - collisionRate * 10)),
        trend: collisionTrend === 'down' ? 'up' : collisionTrend === 'up' ? 'down' : 'stable',
        confidence: 91,
        recommendation: collisionRate > 2 ? 'High collision activity detected. Review congestion zones' : 'Collision avoidance system performing well'
      })

      setPredictions(newPredictions)
    }

    calculatePredictions()
    const interval = setInterval(calculatePredictions, 3000)
    return () => clearInterval(interval)
  }, [tasksCompleted, averageCompletionTime, robotUtilization, totalDistance, collisionsAvoided, efficiencyGain])

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain size={20} weight="duotone" className="text-primary" />
          Predictive Analytics
        </h3>
        <Badge variant="outline" className="border-primary/50 text-primary">
          <Lightning size={14} weight="fill" className="mr-1" />
          AI-Powered
        </Badge>
      </div>

      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{prediction.metric}</span>
                {prediction.trend === 'up' && (
                  <TrendUp size={16} weight="bold" className="text-success" />
                )}
                {prediction.trend === 'down' && (
                  <TrendDown size={16} weight="bold" className="text-destructive" />
                )}
                {prediction.trend === 'stable' && (
                  <Target size={16} weight="duotone" className="text-warning" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono">{prediction.value}</span>
                {prediction.metric.includes('Throughput') && (
                  <span className="text-xs text-muted-foreground">/hour</span>
                )}
                {(prediction.metric.includes('Efficiency') || prediction.metric.includes('Score')) && (
                  <span className="text-xs text-muted-foreground">%</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Progress value={prediction.confidence} className="flex-1 h-1.5" />
              <span className="text-xs text-muted-foreground font-mono w-12 text-right">
                {prediction.confidence}% <Clock size={10} className="inline" />
              </span>
            </div>

            <p className="text-xs text-muted-foreground italic">
              {prediction.recommendation}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 rounded-lg bg-accent/10 border border-accent/30">
        <div className="flex items-start gap-2">
          <Brain size={16} weight="duotone" className="text-accent mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <strong className="text-accent-foreground">AI Insight:</strong> System efficiency has improved by {efficiencyGain.toFixed(1)}% through adaptive learning. 
            Continue current operations for optimal performance.
          </div>
        </div>
      </div>
    </Card>
  )
}
