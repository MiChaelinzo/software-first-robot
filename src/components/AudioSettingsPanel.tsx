import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'

interface AudioSettingsPanelProps {
  enabled: boolean
  volume: number
  isSupported: boolean
  onEnabledChange: (enabled: boolean) => void
  onVolumeChange: (volume: number) => void
  onTest: () => void
}

export function AudioSettingsPanel({
  enabled,
  volume,
  isSupported,
  onEnabledChange,
  onVolumeChange,
  onTest
}: AudioSettingsPanelProps) {
  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {enabled ? (
            <SpeakerHigh size={24} weight="duotone" className="text-accent" />
          ) : (
            <SpeakerSlash size={24} weight="duotone" className="text-muted-foreground" />
          )}
          <div>
            <h3 className="text-lg font-semibold">Audio Settings</h3>
            <p className="text-xs text-muted-foreground">Sound effects for events</p>
          </div>
        </div>
        {isSupported ? (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            Supported
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            Not Supported
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable Audio Cues</p>
            <p className="text-xs text-muted-foreground">
              Play sounds for collisions and events
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            disabled={!isSupported}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Volume</p>
            <span className="text-xs font-mono text-muted-foreground">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <Slider
            value={[volume]}
            onValueChange={([v]) => onVolumeChange(v)}
            min={0}
            max={1}
            step={0.05}
            disabled={!enabled || !isSupported}
            className="w-full"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onTest}
          disabled={!enabled || !isSupported}
          className="w-full"
        >
          <SpeakerHigh size={16} weight="duotone" />
          Test Audio
        </Button>

        <div className="p-4 rounded-lg bg-muted/30 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Audio Events
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span>Critical Collision</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Near Miss</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Collision Avoided</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Task Assigned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Task Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-charging" />
              <span>Charging</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
