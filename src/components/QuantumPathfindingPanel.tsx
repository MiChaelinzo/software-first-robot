import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Atom, Lightning, CirclesThreePlus, TrendUp } from '@phosphor-icons/react'

interface QuantumPathfindingPanelProps {
  activeSuperpositions: number
  entanglementPairs: number
  coherenceTime: number
  quantumAdvantage: number
  isActive: boolean
}

export function QuantumPathfindingPanel({
  activeSuperpositions,
  entanglementPairs,
  coherenceTime,
  quantumAdvantage,
  isActive
}: QuantumPathfindingPanelProps) {
  const advantagePercent = Math.min((quantumAdvantage - 0.5) * 200, 100)

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Atom size={24} weight="duotone" className="text-accent" />
          <h3 className="text-lg font-semibold">Quantum Pathfinding</h3>
        </div>
        {isActive && (
          <Badge variant="default" className="bg-accent text-accent-foreground">
            Active
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <CirclesThreePlus size={16} />
              Quantum Superpositions
            </span>
            <span className="font-mono font-semibold">{activeSuperpositions}</span>
          </div>
          <Progress value={(activeSuperpositions / 20) * 100} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Lightning size={16} />
              Entanglement Pairs
            </span>
            <span className="font-mono font-semibold">{entanglementPairs}</span>
          </div>
          <Progress value={(entanglementPairs / 10) * 100} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendUp size={16} />
              Quantum Advantage
            </span>
            <span className="font-mono font-semibold text-accent">
              {quantumAdvantage.toFixed(2)}x
            </span>
          </div>
          <Progress value={advantagePercent} className="h-2" />
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Coherence Time</span>
            <span className="font-mono">{coherenceTime}ms</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Quantum-inspired algorithms explore multiple path possibilities simultaneously,
            finding optimal routes faster than classical methods.
          </p>
        </div>
      </div>
    </Card>
  )
}
