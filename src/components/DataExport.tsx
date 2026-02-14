import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DownloadSimple, UploadSimple, FileArrowDown, FileArrowUp } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface DataExportProps {
  robots: any[]
  tasks: any[]
  metrics: any
  onImport: (data: any) => void
  isRunning: boolean
}

export function DataExport({ robots, tasks, metrics, onImport, isRunning }: DataExportProps) {
  const handleExport = () => {
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      data: {
        robots,
        tasks,
        metrics
      }
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `warehouse-simulation-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Simulation data exported', {
      description: 'Configuration saved to file'
    })
  }

  const handleImport = () => {
    if (isRunning) {
      toast.error('Stop simulation first', {
        description: 'Pause or stop the simulation before importing data'
      })
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const text = await file.text()
        const importData = JSON.parse(text)

        if (!importData.version || !importData.data) {
          throw new Error('Invalid file format')
        }

        onImport(importData.data)
        toast.success('Simulation data imported', {
          description: `Loaded ${importData.data.robots.length} robots and ${importData.data.tasks.length} tasks`
        })
      } catch (error) {
        toast.error('Import failed', {
          description: 'Invalid file format or corrupted data'
        })
      }
    }
    input.click()
  }

  const handleExportMetrics = () => {
    const csvHeader = 'Metric,Value\n'
    const csvRows = Object.entries(metrics)
      .map(([key, value]) => `${key},${value}`)
      .join('\n')
    
    const csvContent = csvHeader + csvRows
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `metrics-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Metrics exported to CSV', {
      description: 'Performance data saved'
    })
  }

  return (
    <Card className="glass-panel p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileArrowDown size={20} weight="duotone" />
        Data Management
      </h3>

      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-card/50 border border-border/50">
          <h4 className="text-sm font-semibold mb-2">Export Simulation State</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Save current robot positions, tasks, and metrics to a JSON file for later analysis or sharing.
          </p>
          <Button onClick={handleExport} size="sm" variant="outline" className="w-full">
            <DownloadSimple size={16} weight="bold" className="mr-2" />
            Export Configuration
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-card/50 border border-border/50">
          <h4 className="text-sm font-semibold mb-2">Import Simulation State</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Load a previously saved simulation configuration from a JSON file.
          </p>
          <Button
            onClick={handleImport}
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isRunning}
          >
            <UploadSimple size={16} weight="bold" className="mr-2" />
            Import Configuration
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-card/50 border border-border/50">
          <h4 className="text-sm font-semibold mb-2">Export Metrics (CSV)</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Export performance metrics to CSV format for spreadsheet analysis.
          </p>
          <Button onClick={handleExportMetrics} size="sm" variant="outline" className="w-full">
            <FileArrowUp size={16} weight="bold" className="mr-2" />
            Export Metrics CSV
          </Button>
        </div>
      </div>
    </Card>
  )
}
