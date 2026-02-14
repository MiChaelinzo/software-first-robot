import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { WarehouseGrid } from '@/components/WarehouseGrid'
import { RobotStatusCard } from '@/components/RobotStatusCard'
import { MetricsDashboard } from '@/components/MetricsDashboard'
import { TaskQueue } from '@/components/TaskQueue'
import { SimulationControls } from '@/components/SimulationControls'
import { CollisionMonitor, type CollisionEvent } from '@/components/CollisionMonitor'
import { CongestionHeatmap } from '@/components/CongestionHeatmap'
import { AdaptiveLearningPanel } from '@/components/AdaptiveLearningPanel'
import { VisualizationControls } from '@/components/VisualizationControls'
import { HeatTrailStats } from '@/components/HeatTrailStats'
import { Warehouse3D, type Warehouse3DHandle } from '@/components/Warehouse3D'
import { View3DControls } from '@/components/View3DControls'
import { PredictiveAnalytics } from '@/components/PredictiveAnalytics'
import { RobotHistoryPanel } from '@/components/RobotHistoryPanel'
import { ScenarioGenerator } from '@/components/ScenarioGenerator'
import { FleetManagementPanel } from '@/components/FleetManagementPanel'
import { EfficiencyOptimizer } from '@/components/EfficiencyOptimizer'
import { AdvancedHeatMap } from '@/components/AdvancedHeatMap'
import { PerformanceGraph } from '@/components/PerformanceGraph'
import { SystemDashboard } from '@/components/SystemDashboard'
import { DataExport } from '@/components/DataExport'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Robot, Task, WarehouseCell, PerformanceMetrics } from '@/lib/types'
import { 
  createWarehouse, 
  createRobot, 
  assignTaskToRobot, 
  updateRobotPosition, 
  checkCollisions,
  generateRandomTask 
} from '@/lib/simulation'
import { CongestionLearningSystem } from '@/lib/congestion-learning'
import { HeatTrailSystem } from '@/lib/heat-trail'
import { AndroidLogo } from '@phosphor-icons/react'

const GRID_WIDTH = 18
const GRID_HEIGHT = 14

const ROBOT_COLORS = [
  'oklch(0.75 0.20 145)',
  'oklch(0.75 0.20 265)',
  'oklch(0.75 0.18 100)',
  'oklch(0.70 0.22 325)',
  'oklch(0.75 0.22 25)',
  'oklch(0.72 0.20 200)',
  'oklch(0.68 0.22 50)',
  'oklch(0.75 0.18 290)',
  'oklch(0.70 0.20 170)',
  'oklch(0.73 0.21 340)'
]

const initialRobots: Robot[] = [
  createRobot('robot-01', { x: 2, y: 2 }, ROBOT_COLORS[0]),
  createRobot('robot-02', { x: 15, y: 2 }, ROBOT_COLORS[1]),
  createRobot('robot-03', { x: 2, y: 11 }, ROBOT_COLORS[2]),
  createRobot('robot-04', { x: 15, y: 11 }, ROBOT_COLORS[3]),
  createRobot('robot-05', { x: 8, y: 2 }, ROBOT_COLORS[4]),
  createRobot('robot-06', { x: 11, y: 2 }, ROBOT_COLORS[5]),
  createRobot('robot-07', { x: 8, y: 11 }, ROBOT_COLORS[6]),
  createRobot('robot-08', { x: 11, y: 11 }, ROBOT_COLORS[7]),
  createRobot('robot-09', { x: 5, y: 6 }, ROBOT_COLORS[8]),
  createRobot('robot-10', { x: 12, y: 6 }, ROBOT_COLORS[9])
]

