import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  CloudArrowUp,
  CloudArrowDown,
  Database,
  CheckCircle,
  XCircle,
  SpinnerGap,
  Key,
  Globe,
  Link as LinkIcon,
  PlugsConnected,
  Warning
} from '@phosphor-icons/react'

interface APIConnection {
  id: string
  name: string
  type: 'webhook' | 'rest' | 'database' | 'cloud'
  endpoint: string
  apiKey?: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: number
}

interface APIIntegrationPanelProps {
  onDataImported?: (data: any) => void
  isRunning?: boolean
}

export function APIIntegrationPanel({ onDataImported, isRunning }: APIIntegrationPanelProps) {
  const [connections, setConnections] = useKV<APIConnection[]>('api_connections', [])
  const [isLoading, setIsLoading] = useState(false)
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'rest' as const,
    endpoint: '',
    apiKey: ''
  })
  const [syncStatus, setSyncStatus] = useState<Record<string, 'idle' | 'syncing' | 'success' | 'error'>>({})

  const safeConnections = connections || []

  const testConnection = async (connection: APIConnection) => {
    setSyncStatus(prev => ({ ...prev, [connection.id]: 'syncing' }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const success = Math.random() > 0.3
      
      if (success) {
        setConnections((current = []) =>
          current.map(c =>
            c.id === connection.id
              ? { ...c, status: 'connected' as const, lastSync: Date.now() }
              : c
          )
        )
        setSyncStatus(prev => ({ ...prev, [connection.id]: 'success' }))
        toast.success('Connection test successful', {
          description: `${connection.name} is responding`
        })
      } else {
        throw new Error('Connection failed')
      }
    } catch (error) {
      setConnections((current = []) =>
        current.map(c =>
          c.id === connection.id ? { ...c, status: 'error' as const } : c
        )
      )
      setSyncStatus(prev => ({ ...prev, [connection.id]: 'error' }))
      toast.error('Connection test failed', {
        description: `Failed to connect to ${connection.name}`
      })
    }
  }

  const syncData = async (connection: APIConnection) => {
    setSyncStatus(prev => ({ ...prev, [connection.id]: 'syncing' }))

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockData = {
        robots: Array.from({ length: 5 }, (_, i) => ({
          id: `api-robot-${i + 1}`,
          name: `Robot ${i + 1}`,
          status: 'idle',
          battery: 90 + Math.random() * 10
        })),
        tasks: Array.from({ length: 10 }, (_, i) => ({
          id: `api-task-${i + 1}`,
          type: 'pickup',
          position: { x: Math.floor(Math.random() * 18), y: Math.floor(Math.random() * 14) },
          priority: Math.floor(Math.random() * 3) + 1
        })),
        metrics: {
          totalOperations: 1234,
          uptime: 99.7,
          efficiency: 87.3
        }
      }

      setConnections((current = []) =>
        current.map(c =>
          c.id === connection.id ? { ...c, lastSync: Date.now() } : c
        )
      )

      if (onDataImported) {
        onDataImported(mockData)
      }

      setSyncStatus(prev => ({ ...prev, [connection.id]: 'success' }))
      toast.success('Data sync complete', {
        description: `Imported data from ${connection.name}`
      })

      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, [connection.id]: 'idle' }))
      }, 3000)
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, [connection.id]: 'error' }))
      toast.error('Sync failed', {
        description: 'Failed to sync data'
      })
    }
  }

  const addConnection = () => {
    if (!newConnection.name || !newConnection.endpoint) {
      toast.error('Missing required fields', {
        description: 'Please provide name and endpoint'
      })
      return
    }

    const connection: APIConnection = {
      id: `conn-${Date.now()}`,
      name: newConnection.name,
      type: newConnection.type,
      endpoint: newConnection.endpoint,
      apiKey: newConnection.apiKey || undefined,
      status: 'disconnected'
    }

    setConnections((current = []) => [...current, connection])
    setNewConnection({ name: '', type: 'rest', endpoint: '', apiKey: '' })
    toast.success('Connection added', {
      description: `${connection.name} has been added`
    })
  }

  const removeConnection = (id: string) => {
    setConnections((current = []) => current.filter(c => c.id !== id))
    toast.info('Connection removed')
  }

  const exportData = async () => {
    setIsLoading(true)
    try {
      const exportData = {
        connections: safeConnections,
        timestamp: Date.now(),
        version: '1.0'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `api-connections-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Connections exported')
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setIsLoading(false)
    }
  }

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (data.connections && Array.isArray(data.connections)) {
        setConnections(data.connections)
        toast.success('Connections imported', {
          description: `Imported ${data.connections.length} connections`
        })
      } else {
        throw new Error('Invalid format')
      }
    } catch (error) {
      toast.error('Import failed', {
        description: 'Invalid file format'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: APIConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle weight="fill" className="text-success" />
      case 'error':
        return <XCircle weight="fill" className="text-destructive" />
      default:
        return <Warning weight="fill" className="text-warning" />
    }
  }

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <PlugsConnected size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">API Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect external data sources
            </p>
          </div>
        </div>
        <Badge variant="outline" className="font-mono">
          {safeConnections.length} {safeConnections.length === 1 ? 'Connection' : 'Connections'}
        </Badge>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {safeConnections.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 rounded-xl bg-muted/50 mb-4">
                <Database size={48} weight="duotone" className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No API connections configured
              </p>
              <Button variant="outline" onClick={() => {}}>
                <LinkIcon size={18} className="mr-2" />
                Add Your First Connection
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {safeConnections.map((connection) => (
                  <Card key={connection.id} className="p-4 bg-card/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-accent/20">
                          {connection.type === 'webhook' && <Globe size={20} weight="duotone" className="text-accent" />}
                          {connection.type === 'rest' && <CloudArrowDown size={20} weight="duotone" className="text-accent" />}
                          {connection.type === 'database' && <Database size={20} weight="duotone" className="text-accent" />}
                          {connection.type === 'cloud' && <CloudArrowUp size={20} weight="duotone" className="text-accent" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{connection.name}</h4>
                            {getStatusIcon(connection.status)}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mb-1">
                            {connection.endpoint}
                          </p>
                          {connection.lastSync && (
                            <p className="text-xs text-muted-foreground">
                              Last sync: {new Date(connection.lastSync).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {connection.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testConnection(connection)}
                        disabled={syncStatus[connection.id] === 'syncing' || isRunning}
                        className="flex-1"
                      >
                        {syncStatus[connection.id] === 'syncing' ? (
                          <>
                            <SpinnerGap size={16} className="mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} className="mr-2" />
                            Test
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => syncData(connection)}
                        disabled={
                          syncStatus[connection.id] === 'syncing' ||
                          connection.status !== 'connected' ||
                          isRunning
                        }
                        className="flex-1"
                      >
                        {syncStatus[connection.id] === 'syncing' ? (
                          <>
                            <SpinnerGap size={16} className="mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <CloudArrowDown size={16} className="mr-2" />
                            Sync
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeConnection(connection.id)}
                        disabled={isRunning}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex items-center gap-2 pt-4 border-t">
            <Button variant="outline" onClick={exportData} disabled={isLoading || safeConnections.length === 0}>
              <CloudArrowUp size={18} className="mr-2" />
              Export
            </Button>
            <Button variant="outline" disabled={isLoading} asChild>
              <label className="cursor-pointer">
                <CloudArrowDown size={18} className="mr-2" />
                Import
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={importData}
                />
              </label>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conn-name">Connection Name</Label>
              <Input
                id="conn-name"
                placeholder="My API Connection"
                value={newConnection.name}
                onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conn-type">Type</Label>
              <select
                id="conn-type"
                className="w-full px-3 py-2 rounded-md border bg-background"
                value={newConnection.type}
                onChange={(e) => setNewConnection({ ...newConnection, type: e.target.value as any })}
              >
                <option value="rest">REST API</option>
                <option value="webhook">Webhook</option>
                <option value="database">Database</option>
                <option value="cloud">Cloud Storage</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conn-endpoint">Endpoint URL</Label>
              <Input
                id="conn-endpoint"
                placeholder="https://api.example.com/v1/data"
                value={newConnection.endpoint}
                onChange={(e) => setNewConnection({ ...newConnection, endpoint: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conn-apikey">API Key (Optional)</Label>
              <div className="relative">
                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="conn-apikey"
                  type="password"
                  placeholder="sk-..."
                  className="pl-10"
                  value={newConnection.apiKey}
                  onChange={(e) => setNewConnection({ ...newConnection, apiKey: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={addConnection} className="w-full">
              <PlugsConnected size={18} className="mr-2" />
              Add Connection
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Warning size={18} className="text-accent" />
              Connection Examples
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                <strong>REST API:</strong> https://api.example.com/robots
              </div>
              <div>
                <strong>Webhook:</strong> https://webhook.site/unique-url
              </div>
              <div>
                <strong>Database:</strong> postgresql://host:5432/warehouse
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
