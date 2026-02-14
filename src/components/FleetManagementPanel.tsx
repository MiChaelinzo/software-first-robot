import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AndroidLogo, 
  BatteryCharging, 
  Lightning, 
  Pause, 
  Play, 
  Stop, 
  Target,
  MapPin,
  Crosshair
} from '@phosphor-icons/react'
import type { Robot } from '@/lib/types'
import { toast } from 'sonner'

interface FleetManagementPanelProps {
  robots: Robot[]
  onRobotSpeedAdjust: (robotId: string, speed: number) => void
  onRobotPause: (robotId: string) => void
  onRobotResume: (robotId: string) => void
  onRobotRecall: (robotId: string) => void
  isRunning: boolean
}

export function FleetManagementPanel({
  robots,
  onRobotSpeedAdjust,
  onRobotPause,
  onRobotResume,
  onRobotRecall,
  isRunning
}: FleetManagementPanelProps) {
  const getStatusColor = (status: Robot['status']) => {
    switch (status) {
      case 'moving':
        return 'bg-success/20 text-success border-success/50'
      case 'idle':
        return 'bg-muted text-muted-foreground border-muted'
      case 'charging':
        return 'bg-warning/20 text-warning border-warning/50'
      case 'error':
        return 'bg-destructive/20 text-destructive border-destructive/50'
    }
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-success'
    if (battery > 30) return 'text-warning'
    return 'text-destructive'
  }

  const handleSpeedChange = (robotId: string, value: number[]) => {
    onRobotSpeedAdjust(robotId, value[0])
  }

  const handlePauseToggle = (robot: Robot) => {
    if (robot.status === 'moving') {
      onRobotPause(robot.id)
      toast.info(`Robot ${robot.id.split('-')[1].toUpperCase()} paused`)
    } else if (robot.status === 'idle') {
      onRobotResume(robot.id)
      toast.info(`Robot ${robot.id.split('-')[1].toUpperCase()} resumed`)
    }
  }

  const handleRecall = (robotId: string) => {
    onRobotRecall(robotId)
    toast.info(`Robot ${robotId.split('-')[1].toUpperCase()} recalled to base`)
  }

  const fleetStats = {
    active: robots.filter(r => r.status === 'moving').length,
    idle: robots.filter(r => r.status === 'idle').length,
    charging: robots.filter(r => r.status === 'charging').length,
    avgBattery: robots.reduce((sum, r) => sum + r.battery, 0) / robots.length,
    avgSpeed: robots.reduce((sum, r) => sum + r.speed, 0) / robots.length
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AndroidLogo size={20} weight="duotone" />
          Fleet Command Center
        </h3>
        <Badge variant="outline" className="border-primary/50 text-primary">
          {robots.length} Units
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-success/10 border border-success/30">
          <div className="text-xl font-bold font-mono text-success">{fleetStats.active}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/10 border border-muted">
          <div className="text-xl font-bold font-mono">{fleetStats.idle}</div>
          <div className="text-xs text-muted-foreground">Idle</div>
        </div>
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
          <div className="text-xl font-bold font-mono text-warning">{fleetStats.charging}</div>
          <div className="text-xs text-muted-foreground">Charging</div>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="text-xl font-bold font-mono text-primary">
            {fleetStats.avgBattery.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">Avg Battery</div>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4 pr-4">
          {robots.map(robot => (
            <div
              key={robot.id}
              className="p-4 rounded-lg bg-card/50 border border-border/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full robot-glow"
                    style={{ backgroundColor: robot.color }}
                  />
                  <span className="font-mono font-semibold">
                    {robot.id.split('-')[1].toUpperCase()}
                  </span>
                </div>
                <Badge variant="outline" className={`text-xs ${getStatusColor(robot.status)}`}>
                  {robot.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <BatteryCharging size={12} weight="duotone" />
                      Battery
                    </span>
                    <span className={`font-mono font-semibold ${getBatteryColor(robot.battery)}`}>
                      {Math.round(robot.battery)}%
                    </span>
                  </div>
                  <Progress value={robot.battery} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Target size={12} weight="duotone" />
                      Speed
                    </span>
                    <span className="font-mono font-semibold">
                      {robot.speed.toFixed(1)}x
                    </span>
                  </div>
                  <Progress value={(robot.speed / 3) * 100} className="h-1.5" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <MapPin size={12} weight="fill" className="text-muted-foreground" />
                <span className="text-muted-foreground">
                  Position: <span className="font-mono">({robot.position.x}, {robot.position.y})</span>
                </span>
                {robot.targetPosition && (
                  <>
                    <Crosshair size={12} weight="fill" className="text-accent" />
                    <span className="text-muted-foreground">
                      Target: <span className="font-mono">({robot.targetPosition.x}, {robot.targetPosition.y})</span>
                    </span>
                  </>
                )}
              </div>

              {robot.currentTask && (
                <div className="p-2 rounded bg-primary/10 border border-primary/30 text-xs">
                  <span className="text-muted-foreground">Current Task: </span>
                  <span className="font-mono font-semibold capitalize">{robot.currentTask.type}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {robot.currentTask.priority}
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`speed-${robot.id}`} className="text-xs">Manual Speed Control</Label>
                  <span className="text-xs font-mono">{robot.speed.toFixed(1)}x</span>
                </div>
                <Slider
                  id={`speed-${robot.id}`}
                  value={[robot.speed]}
                  onValueChange={(value) => handleSpeedChange(robot.id, value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  disabled={!isRunning}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePauseToggle(robot)}
                  disabled={!isRunning || robot.status === 'error' || robot.status === 'charging'}
                  className="flex-1 h-8"
                >
                  {robot.status === 'moving' ? (
                    <>
                      <Pause size={14} weight="fill" className="mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play size={14} weight="fill" className="mr-1" />
                      Resume
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRecall(robot.id)}
                  disabled={!isRunning || robot.status === 'charging'}
                  className="flex-1 h-8"
                >
                  <Lightning size={14} weight="fill" className="mr-1" />
                  Recall
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
