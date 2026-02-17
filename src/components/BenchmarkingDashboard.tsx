import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BenchmarkReport, CompetitorProfile } from '@/lib/benchmarking-engine'
import { 
  TrendUp, 
  TrendDown, 
  Trophy, 
  Target,
  ChartLine,
  CheckCircle,
  WarningCircle
} from '@phosphor-icons/react'

interface BenchmarkingDashboardProps {
  report: BenchmarkReport | null
  competitors: CompetitorProfile[]
  isRunning: boolean
}

export function BenchmarkingDashboard({
  report,
  competitors,
  isRunning
}: BenchmarkingDashboardProps) {
  if (!report) {
    return (
      <Card className="glass-panel p-6">
        <div className="text-center py-12 text-muted-foreground">
          <ChartLine size={48} className="mx-auto mb-4 opacity-50" />
          <p>Start simulation to generate benchmark report</p>
        </div>
      </Card>
    )
  }

  const getPositionBadge = () => {
    const colors = {
      leader: 'bg-green-500/20 text-green-300 border-green-500/30',
      challenger: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      follower: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      emerging: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    }
    return (
      <Badge className={colors[report.competitivePosition]}>
        {report.competitivePosition.toUpperCase()}
      </Badge>
    )
  }

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    if (trend === 'improving') return <TrendUp size={16} className="text-success" />
    if (trend === 'declining') return <TrendDown size={16} className="text-destructive" />
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy size={24} weight="duotone" className="text-accent" />
          <h3 className="text-lg font-semibold">Competitive Benchmarking</h3>
        </div>
        {getPositionBadge()}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
          <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
          <div className="text-3xl font-bold text-accent">{report.overallScore.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-1">Percentile Rank</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="text-sm text-muted-foreground mb-1">Strengths</div>
          <div className="text-3xl font-bold text-success">{report.strengths.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Top Performers</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="text-sm text-muted-foreground mb-1">Improvements</div>
          <div className="text-3xl font-bold text-warning">{report.weaknesses.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Need Attention</div>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              {report.metrics.map((metric, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{metric.category}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {metric.percentile.toFixed(0)}th
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Our Performance</span>
                      <span className="font-mono font-semibold text-accent">
                        {metric.ourValue.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry Average</span>
                      <span className="font-mono">{metric.industryAverage.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">World Class</span>
                      <span className="font-mono text-success">{metric.worldClass.toFixed(1)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Below Average</span>
                      <span>World Class</span>
                    </div>
                    <Progress value={metric.percentile} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-success" />
              Strengths
            </h4>
            <div className="space-y-2">
              {report.strengths.map((strength, index) => (
                <div key={index} className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-success">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          {report.weaknesses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <WarningCircle size={18} className="text-warning" />
                Areas for Improvement
              </h4>
              <div className="space-y-2">
                {report.weaknesses.map((weakness, index) => (
                  <div key={index} className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-warning">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target size={18} className="text-accent" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              {competitors.map((competitor, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold">{competitor.name}</h5>
                    <Badge variant="outline" className="capitalize">{competitor.type}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Throughput</div>
                      <div className="font-mono text-sm">{competitor.metrics.throughput}/hr</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                      <div className="font-mono text-sm">{competitor.metrics.accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
                      <div className="font-mono text-sm">{competitor.metrics.efficiency}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Robot Density</div>
                      <div className="font-mono text-sm">{competitor.metrics.robotDensity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
