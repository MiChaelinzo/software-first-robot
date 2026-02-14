import type { 
  Warehouse, 
  Robot, 
  Task, 
  TransferRoute, 
  TransferGate, 
  NetworkConnection,
  Position,
  WarehouseCell
} from './types'
import { createWarehouse } from './simulation'

export class MultiWarehouseSystem {
  private warehouses: Map<string, Warehouse> = new Map()
  private connections: NetworkConnection[] = []
  private activeTransfers: Map<string, TransferRoute> = new Map()
  private transferHistory: Array<{
    robotId: string
    from: string
    to: string
    duration: number
    timestamp: number
  }> = []

  constructor() {
    this.initializeNetwork()
  }

  private initializeNetwork() {
    const warehouseConfigs = [
      {
        id: 'warehouse-north',
        name: 'North Distribution Center',
        position: { x: 100, y: 50 },
        width: 18,
        height: 14,
        color: 'oklch(0.75 0.20 145)',
        region: 'North America',
        gates: [
          { id: 'gate-n1', position: { x: 17, y: 7 }, connects: 'warehouse-central' },
          { id: 'gate-n2', position: { x: 8, y: 13 }, connects: 'warehouse-east' }
        ]
      },
      {
        id: 'warehouse-central',
        name: 'Central Hub',
        position: { x: 400, y: 200 },
        width: 20,
        height: 16,
        color: 'oklch(0.75 0.20 265)',
        region: 'Central',
        gates: [
          { id: 'gate-c1', position: { x: 0, y: 8 }, connects: 'warehouse-north' },
          { id: 'gate-c2', position: { x: 19, y: 8 }, connects: 'warehouse-south' },
          { id: 'gate-c3', position: { x: 10, y: 0 }, connects: 'warehouse-east' },
          { id: 'gate-c4', position: { x: 10, y: 15 }, connects: 'warehouse-west' }
        ]
      },
      {
        id: 'warehouse-south',
        name: 'South Fulfillment',
        position: { x: 700, y: 350 },
        width: 16,
        height: 12,
        color: 'oklch(0.75 0.18 100)',
        region: 'South America',
        gates: [
          { id: 'gate-s1', position: { x: 0, y: 6 }, connects: 'warehouse-central' },
          { id: 'gate-s2', position: { x: 8, y: 0 }, connects: 'warehouse-west' }
        ]
      },
      {
        id: 'warehouse-east',
        name: 'East Processing',
        position: { x: 550, y: 50 },
        width: 14,
        height: 14,
        color: 'oklch(0.70 0.22 325)',
        region: 'Asia Pacific',
        gates: [
          { id: 'gate-e1', position: { x: 0, y: 7 }, connects: 'warehouse-central' },
          { id: 'gate-e2', position: { x: 7, y: 13 }, connects: 'warehouse-north' }
        ]
      },
      {
        id: 'warehouse-west',
        name: 'West Logistics',
        position: { x: 250, y: 400 },
        width: 15,
        height: 13,
        color: 'oklch(0.75 0.22 25)',
        region: 'Europe',
        gates: [
          { id: 'gate-w1', position: { x: 7, y: 0 }, connects: 'warehouse-central' },
          { id: 'gate-w2', position: { x: 14, y: 6 }, connects: 'warehouse-south' }
        ]
      }
    ]

    warehouseConfigs.forEach(config => {
      const grid = createWarehouse(config.width, config.height)
      
      const transferGates: TransferGate[] = config.gates.map(gate => ({
        id: gate.id,
        position: gate.position,
        connectedWarehouseId: gate.connects,
        status: 'available' as const,
        robotQueue: []
      }))

      transferGates.forEach(gate => {
        grid[gate.position.y][gate.position.x] = {
          type: 'delivery',
          occupied: false
        }
      })

      const warehouse: Warehouse = {
        id: config.id,
        name: config.name,
        position: config.position,
        grid,
        width: config.width,
        height: config.height,
        transferGates,
        robots: [],
        color: config.color,
        region: config.region
      }

      this.warehouses.set(config.id, warehouse)
    })

    this.connections = [
      { 
        id: 'conn-nc', 
        warehouse1: 'warehouse-north', 
        warehouse2: 'warehouse-central', 
        distance: 350, 
        transferTime: 8, 
        bandwidth: 5,
        congestion: 0
      },
      { 
        id: 'conn-cs', 
        warehouse1: 'warehouse-central', 
        warehouse2: 'warehouse-south', 
        distance: 400, 
        transferTime: 10, 
        bandwidth: 4,
        congestion: 0
      },
      { 
        id: 'conn-ce', 
        warehouse1: 'warehouse-central', 
        warehouse2: 'warehouse-east', 
        distance: 300, 
        transferTime: 7, 
        bandwidth: 6,
        congestion: 0
      },
      { 
        id: 'conn-cw', 
        warehouse1: 'warehouse-central', 
        warehouse2: 'warehouse-west', 
        distance: 320, 
        transferTime: 8, 
        bandwidth: 5,
        congestion: 0
      },
      { 
        id: 'conn-ne', 
        warehouse1: 'warehouse-north', 
        warehouse2: 'warehouse-east', 
        distance: 500, 
        transferTime: 12, 
        bandwidth: 3,
        congestion: 0
      },
      { 
        id: 'conn-sw', 
        warehouse1: 'warehouse-south', 
        warehouse2: 'warehouse-west', 
        distance: 450, 
        transferTime: 11, 
        bandwidth: 4,
        congestion: 0
      }
    ]
  }

