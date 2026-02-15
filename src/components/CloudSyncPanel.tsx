import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  CloudArrowUp,
  CloudArrowDown,
  CloudCheck,
  SpinnerGap,
  HardDrives,
  ClockCounterClockwise
} from '@phosphor-icons/react'

interface CloudSyncPanelProps {
  robots: any[]
  tasks: any[]
  metrics: any
  onRestore: (data: any) => void
}

export function CloudSyncPanel({ robots, tasks, metrics, onRestore }: CloudSyncPanelProps) {
  const [lastSync, setLastSync] = useKV<number>('last_cloud_sync', 0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [cloudBackups, setCloudBackups] = useKV<any[]>('cloud_backups', [])
  const [autoSync, setAutoSync] = useKV<boolean>('auto_sync', false)

  const safeBackups = cloudBackups || []

  useEffect(() => {
    if (autoSync) {
      const interval = setInterval(() => {
        handleCloudBackup()
      }, 300000)
      return () => clearInterval(interval)
    }
  }, [autoSync, robots, tasks, metrics])

  const handleCloudBackup = async () => {
    setIsSyncing(true)
    setSyncProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      await new Promise(resolve => setTimeout(resolve, 2000))

      const backup = {
        id: `backup-${Date.now()}`,
        timestamp: Date.now(),
        robots: robots,
        tasks: tasks,
        metrics: metrics,
        version: '1.0'
      }

      setCloudBackups((current = []) => [backup, ...current].slice(0, 10))
      setLastSync(Date.now())

      clearInterval(progressInterval)
      setSyncProgress(100)

      toast.success('Cloud backup complete', {
        description: 'Simulation state saved to cloud'
      })
    } catch (error) {
      toast.error('Cloud backup failed', {
        description: 'Failed to save to cloud'
      })
    } finally {
      setTimeout(() => {
        setIsSyncing(false)
        setSyncProgress(0)
      }, 1000)
    }
  }

  const handleRestore = async (backup: any) => {
    setIsSyncing(true)
    setSyncProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      await new Promise(resolve => setTimeout(resolve, 1500))

      onRestore({
        robots: backup.robots,
        tasks: backup.tasks,
        metrics: backup.metrics
      })

      clearInterval(progressInterval)
      setSyncProgress(100)

      toast.success('Backup restored', {
        description: `Restored from ${new Date(backup.timestamp).toLocaleString()}`
      })
    } catch (error) {
      toast.error('Restore failed', {
        description: 'Failed to restore from backup'
      })
    } finally {
      setTimeout(() => {
        setIsSyncing(false)
        setSyncProgress(0)
      }, 1000)
    }
  }

  const deleteBackup = (id: string) => {
    setCloudBackups((current = []) => current.filter(b => b.id !== id))
    toast.info('Backup deleted')
  }

  const timeSinceLastSync = lastSync ? Date.now() - lastSync : null

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/20">
            <HardDrives size={24} weight="duotone" className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Cloud Sync</h3>
            <p className="text-sm text-muted-foreground">
              Backup and restore simulation state
            </p>
          </div>
        </div>
        <Badge variant={autoSync ? 'default' : 'outline'} className="font-mono">
          {autoSync ? 'Auto-Sync On' : 'Manual Only'}
        </Badge>
      </div>

      {isSyncing && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {syncProgress < 100 ? 'Syncing...' : 'Complete'}
            </span>
            <span className="font-mono font-semibold">{syncProgress}%</span>
          </div>
          <Progress value={syncProgress} className="h-2" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCloudBackup}
            disabled={isSyncing}
            className="flex-1"
          >
            {isSyncing ? (
              <>
                <SpinnerGap size={18} className="mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <CloudArrowUp size={18} className="mr-2" />
                Backup Now
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setAutoSync(current => !current)}
            disabled={isSyncing}
          >
            {autoSync ? 'Disable Auto-Sync' : 'Enable Auto-Sync'}
          </Button>
        </div>

        {timeSinceLastSync !== null && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-sm">
              <CloudCheck size={18} className="text-success" />
              <span className="text-muted-foreground">Last synced:</span>
            </div>
            <span className="text-sm font-medium">
              {timeSinceLastSync < 60000
                ? 'Just now'
                : `${Math.floor(timeSinceLastSync / 60000)}m ago`}
            </span>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm">Cloud Backups</h4>
            <Badge variant="secondary" className="font-mono">
              {safeBackups.length}/10
            </Badge>
          </div>

          {safeBackups.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No cloud backups yet
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {safeBackups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ClockCounterClockwise size={18} className="text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {new Date(backup.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {backup.robots?.length || 0} robots, {backup.tasks?.length || 0} tasks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(backup)}
                      disabled={isSyncing}
                    >
                      <CloudArrowDown size={14} className="mr-1" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteBackup(backup.id)}
                      disabled={isSyncing}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
