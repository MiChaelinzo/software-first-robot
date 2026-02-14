import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  GitBranch, 
  Flask, 
  TrendUp, 
  TrendDown, 
  ArrowsClockwise,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react'
import type { WhatIfAnalysis, SimulationScenario } from '@/lib/digital-twin-engine'

interface DigitalTwinVisualizationProps {
  whatIfAnalyses: WhatIfAnalysis[]
  scenarios: SimulationScenario[]
  onRunScenario: (scenarioId: string) => void
  onCreateWhatIf: (modifications: any) => void
  isRunning: boolean
}

export function DigitalTwinVisualization({
  whatIfAnalyses,
  scenarios,
  onRunScenario,
  onCreateWhatIf,
  isRunning
}: DigitalTwinVisualizationProps) {
  const getDeltaIcon = (value: number) => {
    if (value > 0) return <TrendUp size={16} className="text-success" />
    if (value < 0) return <TrendDown size={16} className="text-destructive" />
    return <ArrowsClockwise size={16} className="text-muted-foreground" />
  }

  const getDeltaColor = (value: number) => {
    if (value > 10) return 'text-success'
    if (value > 0) return 'text-accent'
    if (value < -10) return 'text-destructive'
    return 'text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      <Card className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/20">
            <GitBranch size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Digital Twin Simulator</h3>
            <p className="text-sm text-muted-foreground">
              Test scenarios and predict outcomes before implementation
            </p>
          </div>
        </div>

        <Tabs defaultValue="what-if" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="what-if">What-If Analysis</TabsTrigger>
            <TabsTrigger value="scenarios">Predefined Scenarios</TabsTrigger>
          </TabsList>

          <TabsContent value="what-if" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateWhatIf({ addRobots: 5 })}
                  disabled={isRunning}
                >
                  Add 5 Robots
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateWhatIf({ increaseSpeed: 2 })}
                  disabled={isRunning}
                >
                  2x Speed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateWhatIf({ addChargingStations: 2 })}
                  disabled={isRunning}
                >
                  +2 Stations
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateWhatIf({ removeRobots: 3 })}
                  disabled={isRunning}
                >
                  -3 Robots
                </Button>
              </div>

              {whatIfAnalyses.length === 0 ? (
                <Card className="p-8 text-center">
                  <Flask size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Run a what-if analysis to see predicted outcomes
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {whatIfAnalyses.map((analysis, idx) => (
                    <Card key={idx} className="p-4 bg-card/50 border-border/50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{analysis.scenario}</h4>
                          <p className="text-xs text-muted-foreground">
                            Confidence: {(analysis.confidence * 100).toFixed(0)}% • 
                            Implementation time: {analysis.timeToImplement}min
                          </p>
                        </div>
                        <Badge variant="outline">
                          {analysis.confidence > 0.8 ? (
                            <CheckCircle size={14} className="mr-1 text-success" />
                          ) : (
                            <XCircle size={14} className="mr-1 text-warning" />
                          )}
                          {(analysis.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">Efficiency</span>
                            {getDeltaIcon(analysis.deltaPercentages.efficiency)}
                          </div>
                          <div className={`text-2xl font-bold font-mono ${getDeltaColor(analysis.deltaPercentages.efficiency)}`}>
                            {analysis.deltaPercentages.efficiency > 0 ? '+' : ''}
                            {analysis.deltaPercentages.efficiency.toFixed(1)}%
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">Throughput</span>
                            {getDeltaIcon(analysis.deltaPercentages.throughput)}
                          </div>
                          <div className={`text-2xl font-bold font-mono ${getDeltaColor(analysis.deltaPercentages.throughput)}`}>
                            {analysis.deltaPercentages.throughput > 0 ? '+' : ''}
                            {analysis.deltaPercentages.throughput.toFixed(1)}%
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">Reliability</span>
                            {getDeltaIcon(analysis.deltaPercentages.reliability)}
                          </div>
                          <div className={`text-2xl font-bold font-mono ${getDeltaColor(analysis.deltaPercentages.reliability)}`}>
                            {analysis.deltaPercentages.reliability > 0 ? '+' : ''}
                            {analysis.deltaPercentages.reliability.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-xs text-muted-foreground">
                          <strong className="text-accent">Overall Impact:</strong>{' '}
                          {analysis.deltaPercentages.efficiency + 
                           analysis.deltaPercentages.throughput + 
                           analysis.deltaPercentages.reliability > 20
                            ? 'Highly beneficial change - recommended for implementation'
                            : analysis.deltaPercentages.efficiency + 
                              analysis.deltaPercentages.throughput + 
                              analysis.deltaPercentages.reliability > 0
                            ? 'Moderate improvement expected'
                            : 'May reduce overall performance - not recommended'}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid gap-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="p-4 bg-card/50 border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{scenario.name}</h4>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onRunScenario(scenario.id)}
                      disabled={isRunning}
                    >
                      <Flask size={16} className="mr-1" />
                      Test
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {scenario.modifications.robotCount && (
                      <Badge variant="secondary" className="text-xs">
                        Robots: {scenario.modifications.robotCount > 0 ? '+' : ''}
                        {scenario.modifications.robotCount}
                      </Badge>
                    )}
                    {scenario.modifications.taskRate && (
                      <Badge variant="secondary" className="text-xs">
                        Task Rate: {scenario.modifications.taskRate}x
                      </Badge>
                    )}
                    {scenario.modifications.speedMultiplier && (
                      <Badge variant="secondary" className="text-xs">
                        Speed: {scenario.modifications.speedMultiplier}x
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Duration: {scenario.duration}s</span>
                    {scenario.results && (
                      <>
                        <span>•</span>
                        <span className="text-success">
                          Efficiency: +{scenario.results.efficiency.toFixed(0)}%
                        </span>
                      </>
                    )}
                  </div>

                  {scenario.results && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
                          <Progress value={scenario.results.efficiency} className="h-1.5" />
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Throughput</div>
                          <Progress value={scenario.results.throughput} className="h-1.5" />
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Reliability</div>
                          <Progress value={scenario.results.reliability} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
