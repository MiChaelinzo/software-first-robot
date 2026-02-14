import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Cube, Path, GridFour, Mouse, ArrowsOutCardinal, ArrowCounterClockwise, Hand } from '@phosphor-icons/react'

interface View3DControlsProps {
  showPaths: boolean
  showGrid: boolean
  onTogglePaths: (value: boolean) => void
  onToggleGrid: (value: boolean) => void
  onResetCamera?: () => void
}

export function View3DControls({
  showPaths,
  showGrid,
  onTogglePaths,
  onToggleGrid,
  onResetCamera
}: View3DControlsProps) {
  return (
    <Card className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cube size={20} weight="duotone" className="text-primary" />
          <h3 className="font-semibold">3D View Controls</h3>
        </div>
        {onResetCamera && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetCamera}
            className="h-7 px-2"
          >
            <ArrowCounterClockwise size={16} weight="duotone" />
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Path size={16} weight="duotone" className="text-muted-foreground" />
              <Label htmlFor="show-paths" className="text-sm cursor-pointer">
                Robot Paths
              </Label>
            </div>
            <Switch
              id="show-paths"
              checked={showPaths}
              onCheckedChange={onTogglePaths}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GridFour size={16} weight="duotone" className="text-muted-foreground" />
              <Label htmlFor="show-grid" className="text-sm cursor-pointer">
                Grid Lines
              </Label>
            </div>
            <Switch
              id="show-grid"
              checked={showGrid}
              onCheckedChange={onToggleGrid}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <Mouse size={14} weight="duotone" className="text-accent" />
              <span>Left drag to rotate camera</span>
            </div>
            <div className="flex items-center gap-2">
              <Hand size={14} weight="duotone" className="text-accent" />
              <span>Right drag to pan view</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowsOutCardinal size={14} weight="duotone" className="text-accent" />
              <span>Scroll to zoom in/out</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
