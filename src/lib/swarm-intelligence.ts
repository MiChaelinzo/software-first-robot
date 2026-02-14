import type { Robot, Task, Position } from './types'

export interface SwarmBehavior {
  cohesion: number
  separation: number
  alignment: number
  taskAttraction: number
}

export interface FormationPattern {
  type: 'line' | 'circle' | 'grid' | 'v-shape' | 'wedge' | 'scatter'
  positions: Position[]
}

export interface CollaborativeTask {
  taskId: string
  requiredRobots: number
  assignedRobots: string[]
  coordinationPoint: Position
  status: 'forming' | 'executing' | 'completed'
}

export class SwarmIntelligence {
  private behaviors: SwarmBehavior = {
    cohesion: 0.5,
    separation: 0.8,
    alignment: 0.3,
    taskAttraction: 1.0
  }

  private collaborativeTasks: Map<string, CollaborativeTask> = new Map()
  private formationMemory: Map<string, FormationPattern> = new Map()

  updateSwarmBehavior(robots: Robot[]): void {
    const movingRobots = robots.filter(r => r.status === 'moving')
    
    if (movingRobots.length < 2) return

    movingRobots.forEach(robot => {
      const neighbors = this.findNeighbors(robot, movingRobots, 5)
      
      if (neighbors.length > 0) {
        const cohesionForce = this.calculateCohesion(robot, neighbors)
        const separationForce = this.calculateSeparation(robot, neighbors)
        const alignmentForce = this.calculateAlignment(robot, neighbors)

        const combinedForce = {
          x: cohesionForce.x * this.behaviors.cohesion +
             separationForce.x * this.behaviors.separation +
             alignmentForce.x * this.behaviors.alignment,
          y: cohesionForce.y * this.behaviors.cohesion +
             separationForce.y * this.behaviors.separation +
             alignmentForce.y * this.behaviors.alignment
        }

        const magnitude = Math.sqrt(combinedForce.x ** 2 + combinedForce.y ** 2)
        if (magnitude > 0.1) {
          robot.speed = Math.max(0.5, Math.min(2.0, robot.speed + magnitude * 0.1))
        }
      }
    })
  }

  private findNeighbors(robot: Robot, allRobots: Robot[], radius: number): Robot[] {
    return allRobots.filter(r => {
      if (r.id === robot.id) return false
      const dx = r.position.x - robot.position.x
      const dy = r.position.y - robot.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance <= radius
    })
  }

  private calculateCohesion(robot: Robot, neighbors: Robot[]): Position {
    const center = neighbors.reduce(
      (acc, n) => ({ x: acc.x + n.position.x, y: acc.y + n.position.y }),
      { x: 0, y: 0 }
    )
    center.x /= neighbors.length
    center.y /= neighbors.length

    return {
      x: (center.x - robot.position.x) * 0.01,
      y: (center.y - robot.position.y) * 0.01
    }
  }

  private calculateSeparation(robot: Robot, neighbors: Robot[]): Position {
    const force = { x: 0, y: 0 }
    
    neighbors.forEach(neighbor => {
      const dx = robot.position.x - neighbor.position.x
      const dy = robot.position.y - neighbor.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 2 && distance > 0) {
        force.x += (dx / distance) * (2 - distance)
        force.y += (dy / distance) * (2 - distance)
      }
    })

