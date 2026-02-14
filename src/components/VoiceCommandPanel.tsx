import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Microphone, MicrophoneSlash, Info } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { VoiceCommand } from '@/hooks/use-voice-commands'

interface VoiceCommandPanelProps {
  isListening: boolean
  isSupported: boolean
  transcript: string
  interimTranscript: string
  onToggle: () => void
  commands: VoiceCommand[]
  recentCommands: Array<{ command: string; transcript: string; timestamp: number }>
}

export function VoiceCommandPanel({
  isListening,
  isSupported,
  transcript,
  interimTranscript,
  onToggle,
  commands,
  recentCommands
}: VoiceCommandPanelProps) {
  if (!isSupported) {
    return (
      <Card className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <MicrophoneSlash size={24} weight="duotone" className="text-muted-foreground" />
          <h3 className="text-lg font-semibold">Voice Commands</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Voice commands are not supported in this browser. Please use Chrome, Edge, or Safari.
        </div>
      </Card>
    )
  }

  const commandsByCategory = commands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = []
    }
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, VoiceCommand[]>)

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
          >
            <Microphone 
              size={24} 
              weight="duotone" 
              className={isListening ? 'text-accent' : 'text-muted-foreground'} 
            />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold">Voice Commands</h3>
            <p className="text-xs text-muted-foreground">
              {isListening ? 'Listening...' : 'Voice control inactive'}
            </p>
          </div>
        </div>
        <Button
          onClick={onToggle}
          variant={isListening ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          {isListening ? (
            <>
              <MicrophoneSlash size={16} weight="duotone" />
              Stop
            </>
          ) : (
            <>
              <Microphone size={16} weight="duotone" />
              Start
            </>
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20"
          >
            <div className="text-xs text-muted-foreground mb-1">Transcript:</div>
            <div className="text-sm font-mono">
              {transcript}
              {interimTranscript && (
                <span className="text-muted-foreground italic">{interimTranscript}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {recentCommands.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <Info size={14} />
            Recent Commands
          </div>
          <ScrollArea className="h-[100px]">
            <div className="space-y-2 pr-4">
              {recentCommands.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item.timestamp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between text-xs p-2 rounded bg-card/50"
                >
                  <span className="font-mono text-accent">{item.command}</span>
                  <span className="text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
          <Info size={14} />
          Available Commands
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4 pr-4">
            {Object.entries(commandsByCategory).map(([category, cmds]) => (
              <div key={category}>
                <Badge variant="outline" className="mb-2 capitalize">
                  {category}
                </Badge>
                <div className="space-y-2">
                  {cmds.map((cmd) => (
                    <div
                      key={cmd.command}
                      className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-mono text-sm text-accent mb-1">
                        "{cmd.command}"
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {cmd.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>💡 <strong>Tip:</strong> Speak clearly and naturally</div>
          <div>💡 Commands are case-insensitive</div>
          <div>💡 You can say "robot one" or "robot 1"</div>
        </div>
      </div>
    </Card>
  )
}
