import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BatteryCharging, Lightning, ChargingStation, TrendUp } from '@phosphor-icons/react'
import type { EnergyProfile } from '@/lib/energy-optimizer'

interface EnergyManagementDashboardProps {
  energyProfiles: EnergyProfile[]
  fleetEfficiency: {
    overallEfficiency: number
    averageBattery: number
    energyWaste: number
    utilizationScore: number
  }
  chargingStations: Array<{
    id: string
    currentLoad: number
    capacity: number
    queue: string[]
    utilizationPercent: number
  }>
  energyPrediction: {
    totalEnergyNeeded: number
    robotsNeedingCharge: number
    chargingBottlenecks: string[]
    recommendations: string[]
  }
}

export function EnergyManagementDashboard({
  energyProfiles,
  fleetEfficiency,
  chargingStations,
  energyPrediction
}: EnergyManagementDashboardProps) {
  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-destructive'
  }

  const getBatteryColor = (battery: number) => {
    if (battery >= 60) return 'text-success'
    if (battery >= 30) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <div className="space-y-6">
      <Card className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/20">
            <BatteryCharging size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Energy Management</h3>
            <p className="text-sm text-muted-foreground">
              Fleet power optimization & charging intelligence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Fleet Efficiency</span>
              <TrendUp size={18} className={getEfficiencyColor(fleetEfficiency.overallEfficiency)} />
            </div>
            <div className={`text-3xl font-bold font-mono ${getEfficiencyColor(fleetEfficiency.overallEfficiency)}`}>
              {fleetEfficiency.overallEfficiency.toFixed(0)}%
            </div>
            <Progress value={fleetEfficiency.overallEfficiency} className="h-2 mt-2" />
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg Battery</span>
              <BatteryCharging size={18} className={getBatteryColor(fleetEfficiency.averageBattery)} />
            </div>
            <div className={`text-3xl font-bold font-mono ${getBatteryColor(fleetEfficiency.averageBattery)}`}>
              {fleetEfficiency.averageBattery.toFixed(0)}%
            </div>
            <Progress value={fleetEfficiency.averageBattery} className="h-2 mt-2" />
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Energy Waste</span>
              <Lightning size={18} className="text-warning" />
            </div>
            <div className="text-3xl font-bold font-mono text-warning">
              {fleetEfficiency.energyWaste.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Idle robots with high battery
            </p>
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Utilization</span>
              <ChargingStation size={18} className="text-accent" />
            </div>
            <div className="text-3xl font-bold font-mono text-accent">
              {fleetEfficiency.utilizationScore.toFixed(0)}%
            </div>
            <Progress value={fleetEfficiency.utilizationScore} className="h-2 mt-2" />
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-panel p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BatteryCharging size={20} weight="duotone" />
            Robot Energy Profiles
          </h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {energyProfiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No energy profiles available
              </p>
            ) : (
              energyProfiles.map((profile) => (
                <div
                  key={profile.robotId}
                  className="p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium font-mono">
                      {profile.robotId.toUpperCase().replace('ROBOT-', 'R-')}
                    </span>
                    <Badge variant={profile.currentBattery < 30 ? 'destructive' : 'secondary'}>
                      {profile.currentBattery.toFixed(0)}%
                    </Badge>
                  </div>

                  <Progress
                    value={profile.currentBattery}
                    className="h-2 mb-2"
                  />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Consumption:</span>
                      <span className="ml-1 font-mono">
                        {profile.consumptionRate.toFixed(2)}/s
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Runtime:</span>
                      <span className="ml-1 font-mono">
                        {profile.estimatedRuntime.toFixed(0)}s
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Efficiency Score</span>
                      <span className={`text-xs font-mono ${getEfficiencyColor(profile.efficiencyScore)}`}>
                        {profile.efficiencyScore.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="glass-panel p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <ChargingStation size={20} weight="duotone" />
            Charging Stations
          </h4>
          <div className="space-y-4">
            {chargingStations.map((station) => (
              <div
                key={station.id}
                className="p-4 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    {station.id.toUpperCase().replace('CHARGING-', 'Station ')}
                  </span>
                  <Badge variant={station.utilizationPercent > 80 ? 'destructive' : 'secondary'}>
                    {station.currentLoad}/{station.capacity}
                  </Badge>
                </div>

                <Progress value={station.utilizationPercent} className="h-2 mb-2" />

                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Utilization: {station.utilizationPercent.toFixed(0)}%
                  </span>
                  <span className="text-muted-foreground">
                    Queue: {station.queue.length}
                  </span>
                </div>

                {station.queue.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-xs text-warning">
                      ⚠️ {station.queue.length} robot(s) waiting
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <h5 className="text-sm font-medium mb-3">Energy Forecast</h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Robots Needing Charge</span>
                <span className="font-mono">{energyPrediction.robotsNeedingCharge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Energy Needed</span>
                <span className="font-mono">{energyPrediction.totalEnergyNeeded.toFixed(0)}%</span>
              </div>
            </div>

            {energyPrediction.chargingBottlenecks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-xs font-medium text-warning mb-2">Bottlenecks:</p>
                {energyPrediction.chargingBottlenecks.slice(0, 2).map((bottleneck, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground mb-1">
                    • {bottleneck}
                  </p>
                ))}
              </div>
            )}

            {energyPrediction.recommendations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-xs font-medium text-accent mb-2">Recommendations:</p>
                {energyPrediction.recommendations.slice(0, 2).map((rec, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground mb-1">
                    💡 {rec}
                  </p>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
