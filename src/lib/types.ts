export interface Position {
  x: number
  y: number
}

export interface Robot {
  id: string
  position: Position
  targetPosition: Position | null
  path: Position[]
  status: 'idle' | 'moving' | 'charging' | 'error'
  battery: number
  currentTask: Task | null
  speed: number
  color: string
}

export interface Task {
  id: string
  type: 'pickup' | 'delivery' | 'scan' | 'recharge'
  position: Position
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed'
  assignedRobotId?: string
  createdAt: number
  completedAt?: number
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
