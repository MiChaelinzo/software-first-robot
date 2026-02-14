import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'

interface VoiceFeedbackSettingsProps {
  enabled: boolean
  rate: number
  pitch: number
  volume: number
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  isSpeaking: boolean
  onEnabledChange: (enabled: boolean) => void
  onRateChange: (rate: number) => void
  onPitchChange: (pitch: number) => void
  onVolumeChange: (volume: number) => void
  onVoiceChange: (voice: SpeechSynthesisVoice) => void
  onTest: () => void
}

export function VoiceFeedbackSettings({
  enabled,
  rate,
  pitch,
  volume,
  voices,
  selectedVoice,
  isSpeaking,
  onEnabledChange,
  onRateChange,
  onPitchChange,
  onVolumeChange,
  onVoiceChange,
  onTest
}: VoiceFeedbackSettingsProps) {
  const englishVoices = voices.filter(v => v.lang.startsWith('en'))

  return (
    <Card className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {enabled ? (
            <SpeakerHigh size={24} weight="duotone" className="text-accent" />
          ) : (
            <SpeakerSlash size={24} weight="duotone" className="text-muted-foreground" />
          )}
          <h3 className="text-lg font-semibold">Voice Feedback</h3>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-select" className="text-sm">Voice</Label>
            <span className="text-xs text-muted-foreground">
              {englishVoices.length} available
            </span>
          </div>
          <Select
            value={selectedVoice?.name || ''}
            onValueChange={(value) => {
              const voice = voices.find(v => v.name === value)
              if (voice) onVoiceChange(voice)
            }}
            disabled={!enabled}
          >
            <SelectTrigger id="voice-select">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {englishVoices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  <div className="flex flex-col">
                    <span>{voice.name}</span>
                    <span className="text-xs text-muted-foreground">{voice.lang}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="rate-slider" className="text-sm">Speech Rate</Label>
            <span className="text-xs font-mono text-muted-foreground">{rate.toFixed(1)}x</span>
          </div>
          <Slider
            id="rate-slider"
            min={0.5}
            max={2}
            step={0.1}
            value={[rate]}
            onValueChange={(values) => onRateChange(values[0])}
            disabled={!enabled}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slower</span>
            <span>Faster</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="pitch-slider" className="text-sm">Pitch</Label>
            <span className="text-xs font-mono text-muted-foreground">{pitch.toFixed(1)}</span>
          </div>
          <Slider
            id="pitch-slider"
            min={0.5}
            max={2}
            step={0.1}
            value={[pitch]}
            onValueChange={(values) => onPitchChange(values[0])}
            disabled={!enabled}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lower</span>
            <span>Higher</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="volume-slider" className="text-sm">Volume</Label>
            <span className="text-xs font-mono text-muted-foreground">{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            id="volume-slider"
            min={0}
            max={1}
            step={0.05}
            value={[volume]}
            onValueChange={(values) => onVolumeChange(values[0])}
            disabled={!enabled}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Quiet</span>
            <span>Loud</span>
          </div>
        </div>

        <Button
          onClick={onTest}
          disabled={!enabled || isSpeaking}
          className="w-full"
          variant="outline"
        >
          <SpeakerHigh size={16} weight="duotone" className="mr-2" />
          {isSpeaking ? 'Speaking...' : 'Test Voice'}
        </Button>
      </div>
    </Card>
  )
}
