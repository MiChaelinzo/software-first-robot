import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
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
        </div>
      </div>
    </Card>
  )
}
