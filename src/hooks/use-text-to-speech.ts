import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTextToSpeechOptions {
  enabled?: boolean
  rate?: number
  pitch?: number
  volume?: number
  voice?: string
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    enabled = true,
    rate = 1.1,
    pitch = 1.0,
    volume = 0.9,
    voice: preferredVoice
  } = options

  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const queueRef = useRef<string[]>([])
  const isProcessingRef = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)

        if (availableVoices.length > 0 && !selectedVoice) {
          const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'))
          
          const preferred = preferredVoice
            ? availableVoices.find(v => v.name.includes(preferredVoice))
            : null

          const samantha = englishVoices.find(v => v.name.includes('Samantha'))
          const karen = englishVoices.find(v => v.name.includes('Karen'))
          const natural = englishVoices.find(v => v.name.includes('Natural') || v.name.includes('Enhanced'))
          const defaultVoice = englishVoices.find(v => v.default)

          setSelectedVoice(
            preferred || samantha || karen || natural || defaultVoice || englishVoices[0] || availableVoices[0]
          )
        }
      }

      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices

      return () => {
        window.speechSynthesis.cancel()
      }
    } else {
      setIsSupported(false)
    }
  }, [preferredVoice])

  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return
    }

    isProcessingRef.current = true
    const text = queueRef.current.shift()

    if (!text) {
      isProcessingRef.current = false
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      isProcessingRef.current = false
      utteranceRef.current = null
      
      setTimeout(() => {
        processQueue()
      }, 100)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
      isProcessingRef.current = false
      utteranceRef.current = null
      
      setTimeout(() => {
        processQueue()
      }, 100)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [rate, pitch, volume, selectedVoice])

  const speak = useCallback((text: string, immediate: boolean = false) => {
    if (!isSupported || !enabled || !text.trim()) {
      return
    }

    if (immediate) {
      window.speechSynthesis.cancel()
      queueRef.current = []
      isProcessingRef.current = false
    }

    queueRef.current.push(text)
    processQueue()
  }, [isSupported, enabled, processQueue])

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      queueRef.current = []
      isProcessingRef.current = false
      setIsSpeaking(false)
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.pause()
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume()
    }
  }, [isSupported])

  return {
    speak,
    cancel,
    pause,
    resume,
    isSupported,
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice
  }
}
