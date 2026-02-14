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
import { VoiceCommandPanel } from '@/components/VoiceCommandPanel'
import { VoiceIndicator } from '@/components/VoiceIndicator'
import { VoiceFeedbackSettings } from '@/components/VoiceFeedbackSettings'
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
import { useVoiceCommands, type VoiceCommand } from '@/hooks/use-voice-commands'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'
import { useAudioCues } from '@/hooks/use-audio-cues'
import { AudioSettingsPanel } from '@/components/AudioSettingsPanel'
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
  
  const [recentVoiceCommands, setRecentVoiceCommands] = useState<Array<{ command: string; transcript: string; timestamp: number }>>([])
  
  const [ttsEnabled, setTtsEnabled] = useKV<boolean>('tts_enabled', true)
  const [ttsRate, setTtsRate] = useKV<number>('tts_rate', 1.1)
  const [ttsPitch, setTtsPitch] = useKV<number>('tts_pitch', 1.0)
  const [ttsVolume, setTtsVolume] = useKV<number>('tts_volume', 0.9)
  
  const {
    speak,
    cancel: cancelSpeech,
    isSupported: isTtsSupported,
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice
  } = useTextToSpeech({
    enabled: ttsEnabled || true,
    rate: ttsRate || 1.1,
    pitch: ttsPitch || 1.0,
    volume: ttsVolume || 0.9
  })

  const {
    playAudioCue,
    settings: audioSettings,
    updateSettings: updateAudioSettings,
    isSupported: isAudioSupported
  } = useAudioCues()

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

  const voiceCommands: VoiceCommand[] = useMemo(() => [
    {
      command: 'start simulation',
      action: () => {
        setIsRunning(true)
        playAudioCue('simulation_start')
        speak('Simulation started')
        toast.success('Voice command: Simulation started')
      },
      patterns: [/start simulation/i, /start the simulation/i, /begin simulation/i, /play/i],
      description: 'Start the warehouse simulation',
      category: 'simulation'
    },
    {
      command: 'stop simulation',
      action: () => {
        setIsRunning(false)
        playAudioCue('simulation_stop')
        speak('Simulation paused')
        toast.success('Voice command: Simulation paused')
      },
      patterns: [/stop simulation/i, /stop the simulation/i, /pause simulation/i, /pause/i],
      description: 'Pause the warehouse simulation',
      category: 'simulation'
    },
    {
      command: 'reset simulation',
      action: () => {
        handleStop()
        speak('Simulation reset complete')
        toast.success('Voice command: Simulation reset')
      },
      patterns: [/reset simulation/i, /reset the simulation/i, /restart simulation/i, /clear all/i],
      description: 'Reset the simulation to initial state',
      category: 'simulation'
    },
    {
      command: 'add task',
      action: () => {
        handleAddTask()
        speak('Task added to queue')
      },
      patterns: [/add task/i, /add a task/i, /create task/i, /new task/i, /add new task/i],
      description: 'Add a new task to the queue',
      category: 'task'
    },
    {
      command: 'add five tasks',
      action: () => {
        for (let i = 0; i < 5; i++) {
          handleAddTask()
        }
        speak('Added 5 tasks to the queue')
        toast.success('Voice command: Added 5 tasks')
      },
      patterns: [/add five tasks/i, /add 5 tasks/i, /create five tasks/i, /create 5 tasks/i],
      description: 'Add 5 tasks at once',
      category: 'task'
    },
    {
      command: 'increase speed',
      action: () => {
        setSpeed(prev => {
          const newSpeed = Math.min(prev + 0.5, 5)
          speak(`Speed increased to ${newSpeed.toFixed(1)}x`)
          toast.success(`Voice command: Speed increased to ${newSpeed}x`)
          return newSpeed
        })
      },
      patterns: [/increase speed/i, /speed up/i, /faster/i, /go faster/i],
      description: 'Increase simulation speed',
      category: 'simulation'
    },
    {
      command: 'decrease speed',
      action: () => {
        setSpeed(prev => {
          const newSpeed = Math.max(prev - 0.5, 0.5)
          speak(`Speed decreased to ${newSpeed.toFixed(1)}x`)
          toast.success(`Voice command: Speed decreased to ${newSpeed}x`)
          return newSpeed
        })
      },
      patterns: [/decrease speed/i, /slow down/i, /slower/i, /go slower/i],
      description: 'Decrease simulation speed',
      category: 'simulation'
    },
    {
      command: 'normal speed',
      action: () => {
        setSpeed(1)
        speak('Speed set to normal')
        toast.success('Voice command: Speed set to 1x')
      },
      patterns: [/normal speed/i, /default speed/i, /regular speed/i, /reset speed/i],
      description: 'Set speed to 1x',
      category: 'simulation'
    },
    {
      command: 'show three d view',
      action: () => {
        const tabsList = document.querySelector('[role="tablist"]')
        const threeDTab = Array.from(tabsList?.querySelectorAll('[role="tab"]') || [])
          .find(tab => tab.textContent?.includes('3D View'))
        if (threeDTab instanceof HTMLElement) {
          threeDTab.click()
          speak('Switched to 3D view')
          toast.success('Voice command: Switched to 3D view')
        }
      },
      patterns: [/show three d view/i, /show 3d view/i, /three d view/i, /switch to three d/i, /switch to 3d/i],
      description: 'Switch to 3D warehouse view',
      category: 'view'
    },
    {
      command: 'show two d view',
      action: () => {
        const tabsList = document.querySelector('[role="tablist"]')
        const twoDTab = Array.from(tabsList?.querySelectorAll('[role="tab"]') || [])
          .find(tab => tab.textContent?.includes('2D View'))
        if (twoDTab instanceof HTMLElement) {
          twoDTab.click()
          speak('Switched to 2D view')
          toast.success('Voice command: Switched to 2D view')
        }
      },
      patterns: [/show two d view/i, /show 2d view/i, /two d view/i, /switch to two d/i, /switch to 2d/i],
      description: 'Switch to 2D warehouse view',
      category: 'view'
    },
    {
      command: 'show analytics',
      action: () => {
        const tabsList = document.querySelector('[role="tablist"]')
        const analyticsTab = Array.from(tabsList?.querySelectorAll('[role="tab"]') || [])
          .find(tab => tab.textContent?.includes('Analytics'))
        if (analyticsTab instanceof HTMLElement) {
          analyticsTab.click()
          speak('Showing analytics')
          toast.success('Voice command: Switched to analytics')
        }
      },
      patterns: [/show analytics/i, /view analytics/i, /analytics view/i, /show statistics/i, /show stats/i],
      description: 'Switch to analytics view',
      category: 'view'
    },
    {
      command: 'optimize system',
      action: () => {
        if (!isOptimizing) {
          handleAIOptimize()
          playAudioCue('optimization_complete')
          speak('Running system optimization')
        }
      },
      patterns: [/optimize system/i, /optimize/i, /run optimization/i, /a i optimize/i, /ai optimize/i],
      description: 'Run AI optimization analysis',
      category: 'simulation'
    },
    {
      command: 'toggle heat trails',
      action: () => {
        setShowHeatTrails(prev => {
          const newState = !prev
          speak(newState ? 'Heat trails enabled' : 'Heat trails disabled')
          toast.success(`Voice command: Heat trails ${newState ? 'enabled' : 'disabled'}`)
          return newState
        })
      },
      patterns: [/toggle heat trails/i, /show heat trails/i, /hide heat trails/i, /heat trails/i],
      description: 'Toggle heat trail visualization',
      category: 'view'
    },
    {
      command: 'toggle congestion zones',
      action: () => {
        setShowCongestionZones(prev => {
          const newState = !prev
          speak(newState ? 'Congestion zones enabled' : 'Congestion zones disabled')
          toast.success(`Voice command: Congestion zones ${newState ? 'enabled' : 'disabled'}`)
          return newState
        })
      },
      patterns: [/toggle congestion/i, /show congestion/i, /hide congestion/i, /congestion zones/i],
      description: 'Toggle congestion zone visualization',
      category: 'view'
    },
    {
      command: 'enable voice feedback',
      action: () => {
        setTtsEnabled(true)
        speak('Voice feedback enabled')
        toast.success('Voice command: Voice feedback enabled')
      },
      patterns: [/enable voice feedback/i, /turn on voice feedback/i, /voice feedback on/i],
      description: 'Enable text-to-speech voice feedback',
      category: 'view'
    },
    {
      command: 'disable voice feedback',
      action: () => {
        setTtsEnabled(false)
        toast.success('Voice command: Voice feedback disabled')
      },
      patterns: [/disable voice feedback/i, /turn off voice feedback/i, /voice feedback off/i, /mute voice/i],
      description: 'Disable text-to-speech voice feedback',
      category: 'view'
    },
    {
      command: 'status report',
      action: () => {
        const activeRobots = safeRobots.filter(r => r.status === 'moving').length
        const pendingTasks = safeTasks.filter(t => t.status === 'pending').length
        speak(`Status report. ${activeRobots} of ${safeRobots.length} robots active. ${pendingTasks} pending tasks. Simulation is ${isRunning ? 'running' : 'stopped'}.`)
        toast.success('Voice command: Status report')
      },
      patterns: [/status report/i, /system status/i, /give me a status/i, /what's the status/i],
      description: 'Get a spoken status report',
      category: 'view'
    },
    ...Array.from({ length: 10 }, (_, i) => {
      const robotNum = i + 1
      const robotId = `robot-${String(robotNum).padStart(2, '0')}`
      return {
        command: `pause robot ${robotNum}`,
        action: () => {
          handleRobotPause(robotId)
          speak(`Robot ${robotNum} paused`)
          toast.success(`Voice command: Paused robot ${robotNum}`)
        },
        patterns: [
          new RegExp(`pause robot ${robotNum}`, 'i'),
          new RegExp(`pause robot number ${robotNum}`, 'i'),
          new RegExp(`stop robot ${robotNum}`, 'i')
        ],
        description: `Pause robot ${robotNum}`,
        category: 'robot' as const
      }
    }),
    ...Array.from({ length: 10 }, (_, i) => {
      const robotNum = i + 1
      const robotId = `robot-${String(robotNum).padStart(2, '0')}`
      return {
        command: `resume robot ${robotNum}`,
        action: () => {
          handleRobotResume(robotId)
          speak(`Robot ${robotNum} resumed`)
          toast.success(`Voice command: Resumed robot ${robotNum}`)
        },
        patterns: [
          new RegExp(`resume robot ${robotNum}`, 'i'),
          new RegExp(`resume robot number ${robotNum}`, 'i'),
          new RegExp(`start robot ${robotNum}`, 'i')
        ],
        description: `Resume robot ${robotNum}`,
        category: 'robot' as const
      }
    })
  ], [isOptimizing, speak, safeRobots, safeTasks, isRunning, setTtsEnabled, playAudioCue])

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    toggleListening
  } = useVoiceCommands({
    commands: voiceCommands,
    onCommandRecognized: (command, transcriptText) => {
      setRecentVoiceCommands(prev => [
        { command, transcript: transcriptText, timestamp: Date.now() },
        ...prev
      ].slice(0, 10))
    },
    onError: (error) => {
      toast.error('Voice command error', {
        description: error
      })
    }
  })

  useEffect(() => {
    if (isListening && ttsEnabled) {
      speak('Voice control activated. I am ready for your commands.', true)
    }
  }, [isListening])

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
              playAudioCue('collision_critical')
              
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
            } else if (event.type === 'near-miss') {
              playAudioCue('collision_near_miss')
            } else if (event.type === 'collision-avoided') {
              playAudioCue('collision_avoided')
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
          playAudioCue('task_assigned')
          
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
          playAudioCue('task_completed')
          
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
  }, [isRunning, speed, warehouse, assignTasks, setRobots, setTasks, setMetrics, congestionSystem, heatTrailSystem, safeRobots, playAudioCue])

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
      <VoiceIndicator isListening={isListening} interimTranscript={interimTranscript} isSpeaking={isSpeaking} />
      
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
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="simulation">2D View</TabsTrigger>
            <TabsTrigger value="3d">3D View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="voice">Voice Control</TabsTrigger>
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

          <TabsContent value="voice" className="space-y-6">
            <div className="grid lg:grid-cols-[1fr,400px] gap-6">
              <div className="space-y-6">
                <Card className="glass-panel p-6">
                  <h3 className="text-xl font-bold mb-4">Voice Control Demo</h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Control your warehouse simulation using natural voice commands. 
                      Click "Start" in the Voice Commands panel to begin listening.
                    </p>
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <h4 className="font-semibold text-accent mb-2">Quick Start:</h4>
                      <ol className="space-y-2 list-decimal list-inside">
                        <li>Click "Start" to activate voice recognition</li>
                        <li>Speak clearly: "Start simulation"</li>
                        <li>Try: "Add task" or "Increase speed"</li>
                        <li>Control individual robots: "Pause robot 1"</li>
                        <li>Switch views: "Show analytics"</li>
                      </ol>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-lg bg-card/50">
                        <h4 className="font-semibold mb-2">Example Commands:</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• "Start simulation"</li>
                          <li>• "Add five tasks"</li>
                          <li>• "Increase speed"</li>
                          <li>• "Show 3D view"</li>
                          <li>• "Toggle heat trails"</li>
                          <li>• "Pause robot 3"</li>
                          <li>• "Resume robot 3"</li>
                          <li>• "Optimize system"</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-card/50">
                        <h4 className="font-semibold mb-2">Tips for Best Results:</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• Speak clearly and naturally</li>
                          <li>• Minimize background noise</li>
                          <li>• Wait for command confirmation</li>
                          <li>• Commands are case-insensitive</li>
                          <li>• Works in Chrome, Edge, Safari</li>
                          <li>• Allow microphone permissions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4">Current Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Simulation</span>
                        <span className={`font-semibold ${isRunning ? 'text-accent' : 'text-muted-foreground'}`}>
                          {isRunning ? 'Running' : 'Stopped'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Speed</span>
                        <span className="font-semibold font-mono">{speed}x</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Active Robots</span>
                        <span className="font-semibold text-accent">
                          {safeRobots.filter(r => r.status === 'moving').length}/{safeRobots.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Pending Tasks</span>
                        <span className="font-semibold">{safeTasks.filter(t => t.status === 'pending').length}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="glass-panel p-6">
                    <h3 className="text-lg font-semibold mb-4">Voice Recognition</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className={`font-semibold ${isListening ? 'text-accent' : 'text-muted-foreground'}`}>
                          {isListening ? 'Listening' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Supported</span>
                        <span className={`font-semibold ${isSupported ? 'text-success' : 'text-destructive'}`}>
                          {isSupported ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Commands Executed</span>
                        <span className="font-semibold font-mono">{recentVoiceCommands.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Available Commands</span>
                        <span className="font-semibold font-mono">{voiceCommands.length}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <VoiceFeedbackSettings
                  enabled={ttsEnabled || true}
                  rate={ttsRate || 1.1}
                  pitch={ttsPitch || 1.0}
                  volume={ttsVolume || 0.9}
                  voices={voices}
                  selectedVoice={selectedVoice}
                  isSpeaking={isSpeaking}
                  onEnabledChange={(enabled) => setTtsEnabled(enabled)}
                  onRateChange={(rate) => setTtsRate(rate)}
                  onPitchChange={(pitch) => setTtsPitch(pitch)}
                  onVolumeChange={(volume) => setTtsVolume(volume)}
                  onVoiceChange={setSelectedVoice}
                  onTest={() => speak('Voice feedback is working correctly. All systems operational.')}
                />

                <AudioSettingsPanel
                  enabled={audioSettings.enabled}
                  volume={audioSettings.volume}
                  isSupported={isAudioSupported}
                  onEnabledChange={(enabled) => updateAudioSettings({ enabled })}
                  onVolumeChange={(volume) => updateAudioSettings({ volume })}
                  onTest={() => {
                    playAudioCue('collision_critical')
                    setTimeout(() => playAudioCue('task_completed'), 400)
                  }}
                />
              </div>

              <VoiceCommandPanel
                isListening={isListening}
                isSupported={isSupported}
                transcript={transcript}
                interimTranscript={interimTranscript}
                onToggle={toggleListening}
                commands={voiceCommands}
                recentCommands={recentVoiceCommands}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
