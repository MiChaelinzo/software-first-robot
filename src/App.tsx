import { useState, useEffect, useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { WarehouseGrid } from '@/components/WarehouseGrid'
import { RobotStatusCard } from '@/components/RobotStatusCard'
import { MetricsDashboard } from '@/components/MetricsDashboard'
import { TaskQueue } from '@/components/TaskQueue'
import { SimulationControls } from '@/components/SimulationControls'
import { CollisionMonitor, type CollisionEvent } from '@/components/CollisionMonitor'
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
  criticalAvoidances: 0
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

  const lastUpdateRef = useRef<number>(Date.now())
  const completionTimesRef = useRef<number[]>([])

  const safeRobots = robots || initialRobots
  const safeTasks = tasks || []
  const safeMetrics = metrics || initialMetrics

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

    setRobots((currentRobots = initialRobots) => {
      const updatedRobots = currentRobots.map(robot => {
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
        }
      }

      return updatedRobots
    })

    setTasks((currentTasks = []) => {
      const updatedTasks = currentTasks.map(task => {
        if (task.status === 'assigned') {
          task.status = 'in-progress'
        }
        
        if (task.status === 'completed' && task.completedAt && !task.assignedRobotId?.includes('processed')) {
          const completionTime = (task.completedAt - task.createdAt) / 1000
          completionTimesRef.current.push(completionTime)
          
          if (completionTimesRef.current.length > 20) {
            completionTimesRef.current.shift()
          }
          
          const avgTime = completionTimesRef.current.reduce((a, b) => a + b, 0) / 
                          completionTimesRef.current.length
          
          setMetrics((currentMetrics = initialMetrics) => ({
            ...currentMetrics,
            tasksCompleted: currentMetrics.tasksCompleted + 1,
            averageCompletionTime: avgTime
          }))

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
  }, [isRunning, speed, warehouse, assignTasks, setRobots, setTasks, setMetrics])

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
    completionTimesRef.current = []
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="simulation" className="space-y-6">
            <div className="grid lg:grid-cols-[1fr,320px] gap-6">
              <Card className="glass-panel p-6">
                <ScrollArea className="h-[600px]">
                  <div className="flex items-center justify-center">
                    <WarehouseGrid
                      warehouse={warehouse}
                      robots={safeRobots}
                      tasks={safeTasks}
                      cellSize={40}
                    />
                  </div>
                </ScrollArea>
              </Card>

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
            <MetricsDashboard metrics={safeMetrics} />

            <div className="grid lg:grid-cols-2 gap-6">
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

            <CollisionMonitor events={collisionEvents} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
