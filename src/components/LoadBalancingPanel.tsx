import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Lightbulb, ArrowRight, CheckCircle } from '@phosphor-icons/react'

interface LoadBalancingPanelProps {
  suggestions: Array<{
    robotId: string
    from: string
    to: string
    reason: string
  }>
  onApplySuggestion: (robotId: string, targetWarehouseId: string) => void
  warehouses: Array<{ id: string; name: string; color: string }>
  isRunning: boolean
}

export function LoadBalancingPanel({
  suggestions,
  onApplySuggestion,
  warehouses,
  isRunning
}: LoadBalancingPanelProps) {
  const getWarehouseName = (id: string) => {
    return warehouses.find(w => w.id === id)?.name || id
  }

  const getWarehouseColor = (id: string) => {
    return warehouses.find(w => w.id === id)?.color || 'oklch(0.75 0.20 145)'
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={24} weight="duotone" className="text-warning" />
        <h3 className="text-xl font-bold">Load Balancing Recommendations</h3>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <CheckCircle size={48} className="text-success" weight="duotone" />
              <div>
                <p className="font-semibold text-success">Network Balanced</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All warehouses are operating within optimal capacity
                </p>
              </div>
            </div>
          ) : (
            suggestions.map((suggestion, idx) => {
              const fromName = getWarehouseName(suggestion.from)
              const toName = getWarehouseName(suggestion.to)
              const fromColor = getWarehouseColor(suggestion.from)
              const toColor = getWarehouseColor(suggestion.to)

              return (
                <div
                  key={`${suggestion.robotId}-${idx}`}
                  className="p-4 rounded-lg border border-border bg-card/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {suggestion.robotId}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Recommendation {idx + 1}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: fromColor }}
                          />
                          <span className="text-sm font-medium">{fromName}</span>
                        </div>
                        <ArrowRight size={16} className="text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: toColor }}
                          />
                          <span className="text-sm font-medium">{toName}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {suggestion.reason}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => onApplySuggestion(suggestion.robotId, suggestion.to)}
                    disabled={!isRunning}
                    size="sm"
                    className="w-full"
                  >
                    <CheckCircle size={14} className="mr-2" />
                    Apply Transfer
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
        <div className="flex items-start gap-2">
          <Lightbulb size={16} className="text-warning mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-warning">About Load Balancing</p>
            <p className="text-muted-foreground">
              The system analyzes robot distribution and suggests transfers to optimize
              warehouse capacity and improve overall network efficiency.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
