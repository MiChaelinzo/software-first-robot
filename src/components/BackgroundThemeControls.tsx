import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cpu, ClipboardText, MapTrifold } from '@phosphor-icons/react'
import type { BackgroundTheme } from './DynamicBackground'

interface BackgroundThemeControlsProps {
  currentTheme: BackgroundTheme
  onThemeChange: (theme: BackgroundTheme) => void
}

export function BackgroundThemeControls({ currentTheme, onThemeChange }: BackgroundThemeControlsProps) {
  const themes: Array<{
    id: BackgroundTheme
    label: string
    icon: React.ReactNode
    description: string
  }> = [
    {
      id: 'circuit-board',
      label: 'Circuit Board',
      icon: <Cpu size={24} weight="duotone" />,
      description: 'Digital circuit pathways with data flow visualization'
    },
    {
      id: 'warehouse-blueprint',
      label: 'Blueprint',
      icon: <ClipboardText size={24} weight="duotone" />,
      description: 'Technical warehouse floor plan with zone annotations'
    },
    {
      id: 'satellite-view',
      label: 'Satellite',
      icon: <MapTrifold size={24} weight="duotone" />,
      description: 'Aerial facility overview with vehicle tracking'
    }
  ]

  return (
    <Card className="glass-panel p-6">
      <h3 className="text-lg font-semibold mb-4">Background Theme</h3>
      <div className="space-y-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-300
              flex items-start gap-4 text-left
              ${
                currentTheme === theme.id
                  ? 'border-accent bg-accent/20 shadow-lg shadow-accent/20'
                  : 'border-border bg-card/30 hover:border-accent/50 hover:bg-card/50'
              }
            `}
          >
            <div
              className={`
                flex-shrink-0 p-2 rounded-lg transition-colors
                ${
                  currentTheme === theme.id
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {theme.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold mb-1">{theme.label}</div>
              <div className="text-sm text-muted-foreground">{theme.description}</div>
            </div>
            {currentTheme === theme.id && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Background themes are rendered in real-time using canvas animations for enhanced visual immersion.
        </p>
      </div>
    </Card>
  )
}