  getWarehouses(): Warehouse[] {
    return Array.from(this.warehouses.values())
  }

  getWarehouse(id: string): Warehouse | undefined {
    return this.warehouses.get(id)
  }

  getConnections(): NetworkConnection[] {
    return this.connections
  }

  getTransferGate(warehouseId: string, gateId: string): TransferGate | undefined {
    const warehouse = this.warehouses.get(warehouseId)
    return warehouse?.transferGates.find(gate => gate.id === gateId)
  }

  findOptimalTransferRoute(
    fromWarehouseId: string,
    toWarehouseId: string
  ): { path: string[]; totalTime: number; gates: TransferGate[] } | null {
    if (fromWarehouseId === toWarehouseId) return null

    const visited = new Set<string>()
    const queue: Array<{
      warehouseId: string
      path: string[]
      totalTime: number
      gates: TransferGate[]
    }> = []

    queue.push({ 
      warehouseId: fromWarehouseId, 
      path: [fromWarehouseId], 
      totalTime: 0,
      gates: []
    })

    while (queue.length > 0) {
      const current = queue.shift()!
      
      if (current.warehouseId === toWarehouseId) {
        return current
      }

      if (visited.has(current.warehouseId)) continue
      visited.add(current.warehouseId)

      const warehouse = this.warehouses.get(current.warehouseId)
      if (!warehouse) continue

      warehouse.transferGates.forEach(gate => {
        if (visited.has(gate.connectedWarehouseId)) return

        const connection = this.connections.find(
          conn =>
            (conn.warehouse1 === current.warehouseId &&
              conn.warehouse2 === gate.connectedWarehouseId) ||
            (conn.warehouse2 === current.warehouseId &&
              conn.warehouse1 === gate.connectedWarehouseId)
        )

        if (connection) {
          const baseTime = connection.transferTime
          const congestionPenalty = connection.congestion * 2
          const adjustedTime = baseTime + congestionPenalty

          queue.push({
            warehouseId: gate.connectedWarehouseId,
            path: [...current.path, gate.connectedWarehouseId],
            totalTime: current.totalTime + adjustedTime,
            gates: [...current.gates, gate]
          })
        }
      })

      queue.sort((a, b) => a.totalTime - b.totalTime)
    }

    return null
  }

  initiateTransfer(robot: Robot, targetWarehouseId: string): TransferRoute | null {
    const currentWarehouse = this.warehouses.get(robot.warehouseId)
    const targetWarehouse = this.warehouses.get(targetWarehouseId)

    if (!currentWarehouse || !targetWarehouse) return null

    const route = this.findOptimalTransferRoute(robot.warehouseId, targetWarehouseId)
    if (!route || route.path.length < 2) return null

    const nextWarehouseId = route.path[1]
    const departureGate = currentWarehouse.transferGates.find(
      gate => gate.connectedWarehouseId === nextWarehouseId
    )
    
    const arrivalWarehouse = this.warehouses.get(nextWarehouseId)
    const arrivalGate = arrivalWarehouse?.transferGates.find(
      gate => gate.connectedWarehouseId === robot.warehouseId
    )

    if (!departureGate || !arrivalGate) return null

    const connection = this.connections.find(
      conn =>
        (conn.warehouse1 === robot.warehouseId && conn.warehouse2 === nextWarehouseId) ||
        (conn.warehouse2 === robot.warehouseId && conn.warehouse1 === nextWarehouseId)
    )

    if (!connection) return null

    const transferRoute: TransferRoute = {
      fromWarehouse: robot.warehouseId,
      toWarehouse: nextWarehouseId,
      departureGate: departureGate.position,
      arrivalGate: arrivalGate.position,
      duration: connection.transferTime * 1000,
      startTime: Date.now()
    }

    this.activeTransfers.set(robot.id, transferRoute)

    departureGate.robotQueue.push(robot.id)
    departureGate.status = 'busy'

    connection.congestion = Math.min(connection.congestion + 0.2, 1.0)

    return transferRoute
  }

  updateTransfer(robot: Robot): { completed: boolean; progress: number } {
    const transfer = this.activeTransfers.get(robot.id)
    if (!transfer) return { completed: false, progress: 0 }

    const elapsed = Date.now() - transfer.startTime
    const progress = Math.min(elapsed / transfer.duration, 1.0)

    if (progress >= 1.0) {
      this.completeTransfer(robot, transfer)
      return { completed: true, progress: 1.0 }
    }

    return { completed: false, progress }
  }

