import type { Robot, Position, Task } from './types'

export type EmergencyType = 
  | 'fire'
  | 'chemical-spill'
  | 'structural-damage'
  | 'power-outage'
  | 'robot-malfunction'
  | 'unauthorized-access'

export interface Emergency {
  id: string
  type: EmergencyType
  position: Position
  severity: 'low' | 'medium' | 'high' | 'critical'
  radius: number
  timestamp: number
  status: 'active' | 'contained' | 'resolved'
  affectedRobots: string[]
  responseActions: EmergencyAction[]
}

export interface EmergencyAction {
  id: string
  type: 'evacuate' | 'isolate' | 'investigate' | 'shutdown' | 'reroute'
  assignedRobotId?: string
  status: 'pending' | 'in-progress' | 'completed'
  timestamp: number
}

export interface EvacuationZone {
  center: Position
  radius: number
  priority: number
  exitPoints: Position[]
}

export class EmergencyResponseSystem {
  private activeEmergencies: Map<string, Emergency> = new Map()
  private emergencyHistory: Emergency[] = []
  private evacuationZones: EvacuationZone[] = []
  private responseTime: number[] = []
  private safetyProtocols: Map<EmergencyType, string[]> = new Map()

  constructor() {
    this.initializeSafetyProtocols()
  }

  private initializeSafetyProtocols() {
    this.safetyProtocols.set('fire', [
      'Evacuate all robots within 5 unit radius',
      'Activate fire suppression systems',
      'Alert emergency services',
      'Reroute traffic away from affected area'
    ])

    this.safetyProtocols.set('chemical-spill', [
      'Isolate contaminated area',
      'Deploy containment robots',
      'Activate ventilation systems',
      'Establish safety perimeter'
    ])

    this.safetyProtocols.set('structural-damage', [
      'Immediate evacuation of unstable zones',
      'Deploy structural assessment drones',
      'Establish alternative pathways',
      'Mark hazardous areas'
    ])

    this.safetyProtocols.set('power-outage', [
      'Switch to backup power systems',
      'Guide robots to charging stations',
      'Prioritize critical operations',
      'Enable emergency lighting'
    ])

    this.safetyProtocols.set('robot-malfunction', [
      'Isolate malfunctioning unit',
      'Deploy maintenance team',
      'Reroute other robots',
      'Log incident for analysis'
    ])

    this.safetyProtocols.set('unauthorized-access', [
      'Lock down affected sector',
      'Deploy security robots',
      'Alert security personnel',
      'Monitor all entry points'
    ])
  }

