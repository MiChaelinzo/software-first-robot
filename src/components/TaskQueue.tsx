import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Task } from '@/lib/types'
import { Package, Truck, Scan, Lightning, Trash } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskQueueProps {
  tasks: Task[]
  onDeleteTask?: (taskId: string) => void
}

export function TaskQueue({ tasks, onDeleteTask }: TaskQueueProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'pickup':
        return Package
      case 'delivery':
        return Truck
      case 'scan':
        return Scan
      case 'recharge':
        return Lightning
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground'
      case 'high':
        return 'bg-warning text-accent-foreground'
      case 'medium':
        return 'bg-accent text-accent-foreground'
      case 'low':
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success border-success/40'
      case 'in-progress':
        return 'bg-accent/20 text-accent border-accent/40'
      case 'assigned':
        return 'bg-primary/20 text-primary border-primary/40'
      case 'failed':
        return 'bg-destructive/20 text-destructive border-destructive/40'
      default:
        return 'bg-muted/20 text-muted-foreground border-border'
    }
  }

  if (tasks.length === 0) {
    return (
      <Card className="glass-panel p-8 text-center">
        <Package size={48} className="mx-auto mb-3 text-muted-foreground/40" weight="duotone" />
        <p className="text-sm text-muted-foreground">No tasks in queue</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {sortedTasks.map((task, index) => {
          const Icon = getTaskIcon(task.type) || Package
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className={`glass-panel p-4 border ${getStatusColor(task.status)}`}>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <Icon size={24} weight="duotone" className="text-foreground/70" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                      <span>Pos: ({task.position.x}, {task.position.y})</span>
                      {task.assignedRobotId && (
                        <span className="text-accent">
                          Robot: {task.assignedRobotId.split('-')[1].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {onDeleteTask && task.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
