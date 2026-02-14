import { useEffect, useRef, useState, useCallback } from 'react'

export interface VoiceCommand {
  command: string
  action: () => void
  patterns: RegExp[]
  description: string
  category: 'simulation' | 'robot' | 'task' | 'view'
}

interface UseVoiceCommandsProps {
  commands: VoiceCommand[]
  onCommandRecognized?: (command: string, transcript: string) => void
  onError?: (error: string) => void
}

export function useVoiceCommands({ commands, onCommandRecognized, onError }: UseVoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    setIsSupported(true)
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (recognitionRef.current?.shouldRestart) {
        try {
          recognition.start()
        } catch (e) {
          console.error('Error restarting recognition:', e)
        }
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        return
      }
      if (event.error === 'aborted') {
        return
      }
      onError?.(`Speech recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcriptText = result[0].transcript.toLowerCase().trim()

        if (result.isFinal) {
          final += transcriptText + ' '
        } else {
          interim += transcriptText + ' '
        }
      }

      setInterimTranscript(interim)

      if (final) {
        setTranscript(final)
        processCommand(final)
      }
    }

    recognitionRef.current = recognition
    recognitionRef.current.shouldRestart = false

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.shouldRestart = false
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.error('Error stopping recognition:', e)
        }
      }
    }
  }, [commands])

  const processCommand = useCallback((text: string) => {
    const normalizedText = text.toLowerCase().trim()
    
    for (const cmd of commands) {
      for (const pattern of cmd.patterns) {
        if (pattern.test(normalizedText)) {
          cmd.action()
          onCommandRecognized?.(cmd.command, normalizedText)
          return
        }
      }
    }
  }, [commands, onCommandRecognized])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.shouldRestart = true
        recognitionRef.current.start()
      } catch (e) {
        console.error('Error starting recognition:', e)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.shouldRestart = false
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.error('Error stopping recognition:', e)
      }
      setIsListening(false)
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening
  }
}
