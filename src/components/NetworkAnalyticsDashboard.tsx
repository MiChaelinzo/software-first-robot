import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Warehouse, Robot, Task, NetworkConnection } from '@/lib/types'
import { ChartBar, TrendUp, ChartLine, Network } from '@phosphor-icons/react'

interface NetworkAnalyticsDashboardProps {
  warehouses: Warehouse[]
  robots: Robot[]
  tasks: Task[]
  connections: NetworkConnection[]
  transferHistory: Array<{
    robotId: string
    from: string
    to: string
    duration: number
    timestamp: number
  }>
}

export function NetworkAnalyticsDashboard({
  warehouses,
  robots,
  tasks,
  connections,
  transferHistory
}: NetworkAnalyticsDashboardProps) {
  const getTotalRobots = () => robots.length

  const getWarehouseLoad = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId)
    if (!warehouse) return 0
    const robotCount = robots.filter(r => r.warehouseId === warehouseId).length
    const maxCapacity = warehouse.width * warehouse.height * 0.3
    return (robotCount / maxCapacity) * 100
  }

  const getWarehouseTasks = (warehouseId: string) => {
    return tasks.filter(t => t.warehouseId === warehouseId).length
  }

  const avgCongestion = connections.reduce((sum, c) => sum + c.congestion, 0) / connections.length

  const recentTransfers = transferHistory.slice(-10).reverse()

  const totalTransfers = transferHistory.length

  const avgTransferTime = transferHistory.length > 0
    ? transferHistory.reduce((sum, t) => sum + t.duration, 0) / transferHistory.length / 1000
    : 0

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="metric-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Robots</span>
            <Network size={20} className="text-accent" />
          </div>
          <div className="text-3xl font-bold font-mono">{getTotalRobots()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Across {warehouses.length} facilities
          </div>
        </Card>

        <Card className="metric-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Transfers</span>
            <TrendUp size={20} className="text-primary" />
          </div>
          <div className="text-3xl font-bold font-mono">{totalTransfers}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg: {avgTransferTime.toFixed(1)}s
          </div>
        </Card>

        <Card className="metric-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Network Load</span>
            <ChartLine size={20} className="text-warning" />
          </div>
          <div className="text-3xl font-bold font-mono">{(avgCongestion * 100).toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            Average congestion
          </div>
        </Card>

        <Card className="metric-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Tasks</span>
            <ChartBar size={20} className="text-accent" />
          </div>
          <div className="text-3xl font-bold font-mono">{tasks.length}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Network-wide
          </div>
        </Card>
      </div>

      <Card className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Warehouse Utilization</h3>
        <div className="space-y-4">
          {warehouses.map(warehouse => {
            const robotCount = robots.filter(r => r.warehouseId === warehouse.id).length
            const taskCount = getWarehouseTasks(warehouse.id)
            const load = getWarehouseLoad(warehouse.id)

            return (
              <div key={warehouse.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: warehouse.color }}
                    />
                    <span className="font-semibold text-sm">{warehouse.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {robotCount} robots
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {taskCount} tasks
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground w-12 text-right">
                      {load.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={load} 
                  className="h-2"
                />
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transfer Activity</h3>
        <div className="space-y-2">
          {recentTransfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No transfers yet
            </div>
          ) : (
            recentTransfers.map((transfer, idx) => {
              const fromWarehouse = warehouses.find(w => w.id === transfer.from)
              const toWarehouse = warehouses.find(w => w.id === transfer.to)
              const robot = robots.find(r => r.id === transfer.robotId)

              return (
                <div
                  key={`${transfer.robotId}-${transfer.timestamp}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border"
                >
                  <div className="flex items-center gap-3">
                    {robot && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: robot.color }}
                      />
                    )}
                    <span className="font-mono text-xs">{transfer.robotId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{fromWarehouse?.name.split(' ')[0]}</span>
                    <span>→</span>
                    <span>{toWarehouse?.name.split(' ')[0]}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {(transfer.duration / 1000).toFixed(1)}s
                  </span>
                </div>
              )
            })
          )}
        </div>
      </Card>

      <Card className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
        <div className="space-y-3">
          {connections.map(conn => {
            const w1 = warehouses.find(w => w.id === conn.warehouse1)
            const w2 = warehouses.find(w => w.id === conn.warehouse2)

            return (
              <div key={conn.id} className="p-3 rounded-lg bg-card/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{w1?.name.split(' ')[0]}</span>
                    <span className="text-muted-foreground">↔</span>
                    <span>{w2?.name.split(' ')[0]}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      conn.congestion > 0.7 ? 'border-warning text-warning' :
                      conn.congestion > 0.4 ? 'border-accent text-accent' :
                      'border-success text-success'
                    }`}
                  >
                    {(conn.congestion * 100).toFixed(0)}% load
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{conn.distance}km</span>
                  <span>{conn.transferTime}s transfer</span>
                  <span>Bandwidth: {conn.bandwidth}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
