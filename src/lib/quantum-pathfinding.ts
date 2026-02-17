import type { Position, Robot, WarehouseCell } from './types'

interface QuantumPath {
  path: Position[]
  probability: number
  energyCost: number
  timeEstimate: number
  quantumAdvantage: number
}

export class QuantumPathfindingEngine {
  private superpositionStates: Map<string, QuantumPath[]> = new Map()
  private coherenceTime: number = 100
  private entanglementMap: Map<string, Set<string>> = new Map()

  findQuantumOptimalPath(
    start: Position,
    goal: Position,
    warehouse: WarehouseCell[][],
    robots: Robot[]
  ): QuantumPath | null {
    const key = `${start.x},${start.y}-${goal.x},${goal.y}`
    
    const quantumPaths = this.generateSuperposition(start, goal, warehouse, robots)
    
    this.superpositionStates.set(key, quantumPaths)
    
    const collapsedPath = this.collapseWavefunction(quantumPaths, robots)
    
    return collapsedPath
  }

  private generateSuperposition(
    start: Position,
    goal: Position,
    warehouse: WarehouseCell[][],
    robots: Robot[]
  ): QuantumPath[] {
    const paths: QuantumPath[] = []
    const numSuperpositions = 8
    
    for (let i = 0; i < numSuperpositions; i++) {
      const path = this.simulateQuantumWalk(start, goal, warehouse, robots, i)
      if (path) {
        paths.push(path)
      }
    }
    
    return paths
  }

  private simulateQuantumWalk(
    start: Position,
    goal: Position,
    warehouse: WarehouseCell[][],
    robots: Robot[],
    seed: number
  ): QuantumPath | null {
    const path: Position[] = [{ ...start }]
    const visited = new Set<string>()
    let current = { ...start }
    let energyCost = 0
    let steps = 0
    const maxSteps = 200
    
    visited.add(`${current.x},${current.y}`)
    
    while (
      (current.x !== goal.x || current.y !== goal.y) &&
      steps < maxSteps
    ) {
      const neighbors = this.getQuantumNeighbors(current, warehouse, visited, seed + steps)
      
      if (neighbors.length === 0) {
        return null
      }
      
      const nextPos = this.selectQuantumNext(neighbors, goal, current, seed + steps)
      
      const distance = Math.abs(nextPos.x - current.x) + Math.abs(nextPos.y - current.y)
      energyCost += distance
      
      current = nextPos
      path.push({ ...current })
      visited.add(`${current.x},${current.y}`)
      steps++
    }
    
    if (current.x !== goal.x || current.y !== goal.y) {
      return null
    }
    
    const straightLineDistance = Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y)
    const quantumAdvantage = straightLineDistance / (path.length || 1)
    
    const probability = Math.exp(-energyCost / 100) * quantumAdvantage
    
    return {
      path,
      probability: Math.min(probability, 1),
      energyCost,
      timeEstimate: path.length * 0.5,
      quantumAdvantage
    }
  }

  private getQuantumNeighbors(
    pos: Position,
    warehouse: WarehouseCell[][],
    visited: Set<string>,
    seed: number
  ): Position[] {
    const neighbors: Position[] = []
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 }
    ]
    
    for (const dir of directions) {
      const newPos = {
        x: pos.x + dir.x,
        y: pos.y + dir.y
      }
      
      if (
        newPos.y >= 0 &&
        newPos.y < warehouse.length &&
        newPos.x >= 0 &&
        newPos.x < warehouse[0].length &&
        warehouse[newPos.y][newPos.x].type !== 'obstacle' &&
        !visited.has(`${newPos.x},${newPos.y}`)
      ) {
        neighbors.push(newPos)
      }
    }
    
    return neighbors
  }

  private selectQuantumNext(
    neighbors: Position[],
    goal: Position,
    current: Position,
    seed: number
  ): Position {
    const weights = neighbors.map(neighbor => {
      const distanceToGoal = Math.sqrt(
        Math.pow(neighbor.x - goal.x, 2) + Math.pow(neighbor.y - goal.y, 2)
      )
      
      const quantumTunneling = Math.sin(seed * 0.1 + neighbor.x * 0.5) * 0.3
      
      return 1 / (distanceToGoal + 0.1) + quantumTunneling
    })
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    let random = (Math.sin(seed * 12.9898) * 0.5 + 0.5) * totalWeight
    
    for (let i = 0; i < neighbors.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return neighbors[i]
      }
    }
    
    return neighbors[0]
  }

  private collapseWavefunction(paths: QuantumPath[], robots: Robot[]): QuantumPath | null {
    if (paths.length === 0) return null
    
    const adjustedPaths = paths.map(qPath => {
      let collisionPenalty = 0
      
      for (const pos of qPath.path) {
        for (const robot of robots) {
          const dist = Math.sqrt(
            Math.pow(pos.x - robot.position.x, 2) +
            Math.pow(pos.y - robot.position.y, 2)
          )
          if (dist < 2) {
            collisionPenalty += 0.1
          }
        }
      }
      
      return {
        ...qPath,
        probability: qPath.probability * Math.exp(-collisionPenalty)
      }
    })
    
    adjustedPaths.sort((a, b) => b.probability - a.probability)
    
    return adjustedPaths[0]
  }

  createEntanglement(robot1Id: string, robot2Id: string): void {
    if (!this.entanglementMap.has(robot1Id)) {
      this.entanglementMap.set(robot1Id, new Set())
    }
    if (!this.entanglementMap.has(robot2Id)) {
      this.entanglementMap.set(robot2Id, new Set())
    }
    
    this.entanglementMap.get(robot1Id)!.add(robot2Id)
    this.entanglementMap.get(robot2Id)!.add(robot1Id)
  }

  isEntangled(robot1Id: string, robot2Id: string): boolean {
    return this.entanglementMap.get(robot1Id)?.has(robot2Id) || false
  }

  getQuantumMetrics() {
    return {
      activeSuperpositions: this.superpositionStates.size,
      entanglementPairs: Array.from(this.entanglementMap.values())
        .reduce((sum, set) => sum + set.size, 0) / 2,
      coherenceTime: this.coherenceTime,
      quantumAdvantage: this.calculateAverageAdvantage()
    }
  }

  private calculateAverageAdvantage(): number {
    let totalAdvantage = 0
    let count = 0
    
    for (const paths of this.superpositionStates.values()) {
      if (paths.length > 0) {
        totalAdvantage += paths[0].quantumAdvantage
        count++
      }
    }
    
    return count > 0 ? totalAdvantage / count : 1
  }

  reset() {
    this.superpositionStates.clear()
    this.entanglementMap.clear()
  }
}
