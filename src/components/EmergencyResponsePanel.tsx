import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Emergency, EmergencyType } from '@/lib/emergency-response'
import { 
  Fire, 
  Warning, 
  FirstAid, 
  ShieldCheck,
  X,
  CheckCircle,
  ClockCounterClockwise
} from '@phosphor-icons/react'

interface EmergencyResponsePanelProps {
  emergencies: Emergency[]
  onTriggerEmergency: (type: EmergencyType, severity: Emergency['severity']) => void
  onResolveEmergency: (id: string) => void
  metrics: {
    activeEmergencies: number
    totalResolved: number
    averageResponseTime: number
    criticalEmergencies: number
    evacuationZones: number
  }
  isRunning: boolean
}

export function EmergencyResponsePanel({
  emergencies,
  onTriggerEmergency,
  onResolveEmergency,
  metrics,
  isRunning
}: EmergencyResponsePanelProps) {
  const getSeverityColor = (severity: Emergency['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30'
    }
  }

  const getEmergencyIcon = (type: EmergencyType) => {
    switch (type) {
      case 'fire': return <Fire size={20} weight="duotone" className="text-red-400" />
      case 'chemical-spill': return <Warning size={20} weight="duotone" className="text-yellow-400" />
      case 'structural-damage': return <Warning size={20} weight="duotone" className="text-orange-400" />
      case 'power-outage': return <Warning size={20} weight="duotone" className="text-blue-400" />
      case 'robot-malfunction': return <Warning size={20} weight="duotone" className="text-purple-400" />
      case 'unauthorized-access': return <ShieldCheck size={20} weight="duotone" className="text-red-400" />
    }
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FirstAid size={24} weight="duotone" className="text-destructive" />
          <h3 className="text-lg font-semibold">Emergency Response System</h3>
        </div>
        {metrics.activeEmergencies > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {metrics.activeEmergencies} Active
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">Active</div>
          <div className="text-2xl font-bold text-destructive">{metrics.activeEmergencies}</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">Resolved</div>
          <div className="text-2xl font-bold text-success">{metrics.totalResolved}</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">Response Time</div>
          <div className="text-2xl font-bold font-mono">{metrics.averageResponseTime.toFixed(1)}s</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">Critical</div>
          <div className="text-2xl font-bold text-destructive">{metrics.criticalEmergencies}</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-3">Trigger Emergency (Testing)</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onTriggerEmergency('fire', 'high')}
            disabled={!isRunning}
          >
            <Fire size={16} className="mr-2" />
            Fire
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTriggerEmergency('chemical-spill', 'medium')}
            disabled={!isRunning}
          >
            <Warning size={16} className="mr-2" />
            Spill
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTriggerEmergency('power-outage', 'critical')}
            disabled={!isRunning}
          >
            <Warning size={16} className="mr-2" />
            Power Out
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTriggerEmergency('robot-malfunction', 'low')}
            disabled={!isRunning}
          >
            <Warning size={16} className="mr-2" />
            Malfunction
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Active Emergencies</h4>
        <ScrollArea className="h-[300px]">
          {emergencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle size={32} className="mx-auto mb-2 text-success" />
              <p className="text-sm">All systems operational</p>
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {emergencies.map((emergency) => (
                <div
                  key={emergency.id}
                  className="p-4 rounded-lg border bg-card/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEmergencyIcon(emergency.type)}
                      <span className="font-semibold capitalize">
                        {emergency.type.replace('-', ' ')}
                      </span>
                    </div>
                    <Badge className={getSeverityColor(emergency.severity)}>
                      {emergency.severity}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-3">
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-mono">
                        ({emergency.position.x}, {emergency.position.y})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Radius:</span>
                      <span className="font-mono">{emergency.radius} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Affected Robots:</span>
                      <span className="font-mono">{emergency.affectedRobots.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Actions:</span>
                      <span className="font-mono">{emergency.responseActions.length}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onResolveEmergency(emergency.id)}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  )
}
