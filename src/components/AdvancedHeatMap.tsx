import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Fire, Path, TrendUp, Target } from '@phosphor-icons/react'

interface HeatMapLayer {
  name: string
  data: number[][]
  colorScale: (value: number) => string
}

interface AdvancedHeatMapProps {
  gridWidth: number
  gridHeight: number
  trafficData: number[][]
  speedData: number[][]
  collisionData: number[][]
  efficiencyData: number[][]
}

export function AdvancedHeatMap({
  gridWidth,
  gridHeight,
  trafficData,
  speedData,
  collisionData,
  efficiencyData
}: AdvancedHeatMapProps) {
  const cellSize = 30

  const trafficColorScale = (value: number) => {
    const intensity = Math.min(value / 10, 1)
    return `oklch(${0.7 - intensity * 0.3} ${0.15 + intensity * 0.1} 25 / ${intensity * 0.8})`
  }

  const speedColorScale = (value: number) => {
    const normalized = Math.min(value / 3, 1)
    return `oklch(${0.65 + normalized * 0.1} ${0.18} ${145 + normalized * 120} / ${0.6})`
  }

  const collisionColorScale = (value: number) => {
    const intensity = Math.min(value / 5, 1)
    return `oklch(${0.75 - intensity * 0.2} ${0.20 + intensity * 0.05} 25 / ${intensity})`
  }

  const efficiencyColorScale = (value: number) => {
    const normalized = Math.min(Math.max(value, 0), 1)
    return `oklch(${0.6 + normalized * 0.15} ${0.2} ${normalized > 0.5 ? 145 : 25} / ${0.7})`
  }

  const renderHeatMap = (data: number[][], colorScale: (value: number) => string, label: string) => {
    const maxValue = Math.max(...data.flat())
    const avgValue = data.flat().reduce((a, b) => a + b, 0) / (gridWidth * gridHeight)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Max:</span>{' '}
              <span className="font-mono font-semibold">{maxValue.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg:</span>{' '}
              <span className="font-mono font-semibold">{avgValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center p-4 bg-background/50 rounded-lg border border-border/50">
          <svg
            width={gridWidth * cellSize}
            height={gridHeight * cellSize}
            className="rounded"
          >
            {data.map((row, y) =>
              row.map((value, x) => (
                <rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={colorScale(value)}
                  stroke="oklch(0.3 0.02 265)"
                  strokeWidth="0.5"
                />
              ))
            )}
          </svg>
        </div>
      </div>
    )
  }

  const trafficStats = {
    hotspots: trafficData.flat().filter(v => v > 5).length,
    coverage: (trafficData.flat().filter(v => v > 0).length / (gridWidth * gridHeight) * 100).toFixed(0)
  }

  const collisionStats = {
    zones: collisionData.flat().filter(v => v > 2).length,
    total: collisionData.flat().reduce((a, b) => a + b, 0).toFixed(0)
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Fire size={20} weight="duotone" />
          Advanced Heat Map Analysis
        </h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-destructive/50 text-destructive">
            {trafficStats.hotspots} Hotspots
          </Badge>
          <Badge variant="outline" className="border-warning/50 text-warning">
            {collisionStats.zones} Risk Zones
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traffic">
            <Path size={14} className="mr-1" />
            Traffic
          </TabsTrigger>
          <TabsTrigger value="speed">
            <TrendUp size={14} className="mr-1" />
            Speed
          </TabsTrigger>
          <TabsTrigger value="collision">
            <Target size={14} className="mr-1" />
            Collision
          </TabsTrigger>
          <TabsTrigger value="efficiency">
            <Fire size={14} className="mr-1" />
            Efficiency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          {renderHeatMap(trafficData, trafficColorScale, 'Traffic Density')}
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-xs text-muted-foreground">
              <strong className="text-destructive-foreground">Traffic Analysis:</strong> {trafficStats.coverage}% of 
              warehouse covered. {trafficStats.hotspots} high-traffic zones identified requiring speed optimization.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="speed">
          {renderHeatMap(speedData, speedColorScale, 'Average Speed')}
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-muted-foreground">
              <strong className="text-primary-foreground">Speed Distribution:</strong> Cyan indicates high-speed zones, 
              orange shows congested areas where robots move slower.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="collision">
          {renderHeatMap(collisionData, collisionColorScale, 'Collision Risk')}
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
            <p className="text-xs text-muted-foreground">
              <strong className="text-warning-foreground">Collision Analysis:</strong> {collisionStats.total} total 
              avoidance events. {collisionStats.zones} zones require improved path planning.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="efficiency">
          {renderHeatMap(efficiencyData, efficiencyColorScale, 'Zone Efficiency')}
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/30">
            <p className="text-xs text-muted-foreground">
              <strong className="text-success-foreground">Efficiency Map:</strong> Green zones indicate optimal robot 
              performance, red zones show areas needing optimization.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