  triggerEmergency(
    type: EmergencyType,
    position: Position,
    severity: Emergency['severity']
  ): Emergency {
    const emergency: Emergency = {
      id: `emerg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position,
      severity,
      radius: this.calculateEmergencyRadius(severity),
      timestamp: Date.now(),
      status: 'active',
      affectedRobots: [],
      responseActions: []
    }

    this.activeEmergencies.set(emergency.id, emergency)
    this.generateResponseActions(emergency)

    return emergency
  }

  private calculateEmergencyRadius(severity: Emergency['severity']): number {
    switch (severity) {
      case 'low': return 2
      case 'medium': return 4
      case 'high': return 6
      case 'critical': return 10
    }
  }

  private generateResponseActions(emergency: Emergency): void {
    const protocols = this.safetyProtocols.get(emergency.type) || []
    
    protocols.forEach((protocol, index) => {
      const action: EmergencyAction = {
        id: `action-${emergency.id}-${index}`,
        type: this.mapProtocolToAction(protocol),
        status: 'pending',
        timestamp: Date.now()
      }
      emergency.responseActions.push(action)
    })
  }

  private mapProtocolToAction(protocol: string): EmergencyAction['type'] {
    if (protocol.includes('Evacuate')) return 'evacuate'
    if (protocol.includes('Isolate') || protocol.includes('Lock down')) return 'isolate'
    if (protocol.includes('Deploy') || protocol.includes('assess')) return 'investigate'
    if (protocol.includes('shutdown') || protocol.includes('Switch')) return 'shutdown'
    return 'reroute'
  }

  assessRobotSafety(robot: Robot, robots: Robot[]): {
    isSafe: boolean
    nearbyEmergencies: Emergency[]
    recommendedAction: string | null
    shouldEvacuate: boolean
  } {
    const nearbyEmergencies: Emergency[] = []
    let shouldEvacuate = false

    for (const emergency of this.activeEmergencies.values()) {
      const distance = Math.sqrt(
        Math.pow(robot.position.x - emergency.position.x, 2) +
        Math.pow(robot.position.y - emergency.position.y, 2)
      )

      if (distance <= emergency.radius) {
        nearbyEmergencies.push(emergency)
        if (emergency.severity === 'high' || emergency.severity === 'critical') {
          shouldEvacuate = true
        }
      }
    }

    const isSafe = nearbyEmergencies.length === 0
    let recommendedAction: string | null = null

    if (!isSafe) {
      if (shouldEvacuate) {
        recommendedAction = 'Evacuate to safe zone immediately'
      } else {
        recommendedAction = 'Maintain distance and monitor situation'
      }
    }

    return {
      isSafe,
      nearbyEmergencies,
      recommendedAction,
      shouldEvacuate
    }
  }

  evacuateRobot(robot: Robot, safePosition: Position): {
    evacuationPath: Position[]
    estimatedTime: number
  } {
    const evacuationPath = this.calculateEvacuationPath(robot.position, safePosition)
    
    return {
      evacuationPath,
      estimatedTime: evacuationPath.length * 0.5
    }
  }

  private calculateEvacuationPath(from: Position, to: Position): Position[] {
    const path: Position[] = []
    let current = { ...from }

    while (current.x !== to.x || current.y !== to.y) {
      if (!this.isInEmergencyZone(current)) {
        path.push({ ...current })
      }

      if (current.x < to.x) current.x++
      else if (current.x > to.x) current.x--
      
      if (current.y < to.y) current.y++
      else if (current.y > to.y) current.y--
    }

    path.push({ ...current })
    return path
  }

  private isInEmergencyZone(position: Position): boolean {
    for (const emergency of this.activeEmergencies.values()) {
      const distance = Math.sqrt(
        Math.pow(position.x - emergency.position.x, 2) +
        Math.pow(position.y - emergency.position.y, 2)
      )

      if (distance <= emergency.radius && emergency.severity !== 'low') {
        return true
      }
    }
    return false
  }

  createEvacuationZone(center: Position, radius: number, exitPoints: Position[]): void {
    const zone: EvacuationZone = {
      center,
      radius,
      priority: 1,
      exitPoints
    }
    this.evacuationZones.push(zone)
  }

  resolveEmergency(emergencyId: string): void {
    const emergency = this.activeEmergencies.get(emergencyId)
    if (!emergency) return

    const responseTime = Date.now() - emergency.timestamp
    this.responseTime.push(responseTime)

    emergency.status = 'resolved'
    this.emergencyHistory.push(emergency)
    this.activeEmergencies.delete(emergencyId)
  }

  updateEmergencyStatus(emergencyId: string, status: Emergency['status']): void {
    const emergency = this.activeEmergencies.get(emergencyId)
    if (emergency) {
      emergency.status = status
    }
  }

  getActiveEmergencies(): Emergency[] {
    return Array.from(this.activeEmergencies.values())
  }

  getEmergencyMetrics() {
    const averageResponseTime = this.responseTime.length > 0
      ? this.responseTime.reduce((sum, time) => sum + time, 0) / this.responseTime.length
      : 0

    return {
      activeEmergencies: this.activeEmergencies.size,
      totalResolved: this.emergencyHistory.length,
      averageResponseTime: averageResponseTime / 1000,
      criticalEmergencies: Array.from(this.activeEmergencies.values())
        .filter(e => e.severity === 'critical').length,
      evacuationZones: this.evacuationZones.length
    }
  }

  getSafetyProtocol(emergencyType: EmergencyType): string[] {
    return this.safetyProtocols.get(emergencyType) || []
  }

  reset() {
    this.activeEmergencies.clear()
    this.evacuationZones = []
    this.responseTime = []
  }
}
