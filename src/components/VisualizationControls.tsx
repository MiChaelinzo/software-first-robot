import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Eye, Gauge, ChartBar, ArrowDown, ArrowUp, Warning, Path, Fire } from '@phosphor-icons/react'
import { Separator } from '@/components/ui/separator'

interface VisualizationControlsProps {
  showCongestionZones: boolean
  showRobotSpeeds: boolean
  showSpeedIndicators: boolean
  showHeatTrails: boolean
  showHeatMap: boolean
  onToggleCongestionZones: (value: boolean) => void
  onToggleRobotSpeeds: (value: boolean) => void
  onToggleSpeedIndicators: (value: boolean) => void
  onToggleHeatTrails: (value: boolean) => void
  onToggleHeatMap: (value: boolean) => void
}

export function VisualizationControls({
  showCongestionZones,
  showRobotSpeeds,
  showSpeedIndicators,
  showHeatTrails,
  showHeatMap,
  onToggleCongestionZones,
  onToggleRobotSpeeds,
  onToggleSpeedIndicators,
  onToggleHeatTrails,
  onToggleHeatMap
}: VisualizationControlsProps) {
  return (
    <Card className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Eye size={20} weight="duotone" className="text-primary" />
        <h3 className="text-base font-semibold">Real-Time Visualization</h3>
      </div>
      
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBar size={16} className="text-muted-foreground" />
            <Label htmlFor="congestion-zones" className="text-sm cursor-pointer">
              Congestion Zones
            </Label>
          </div>
          <Switch
            id="congestion-zones"
            checked={showCongestionZones}
            onCheckedChange={onToggleCongestionZones}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-muted-foreground" />
            <Label htmlFor="robot-speeds" className="text-sm cursor-pointer">
              Robot Speed Labels
            </Label>
          </div>
          <Switch
            id="robot-speeds"
            checked={showRobotSpeeds}
            onCheckedChange={onToggleRobotSpeeds}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-muted-foreground" />
            <Label htmlFor="speed-indicators" className="text-sm cursor-pointer">
              Speed Adjustments
            </Label>
          </div>
          <Switch
            id="speed-indicators"
            checked={showSpeedIndicators}
            onCheckedChange={onToggleSpeedIndicators}
          />
        </div>

        <Separator className="my-2" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Path size={16} className="text-muted-foreground" />
            <Label htmlFor="heat-trails" className="text-sm cursor-pointer">
              Heat Trails
            </Label>
          </div>
          <Switch
            id="heat-trails"
            checked={showHeatTrails}
            onCheckedChange={onToggleHeatTrails}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fire size={16} className="text-muted-foreground" />
            <Label htmlFor="heat-map" className="text-sm cursor-pointer">
              Heat Map
            </Label>
          </div>
          <Switch
            id="heat-map"
            checked={showHeatMap}
            onCheckedChange={onToggleHeatMap}
          />
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="text-xs font-semibold text-foreground/90 mb-2">
          Speed Indicators
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded flex items-center justify-center" style={{ backgroundColor: 'oklch(0.75 0.20 145)' }}>
              <ArrowUp size={8} weight="bold" className="text-white" />
            </div>
            <span>Fast ≥1.0x</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded flex items-center justify-center" style={{ backgroundColor: 'oklch(0.75 0.18 100)' }}>
              <span className="text-white text-[8px]">—</span>
            </div>
            <span>Normal 0.8x</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded flex items-center justify-center" style={{ backgroundColor: 'oklch(0.75 0.15 85)' }}>
              <ArrowDown size={8} weight="bold" className="text-white" />
            </div>
            <span>Slow 0.6x</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded flex items-center justify-center" style={{ backgroundColor: 'oklch(0.75 0.22 25)' }}>
              <ArrowDown size={8} weight="bold" className="text-white" />
            </div>
            <span>V.Slow &lt;0.6x</span>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="text-xs font-semibold text-foreground/90 mb-2">
          Congestion Levels
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded" style={{ backgroundColor: 'oklch(0.55 0.22 25 / 0.5)' }}>
              <div className="flex items-center justify-center h-full">
                <Warning size={8} weight="fill" className="text-white" />
              </div>
            </div>
            <span>Critical (≥70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded" style={{ backgroundColor: 'oklch(0.75 0.22 25 / 0.4)' }} />
            <span>High (50-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded" style={{ backgroundColor: 'oklch(0.75 0.15 85 / 0.3)' }} />
            <span>Medium (30-50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-3 rounded" style={{ backgroundColor: 'oklch(0.75 0.18 100 / 0.2)' }} />
            <span>Low (&lt;30%)</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
