import { Card } from '@/components/ui/card'
import type { PerformanceMetrics } from '@/lib/types'
import { CheckCircle, Clock, Package, Gauge, ArrowsClockwise, Path } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface MetricsDashboardProps {
  metrics: PerformanceMetrics
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const metricCards = [
    {
      label: 'Tasks Completed',
      value: metrics.tasksCompleted,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'In Progress',
      value: metrics.tasksInProgress,
      icon: ArrowsClockwise,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Pending Tasks',
      value: metrics.tasksPending,
      icon: Package,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Avg. Time (s)',
      value: metrics.averageCompletionTime.toFixed(1),
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Robot Utilization',
      value: `${Math.round(metrics.robotUtilization)}%`,
      icon: Gauge,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Collisions Avoided',
      value: metrics.collisionsAvoided,
      icon: Path,
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {metricCards.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="metric-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon size={20} weight="duotone" className={metric.color} />
              </div>
            </div>
            <div className="space-y-1">
              <motion.div
                key={metric.value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`text-2xl font-bold font-mono ${metric.color}`}
              >
                {metric.value}
              </motion.div>
              <div className="text-xs text-muted-foreground tracking-wide uppercase">
                {metric.label}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
