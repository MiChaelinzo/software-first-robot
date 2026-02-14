import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Users, CirclesThree, Lightning, Target } from '@phosphor-icons/react'
import type { SwarmBehavior } from '@/lib/swarm-intelligence'

interface SwarmControlPanelProps {
  behaviors: SwarmBehavior
  emergenceData: {
    hasEmergentBehavior: boolean
    patterns: string[]
    coordination: number
  }
  onBehaviorChange: (behaviors: Partial<SwarmBehavior>) => void
  onCreateFormation: (type: 'line' | 'circle' | 'grid' | 'v-shape' | 'wedge' | 'scatter') => void
  isRunning: boolean
}

export function SwarmControlPanel({
  behaviors,
  emergenceData,
  onBehaviorChange,
  onCreateFormation,
  isRunning
}: SwarmControlPanelProps) {
  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/20">
          <Users size={24} weight="duotone" className="text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Swarm Intelligence</h3>
          <p className="text-sm text-muted-foreground">Collective behavior & formation control</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <CirclesThree size={18} weight="duotone" />
            Behavior Weights
          </h4>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Cohesion</label>
                <span className="text-sm font-mono">{behaviors.cohesion.toFixed(2)}</span>
              </div>
              <Slider
                value={[behaviors.cohesion * 100]}
                onValueChange={([value]) => onBehaviorChange({ cohesion: value / 100 })}
                max={100}
                step={1}
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Stay close to neighbors
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Separation</label>
                <span className="text-sm font-mono">{behaviors.separation.toFixed(2)}</span>
              </div>
              <Slider
                value={[behaviors.separation * 100]}
                onValueChange={([value]) => onBehaviorChange({ separation: value / 100 })}
                max={100}
                step={1}
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maintain safe distance
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Alignment</label>
                <span className="text-sm font-mono">{behaviors.alignment.toFixed(2)}</span>
              </div>
              <Slider
                value={[behaviors.alignment * 100]}
                onValueChange={([value]) => onBehaviorChange({ alignment: value / 100 })}
                max={100}
                step={1}
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Match neighbor velocity
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Task Attraction</label>
                <span className="text-sm font-mono">{behaviors.taskAttraction.toFixed(2)}</span>
              </div>
              <Slider
                value={[behaviors.taskAttraction * 100]}
                onValueChange={([value]) => onBehaviorChange({ taskAttraction: value / 100 })}
                max={100}
                step={1}
                disabled={isRunning}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pull toward assigned tasks
              </p>
            </div>
          </div>

          <div className="pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target size={18} weight="duotone" />
              Formation Patterns
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateFormation('line')}
                disabled={isRunning}
              >
                Line
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateFormation('circle')}
                disabled={isRunning}
              >
                Circle
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateFormation('grid')}
                disabled={isRunning}
              >
                Grid
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateFormation('v-shape')}
                disabled={isRunning}
              >
                V-Shape
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateFormation('wedge')}
                disabled={isRunning}
              >
                Wedge
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateFormation('scatter')}
                disabled={isRunning}
              >
                Scatter
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Lightning size={18} weight="duotone" />
            Emergent Behavior
          </h4>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Coordination Score</span>
              <Badge variant={emergenceData.coordination > 70 ? 'default' : 'outline'}>
                {emergenceData.coordination.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={emergenceData.coordination} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {emergenceData.coordination > 70
                ? 'High swarm coordination detected'
                : emergenceData.coordination > 40
                ? 'Moderate coordination'
                : 'Low coordination - increase behavior weights'}
            </p>
          </Card>

          <div className="space-y-2">
            <h5 className="text-sm font-medium">Detected Patterns</h5>
            {emergenceData.patterns.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No emergent patterns detected yet
              </p>
            ) : (
              <div className="space-y-2">
                {emergenceData.patterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-sm"
                  >
                    ✨ {pattern}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-muted/30">
            <h5 className="text-sm font-medium mb-2">System Status</h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emergent Behavior</span>
                <span className={emergenceData.hasEmergentBehavior ? 'text-success' : 'text-muted-foreground'}>
                  {emergenceData.hasEmergentBehavior ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pattern Count</span>
                <span className="font-mono">{emergenceData.patterns.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Behavior Mode</span>
                <span className="font-mono">
                  {behaviors.cohesion > 0.5 ? 'Flocking' : 'Independent'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
