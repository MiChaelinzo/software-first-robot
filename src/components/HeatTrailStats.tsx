import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Path, Fire, Gauge, MapPin } from '@phosphor-icons/react'

interface HeatTrailStatsProps {
  activeTrails: number
  totalTrailPoints: number
  heatMapCells: number
  avgSpeed: number
  hotspots: number
}

export function HeatTrailStats({
  activeTrails,
  totalTrailPoints,
  heatMapCells,
  avgSpeed,
  hotspots
}: HeatTrailStatsProps) {
  return (
    <Card className="glass-panel p-4">
      <div className="flex items-center gap-2 mb-4">
        <Path size={20} weight="duotone" className="text-accent" />
        <h3 className="text-lg font-semibold">Heat Trail Analytics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Path size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Active Trails</span>
          </div>
          <div className="font-mono text-2xl font-bold text-accent">
            {activeTrails}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Trail Points</span>
          </div>
          <div className="font-mono text-2xl font-bold">
            {totalTrailPoints}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Fire size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Heat Cells</span>
          </div>
          <div className="font-mono text-2xl font-bold text-warning">
            {heatMapCells}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Avg Speed</span>
          </div>
          <div className="font-mono text-2xl font-bold text-success">
            {avgSpeed.toFixed(2)}x
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Traffic Hotspots</span>
          <Badge 
            variant={hotspots > 5 ? "destructive" : hotspots > 2 ? "default" : "secondary"}
            className="font-mono"
          >
            {hotspots} zones
          </Badge>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="text-xs text-muted-foreground">Speed Legend:</div>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.55 0.22 25)' }} />
            <span className="text-muted-foreground">Slow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.75 0.18 100)' }} />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'oklch(0.75 0.20 145)' }} />
            <span className="text-muted-foreground">Fast</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