const initialMetrics: PerformanceMetrics = {
  tasksCompleted: 0,
  tasksInProgress: 0,
  tasksPending: 0,
  averageCompletionTime: 0,
  robotUtilization: 0,
  collisionsAvoided: 0,
  pathsCalculated: 0,
  totalDistance: 0,
  nearMissIncidents: 0,
  criticalAvoidances: 0,
  totalCongestionEvents: 0,
  speedAdjustments: 0,
  avgCongestionLevel: 0,
  highTrafficZones: 0,
  learningRate: 0.1,
  efficiencyGain: 0
}

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [warehouse] = useState(() => createWarehouse(GRID_WIDTH, GRID_HEIGHT))
  const [robots, setRobots] = useKV<Robot[]>('robots', initialRobots)
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [metrics, setMetrics] = useKV<PerformanceMetrics>('metrics', initialMetrics)
  const [collisionEvents, setCollisionEvents] = useState<CollisionEvent[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  
  const [showCongestionZones, setShowCongestionZones] = useState(true)
  const [showRobotSpeeds, setShowRobotSpeeds] = useState(true)
  const [showSpeedIndicators, setShowSpeedIndicators] = useState(true)
  const [showHeatTrails, setShowHeatTrails] = useState(true)
  const [showHeatMap, setShowHeatMap] = useState(false)
  const [show3DPaths, setShow3DPaths] = useState(true)
  const [show3DGrid, setShow3DGrid] = useState(true)

  const congestionSystem = useMemo(() => new CongestionLearningSystem(GRID_WIDTH, GRID_HEIGHT, 3), [])
  const heatTrailSystem = useMemo(() => new HeatTrailSystem(50, 5000, 1), [])
  const lastUpdateRef = useRef<number>(Date.now())
  const completionTimesRef = useRef<number[]>([])
  const warehouse3DRef = useRef<Warehouse3DHandle>(null)
  const [heatTrailStats, setHeatTrailStats] = useState({
    activeTrails: 0,
    totalTrailPoints: 0,
    heatMapCells: 0,
    avgSpeed: 0,
    hotspots: 0
  })

  const [robotHistory, setRobotHistory] = useKV<any[]>('robot_history', [])
  const [trafficHeatData, setTrafficHeatData] = useState<number[][]>([])
  const [speedHeatData, setSpeedHeatData] = useState<number[][]>([])
  const [collisionHeatData, setCollisionHeatData] = useState<number[][]>([])
  const [efficiencyHeatData, setEfficiencyHeatData] = useState<number[][]>([])

  const safeRobots = robots || initialRobots
  const safeTasks = tasks || []
  const safeMetrics = metrics || initialMetrics
  const safeHistory = robotHistory || []

  useEffect(() => {
    const initHeatData = () => {
      const traffic: number[][] = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0))
      const speed: number[][] = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0))
      const collision: number[][] = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0))
      const efficiency: number[][] = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0.5))
      
      setTrafficHeatData(traffic)
      setSpeedHeatData(speed)
      setCollisionHeatData(collision)
      setEfficiencyHeatData(efficiency)
    }
    
    if (trafficHeatData.length === 0) {
      initHeatData()
    }
  }, [])

  const assignTasks = useCallback(() => {
    setTasks((currentTasks = []) => {
      const updatedTasks = [...currentTasks]
      const pendingTasks = updatedTasks.filter(t => t.status === 'pending')

      setRobots((currentRobots = initialRobots) => {
        const updatedRobots = [...currentRobots]

        for (const task of pendingTasks) {
          const assignment = assignTaskToRobot(task, updatedRobots, warehouse)
          
          if (assignment) {
            const robot = updatedRobots.find(r => r.id === assignment.robotId)
            if (robot) {
              robot.status = 'moving'
              robot.path = assignment.path
              robot.targetPosition = task.position
              robot.currentTask = task
              
              task.status = 'assigned'
              task.assignedRobotId = assignment.robotId

              setMetrics((currentMetrics = initialMetrics) => ({
                ...currentMetrics,
                pathsCalculated: currentMetrics.pathsCalculated + 1
              }))
            }
          }
        }

        return updatedRobots
      })

      return updatedTasks
    })
  }, [warehouse, setRobots, setTasks, setMetrics])

  const updateSimulation = useCallback(() => {
    if (!isRunning) return

    const now = Date.now()
    const deltaTime = (now - lastUpdateRef.current) / 1000
    lastUpdateRef.current = now

    congestionSystem.analyzeTrafficPatterns(safeRobots)

    setRobots((currentRobots = initialRobots) => {
      const updatedRobots = currentRobots.map(robot => {
        const adaptiveSpeed = congestionSystem.getAdaptiveSpeed(robot, currentRobots)
        robot.speed = adaptiveSpeed

        heatTrailSystem.recordPosition(robot)

        const { robot: updatedRobot, metrics: robotMetrics } = updateRobotPosition(
          robot,
          warehouse,
          deltaTime,
          speed
        )

        if (robotMetrics.totalDistance) {
          setMetrics((currentMetrics = initialMetrics) => ({
            ...currentMetrics,
            totalDistance: currentMetrics.totalDistance + (robotMetrics.totalDistance || 0)
          }))
        }

        setTrafficHeatData(prev => {
          const updated = prev.map(row => [...row])
          const x = Math.floor(robot.position.x)
          const y = Math.floor(robot.position.y)
          if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            updated[y][x] = Math.min(updated[y][x] + 0.1, 10)
          }
          return updated
        })

        setSpeedHeatData(prev => {
          const updated = prev.map(row => [...row])
          const x = Math.floor(robot.position.x)
          const y = Math.floor(robot.position.y)
          if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            updated[y][x] = (updated[y][x] + robot.speed) / 2
          }
          return updated
        })

        return updatedRobot
      })

      const collisionMetrics = checkCollisions(updatedRobots)
      if (collisionMetrics.collisionsAvoided > 0 || collisionMetrics.nearMissIncidents > 0 || collisionMetrics.criticalAvoidances > 0) {
        setMetrics((currentMetrics = initialMetrics) => ({
          ...currentMetrics,
          collisionsAvoided: currentMetrics.collisionsAvoided + collisionMetrics.collisionsAvoided,
          nearMissIncidents: currentMetrics.nearMissIncidents + collisionMetrics.nearMissIncidents,
          criticalAvoidances: currentMetrics.criticalAvoidances + collisionMetrics.criticalAvoidances
        }))

        if (collisionMetrics.events.length > 0) {
          setCollisionEvents(prev => [
            ...collisionMetrics.events.map(event => ({
              ...event,
              id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now()
            })),
            ...prev
          ].slice(0, 50))

          collisionMetrics.events.forEach(event => {
            if (event.type === 'critical-avoidance') {
              const avgPos = {
                x: updatedRobots.find(r => r.id === event.robotIds[0])?.position.x || 0,
                y: updatedRobots.find(r => r.id === event.robotIds[0])?.position.y || 0
              }
              congestionSystem.recordCollision(avgPos)
              
              setCollisionHeatData(prev => {
                const updated = prev.map(row => [...row])
                const x = Math.floor(avgPos.x)
                const y = Math.floor(avgPos.y)
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                  updated[y][x] = Math.min(updated[y][x] + 1, 10)
                }
                return updated
              })

              setRobotHistory((currentHistory = []) => [
                ...currentHistory,
                {
                  robotId: event.robotIds[0],
                  timestamp: Date.now(),
                  event: 'collision_avoided' as const,
                  details: `Critical avoidance with ${event.robotIds[1]}`,
                  position: avgPos
                }
              ].slice(-100))
            }
          })
        }
      }

      const learningMetrics = congestionSystem.getMetrics()
      setMetrics((currentMetrics = initialMetrics) => ({
        ...currentMetrics,
        totalCongestionEvents: learningMetrics.totalCongestionEvents,
        speedAdjustments: learningMetrics.speedAdjustments,
        avgCongestionLevel: learningMetrics.avgCongestionLevel,
        highTrafficZones: learningMetrics.highTrafficZones,
        learningRate: learningMetrics.learningRate,
        efficiencyGain: learningMetrics.efficiencyGain
      }))

      return updatedRobots
    })

    heatTrailSystem.cleanup()
    setHeatTrailStats(heatTrailSystem.getStats())

    setTasks((currentTasks = []) => {
      const updatedTasks = currentTasks.map(task => {
        if (task.status === 'assigned') {
          task.status = 'in-progress'
          
          setRobotHistory((currentHistory = []) => [
            ...currentHistory,
            {
              robotId: task.assignedRobotId || '',
              timestamp: Date.now(),
              event: 'task_assigned' as const,
              details: `${task.type} task at (${task.position.x}, ${task.position.y})`,
              position: task.position
            }
          ].slice(-100))
        }
        
        if (task.status === 'completed' && task.completedAt && !task.assignedRobotId?.includes('processed')) {
          const completionTime = (task.completedAt - task.createdAt) / 1000
          completionTimesRef.current.push(completionTime)
          
          if (completionTimesRef.current.length > 20) {
            completionTimesRef.current.shift()
          }
          
          const avgTime = completionTimesRef.current.reduce((a, b) => a + b, 0) / 
                          completionTimesRef.current.length
          
          setMetrics((currentMetrics = initialMetrics) => {
            const successRate = currentMetrics.tasksCompleted / (currentMetrics.tasksCompleted + currentMetrics.collisionsAvoided + 1)
            congestionSystem.updateLearningRate(successRate)
            
            return {
              ...currentMetrics,
              tasksCompleted: currentMetrics.tasksCompleted + 1,
              averageCompletionTime: avgTime
            }
          })

          setRobotHistory((currentHistory = []) => [
            ...currentHistory,
            {
              robotId: task.assignedRobotId || '',
              timestamp: Date.now(),
              event: 'task_completed' as const,
              details: `Completed ${task.type} in ${completionTime.toFixed(1)}s`,
              position: task.position
            }
          ].slice(-100))

          setEfficiencyHeatData(prev => {
            const updated = prev.map(row => [...row])
            const x = Math.floor(task.position.x)
            const y = Math.floor(task.position.y)
            if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
              updated[y][x] = Math.min((updated[y][x] + 0.1), 1)
            }
            return updated
          })

          task.assignedRobotId = task.assignedRobotId + '-processed'
        }

        return task
      }).filter(task => {
        if (task.status === 'completed' && task.completedAt) {
          return Date.now() - task.completedAt < 5000
        }
        return true
      })

      return updatedTasks
    })

    assignTasks()
  }, [isRunning, speed, warehouse, assignTasks, setRobots, setTasks, setMetrics, congestionSystem, heatTrailSystem, safeRobots])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(updateSimulation, 50)
    return () => clearInterval(interval)
  }, [isRunning, updateSimulation])

  useEffect(() => {
    setMetrics((currentMetrics = initialMetrics) => ({
      ...currentMetrics,
      tasksPending: safeTasks.filter(t => t.status === 'pending').length,
      tasksInProgress: safeTasks.filter(t => t.status === 'in-progress' || t.status === 'assigned').length,
      robotUtilization: (safeRobots.filter(r => r.status === 'moving').length / safeRobots.length) * 100
    }))
  }, [safeTasks, safeRobots, setMetrics])

  const handleAddTask = () => {
    const newTask = generateRandomTask(warehouse, safeTasks)
    setTasks((currentTasks = []) => [...currentTasks, newTask])
    toast.success('Task added to queue', {
      description: `${newTask.type} task at (${newTask.position.x}, ${newTask.position.y})`
    })
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((currentTasks = []) => currentTasks.filter(t => t.id !== taskId))
    toast.info('Task removed from queue')
  }

  const handleStop = () => {
    setIsRunning(false)
    setRobots(initialRobots)
    setTasks([])
    setMetrics(initialMetrics)
    setCollisionEvents([])
    setRobotHistory([])
    completionTimesRef.current = []
    congestionSystem.reset()
    heatTrailSystem.reset()
    setHeatTrailStats({
      activeTrails: 0,
      totalTrailPoints: 0,
      heatMapCells: 0,
      avgSpeed: 0,
      hotspots: 0
    })
    setTrafficHeatData(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)))
    setSpeedHeatData(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)))
    setCollisionHeatData(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0)))
    setEfficiencyHeatData(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0.5)))
    toast.info('Simulation reset')
  }

  const handleAIOptimize = async () => {
    setIsOptimizing(true)
    
    try {
      const promptText = `You are an AI optimization engine for a warehouse robotics system.

Current State:
- Active Robots: ${safeRobots.length}
- Pending Tasks: ${safeTasks.filter(t => t.status === 'pending').length}
- Tasks In Progress: ${safeTasks.filter(t => t.status === 'in-progress' || t.status === 'assigned').length}
- Robot Utilization: ${safeMetrics.robotUtilization.toFixed(1)}%
- Average Completion Time: ${safeMetrics.averageCompletionTime.toFixed(1)}s
- Collisions Avoided: ${safeMetrics.collisionsAvoided}

Analyze this robotics system and provide 2-3 specific, actionable optimization suggestions to improve efficiency, reduce completion time, or better utilize the robot fleet. Be concise and practical.`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini')
      
      toast.success('AI Optimization Complete', {
        description: response,
        duration: 10000
      })
    } catch (error) {
      toast.error('AI optimization failed', {
        description: 'Please try again later'
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  useEffect(() => {
    if (safeTasks.length < 5 && isRunning) {
      const timer = setTimeout(() => {
        const tasksToAdd = 5 - safeTasks.length
        for (let i = 0; i < tasksToAdd; i++) {
          handleAddTask()
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [safeTasks.length, isRunning])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const speedPresets: Record<string, number> = {
        '1': 0.5,
        '2': 1.0,
        '3': 1.5,
        '4': 2.0,
        '5': 3.0,
      }

      if (speedPresets[event.key]) {
        const newSpeed = speedPresets[event.key]
        setSpeed(newSpeed)
        toast.success(`Speed set to ${newSpeed}x`, {
          description: `Preset ${event.key} activated`,
          duration: 2000
        })
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleRobotSpeedAdjust = (robotId: string, speed: number) => {
    setRobots((currentRobots = initialRobots) =>
      currentRobots.map(r => (r.id === robotId ? { ...r, speed } : r))
    )
  }

  const handleRobotPause = (robotId: string) => {
    setRobots((currentRobots = initialRobots) =>
      currentRobots.map(r => (r.id === robotId ? { ...r, status: 'idle' as const, path: [] } : r))
    )
  }

  const handleRobotResume = (robotId: string) => {
    setRobots((currentRobots = initialRobots) =>
      currentRobots.map(r => (r.id === robotId ? { ...r, status: 'moving' as const } : r))
    )
  }

  const handleRobotRecall = (robotId: string) => {
    setRobots((currentRobots = initialRobots) =>
      currentRobots.map(r =>
        r.id === robotId
          ? { ...r, status: 'charging' as const, targetPosition: { x: 1, y: 1 }, path: [] }
          : r
      )
    )
  }

  const handleScenarioApply = (scenario: any) => {
    const newRobots: Robot[] = []
    for (let i = 0; i < scenario.robotCount; i++) {
      const startX = 2 + (i % 6) * 2
      const startY = 2 + Math.floor(i / 6) * 3
      newRobots.push(
        createRobot(`robot-${String(i + 1).padStart(2, '0')}`, { x: startX, y: startY }, ROBOT_COLORS[i % ROBOT_COLORS.length])
      )
    }
    setRobots(newRobots)
    setTasks([])
    setMetrics(initialMetrics)
    setCollisionEvents([])
    setRobotHistory([])
    congestionSystem.reset()
    heatTrailSystem.reset()
  }

  const handleOptimization = (optimization: any) => {
    switch (optimization.type) {
      case 'increase_task_rate':
        for (let i = 0; i < 5; i++) {
          setTimeout(() => handleAddTask(), i * 500)
        }
        break
      case 'optimize_traffic_flow':
        congestionSystem.reset()
        toast.success('Traffic flow patterns reset for relearning')
        break
      case 'increase_speed_zones':
        setRobots((currentRobots = initialRobots) =>
          currentRobots.map(r => ({ ...r, speed: Math.min(r.speed * 1.2, 3) }))
        )
        break
      case 'optimize_charging_schedule':
        setRobots((currentRobots = initialRobots) =>
          currentRobots.map(r =>
            r.battery < 30 ? { ...r, status: 'charging' as const, path: [] } : r
          )
        )
        break
      case 'apply_path_learning':
        setMetrics((currentMetrics = initialMetrics) => ({
          ...currentMetrics,
          learningRate: Math.min(currentMetrics.learningRate * 1.5, 0.3)
        }))
        break
    }
  }

  const handleImportData = (data: any) => {
    if (data.robots) setRobots(data.robots)
    if (data.tasks) setTasks(data.tasks)
    if (data.metrics) setMetrics(data.metrics)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" theme="dark" />
      
      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <AndroidLogo size={32} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Autonomous Warehouse
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Robotics Simulation
              </p>
            </div>
          </div>
        </header>

        <SimulationControls
          isRunning={isRunning}
          speed={speed}
          onPlayPause={() => setIsRunning(!isRunning)}
          onStop={handleStop}
          onSpeedChange={setSpeed}
          onAddTask={handleAddTask}
          onAIOptimize={handleAIOptimize}
          isOptimizing={isOptimizing}
        />

        <Tabs defaultValue="simulation" className="space-y-4">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="simulation">2D View</TabsTrigger>
            <TabsTrigger value="3d">3D View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="simulation" className="space-y-6">
            <div className="grid lg:grid-cols-[1fr,320px] gap-6">
              <div className="space-y-4">
                <VisualizationControls
                  showCongestionZones={showCongestionZones}
                  showRobotSpeeds={showRobotSpeeds}
                  showSpeedIndicators={showSpeedIndicators}
                  showHeatTrails={showHeatTrails}
                  showHeatMap={showHeatMap}
                  onToggleCongestionZones={setShowCongestionZones}
                  onToggleRobotSpeeds={setShowRobotSpeeds}
                  onToggleSpeedIndicators={setShowSpeedIndicators}
                  onToggleHeatTrails={setShowHeatTrails}
                  onToggleHeatMap={setShowHeatMap}
                />
                
                <Card className="glass-panel p-6">
                  <ScrollArea className="h-[600px]">
                    <div className="flex items-center justify-center">
                      <WarehouseGrid
                        warehouse={warehouse}
                        robots={safeRobots}
                        tasks={safeTasks}
                        cellSize={40}
                        congestionZones={congestionSystem.getZones()}
                        showCongestionZones={showCongestionZones}
                        showRobotSpeeds={showRobotSpeeds}
                        showSpeedIndicators={showSpeedIndicators}
                        heatTrails={heatTrailSystem.getTrails(true)}
                        heatMap={heatTrailSystem.getHeatMap()}
                        showHeatTrails={showHeatTrails}
                        showHeatMap={showHeatMap}
                        getTrailOpacity={(point) => heatTrailSystem.getOpacity(point)}
                      />
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AndroidLogo size={20} weight="duotone" />
                    Robot Fleet
                  </h3>
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-3 pr-4">
                      {safeRobots.map(robot => (
                        <RobotStatusCard key={robot.id} robot={robot} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Task Queue</h3>
                  <ScrollArea className="h-[280px]">
                    <div className="pr-4">
                      <TaskQueue tasks={safeTasks} onDeleteTask={handleDeleteTask} />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="3d" className="space-y-6">
            <div className="grid lg:grid-cols-[1fr,320px] gap-6">
              <div className="space-y-4">
                <View3DControls
                  showPaths={show3DPaths}
                  showGrid={show3DGrid}
                  onTogglePaths={setShow3DPaths}
                  onToggleGrid={setShow3DGrid}
                  onResetCamera={() => warehouse3DRef.current?.resetCamera()}
                />
                
                <Card className="glass-panel p-6">
                  <Warehouse3D
                    ref={warehouse3DRef}
                    warehouse={warehouse}
                    robots={safeRobots}
                    tasks={safeTasks}
                    isRunning={isRunning}
                    showPaths={show3DPaths}
                    showGrid={show3DGrid}
                  />
                </Card>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AndroidLogo size={20} weight="duotone" />
                    Robot Fleet
                  </h3>
                  <ScrollArea className="h-[280px]">
                    <div className="space-y-3 pr-4">
                      {safeRobots.map(robot => (
                        <RobotStatusCard key={robot.id} robot={robot} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Task Queue</h3>
                  <ScrollArea className="h-[280px]">
                    <div className="pr-4">
                      <TaskQueue tasks={safeTasks} onDeleteTask={handleDeleteTask} />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SystemDashboard
              metrics={safeMetrics}
              robotCount={safeRobots.length}
              activeRobots={safeRobots.filter(r => r.status === 'moving').length}
              isRunning={isRunning}
            />

            <PerformanceGraph metrics={safeMetrics} isRunning={isRunning} />

            <div className="grid lg:grid-cols-2 gap-6">
              <MetricsDashboard metrics={safeMetrics} />
              <PredictiveAnalytics
                tasksCompleted={safeMetrics.tasksCompleted}
                averageCompletionTime={safeMetrics.averageCompletionTime}
                robotUtilization={safeMetrics.robotUtilization}
                totalDistance={safeMetrics.totalDistance}
                collisionsAvoided={safeMetrics.collisionsAvoided}
                efficiencyGain={safeMetrics.efficiencyGain}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <AdaptiveLearningPanel
                totalCongestionEvents={safeMetrics.totalCongestionEvents}
                speedAdjustments={safeMetrics.speedAdjustments}
                avgCongestionLevel={safeMetrics.avgCongestionLevel}
                highTrafficZones={safeMetrics.highTrafficZones}
                learningRate={safeMetrics.learningRate}
                efficiencyGain={safeMetrics.efficiencyGain}
              />

              <HeatTrailStats
                activeTrails={heatTrailStats.activeTrails}
                totalTrailPoints={heatTrailStats.totalTrailPoints}
                heatMapCells={heatTrailStats.heatMapCells}
                avgSpeed={heatTrailStats.avgSpeed}
                hotspots={heatTrailStats.hotspots}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <CongestionHeatmap
                zones={congestionSystem.getZones()}
                gridWidth={GRID_WIDTH}
                gridHeight={GRID_HEIGHT}
                zoneSize={3}
              />

              <Card className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4">System Overview</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Robots</span>
                    <span className="font-mono font-semibold">{safeRobots.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Robots</span>
                    <span className="font-mono font-semibold text-accent">
                      {safeRobots.filter(r => r.status === 'moving').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Distance</span>
                    <span className="font-mono font-semibold">
                      {safeMetrics.totalDistance.toFixed(0)} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paths Calculated</span>
                    <span className="font-mono font-semibold">
                      {safeMetrics.pathsCalculated}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4">Robot Status</h3>
                <div className="space-y-3">
                  {safeRobots.map(robot => (
                    <div key={robot.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: robot.color }}
                        />
                        <span className="font-mono">
                          {robot.id.split('-')[1].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground capitalize">
                          {robot.status}
                        </span>
                        <span className="font-mono text-xs">
                          {Math.round(robot.battery)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <RobotHistoryPanel robots={safeRobots} history={safeHistory} />

            <AdvancedHeatMap
              gridWidth={GRID_WIDTH}
              gridHeight={GRID_HEIGHT}
              trafficData={trafficHeatData}
              speedData={speedHeatData}
              collisionData={collisionHeatData}
              efficiencyData={efficiencyHeatData}
            />

            <CollisionMonitor events={collisionEvents} />
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <ScenarioGenerator
                onApplyScenario={handleScenarioApply}
                isRunning={isRunning}
              />
              <EfficiencyOptimizer
                robots={safeRobots}
                tasks={safeTasks}
                metrics={safeMetrics}
                onOptimize={handleOptimization}
                isRunning={isRunning}
              />
              <DataExport
                robots={safeRobots}
                tasks={safeTasks}
                metrics={safeMetrics}
                onImport={handleImportData}
                isRunning={isRunning}
              />
            </div>

            <FleetManagementPanel
              robots={safeRobots}
              onRobotSpeedAdjust={handleRobotSpeedAdjust}
              onRobotPause={handleRobotPause}
              onRobotResume={handleRobotResume}
              onRobotRecall={handleRobotRecall}
              isRunning={isRunning}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
