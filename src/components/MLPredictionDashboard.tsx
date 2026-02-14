import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Brain, TrendUp, Warning, CheckCircle, Clock } from '@phosphor-icons/react'
import type { PredictionResult, MaintenancePrediction } from '@/lib/ml-prediction-engine'

interface MLPredictionDashboardProps {
  taskPredictions: PredictionResult[]
  maintenancePredictions: MaintenancePrediction[]
  systemHealthScore: number
}

export function MLPredictionDashboard({
  taskPredictions,
  maintenancePredictions,
  systemHealthScore
}: MLPredictionDashboardProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-destructive'
  }

  const getUrgencyColor = (urgency: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (urgency) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'outline'
      default: return 'secondary'
    }
  }

  const criticalMaintenance = maintenancePredictions.filter(p => p.maintenanceUrgency === 'critical')
  const highConfidencePredictions = taskPredictions.filter(p => p.confidence > 0.8)

  return (
    <div className="space-y-6">
      <Card className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/20">
            <Brain size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">ML Prediction Engine</h3>
            <p className="text-sm text-muted-foreground">Real-time predictive analytics & maintenance forecasting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">System Health</span>
              <TrendUp size={18} className={getHealthColor(systemHealthScore)} />
            </div>
            <div className="text-3xl font-bold font-mono mb-2 ${getHealthColor(systemHealthScore)}">
              {systemHealthScore.toFixed(0)}%
            </div>
            <Progress value={systemHealthScore} className="h-2" />
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">High Confidence</span>
              <CheckCircle size={18} className="text-success" />
            </div>
            <div className="text-3xl font-bold font-mono mb-2">
              {highConfidencePredictions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Predictions over 80% confidence
            </p>
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Critical Alerts</span>
              <Warning size={18} className="text-destructive" />
            </div>
            <div className="text-3xl font-bold font-mono mb-2 text-destructive">
              {criticalMaintenance.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Robots requiring immediate attention
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} weight="duotone" className="text-accent" />
            <h4 className="font-semibold">Task Completion Predictions</h4>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {taskPredictions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active predictions - add tasks to see forecasts
              </p>
            ) : (
              taskPredictions.slice(0, 10).map((prediction, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Task #{idx + 1}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {prediction.confidence.toFixed(0)}% confidence
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      ETA: {prediction.predictedCompletionTime.toFixed(1)}s
                    </span>
                  </div>
                  {prediction.riskFactors.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {prediction.riskFactors.slice(0, 2).map((risk, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-2">
                          <Warning size={12} className="text-warning mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{risk}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {prediction.optimizationSuggestions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <p className="text-xs text-accent">
                        💡 {prediction.optimizationSuggestions[0]}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <Warning size={20} weight="duotone" className="text-destructive" />
            <h4 className="font-semibold">Predictive Maintenance</h4>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {maintenancePredictions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                All robots operating normally
              </p>
            ) : (
              maintenancePredictions
                .sort((a, b) => {
                  const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
                  return urgencyOrder[b.maintenanceUrgency] - urgencyOrder[a.maintenanceUrgency]
                })
                .map((prediction) => {
                  const timeToFailure = (prediction.predictedFailureTime - Date.now()) / 60000
                  
                  return (
                    <div
                      key={prediction.robotId}
                      className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium font-mono">
                          {prediction.robotId.toUpperCase().replace('ROBOT-', 'R-')}
                        </span>
                        <Badge variant={getUrgencyColor(prediction.maintenanceUrgency)}>
                          {prediction.maintenanceUrgency}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Reliability: {(prediction.reliability * 100).toFixed(0)}%</span>
                        <span>ETA: {timeToFailure.toFixed(0)}m</span>
                      </div>
                      
                      <Progress 
                        value={prediction.reliability * 100} 
                        className="h-1.5 mb-2"
                      />
                      
                      <div className="space-y-1 mt-2">
                        {prediction.recommendedActions.slice(0, 2).map((action, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle size={12} className="text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{action}</span>
                          </div>
                        ))}
                      </div>
                      
                      {prediction.estimatedDowntime > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/30">
                          <span className="text-xs text-warning">
                            ⚠️ Est. downtime: {prediction.estimatedDowntime}min
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
