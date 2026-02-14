import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Robot } from '@/lib/types'
import { Circle, BatteryCharging, Package, Lightning } from '@phosphor-icons/react'

interface RobotStatusCardProps {
  robot: Robot
}

export function RobotStatusCard({ robot }: RobotStatusCardProps) {
  const getStatusColor = (status: Robot['status']) => {
    switch (status) {
      case 'moving':
        return 'bg-accent text-accent-foreground'
      case 'charging':
        return 'bg-charging text-accent-foreground'
      case 'idle':
        return 'bg-muted text-muted-foreground'
      case 'error':
        return 'bg-destructive text-destructive-foreground'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-success'
    if (battery > 30) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <Card className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle
            size={16}
            weight="fill"
            style={{ color: robot.color }}
            className="robot-glow"
          />
          <span className="font-semibold text-sm tracking-wide">
            Robot {robot.id.split('-')[1].toUpperCase()}
          </span>
        </div>
        <Badge className={getStatusColor(robot.status)}>
          {robot.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BatteryCharging size={14} weight="duotone" />
            <span>Battery</span>
          </div>
          <span className={`font-mono font-medium ${getBatteryColor(robot.battery)}`}>
            {Math.round(robot.battery)}%
          </span>
        </div>
        <Progress value={robot.battery} className="h-1.5" />
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Position</span>
          <span className="font-mono">
            ({Math.round(robot.position.x)}, {Math.round(robot.position.y)})
          </span>
        </div>

        {robot.currentTask && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package size={12} weight="duotone" />
              <span>Task</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {robot.currentTask.type}
            </Badge>
          </div>
        )}

        {robot.status === 'charging' && (
          <div className="flex items-center gap-1.5 text-charging pt-1">
            <Lightning size={12} weight="fill" />
            <span className="text-xs">Recharging...</span>
          </div>
        )}

        {robot.path.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground">Path length</span>
            <span className="font-mono text-accent">
              {robot.path.length} steps
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
