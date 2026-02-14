export interface Position {
  x: number
  y: number
}

export interface Robot {
  id: string
  position: Position
  targetPosition: Position | null
  path: Position[]
  status: 'idle' | 'moving' | 'charging' | 'error' | 'transferring'
  battery: number
  currentTask: Task | null
  speed: number
  color: string
  warehouseId: string
  transferProgress?: number
  transferRoute?: TransferRoute
}

export interface Task {
  id: string
  type: 'pickup' | 'delivery' | 'scan' | 'recharge' | 'transfer'
  position: Position
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed'
  assignedRobotId?: string
  createdAt: number
  completedAt?: number
  warehouseId: string
  transferDestination?: string
}

export interface TransferRoute {
  fromWarehouse: string
  toWarehouse: string
  departureGate: Position
  arrivalGate: Position
  duration: number
  startTime: number
}

export interface TransferGate {
  id: string
  position: Position
  connectedWarehouseId: string
  status: 'available' | 'busy' | 'maintenance'
  robotQueue: string[]
}

export interface Warehouse {
  id: string
  name: string
  position: { x: number; y: number }
  grid: WarehouseCell[][]
  width: number
  height: number
  transferGates: TransferGate[]
  robots: string[]
  color: string
  region: string
}

export interface WarehouseCell {
  type: 'empty' | 'obstacle' | 'storage' | 'charging' | 'pickup' | 'delivery'
  occupied: boolean
  robotId?: string
}

export interface PerformanceMetrics {
  tasksCompleted: number
  tasksInProgress: number
  tasksPending: number
  averageCompletionTime: number
  robotUtilization: number
  collisionsAvoided: number
  pathsCalculated: number
  totalDistance: number
  nearMissIncidents: number
  criticalAvoidances: number
  totalCongestionEvents: number
  speedAdjustments: number
  avgCongestionLevel: number
  highTrafficZones: number
  learningRate: number
  efficiencyGain: number
  robotTransfers: number
  activeTransfers: number
  transferTime: number
}

export interface WarehouseNetwork {
  warehouses: Map<string, Warehouse>
  connections: NetworkConnection[]
  totalRobots: number
  totalTasks: number
  networkEfficiency: number
}

export interface NetworkConnection {
  id: string
  warehouse1: string
  warehouse2: string
  distance: number
  transferTime: number
  bandwidth: number
  congestion: number
}

export interface SimulationState {
  isRunning: boolean
  speed: number
  gridSize: { width: number; height: number }
  robots: Robot[]
  tasks: Task[]
  warehouse: WarehouseCell[][]
  metrics: PerformanceMetrics
}