    return force
  }

  private calculateAlignment(robot: Robot, neighbors: Robot[]): Position {
    const avgVelocity = neighbors.reduce(
      (acc, n) => {
        const vx = n.path[0] ? n.path[0].x - n.position.x : 0
        const vy = n.path[0] ? n.path[0].y - n.position.y : 0
        return { x: acc.x + vx, y: acc.y + vy }
      },
      { x: 0, y: 0 }
    )
    
    avgVelocity.x /= neighbors.length
    avgVelocity.y /= neighbors.length

    return {
      x: avgVelocity.x * 0.1,
      y: avgVelocity.y * 0.1
    }
  }

  createFormation(robots: Robot[], pattern: FormationPattern['type'], center: Position): Position[] {
    const positions: Position[] = []
    const robotCount = robots.length

    switch (pattern) {
      case 'line':
        for (let i = 0; i < robotCount; i++) {
          positions.push({
            x: center.x + (i - robotCount / 2) * 2,
            y: center.y
          })
        }
        break

      case 'circle':
        const radius = Math.max(3, robotCount * 0.5)
        for (let i = 0; i < robotCount; i++) {
          const angle = (i / robotCount) * Math.PI * 2
          positions.push({
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius
          })
        }
        break

      case 'grid':
        const cols = Math.ceil(Math.sqrt(robotCount))
        for (let i = 0; i < robotCount; i++) {
          const row = Math.floor(i / cols)
          const col = i % cols
          positions.push({
            x: center.x + (col - cols / 2) * 2,
            y: center.y + (row - Math.ceil(robotCount / cols) / 2) * 2
          })
        }
        break

      case 'v-shape':
        const midpoint = Math.floor(robotCount / 2)
        for (let i = 0; i < robotCount; i++) {
          const offset = Math.abs(i - midpoint)
          positions.push({
            x: center.x + (i - midpoint) * 2,
            y: center.y + offset * 1.5
          })
        }
        break

      case 'wedge':
        const rows = Math.ceil(Math.sqrt(robotCount))
        let robotIdx = 0
        for (let row = 0; row < rows && robotIdx < robotCount; row++) {
          const robotsInRow = Math.min(row + 1, robotCount - robotIdx)
          for (let col = 0; col < robotsInRow; col++) {
            positions.push({
              x: center.x + (col - robotsInRow / 2) * 2,
              y: center.y - row * 2
            })
            robotIdx++
          }
        }
        break

      case 'scatter':
        for (let i = 0; i < robotCount; i++) {
          positions.push({
            x: center.x + (Math.random() - 0.5) * 10,
            y: center.y + (Math.random() - 0.5) * 10
          })
        }
        break
    }

    this.formationMemory.set(pattern, { type: pattern, positions })
    return positions
  }

  assignCollaborativeTask(task: Task, requiredRobots: number, availableRobots: Robot[]): CollaborativeTask | null {
    if (availableRobots.length < requiredRobots) return null

    const selectedRobots = availableRobots
      .filter(r => r.status === 'idle' || r.status === 'moving')
      .slice(0, requiredRobots)

    if (selectedRobots.length < requiredRobots) return null

    const collabTask: CollaborativeTask = {
      taskId: task.id,
      requiredRobots,
      assignedRobots: selectedRobots.map(r => r.id),
      coordinationPoint: task.position,
      status: 'forming'
    }

    this.collaborativeTasks.set(task.id, collabTask)
    return collabTask
  }

  updateCollaborativeTasks(robots: Robot[], tasks: Task[]): void {
    this.collaborativeTasks.forEach((collabTask, taskId) => {
      const assignedRobots = robots.filter(r => collabTask.assignedRobots.includes(r.id))
      const task = tasks.find(t => t.id === taskId)

      if (!task || task.status === 'completed') {
        this.collaborativeTasks.delete(taskId)
        return
      }

      const allAtCoordination = assignedRobots.every(robot => {
        const dx = robot.position.x - collabTask.coordinationPoint.x
        const dy = robot.position.y - collabTask.coordinationPoint.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < 2
      })

      if (collabTask.status === 'forming' && allAtCoordination) {
        collabTask.status = 'executing'
      }
    })
  }

  detectSwarmEmergence(robots: Robot[]): {
    hasEmergentBehavior: boolean
    patterns: string[]
    coordination: number
  } {
    const patterns: string[] = []
    let coordinationScore = 0

    const movingRobots = robots.filter(r => r.status === 'moving')
    if (movingRobots.length < 3) {
      return { hasEmergentBehavior: false, patterns: [], coordination: 0 }
    }

    const avgPosition = movingRobots.reduce(
      (acc, r) => ({ x: acc.x + r.position.x, y: acc.y + r.position.y }),
      { x: 0, y: 0 }
    )
    avgPosition.x /= movingRobots.length
    avgPosition.y /= movingRobots.length

    const distances = movingRobots.map(r => {
      const dx = r.position.x - avgPosition.x
      const dy = r.position.y - avgPosition.y
      return Math.sqrt(dx * dx + dy * dy)
    })

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length

    if (variance < 2) {
      patterns.push('Cohesive clustering')
      coordinationScore += 30
    }

    const speeds = movingRobots.map(r => r.speed)
    const speedVariance = speeds.reduce((sum, s) => {
      const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length
      return sum + Math.pow(s - avg, 2)
    }, 0) / speeds.length

    if (speedVariance < 0.1) {
      patterns.push('Synchronized movement')
      coordinationScore += 25
    }

    const robotPairs = movingRobots.length * (movingRobots.length - 1) / 2
    let closeEncounters = 0
    for (let i = 0; i < movingRobots.length; i++) {
      for (let j = i + 1; j < movingRobots.length; j++) {
        const dx = movingRobots[i].position.x - movingRobots[j].position.x
        const dy = movingRobots[i].position.y - movingRobots[j].position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 3 && distance > 1) {
          closeEncounters++
        }
      }
    }

    if (closeEncounters / robotPairs > 0.3) {
      patterns.push('Coordinated spacing')
      coordinationScore += 20
    }

    if (this.collaborativeTasks.size > 0) {
      patterns.push('Multi-robot collaboration active')
      coordinationScore += 25
    }

    return {
      hasEmergentBehavior: patterns.length >= 2,
      patterns,
      coordination: Math.min(100, coordinationScore)
    }
  }

  optimizeFleetDistribution(robots: Robot[], gridWidth: number, gridHeight: number): Position[] {
    const targetPositions: Position[] = []
    const zones = this.divideIntoZones(gridWidth, gridHeight, Math.min(robots.length, 9))

    robots.forEach((robot, idx) => {
      const zoneIdx = idx % zones.length
      const zone = zones[zoneIdx]
      targetPositions.push({
        x: zone.centerX + (Math.random() - 0.5) * 2,
        y: zone.centerY + (Math.random() - 0.5) * 2
      })
    })

    return targetPositions
  }

  private divideIntoZones(width: number, height: number, zoneCount: number): Array<{
    centerX: number
    centerY: number
    width: number
    height: number
  }> {
    const zones: Array<{ centerX: number; centerY: number; width: number; height: number }> = []
    const cols = Math.ceil(Math.sqrt(zoneCount))
    const rows = Math.ceil(zoneCount / cols)
    const zoneWidth = width / cols
    const zoneHeight = height / rows

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (zones.length >= zoneCount) break
        zones.push({
          centerX: (col + 0.5) * zoneWidth,
          centerY: (row + 0.5) * zoneHeight,
          width: zoneWidth,
          height: zoneHeight
        })
      }
    }

    return zones
  }

  setBehaviorWeights(weights: Partial<SwarmBehavior>): void {
    this.behaviors = { ...this.behaviors, ...weights }
  }

  getBehaviorWeights(): SwarmBehavior {
    return { ...this.behaviors }
  }

  reset(): void {
    this.collaborativeTasks.clear()
    this.formationMemory.clear()
    this.behaviors = {
      cohesion: 0.5,
      separation: 0.8,
      alignment: 0.3,
      taskAttraction: 1.0
    }
  }
}
