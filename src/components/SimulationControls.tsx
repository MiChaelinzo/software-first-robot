import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Stop, Plus, Brain } from '@phosphor-icons/react'

interface SimulationControlsProps {
  isRunning: boolean
  speed: number
  onPlayPause: () => void
  onStop: () => void
  onSpeedChange: (speed: number) => void
  onAddTask: () => void
  onAIOptimize: () => void
  isOptimizing?: boolean
}

const SPEED_PRESETS = [
  { key: '1', speed: 0.5, label: 'Slow' },
  { key: '2', speed: 1.0, label: 'Normal' },
  { key: '3', speed: 1.5, label: 'Fast' },
  { key: '4', speed: 2.0, label: 'Faster' },
  { key: '5', speed: 3.0, label: 'Max' },
]

export function SimulationControls({
  isRunning,
  speed,
  onPlayPause,
  onStop,
  onSpeedChange,
  onAddTask,
  onAIOptimize,
  isOptimizing = false
}: SimulationControlsProps) {
  return (
    <Card className="glass-panel p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={onPlayPause}
            className="flex items-center gap-2"
            variant={isRunning ? 'secondary' : 'default'}
          >
            {isRunning ? (
              <>
                <Pause size={18} weight="fill" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={18} weight="fill" />
                <span>Start</span>
              </>
            )}
          </Button>

          <Button
            onClick={onStop}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Stop size={18} weight="fill" />
            <span>Reset</span>
          </Button>

          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Speed: {speed.toFixed(1)}x
              </span>
              <Slider
                value={[speed]}
                onValueChange={(values) => onSpeedChange(values[0])}
                min={0.1}
                max={3}
                step={0.1}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Presets:</span>
            {SPEED_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                onClick={() => onSpeedChange(preset.speed)}
                variant={Math.abs(speed - preset.speed) < 0.05 ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 relative"
              >
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-mono"
                >
                  {preset.key}
                </Badge>
                <span className="text-xs">{preset.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={onAddTask}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus size={18} weight="bold" />
            <span>Add Task</span>
          </Button>

          <Button
            onClick={onAIOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <Brain size={18} weight="duotone" />
            <span>{isOptimizing ? 'Optimizing...' : 'AI Optimize'}</span>
          </Button>

          <div className="ml-auto">
            <span className="text-xs text-muted-foreground">
              Press 1-5 for speed presets
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
