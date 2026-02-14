import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Package, Lightning, Fire, Target, Shuffle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Scenario {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  robotCount: number
  taskRate: 'low' | 'medium' | 'high' | 'extreme'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
}

interface ScenarioGeneratorProps {
  onApplyScenario: (scenario: Scenario) => void
  isRunning: boolean
}

const scenarios: Scenario[] = [
  {
    id: 'standard',
    name: 'Standard Operations',
    description: 'Balanced fleet with moderate task load. Perfect for testing core functionality.',
    icon: <Package size={20} weight="duotone" />,
    robotCount: 10,
    taskRate: 'medium',
    difficulty: 'easy'
  },
  {
    id: 'high-demand',
    name: 'Peak Hours',
    description: 'High task volume simulating warehouse rush periods with increased pressure.',
    icon: <Fire size={20} weight="duotone" />,
    robotCount: 10,
    taskRate: 'high',
    difficulty: 'medium'
  },
  {
    id: 'small-fleet',
    name: 'Resource Limited',
    description: 'Small fleet handling normal workload. Tests efficiency with limited resources.',
    icon: <Lightning size={20} weight="duotone" />,
    robotCount: 5,
    taskRate: 'medium',
    difficulty: 'medium'
  },
  {
    id: 'large-fleet',
    name: 'Full Capacity',
    description: 'Large fleet with extreme task volume. Maximum stress test for collision avoidance.',
    icon: <Target size={20} weight="duotone" />,
    robotCount: 15,
    taskRate: 'extreme',
    difficulty: 'hard'
  },
  {
    id: 'chaos',
    name: 'Chaos Mode',
    description: 'Maximum robots, extreme task rate, unpredictable conditions. Ultimate challenge.',
    icon: <Fire size={20} weight="fill" />,
    robotCount: 20,
    taskRate: 'extreme',
    difficulty: 'expert'
  }
]

export function ScenarioGenerator({ onApplyScenario, isRunning }: ScenarioGeneratorProps) {
  const handleApplyScenario = (scenario: Scenario) => {
    if (isRunning) {
      toast.error('Stop simulation first', {
        description: 'Pause or stop the current simulation before applying a new scenario'
      })
      return
    }

    onApplyScenario(scenario)
    toast.success(`Scenario Applied: ${scenario.name}`, {
      description: `${scenario.robotCount} robots, ${scenario.taskRate} task rate`
    })
  }

  const getDifficultyColor = (difficulty: Scenario['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success/20 text-success border-success/50'
      case 'medium':
        return 'bg-primary/20 text-primary border-primary/50'
      case 'hard':
        return 'bg-warning/20 text-warning border-warning/50'
      case 'expert':
        return 'bg-destructive/20 text-destructive border-destructive/50'
    }
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb size={20} weight="duotone" />
          Scenario Generator
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
            handleApplyScenario(randomScenario)
          }}
          disabled={isRunning}
        >
          <Shuffle size={16} weight="bold" className="mr-2" />
          Random
        </Button>
      </div>

      <div className="space-y-3">
        {scenarios.map(scenario => (
          <div
            key={scenario.id}
            className="p-4 rounded-lg bg-card/50 border border-border/50 hover:border-accent/50 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary group-hover:bg-accent/20 group-hover:text-accent transition-colors">
                {scenario.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{scenario.name}</h4>
                  <Badge variant="outline" className={`text-xs ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{scenario.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs">
                    <span className="text-muted-foreground">
                      Robots: <span className="font-mono font-semibold text-foreground">{scenario.robotCount}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Tasks: <span className="font-mono font-semibold text-foreground capitalize">{scenario.taskRate}</span>
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplyScenario(scenario)}
                    disabled={isRunning}
                    className="h-7 text-xs"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/30">
        <p className="text-xs text-muted-foreground">
          <strong className="text-accent-foreground">Tip:</strong> Start with Standard Operations to understand the system, 
          then progress to more challenging scenarios to test adaptive learning capabilities.
        </p>
      </div>
    </Card>
  )
}
