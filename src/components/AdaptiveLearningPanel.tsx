import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Brain, Gauge, TrendUp, Lightning } from '@phosphor-icons/react'

interface AdaptiveLearningPanelProps {
  totalCongestionEvents: number
  speedAdjustments: number
  avgCongestionLevel: number
  highTrafficZones: number
  learningRate: number
  efficiencyGain: number
}

export function AdaptiveLearningPanel({
  totalCongestionEvents,
  speedAdjustments,
  avgCongestionLevel,
  highTrafficZones,
  learningRate,
  efficiencyGain
}: AdaptiveLearningPanelProps) {
  const congestionPercentage = avgCongestionLevel * 100
  const learningRatePercentage = (learningRate / 0.3) * 100

  const getCongestionStatus = () => {
    if (avgCongestionLevel > 0.7) return { label: 'Critical', color: 'destructive' as const }
    if (avgCongestionLevel > 0.5) return { label: 'High', color: 'secondary' as const }
    if (avgCongestionLevel > 0.3) return { label: 'Moderate', color: 'secondary' as const }
    return { label: 'Low', color: 'default' as const }
  }

  const status = getCongestionStatus()

  return (
    <Card className="glass-panel p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain size={20} weight="duotone" className="text-primary" />
            Adaptive Learning
          </h3>
          <Badge variant={status.color}>
            {status.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Congestion Level</span>
              <span className="font-mono font-semibold">
                {congestionPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={congestionPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Learning Rate</span>
              <span className="font-mono font-semibold">
                {learningRate.toFixed(2)}
              </span>
            </div>
            <Progress value={learningRatePercentage} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="metric-card p-4 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-accent">
              <Gauge size={18} weight="duotone" />
              <span className="text-xs font-medium">Speed Adjustments</span>
            </div>
            <div className="font-mono text-2xl font-bold">
              {speedAdjustments.toLocaleString()}
            </div>
          </div>

          <div className="metric-card p-4 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-warning">
              <Lightning size={18} weight="duotone" />
              <span className="text-xs font-medium">Congestion Events</span>
            </div>
            <div className="font-mono text-2xl font-bold">
              {totalCongestionEvents.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">High Traffic Zones</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-semibold text-destructive">
                {highTrafficZones}
              </span>
              <span className="text-xs text-muted-foreground">zones</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Efficiency Gain</span>
            <div className="flex items-center gap-2">
              <TrendUp 
                size={16} 
                weight="duotone" 
                className={efficiencyGain > 0 ? 'text-success' : 'text-muted-foreground'} 
              />
              <span className={`font-mono text-xl font-semibold ${efficiencyGain > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                {efficiencyGain > 0 ? '+' : ''}{efficiencyGain.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            The adaptive learning system continuously analyzes traffic patterns and adjusts robot speeds 
            to optimize throughput while minimizing congestion and collisions.
          </p>
        </div>
      </div>
    </Card>
  )
}