  private completeTransfer(robot: Robot, transfer: TransferRoute) {
    const fromWarehouse = this.warehouses.get(transfer.fromWarehouse)
    const toWarehouse = this.warehouses.get(transfer.toWarehouse)

    if (fromWarehouse && toWarehouse) {
      fromWarehouse.robots = fromWarehouse.robots.filter(id => id !== robot.id)
      toWarehouse.robots.push(robot.id)

      robot.warehouseId = transfer.toWarehouse
      robot.position = { ...transfer.arrivalGate }
      robot.status = 'idle'
      robot.path = []
      robot.targetPosition = null
      robot.transferProgress = undefined
      robot.transferRoute = undefined

      const departureGate = fromWarehouse.transferGates.find(
        gate => gate.position.x === transfer.departureGate.x && 
                gate.position.y === transfer.departureGate.y
      )
      if (departureGate) {
        departureGate.robotQueue = departureGate.robotQueue.filter(id => id !== robot.id)
        if (departureGate.robotQueue.length === 0) {
          departureGate.status = 'available'
        }
      }

      const connection = this.connections.find(
        conn =>
          (conn.warehouse1 === transfer.fromWarehouse && 
           conn.warehouse2 === transfer.toWarehouse) ||
          (conn.warehouse2 === transfer.fromWarehouse && 
           conn.warehouse1 === transfer.toWarehouse)
      )
      if (connection) {
        connection.congestion = Math.max(connection.congestion - 0.2, 0)
      }

      this.transferHistory.push({
        robotId: robot.id,
        from: transfer.fromWarehouse,
        to: transfer.toWarehouse,
        duration: transfer.duration,
        timestamp: Date.now()
      })
    }

    this.activeTransfers.delete(robot.id)
  }

  cancelTransfer(robotId: string) {
    const transfer = this.activeTransfers.get(robotId)
    if (!transfer) return

    const fromWarehouse = this.warehouses.get(transfer.fromWarehouse)
    if (fromWarehouse) {
      const gate = fromWarehouse.transferGates.find(
        g => g.position.x === transfer.departureGate.x && 
            g.position.y === transfer.departureGate.y
      )
      if (gate) {
        gate.robotQueue = gate.robotQueue.filter(id => id !== robotId)
        if (gate.robotQueue.length === 0) {
          gate.status = 'available'
        }
      }
    }

    this.activeTransfers.delete(robotId)
  }

  getActiveTransfers(): Map<string, TransferRoute> {
    return this.activeTransfers
  }

  getTransferHistory() {
    return this.transferHistory.slice(-100)
  }

  getNetworkStats() {
    const totalRobots = Array.from(this.warehouses.values()).reduce(
      (sum, wh) => sum + wh.robots.length,
      0
    )

    const avgCongestion = this.connections.reduce(
      (sum, conn) => sum + conn.congestion,
      0
    ) / this.connections.length

    const totalCapacity = this.connections.reduce(
      (sum, conn) => sum + conn.bandwidth,
      0
    )

    const utilizationRate = this.activeTransfers.size / totalCapacity

    return {
      totalWarehouses: this.warehouses.size,
      totalRobots,
      totalConnections: this.connections.length,
      activeTransfers: this.activeTransfers.size,
      avgCongestion,
      utilizationRate,
      totalTransfers: this.transferHistory.length
    }
  }

  getWarehouseLoad(warehouseId: string): number {
    const warehouse = this.warehouses.get(warehouseId)
    if (!warehouse) return 0

    const maxCapacity = warehouse.width * warehouse.height * 0.3
    return warehouse.robots.length / maxCapacity
  }

  suggestRobotReallocation(): Array<{
    robotId: string
    from: string
    to: string
    reason: string
  }> {
    const suggestions: Array<{
      robotId: string
      from: string
      to: string
      reason: string
    }> = []

    const warehouseLoads = Array.from(this.warehouses.values()).map(wh => ({
      id: wh.id,
      load: this.getWarehouseLoad(wh.id),
      robotCount: wh.robots.length
    }))

    warehouseLoads.sort((a, b) => b.load - a.load)

    const overloaded = warehouseLoads.filter(wh => wh.load > 0.7)
    const underloaded = warehouseLoads.filter(wh => wh.load < 0.3)

    overloaded.forEach(over => {
      underloaded.forEach(under => {
        if (suggestions.length < 5 && over.robotCount > 2) {
          const warehouse = this.warehouses.get(over.id)
          if (warehouse && warehouse.robots.length > 0) {
            suggestions.push({
              robotId: warehouse.robots[0],
              from: over.id,
              to: under.id,
              reason: `Load balancing: ${over.id} is ${(over.load * 100).toFixed(0)}% loaded, ${under.id} is ${(under.load * 100).toFixed(0)}% loaded`
            })
          }
        }
      })
    })

    return suggestions
  }

  reset() {
    this.activeTransfers.clear()
    this.transferHistory = []
    this.connections.forEach(conn => {
      conn.congestion = 0
    })
    this.warehouses.forEach(wh => {
      wh.robots = []
      wh.transferGates.forEach(gate => {
        gate.status = 'available'
        gate.robotQueue = []
      })
    })
  }
}
