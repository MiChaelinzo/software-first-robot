import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import type { Robot, Warehouse, TransferRoute } from '@/lib/types'
import { ArrowRight, Robot as RobotIcon, Timer, CheckCircle, Warning } from '@phosphor-icons/react'
import { useState } from 'react'

interface RobotTransferPanelProps {
  robots: Robot[]
  warehouses: Warehouse[]
  activeTransfers: Map<string, TransferRoute>
  onInitiateTransfer: (robotId: string, targetWarehouseId: string) => void
  onCancelTransfer: (robotId: string) => void
  isRunning: boolean
}

export function RobotTransferPanel({
  robots,
  warehouses,
  activeTransfers,
  onInitiateTransfer,
  onCancelTransfer,
  isRunning
}: RobotTransferPanelProps) {
  const [selectedRobot, setSelectedRobot] = useState<string>('')
  const [targetWarehouse, setTargetWarehouse] = useState<string>('')

  const availableRobots = robots.filter(r => r.status !== 'transferring')
  const transferringRobots = robots.filter(r => r.status === 'transferring')

  const handleTransfer = () => {
    if (selectedRobot && targetWarehouse) {
      onInitiateTransfer(selectedRobot, targetWarehouse)
      setSelectedRobot('')
      setTargetWarehouse('')
    }
  }

  const selectedRobotObj = robots.find(r => r.id === selectedRobot)
  const targetWarehouseObj = warehouses.find(w => w.id === targetWarehouse)

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRight size={24} weight="duotone" className="text-primary" />
        <h3 className="text-xl font-bold">Robot Transfer Control</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/20 border border-border space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Robot</label>
            <Select value={selectedRobot} onValueChange={setSelectedRobot}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a robot..." />
              </SelectTrigger>
              <SelectContent>
                {availableRobots.map(robot => {
                  const warehouse = warehouses.find(w => w.id === robot.warehouseId)
                  return (
                    <SelectItem key={robot.id} value={robot.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: robot.color }}
                        />
                        <span className="font-mono text-xs">{robot.id}</span>
                        <span className="text-muted-foreground text-xs">
                          @ {warehouse?.name.split(' ')[0]}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Target Warehouse</label>
            <Select 
              value={targetWarehouse} 
              onValueChange={setTargetWarehouse}
              disabled={!selectedRobot}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose destination..." />
              </SelectTrigger>
              <SelectContent>
                {warehouses
                  .filter(w => w.id !== selectedRobotObj?.warehouseId)
                  .map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: warehouse.color }}
                        />
                        <span className="text-xs">{warehouse.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRobotObj && targetWarehouseObj && (
            <div className="p-3 rounded bg-card/50 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">From:</span>
                <span className="font-semibold">
                  {warehouses.find(w => w.id === selectedRobotObj.warehouseId)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">To:</span>
                <span className="font-semibold">{targetWarehouseObj.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Battery:</span>
                <span className={`font-mono ${selectedRobotObj.battery < 30 ? 'text-warning' : 'text-accent'}`}>
                  {Math.round(selectedRobotObj.battery)}%
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handleTransfer}
            disabled={!selectedRobot || !targetWarehouse || !isRunning}
            className="w-full"
          >
            <ArrowRight size={16} className="mr-2" />
            Initiate Transfer
          </Button>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Timer size={16} className="text-accent" />
            Active Transfers ({transferringRobots.length})
          </h4>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-4">
              {transferringRobots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No active transfers
                </div>
              ) : (
                transferringRobots.map(robot => {
                  const transfer = activeTransfers.get(robot.id)
                  if (!transfer) return null

                  const fromWarehouse = warehouses.find(w => w.id === transfer.fromWarehouse)
                  const toWarehouse = warehouses.find(w => w.id === transfer.toWarehouse)
                  const progress = robot.transferProgress || 0

                  return (
                    <div
                      key={robot.id}
                      className="p-3 rounded-lg bg-card/50 border border-border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{ backgroundColor: robot.color }}
                          />
                          <span className="font-mono text-xs font-semibold">{robot.id}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(progress * 100)}%
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground truncate">
                          {fromWarehouse?.name.split(' ')[0]}
                        </span>
                        <ArrowRight size={12} className="text-accent" />
                        <span className="text-muted-foreground truncate">
                          {toWarehouse?.name.split(' ')[0]}
                        </span>
                      </div>

                      <Progress value={progress * 100} className="h-1" />

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>ETA: {Math.round((1 - progress) * (transfer.duration / 1000))}s</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancelTransfer(robot.id)}
                          className="h-6 px-2 text-[10px]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-accent mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-accent">Transfer Tips</p>
              <p className="text-muted-foreground">
                • Robots with low battery may not complete long transfers
              </p>
              <p className="text-muted-foreground">
                • Transfers take 7-12 seconds depending on distance
              </p>
              <p className="text-muted-foreground">
                • Robots are unavailable during transfer
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
