import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AndroidLogo, Package, Lightning, MapPin, Clock } from '@phosphor-icons/react'
import type { Robot } from '@/lib/types'

interface RobotHistoryEntry {
  robotId: string
  timestamp: number
  event: 'task_assigned' | 'task_completed' | 'collision_avoided' | 'charging' | 'idle'
  details: string
  position: { x: number; y: number }
}

interface RobotHistoryPanelProps {
  robots: Robot[]
  history: RobotHistoryEntry[]
}

export function RobotHistoryPanel({ robots, history }: RobotHistoryPanelProps) {
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)

  const getEventIcon = (event: RobotHistoryEntry['event']) => {
    switch (event) {
      case 'task_assigned':
        return <Package size={14} weight="duotone" className="text-primary" />
      case 'task_completed':
        return <Package size={14} weight="fill" className="text-success" />
      case 'collision_avoided':
        return <MapPin size={14} weight="fill" className="text-warning" />
      case 'charging':
        return <Lightning size={14} weight="fill" className="text-charging" />
      case 'idle':
        return <Clock size={14} weight="duotone" className="text-muted-foreground" />
    }
  }

  const getEventColor = (event: RobotHistoryEntry['event']) => {
    switch (event) {
      case 'task_assigned':
        return 'border-primary/50 text-primary'
      case 'task_completed':
        return 'border-success/50 text-success'
      case 'collision_avoided':
        return 'border-warning/50 text-warning'
      case 'charging':
        return 'border-charging/50 text-charging'
      case 'idle':
        return 'border-muted text-muted-foreground'
    }
  }

  const getRobotStats = (robotId: string) => {
    const robotHistory = history.filter(h => h.robotId === robotId)
    return {
      tasksCompleted: robotHistory.filter(h => h.event === 'task_completed').length,
      collisionsAvoided: robotHistory.filter(h => h.event === 'collision_avoided').length,
      totalEvents: robotHistory.length
    }
  }

  return (
    <Card className="glass-panel p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock size={20} weight="duotone" />
        Activity History
      </h3>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="robots">By Robot</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {sortedHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No events recorded yet. Start the simulation to see activity.
                </div>
              ) : (
                sortedHistory.map((entry, index) => (
                  <div
                    key={`${entry.robotId}-${entry.timestamp}-${index}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-accent/50 transition-colors"
                  >
                    <div className="mt-1">{getEventIcon(entry.event)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {entry.robotId.split('-')[1].toUpperCase()}
                        </span>
                        <Badge variant="outline" className={`text-xs ${getEventColor(entry.event)}`}>
                          {entry.event.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.details}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Position: ({entry.position.x}, {entry.position.y})
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="robots">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {robots.map(robot => {
                const stats = getRobotStats(robot.id)
                return (
                  <div
                    key={robot.id}
                    className="p-4 rounded-lg bg-card/50 border border-border/50"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: robot.color }}
                      />
                      <span className="font-mono text-sm font-semibold">
                        {robot.id.split('-')[1].toUpperCase()}
                      </span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {stats.totalEvents} events
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tasks:</span>
                        <span className="font-mono font-semibold text-success">
                          {stats.tasksCompleted}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avoidances:</span>
                        <span className="font-mono font-semibold text-warning">
                          {stats.collisionsAvoided}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="stats">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="text-2xl font-bold font-mono">{history.length}</div>
                <div className="text-xs text-muted-foreground">Total Events</div>
              </div>
              <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                <div className="text-2xl font-bold font-mono">
                  {history.filter(h => h.event === 'task_completed').length}
                </div>
                <div className="text-xs text-muted-foreground">Tasks Completed</div>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                <div className="text-2xl font-bold font-mono">
                  {history.filter(h => h.event === 'collision_avoided').length}
                </div>
                <div className="text-xs text-muted-foreground">Collisions Avoided</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="text-2xl font-bold font-mono">
                  {history.filter(h => h.event === 'task_assigned').length}
                </div>
                <div className="text-xs text-muted-foreground">Tasks Assigned</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
              <h4 className="text-sm font-semibold mb-3">Most Active Robot</h4>
              {robots.length > 0 && (
                (() => {
                  const mostActive = robots.reduce((prev, curr) => {
                    const prevStats = getRobotStats(prev.id)
                    const currStats = getRobotStats(curr.id)
                    return currStats.totalEvents > prevStats.totalEvents ? curr : prev
                  })
                  const stats = getRobotStats(mostActive.id)
                  return (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: mostActive.color }}
                      />
                      <span className="font-mono font-semibold">
                        {mostActive.id.split('-')[1].toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {stats.totalEvents} events
                      </span>
                    </div>
                  )
                })()
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
