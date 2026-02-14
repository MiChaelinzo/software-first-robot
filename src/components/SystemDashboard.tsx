import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Gauge,
  Target,
  Lightning,
  CheckCircle,
  Warning,
  TrendUp,
  MapPin,
  Clock,
  Pulse
} from '@phosphor-icons/react'

interface SystemDashboardProps {
  metrics: {
    tasksCompleted: number
    tasksInProgress: number
    tasksPending: number
    averageCompletionTime: number
    robotUtilization: number
    collisionsAvoided: number
    pathsCalculated: number
    totalDistance: number
    nearMissIncidents: number
    criticalAvoidances: number
    totalCongestionEvents: number
    speedAdjustments: number
    avgCongestionLevel: number
    highTrafficZones: number
    learningRate: number
    efficiencyGain: number
  }
  robotCount: number
  activeRobots: number
  isRunning: boolean
}

export function SystemDashboard({ metrics, robotCount, activeRobots, isRunning }: SystemDashboardProps) {
  const systemHealth = () => {
    let score = 100
    if (metrics.avgCongestionLevel > 0.7) score -= 20
    if (metrics.robotUtilization < 30) score -= 15
    if (metrics.averageCompletionTime > 20) score -= 15
    if (metrics.criticalAvoidances > 20) score -= 10
    return Math.max(0, score)
  }

  const health = systemHealth()
  const healthColor =
    health >= 80 ? 'text-success' : health >= 60 ? 'text-warning' : 'text-destructive'
  const healthBg =
    health >= 80 ? 'bg-success/10 border-success/30' : health >= 60 ? 'bg-warning/10 border-warning/30' : 'bg-destructive/10 border-destructive/30'

  const throughput = metrics.averageCompletionTime > 0
    ? (60 / metrics.averageCompletionTime) * activeRobots
    : 0

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Pulse size={20} weight="duotone" />
          System Dashboard
        </h3>
        <Badge variant="outline" className={isRunning ? 'border-success/50 text-success' : 'border-muted'}>
          {isRunning ? 'Active' : 'Stopped'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${healthBg}`}>
          <div className="flex items-center justify-between mb-2">
            <Gauge size={20} weight="duotone" className={healthColor} />
            <span className={`text-2xl font-bold font-mono ${healthColor}`}>
              {health}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">System Health</div>
          <Progress value={health} className="h-1 mt-2" />
        </div>

        <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
          <div className="flex items-center justify-between mb-2">
            <Target size={20} weight="duotone" className="text-accent" />
            <span className="text-2xl font-bold font-mono text-accent">
              {throughput.toFixed(0)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Tasks/Hour</div>
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <Lightning size={20} weight="duotone" className="text-primary" />
            <span className="text-2xl font-bold font-mono text-primary">
              {activeRobots}/{robotCount}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Active Fleet</div>
          <Progress value={(activeRobots / robotCount) * 100} className="h-1 mt-2" />
        </div>

        <div className="p-4 rounded-lg bg-success/10 border border-success/30">
          <div className="flex items-center justify-between mb-2">
            <TrendUp size={20} weight="duotone" className="text-success" />
            <span className="text-2xl font-bold font-mono text-success">
              +{metrics.efficiencyGain.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Efficiency Gain</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Task Metrics
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <CheckCircle size={14} weight="duotone" className="text-success" />
                Completed
              </span>
              <span className="font-mono font-semibold">{metrics.tasksCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Pulse size={14} weight="duotone" className="text-primary" />
                In Progress
              </span>
              <span className="font-mono font-semibold">{metrics.tasksInProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock size={14} weight="duotone" className="text-warning" />
                Pending
              </span>
              <span className="font-mono font-semibold">{metrics.tasksPending}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Avg Time</span>
              <span className="font-mono font-semibold">
                {metrics.averageCompletionTime.toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Navigation
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin size={14} weight="duotone" />
                Paths Calculated
              </span>
              <span className="font-mono font-semibold">{metrics.pathsCalculated}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Target size={14} weight="duotone" />
                Total Distance
              </span>
              <span className="font-mono font-semibold">
                {metrics.totalDistance.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Lightning size={14} weight="duotone" className="text-warning" />
                Speed Adjustments
              </span>
              <span className="font-mono font-semibold">{metrics.speedAdjustments}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Learning Rate</span>
              <span className="font-mono font-semibold">
                {(metrics.learningRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Safety & Traffic
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <CheckCircle size={14} weight="duotone" className="text-success" />
                Collisions Avoided
              </span>
              <span className="font-mono font-semibold">{metrics.collisionsAvoided}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Warning size={14} weight="duotone" className="text-warning" />
                Near Misses
              </span>
              <span className="font-mono font-semibold">{metrics.nearMissIncidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Warning size={14} weight="fill" className="text-destructive" />
                Critical Avoidances
              </span>
              <span className="font-mono font-semibold">{metrics.criticalAvoidances}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Traffic Zones</span>
              <span className="font-mono font-semibold">{metrics.highTrafficZones}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-card/50 border border-border/50">
        <div className="flex items-start gap-3">
          <Pulse size={20} weight="duotone" className="text-accent mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold mb-1">System Status</div>
            <div className="text-xs text-muted-foreground">
              {isRunning ? (
                <>
                  Simulation running at {metrics.robotUtilization.toFixed(0)}% fleet utilization. 
                  Adaptive learning enabled with {(metrics.avgCongestionLevel * 100).toFixed(0)}% average congestion. 
                  {metrics.efficiencyGain > 0
                    ? ` System efficiency improved by ${metrics.efficiencyGain.toFixed(1)}%.`
                    : ' Collecting baseline performance data.'}
                </>
              ) : (
                'Simulation stopped. Start the simulation to begin collecting metrics and tracking performance.'
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
