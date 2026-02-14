import { motion, AnimatePresence } from 'framer-motion'
import { Microphone, SpeakerHigh } from '@phosphor-icons/react'

interface VoiceIndicatorProps {
  isListening: boolean
  interimTranscript?: string
  isSpeaking?: boolean
}

export function VoiceIndicator({ isListening, interimTranscript, isSpeaking }: VoiceIndicatorProps) {
  const showIndicator = isListening || isSpeaking

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`glass-panel px-6 py-3 rounded-full flex items-center gap-3 shadow-lg border-2 ${
            isSpeaking ? 'border-primary/50' : 'border-accent/50'
          }`}>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {isSpeaking ? (
                <SpeakerHigh size={20} weight="fill" className="text-primary" />
              ) : (
                <Microphone size={20} weight="fill" className="text-accent" />
              )}
            </motion.div>
            <div className="flex flex-col">
              <span className={`text-sm font-semibold ${isSpeaking ? 'text-primary' : 'text-accent'}`}>
                {isSpeaking ? 'Speaking...' : 'Listening...'}
              </span>
              {interimTranscript && (
                <span className="text-xs text-muted-foreground font-mono max-w-[300px] truncate">
                  {interimTranscript}
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <motion.div
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className={`w-1 rounded-full ${isSpeaking ? 'bg-primary' : 'bg-accent'}`}
              />
              <motion.div
                animate={{ height: [4, 16, 4] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                className={`w-1 rounded-full ${isSpeaking ? 'bg-primary' : 'bg-accent'}`}
              />
              <motion.div
                animate={{ height: [4, 10, 4] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className={`w-1 rounded-full ${isSpeaking ? 'bg-primary' : 'bg-accent'}`}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
