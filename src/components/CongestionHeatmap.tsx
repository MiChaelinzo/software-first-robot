import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CongestionZone } from '@/lib/congestion-learning'
import { Flame, TrendUp } from '@phosphor-icons/react'

interface CongestionHeatmapProps {
  zones: CongestionZone[]
  gridWidth: number
  gridHeight: number
  zoneSize: number
}

export function CongestionHeatmap({ zones, gridWidth, gridHeight, zoneSize }: CongestionHeatmapProps) {
  const zonesX = Math.ceil(gridWidth / zoneSize)
  const zonesY = Math.ceil(gridHeight / zoneSize)
  
  const getCongestionColor = (level: number): string => {
    if (level > 0.7) return 'oklch(0.75 0.22 25 / 0.8)'
    if (level > 0.5) return 'oklch(0.75 0.18 50 / 0.6)'
    if (level > 0.3) return 'oklch(0.75 0.15 85 / 0.4)'
    if (level > 0.1) return 'oklch(0.75 0.20 145 / 0.2)'
    return 'oklch(0.30 0.03 265 / 0.1)'
  }

  const getSpeedIndicator = (speed: number): string => {
    if (speed > 0.9) return '⚡'
    if (speed > 0.7) return '→'
    if (speed > 0.5) return '~'
    return '•'
  }

  const hotZones = zones
    .filter(z => z.congestionLevel > 0.6)
    .sort((a, b) => b.congestionLevel - a.congestionLevel)
    .slice(0, 3)

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Flame size={20} weight="duotone" className="text-destructive" />
          Traffic Congestion Heatmap
        </h3>
      </div>

      <div className="space-y-4">
        <div 
          className="grid gap-1 p-4 bg-card/50 rounded-lg border border-border"
          style={{
            gridTemplateColumns: `repeat(${zonesX}, 1fr)`,
          }}
        >
          {Array.from({ length: zonesY }).map((_, y) =>
            Array.from({ length: zonesX }).map((_, x) => {
              const zone = zones.find(z => z.x === x * zoneSize && z.y === y * zoneSize)
              if (!zone) return null

              return (
                <div
                  key={`${x},${y}`}
                  className="aspect-square rounded flex items-center justify-center text-xs font-mono transition-all duration-300"
                  style={{
                    backgroundColor: getCongestionColor(zone.congestionLevel),
                  }}
                  title={`Zone (${x},${y})\nCongestion: ${(zone.congestionLevel * 100).toFixed(0)}%\nSpeed: ${zone.avgSpeed.toFixed(2)}x\nRobots: ${zone.robotCount}`}
                >
                  <span className="text-foreground/80 text-[10px]">
                    {getSpeedIndicator(zone.avgSpeed)}
                  </span>
                </div>
              )
            })
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'oklch(0.75 0.22 25 / 0.8)' }} />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'oklch(0.75 0.18 50 / 0.6)' }} />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'oklch(0.75 0.15 85 / 0.4)' }} />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'oklch(0.75 0.20 145 / 0.2)' }} />
              <span>Low</span>
            </div>
          </div>

          {hotZones.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <TrendUp size={16} weight="duotone" className="text-warning" />
                <span>High Traffic Zones</span>
              </div>
              <div className="space-y-1">
                {hotZones.map((zone, idx) => (
                  <div key={`${zone.x},${zone.y}`} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">
                      Zone ({Math.floor(zone.x / zoneSize)},{Math.floor(zone.y / zoneSize)})
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        {(zone.congestionLevel * 100).toFixed(0)}%
                      </Badge>
                      <span className="text-muted-foreground">
                        {zone.robotCount} robots
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
