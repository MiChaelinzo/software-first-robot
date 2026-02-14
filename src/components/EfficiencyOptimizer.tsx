import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Brain, Sparkle, TrendUp, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface OptimizationSuggestion {
  id: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  action: () => void
  applied: boolean
}

interface EfficiencyOptimizerProps {
  robots: any[]
  tasks: any[]
  metrics: any
  onOptimize: (optimization: any) => void
  isRunning: boolean
}

export function EfficiencyOptimizer({
  robots,
  tasks,
  metrics,
  onOptimize,
  isRunning
}: EfficiencyOptimizerProps) {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<number | null>(null)

  const analyzSystem = async () => {
    setIsAnalyzing(true)
    
    setTimeout(() => {
      const newSuggestions: OptimizationSuggestion[] = []

      if (metrics.robotUtilization < 50 && tasks.length < 5) {
        newSuggestions.push({
          id: 'increase-tasks',
          title: 'Low Robot Utilization Detected',
          description: `Only ${metrics.robotUtilization.toFixed(0)}% of robots are active. Increase task generation rate to improve fleet efficiency.`,
          impact: 'medium',
          confidence: 85,
          action: () => {
            onOptimize({ type: 'increase_task_rate', value: 1.5 })
            toast.success('Task generation rate increased by 50%')
          },
          applied: false
        })
      }

      if (metrics.avgCongestionLevel > 0.6) {
        newSuggestions.push({
          id: 'reduce-congestion',
          title: 'High Congestion Detected',
          description: `Average congestion level is ${(metrics.avgCongestionLevel * 100).toFixed(0)}%. Implement traffic flow optimization to reduce bottlenecks.`,
          impact: 'high',
          confidence: 92,
          action: () => {
            onOptimize({ type: 'optimize_traffic_flow' })
            toast.success('Traffic flow optimization applied')
          },
          applied: false
        })
      }

      if (metrics.averageCompletionTime > 15) {
        newSuggestions.push({
          id: 'improve-speed',
          title: 'Slow Task Completion',
          description: `Average task completion time is ${metrics.averageCompletionTime.toFixed(1)}s. Increase robot speeds in low-congestion zones.`,
          impact: 'high',
          confidence: 88,
          action: () => {
            onOptimize({ type: 'increase_speed_zones' })
            toast.success('Speed optimization applied to low-congestion zones')
          },
          applied: false
        })
      }

      const lowBatteryRobots = robots.filter(r => r.battery < 30).length
      if (lowBatteryRobots > 2) {
        newSuggestions.push({
          id: 'battery-management',
          title: 'Battery Management Warning',
          description: `${lowBatteryRobots} robots have low battery. Implement proactive charging schedule to prevent fleet downtime.`,
          impact: 'critical',
          confidence: 95,
          action: () => {
            onOptimize({ type: 'optimize_charging_schedule' })
            toast.success('Charging schedule optimized')
          },
          applied: false
        })
      }

      if (metrics.collisionsAvoided > 50 && metrics.totalDistance > 500) {
        newSuggestions.push({
          id: 'path-optimization',
          title: 'Path Efficiency Can Be Improved',
          description: `High collision avoidance rate (${metrics.collisionsAvoided}) suggests suboptimal paths. Apply AI path learning to reduce conflicts.`,
          impact: 'medium',
          confidence: 78,
          action: () => {
            onOptimize({ type: 'apply_path_learning' })
            toast.success('AI path learning activated')
          },
          applied: false
        })
      }

      if (newSuggestions.length === 0) {
        newSuggestions.push({
          id: 'optimal',
          title: 'System Operating Optimally',
          description: 'All metrics are within optimal ranges. No immediate optimizations needed.',
          impact: 'low',
          confidence: 90,
          action: () => {
            toast.info('System is already optimized')
          },
          applied: false
        })
      }

      setSuggestions(newSuggestions)
      setLastAnalysis(Date.now())
      setIsAnalyzing(false)
      toast.success(`Analysis complete: ${newSuggestions.length} suggestion${newSuggestions.length !== 1 ? 's' : ''} generated`)
    }, 1500)
  }

  const applyOptimization = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return

    suggestion.action()
    setSuggestions(prev =>
      prev.map(s => (s.id === suggestionId ? { ...s, applied: true } : s))
    )
  }

  const getImpactColor = (impact: OptimizationSuggestion['impact']) => {
    switch (impact) {
      case 'low':
        return 'bg-muted text-muted-foreground border-muted'
      case 'medium':
        return 'bg-primary/20 text-primary border-primary/50'
      case 'high':
        return 'bg-warning/20 text-warning border-warning/50'
      case 'critical':
        return 'bg-destructive/20 text-destructive border-destructive/50'
    }
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain size={20} weight="duotone" className="text-accent" />
          Real-Time Efficiency Optimizer
        </h3>
        <Button
          onClick={analyzSystem}
          disabled={isAnalyzing || !isRunning}
          size="sm"
        >
          <Sparkle size={16} weight="fill" className="mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze System'}
        </Button>
      </div>

      {lastAnalysis && (
        <div className="mb-4 text-xs text-muted-foreground flex items-center gap-1">
          <Clock size={12} />
          Last analyzed: {new Date(lastAnalysis).toLocaleTimeString()}
        </div>
      )}

      {suggestions.length === 0 ? (
        <div className="text-center py-12">
          <Brain size={48} weight="duotone" className="text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Click "Analyze System" to get AI-powered optimization suggestions
          </p>
          <p className="text-xs text-muted-foreground/70">
            The optimizer analyzes robot utilization, task completion times, congestion patterns, and more
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border transition-all ${
                suggestion.applied
                  ? 'bg-success/5 border-success/30'
                  : 'bg-card/50 border-border/50 hover:border-accent/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {suggestion.applied ? (
                    <CheckCircle size={20} weight="fill" className="text-success mt-0.5 flex-shrink-0" />
                  ) : (
                    <TrendUp size={20} weight="duotone" className="text-accent mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                      <Badge variant="outline" className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                        {suggestion.impact} impact
                      </Badge>
                      {suggestion.applied && (
                        <Badge variant="outline" className="text-xs bg-success/20 text-success border-success/50">
                          Applied
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Progress value={suggestion.confidence} className="flex-1 h-1.5 max-w-[200px]" />
                  <span className="text-xs font-mono font-semibold">{suggestion.confidence}%</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => applyOptimization(suggestion.id)}
                  disabled={suggestion.applied || !isRunning || suggestion.id === 'optimal'}
                  className="ml-4"
                  variant={suggestion.applied ? 'outline' : 'default'}
                >
                  {suggestion.applied ? (
                    <>
                      <CheckCircle size={14} weight="fill" className="mr-1" />
                      Applied
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-3 rounded-lg bg-accent/10 border border-accent/30">
        <p className="text-xs text-muted-foreground">
          <strong className="text-accent-foreground">AI-Powered:</strong> This optimizer uses real-time metrics and machine learning 
          insights to identify efficiency bottlenecks and suggest actionable improvements.
        </p>
      </div>
    </Card>
  )
}
