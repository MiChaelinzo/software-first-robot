import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Warning, ShieldCheck, Path } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

export interface CollisionEvent {
  id: string
  type: 'near-miss' | 'collision-avoided' | 'critical-avoidance'
  timestamp: number
  robotIds: string[]
  distance: number
  description: string
}

interface CollisionMonitorProps {
  events: CollisionEvent[]
}

export function CollisionMonitor({ events }: CollisionMonitorProps) {
  const getEventIcon = (type: CollisionEvent['type']) => {
    switch (type) {
      case 'critical-avoidance':
        return ShieldCheck
      case 'collision-avoided':
        return Path
      case 'near-miss':
        return Warning
    }
  }

  const getEventColor = (type: CollisionEvent['type']) => {
    switch (type) {
      case 'critical-avoidance':
        return 'destructive'
      case 'collision-avoided':
        return 'default'
      case 'near-miss':
        return 'secondary'
    }
  }

  const getEventLabel = (type: CollisionEvent['type']) => {
    switch (type) {
      case 'critical-avoidance':
        return 'CRITICAL'
      case 'collision-avoided':
        return 'AVOIDED'
      case 'near-miss':
        return 'NEAR-MISS'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = Math.floor((now - timestamp) / 1000)
    
    if (diff < 1) return 'just now'
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Collision Avoidance Monitor</h3>
        <Badge variant="outline" className="font-mono">
          {events.length} events
        </Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          <AnimatePresence mode="popLayout">
            {events.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground text-sm"
              >
                No collision events detected
              </motion.div>
            ) : (
              events.map((event) => {
                const Icon = getEventIcon(event.type)
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-accent/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${
                      event.type === 'critical-avoidance' ? 'bg-destructive/10' :
                      event.type === 'collision-avoided' ? 'bg-success/10' :
                      'bg-warning/10'
                    }`}>
                      <Icon 
                        size={16} 
                        weight="duotone" 
                        className={
                          event.type === 'critical-avoidance' ? 'text-destructive' :
                          event.type === 'collision-avoided' ? 'text-success' :
                          'text-warning'
                        }
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getEventColor(event.type)} className="text-xs">
                          {getEventLabel(event.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground mb-1">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Robots:</span>
                        {event.robotIds.map((id, idx) => (
                          <span key={id} className="font-mono text-accent">
                            {id.split('-')[1].toUpperCase()}
                            {idx < event.robotIds.length - 1 && ', '}
                          </span>
                        ))}
                        <span className="text-muted-foreground ml-2">
                          Distance: <span className="font-mono">{event.distance.toFixed(2)}</span>u
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}
