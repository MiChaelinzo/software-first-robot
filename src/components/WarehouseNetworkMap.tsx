import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Warehouse, NetworkConnection, Robot } from '@/lib/types'
import { Buildings, ArrowsLeftRight, Robot as RobotIcon, MapPin } from '@phosphor-icons/react'

interface WarehouseNetworkMapProps {
  warehouses: Warehouse[]
  connections: NetworkConnection[]
  robots: Robot[]
  activeTransfers: number
  onWarehouseSelect: (warehouseId: string) => void
  selectedWarehouse?: string
}

export function WarehouseNetworkMap({
  warehouses,
  connections,
  robots,
  activeTransfers,
  onWarehouseSelect,
  selectedWarehouse
}: WarehouseNetworkMapProps) {
  const minX = Math.min(...warehouses.map(w => w.position.x))
  const maxX = Math.max(...warehouses.map(w => w.position.x))
  const minY = Math.min(...warehouses.map(w => w.position.y))
  const maxY = Math.max(...warehouses.map(w => w.position.y))

  const viewWidth = 800
  const viewHeight = 500
  const padding = 60

  const scaleX = (viewWidth - padding * 2) / (maxX - minX)
  const scaleY = (viewHeight - padding * 2) / (maxY - minY)
  const scale = Math.min(scaleX, scaleY)

  const toViewCoords = (x: number, y: number) => ({
    x: padding + (x - minX) * scale,
    y: padding + (y - minY) * scale
  })

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Buildings size={24} weight="duotone" className="text-accent" />
          <h3 className="text-xl font-bold">Warehouse Network</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">{warehouses.length} Facilities</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowsLeftRight size={16} className="text-primary" />
            <span className="text-muted-foreground">{activeTransfers} Transfers</span>
          </div>
        </div>
      </div>

      <div className="relative bg-muted/20 rounded-lg border border-border overflow-hidden">
        <svg
          width="100%"
          height={viewHeight}
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full"
        >
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.55 0.25 265)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="oklch(0.75 0.20 145)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="oklch(0.55 0.25 265)" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {connections.map(conn => {
            const w1 = warehouses.find(w => w.id === conn.warehouse1)
            const w2 = warehouses.find(w => w.id === conn.warehouse2)
            if (!w1 || !w2) return null

            const start = toViewCoords(w1.position.x, w1.position.y)
            const end = toViewCoords(w2.position.x, w2.position.y)

            const strokeWidth = 2 + conn.congestion * 4
            const opacity = 0.3 + conn.congestion * 0.5

            return (
              <g key={conn.id}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="url(#connectionGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray="5,5"
                  opacity={opacity}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;10"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </line>
                
                <text
                  x={(start.x + end.x) / 2}
                  y={(start.y + end.y) / 2 - 5}
                  fill="oklch(0.65 0.02 265)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {conn.transferTime}s
                </text>
              </g>
            )
          })}

          {warehouses.map(warehouse => {
            const pos = toViewCoords(warehouse.position.x, warehouse.position.y)
            const robotCount = robots.filter(r => r.warehouseId === warehouse.id).length
            const isSelected = selectedWarehouse === warehouse.id
            const radius = 25

            return (
              <g
                key={warehouse.id}
                onClick={() => onWarehouseSelect(warehouse.id)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius + 5}
                  fill={warehouse.color}
                  opacity={isSelected ? 0.3 : 0.1}
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="r"
                    values={`${radius + 5};${radius + 8};${radius + 5}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill="oklch(0.30 0.03 265)"
                  stroke={warehouse.color}
                  strokeWidth={isSelected ? 3 : 2}
                  filter="url(#glow)"
                />

                <text
                  x={pos.x}
                  y={pos.y - 35}
                  fill={warehouse.color}
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="var(--font-body)"
                >
                  {warehouse.name.split(' ')[0]}
                </text>

                {robotCount > 0 && (
                  <>
                    <circle
                      cx={pos.x + 15}
                      cy={pos.y - 15}
                      r="10"
                      fill="oklch(0.75 0.20 145)"
                      stroke="oklch(0.30 0.03 265)"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x + 15}
                      y={pos.y - 11}
                      fill="oklch(0.98 0 0)"
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                    >
                      {robotCount}
                    </text>
                  </>
                )}

                <text
                  x={pos.x}
                  y={pos.y + 45}
                  fill="oklch(0.65 0.02 265)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {warehouse.region}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {warehouses.map(warehouse => {
          const robotCount = robots.filter(r => r.warehouseId === warehouse.id).length
          const isSelected = selectedWarehouse === warehouse.id

          return (
            <button
              key={warehouse.id}
              onClick={() => onWarehouseSelect(warehouse.id)}
              className={`p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-card/50 hover:border-accent/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: warehouse.color }}
                  />
                  <span className="text-xs font-semibold">{warehouse.name.split(' ')[0]}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  <RobotIcon size={10} className="mr-1" />
                  {robotCount}
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin size={10} />
                {warehouse.region}
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
