import { useCallback, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

export type AudioCueType = 
  | 'collision_critical'
  | 'collision_near_miss'
  | 'collision_avoided'
  | 'task_assigned'
  | 'task_completed'
  | 'robot_charging'
  | 'warning'
  | 'optimization_complete'
  | 'simulation_start'
  | 'simulation_stop'

interface AudioSettings {
  enabled: boolean
  volume: number
}

export function useAudioCues() {
  const [settings, setSettings] = useKV<AudioSettings>('audio_settings', {
    enabled: true,
    volume: 0.5
  })
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      gainNodeRef.current.gain.value = settings?.volume || 0.5
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (gainNodeRef.current && settings) {
      gainNodeRef.current.gain.value = settings.volume
    }
  }, [settings?.volume])

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', fadeOut: boolean = true) => {
    if (!audioContextRef.current || !gainNodeRef.current || !settings?.enabled) return

    const ctx = audioContextRef.current
    const gainNode = gainNodeRef.current
    const oscillator = ctx.createOscillator()
    const localGain = ctx.createGain()

    oscillator.connect(localGain)
    localGain.connect(gainNode)

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    if (fadeOut) {
      localGain.gain.setValueAtTime(0.8, ctx.currentTime)
      localGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    } else {
      localGain.gain.setValueAtTime(0.8, ctx.currentTime)
    }

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }, [settings?.enabled])

  const playCollisionCritical = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(220, 0.1, 'square', false)
    setTimeout(() => playTone(185, 0.15, 'square', true), 120)
  }, [playTone, settings?.enabled])

  const playCollisionNearMiss = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(330, 0.08, 'sine', true)
    setTimeout(() => playTone(370, 0.08, 'sine', true), 90)
  }, [playTone, settings?.enabled])

  const playCollisionAvoided = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(440, 0.05, 'sine', true)
  }, [playTone, settings?.enabled])

  const playTaskAssigned = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(523, 0.06, 'sine', true)
    setTimeout(() => playTone(659, 0.06, 'sine', true), 70)
  }, [playTone, settings?.enabled])

  const playTaskCompleted = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(523, 0.08, 'sine', true)
    setTimeout(() => playTone(659, 0.08, 'sine', true), 90)
    setTimeout(() => playTone(784, 0.12, 'sine', true), 180)
  }, [playTone, settings?.enabled])

  const playRobotCharging = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(392, 0.1, 'triangle', true)
  }, [playTone, settings?.enabled])

  const playWarning = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(880, 0.15, 'sawtooth', false)
    setTimeout(() => playTone(880, 0.15, 'sawtooth', false), 200)
  }, [playTone, settings?.enabled])

  const playOptimizationComplete = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(659, 0.1, 'sine', true)
    setTimeout(() => playTone(784, 0.1, 'sine', true), 110)
    setTimeout(() => playTone(988, 0.15, 'sine', true), 220)
  }, [playTone, settings?.enabled])

  const playSimulationStart = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(440, 0.08, 'sine', true)
    setTimeout(() => playTone(554, 0.08, 'sine', true), 90)
    setTimeout(() => playTone(659, 0.12, 'sine', true), 180)
  }, [playTone, settings?.enabled])

  const playSimulationStop = useCallback(() => {
    if (!settings?.enabled) return
    
    playTone(659, 0.08, 'sine', true)
    setTimeout(() => playTone(554, 0.08, 'sine', true), 90)
    setTimeout(() => playTone(440, 0.12, 'sine', true), 180)
  }, [playTone, settings?.enabled])

  const playAudioCue = useCallback((cueType: AudioCueType) => {
    switch (cueType) {
      case 'collision_critical':
        playCollisionCritical()
        break
      case 'collision_near_miss':
        playCollisionNearMiss()
        break
      case 'collision_avoided':
        playCollisionAvoided()
        break
      case 'task_assigned':
        playTaskAssigned()
        break
      case 'task_completed':
        playTaskCompleted()
        break
      case 'robot_charging':
        playRobotCharging()
        break
      case 'warning':
        playWarning()
        break
      case 'optimization_complete':
        playOptimizationComplete()
        break
      case 'simulation_start':
        playSimulationStart()
        break
      case 'simulation_stop':
        playSimulationStop()
        break
    }
  }, [
    playCollisionCritical,
    playCollisionNearMiss,
    playCollisionAvoided,
    playTaskAssigned,
    playTaskCompleted,
    playRobotCharging,
    playWarning,
    playOptimizationComplete,
    playSimulationStart,
    playSimulationStop
  ])

  const updateSettings = useCallback((updates: Partial<AudioSettings>) => {
    setSettings((current = { enabled: true, volume: 0.5 }) => ({
      ...current,
      ...updates
    }))
  }, [setSettings])

  return {
    playAudioCue,
    settings: settings || { enabled: true, volume: 0.5 },
    updateSettings,
    isSupported: !!(audioContextRef.current)
  }
}
