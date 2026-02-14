import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartLine, TrendUp } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

interface PerformanceGraphProps {
  metrics: {
    tasksCompleted: number
    robotUtilization: number
    averageCompletionTime: number
    efficiencyGain: number
    collisionsAvoided: number
  }
  isRunning: boolean
}

interface DataPoint {
  timestamp: number
  tasksCompleted: number
  utilization: number
  completionTime: number
  efficiency: number
}

export function PerformanceGraph({ metrics, isRunning }: PerformanceGraphProps) {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const maxPoints = 60

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setDataPoints(prev => {
        const newPoint: DataPoint = {
          timestamp: Date.now(),
          tasksCompleted: metrics.tasksCompleted,
          utilization: metrics.robotUtilization,
          completionTime: metrics.averageCompletionTime,
          efficiency: metrics.efficiencyGain
        }
        return [...prev, newPoint].slice(-maxPoints)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, metrics])

  const renderGraph = () => {
    if (dataPoints.length < 2) {
      return (
        <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
          Collecting performance data...
        </div>
      )
    }

    const width = 600
    const height = 200
    const padding = 40

    const maxTasks = Math.max(...dataPoints.map(d => d.tasksCompleted), 10)
    const maxUtil = 100
    const maxTime = Math.max(...dataPoints.map(d => d.completionTime), 20)

    const xScale = (index: number) =>
      padding + (index / (maxPoints - 1)) * (width - padding * 2)
    
    const yScaleTasks = (value: number) =>
      height - padding - ((value / maxTasks) * (height - padding * 2))
    
    const yScaleUtil = (value: number) =>
      height - padding - ((value / maxUtil) * (height - padding * 2))

    const taskPath = dataPoints
      .map((point, i) => {
        const x = xScale(i)
        const y = yScaleTasks(point.tasksCompleted)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')

    const utilPath = dataPoints
      .map((point, i) => {
        const x = xScale(i)
        const y = yScaleUtil(point.utilization)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')

    return (
      <svg width={width} height={height} className="w-full">
        <defs>
          <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.75 0.20 145)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.75 0.20 145)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="utilGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.75 0.20 265)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.75 0.20 265)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="oklch(0.40 0.05 265)"
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="oklch(0.40 0.05 265)"
          strokeWidth="1"
        />

        {[0, 25, 50, 75, 100].map(tick => {
          const y = yScaleUtil(tick)
          return (
            <g key={tick}>
              <line
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="oklch(0.40 0.05 265)"
                strokeWidth="0.5"
                strokeDasharray="4 4"
                opacity="0.3"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="oklch(0.65 0.02 265)"
              >
                {tick}
              </text>
            </g>
          )
        })}

        <path
          d={`${taskPath} L ${xScale(dataPoints.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="url(#taskGradient)"
        />
        <path
          d={taskPath}
          fill="none"
          stroke="oklch(0.75 0.20 145)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={`${utilPath} L ${xScale(dataPoints.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="url(#utilGradient)"
        />
        <path
          d={utilPath}
          fill="none"
          stroke="oklch(0.75 0.20 265)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize="12"
          fill="oklch(0.65 0.02 265)"
        >
          Time (last {maxPoints} seconds)
        </text>

        <text
          x={10}
          y={20}
          fontSize="12"
          fill="oklch(0.65 0.02 265)"
          transform={`rotate(-90, 10, 20)`}
        >
          Performance Metrics
        </text>
      </svg>
    )
  }

  const latestPoint = dataPoints[dataPoints.length - 1]
  const firstPoint = dataPoints[0]
  const tasksDelta = latestPoint && firstPoint ? latestPoint.tasksCompleted - firstPoint.tasksCompleted : 0
  const utilDelta = latestPoint && firstPoint ? latestPoint.utilization - firstPoint.utilization : 0

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ChartLine size={20} weight="duotone" />
          Real-Time Performance
        </h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-accent/50">
            <div className="w-2 h-2 rounded-full bg-accent mr-1.5" />
            Tasks
          </Badge>
          <Badge variant="outline" className="border-primary/50">
            <div className="w-2 h-2 rounded-full bg-primary mr-1.5" />
            Utilization
          </Badge>
        </div>
      </div>

      {renderGraph()}

      {latestPoint && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Tasks Delta</span>
              {tasksDelta > 0 && <TrendUp size={14} weight="bold" className="text-success" />}
            </div>
            <div className="text-xl font-bold font-mono text-accent">
              +{tasksDelta}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Utilization</span>
            </div>
            <div className="text-xl font-bold font-mono text-primary">
              {latestPoint.utilization.toFixed(0)}%
            </div>
          </div>
          <div className="p-3 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Efficiency</span>
            </div>
            <div className="text-xl font-bold font-mono text-success">
              +{latestPoint.efficiency.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
