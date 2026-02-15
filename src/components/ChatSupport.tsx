import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  ChatCircleDots,
  X,
  PaperPlaneRight,
  Paperclip,
  Image as ImageIcon,
  FileText,
  VideoCamera,
  Robot,
  User,
  Trash,
  Sparkle,
  Microphone,
  MicrophoneSlash,
  SpeakerHigh,
  Stop
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  attachments?: ChatAttachment[]
  isVoice?: boolean
}

export type ChatAttachment = {
  id: string
  type: 'image' | 'video' | 'file'
  name: string
  size?: number
  url: string
}

export type ChatSuggestion = {
  id: string
  text: string
  category?: 'question' | 'action' | 'help'
}

const DEFAULT_SUGGESTIONS: ChatSuggestion[] = [
  { id: '1', text: 'How do I start the simulation?', category: 'question' },
  { id: '2', text: 'Show me the analytics dashboard', category: 'action' },
  { id: '3', text: 'Add 5 tasks to the queue', category: 'action' },
  { id: '4', text: 'What are the keyboard shortcuts?', category: 'help' },
  { id: '5', text: 'How does collision avoidance work?', category: 'question' },
  { id: '6', text: 'How do I adjust robot speed?', category: 'question' }
]

const VOICE_CHAT_SUGGESTIONS: ChatSuggestion[] = [
  { id: 'v1', text: 'Tell me about the simulation status', category: 'question' },
  { id: 'v2', text: 'What are the active robots doing?', category: 'question' },
  { id: 'v3', text: 'Explain the collision avoidance system', category: 'help' },
  { id: 'v4', text: 'How do I use voice commands?', category: 'help' },
  { id: 'v5', text: 'What can I ask you?', category: 'question' },
  { id: 'v6', text: 'Give me system metrics overview', category: 'action' }
]

export function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('voice')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [voiceMessages, setVoiceMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isVoiceTyping, setIsVoiceTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>(DEFAULT_SUGGESTIONS)
  const [voiceSuggestions, setVoiceSuggestions] = useState<ChatSuggestion[]>(VOICE_CHAT_SUGGESTIONS)
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [interimVoiceTranscript, setInterimVoiceTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const voiceScrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const voiceMessagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }

        setInterimVoiceTranscript(interim)
        if (final) {
          setVoiceTranscript(final)
          handleVoiceMessage(final)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsVoiceListening(false)
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast.error('Voice recognition error', {
            description: 'Please try again'
          })
        }
      }

      recognitionRef.current.onend = () => {
        setIsVoiceListening(false)
        setInterimVoiceTranscript('')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      scrollToBottom()
    }
  }, [isOpen, messages, voiceMessages])

  useEffect(() => {
    if (!isOpen && (messages.length > 0 || voiceMessages.length > 0)) {
      const lastMessage = activeTab === 'text' 
        ? messages[messages.length - 1] 
        : voiceMessages[voiceMessages.length - 1]
      
      if (lastMessage && lastMessage.role === 'assistant') {
        const now = Date.now()
        if (now - lastMessage.timestamp < 2000) {
          setUnreadCount(prev => prev + 1)
        }
      }
    }
  }, [messages, voiceMessages, isOpen, activeTab])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    voiceMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.1
    utterance.pitch = 1.0
    utterance.volume = 0.9
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    synthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported', {
        description: 'Please use a compatible browser'
      })
      return
    }

    if (isVoiceListening) {
      recognitionRef.current.stop()
      setIsVoiceListening(false)
    } else {
      setVoiceTranscript('')
      setInterimVoiceTranscript('')
      recognitionRef.current.start()
      setIsVoiceListening(true)
      toast.info('Listening...', { description: 'Speak your message' })
    }
  }

  const handleVoiceMessage = async (transcript: string) => {
    if (!transcript.trim()) return

    const userMessage: ChatMessage = {
      id: `voice-msg-${Date.now()}-user`,
      role: 'user',
      content: transcript.trim(),
      timestamp: Date.now(),
      isVoice: true
    }

    setVoiceMessages(prev => [...prev, userMessage])
    setIsVoiceTyping(true)
    setIsVoiceListening(false)

    setTimeout(async () => {
      const aiResponse = await generateAIResponse(transcript, undefined, true)
      
      const assistantMessage: ChatMessage = {
        id: `voice-msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
        isVoice: true
      }

      setVoiceMessages(prev => [...prev, assistantMessage])
      setIsVoiceTyping(false)

      speak(aiResponse)

      const newSuggestions = await generateSmartSuggestions([...voiceMessages, userMessage, assistantMessage], true)
      setVoiceSuggestions(newSuggestions)
    }, 800 + Math.random() * 400)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newAttachments: ChatAttachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', {
          description: `${file.name} exceeds 10MB limit`
        })
        continue
      }

      let type: 'image' | 'video' | 'file' = 'file'
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('video/')) type = 'video'

      const reader = new FileReader()
      reader.onload = (e) => {
        const attachment: ChatAttachment = {
          id: `attachment-${Date.now()}-${i}`,
          type,
          name: file.name,
          url: e.target?.result as string,
          size: file.size
        }
        newAttachments.push(attachment)
        
        if (newAttachments.length === files.length) {
          setAttachments(prev => [...prev, ...newAttachments])
          toast.success('Files attached', {
            description: `${newAttachments.length} file(s) ready to send`
          })
        }
      }
      reader.readAsDataURL(file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const generateAIResponse = async (userMessage: string, userAttachments?: ChatAttachment[], isVoice?: boolean): Promise<string> => {
    try {
      let promptContext = `You are a helpful AI assistant for an autonomous warehouse robotics simulation platform. 
A user has sent you a ${isVoice ? 'voice' : 'text'} message. Provide a helpful, concise, and friendly response.

User message: "${userMessage}"`

      if (userAttachments && userAttachments.length > 0) {
        promptContext += `\n\nThe user has attached ${userAttachments.length} file(s):`
        userAttachments.forEach(att => {
          promptContext += `\n- ${att.name} (${att.type})`
        })
        promptContext += `\n\nAcknowledge their attachments and provide relevant assistance.`
      }

      if (isVoice) {
        promptContext += `\n\nThis is a voice conversation, so keep your response natural and conversational, under 2-3 sentences.`
      } else {
        promptContext += `\n\nKeep your response under 3 sentences and be specific to warehouse robotics, simulation controls, or the platform features.`
      }

      const response = await window.spark.llm(promptContext, 'gpt-4o-mini')
      return response
    } catch (error) {
      return isVoice 
        ? "I'm here to help! Could you please repeat that?" 
        : "I'm here to help! Could you please rephrase your question? I can assist with simulation controls, robot management, analytics, and more."
    }
  }

  const generateSmartSuggestions = async (conversationContext: ChatMessage[], isVoice?: boolean): Promise<ChatSuggestion[]> => {
    if (conversationContext.length === 0) {
      return isVoice ? VOICE_CHAT_SUGGESTIONS : DEFAULT_SUGGESTIONS
    }

    try {
      const recentMessages = conversationContext.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')
      
      const promptText = `Based on this conversation about a warehouse robotics simulation, suggest 4 helpful follow-up questions or actions the user might want:

${recentMessages}

Return a JSON object with a "suggestions" property containing an array of 4 suggestion objects. Each object should have:
- text: A short, actionable question or command (under 50 chars)
- category: Either "question", "action", or "help"

Example format:
{
  "suggestions": [
    {"text": "Show me the analytics", "category": "action"},
    {"text": "How do I add more tasks?", "category": "question"}
  ]
}`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const parsed = JSON.parse(response)
      
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions.map((s: any, idx: number) => ({
          id: `smart-${Date.now()}-${idx}`,
          text: s.text,
          category: s.category
        }))
      }
    } catch (error) {
      console.error('Failed to generate smart suggestions:', error)
    }

    return isVoice ? VOICE_CHAT_SUGGESTIONS : DEFAULT_SUGGESTIONS
  }

  const sendMessage = async (content: string, messageAttachments?: ChatAttachment[]) => {
    if (!content.trim() && (!messageAttachments || messageAttachments.length === 0)) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      attachments: messageAttachments
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setAttachments([])
    setIsTyping(true)

    setTimeout(async () => {
      const aiResponse = await generateAIResponse(content, messageAttachments)
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)

      const newSuggestions = await generateSmartSuggestions([...messages, userMessage, assistantMessage])
      setSuggestions(newSuggestions)
    }, 800 + Math.random() * 400)
  }

  const handleSuggestionClick = (suggestion: ChatSuggestion, isVoice?: boolean) => {
    if (isVoice) {
      handleVoiceMessage(suggestion.text)
    } else {
      sendMessage(suggestion.text)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() || attachments.length > 0) {
      sendMessage(inputValue, attachments.length > 0 ? [...attachments] : undefined)
    }
  }

  const handleClearChat = () => {
    if (activeTab === 'voice') {
      setVoiceMessages([])
      setVoiceSuggestions(VOICE_CHAT_SUGGESTIONS)
    } else {
      setMessages([])
      setSuggestions(DEFAULT_SUGGESTIONS)
      setAttachments([])
    }
    toast.info('Chat cleared')
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Button
          size="lg"
          onClick={() => {
            setIsOpen(true)
            setActiveTab('voice')
          }}
          className="rounded-full h-14 w-14 shadow-lg relative bg-accent hover:bg-accent/90"
          title="Voice Chat"
        >
          <Microphone size={28} weight="duotone" />
        </Button>
        <Button
          size="lg"
          onClick={() => {
            setIsOpen(true)
            setActiveTab('text')
          }}
          className="rounded-full h-14 w-14 shadow-lg relative"
          title="Text Chat"
        >
          <ChatCircleDots size={28} weight="duotone" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-destructive text-destructive-foreground">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] z-50 glass-panel flex flex-col shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <Sparkle size={20} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Support</h3>
            <p className="text-xs text-muted-foreground">
              {activeTab === 'voice' ? 'Voice conversation' : 'Text chat'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClearChat}
            disabled={activeTab === 'voice' ? voiceMessages.length === 0 : messages.length === 0}
          >
            <Trash size={18} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'voice' | 'text')} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2">
          <TabsTrigger value="voice" className="gap-2">
            <Microphone size={16} weight="duotone" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-2">
            <ChatCircleDots size={16} weight="duotone" />
            Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="flex-1 flex flex-col mt-0">
          <ScrollArea ref={voiceScrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {voiceMessages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex items-center justify-center p-4 rounded-xl bg-accent/10">
                    <Microphone size={48} weight="duotone" className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Voice Chat Ready</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the microphone to start speaking, or try a suggestion below.
                    </p>
                  </div>
                </div>
              )}

              {voiceMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-2',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'flex gap-2 max-w-[85%]',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      message.role === 'user' ? 'bg-accent text-accent-foreground' : 'bg-primary/20'
                    )}>
                      {message.role === 'user' ? <User size={18} weight="duotone" /> : <Robot size={18} weight="duotone" className="text-primary" />}
                    </div>
                    <div
                      className={cn(
                        'flex flex-col gap-1',
                        message.role === 'user' ? 'items-end' : 'items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2 text-sm',
                          message.role === 'user'
                            ? 'bg-accent text-accent-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground px-2">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isVoiceTyping && (
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Robot size={18} weight="duotone" className="text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {isVoiceListening && interimVoiceTranscript && (
                <div className="flex gap-2 justify-end">
                  <div className="flex gap-2 max-w-[85%] flex-row-reverse">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                      <User size={18} weight="duotone" />
                    </div>
                    <div className="bg-accent/50 text-accent-foreground rounded-2xl rounded-br-sm px-4 py-2 text-sm italic">
                      <p>{interimVoiceTranscript}</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={voiceMessagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border space-y-3">
            {voiceSuggestions.length > 0 && voiceMessages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {voiceSuggestions.slice(0, 3).map(suggestion => (
                    <Button
                      key={suggestion.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion, true)}
                      className="text-xs"
                      disabled={isVoiceListening || isVoiceTyping}
                    >
                      {suggestion.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                size="lg"
                onClick={toggleVoiceListening}
                disabled={isVoiceTyping || isSpeaking}
                className={cn(
                  'flex-1',
                  isVoiceListening && 'bg-destructive hover:bg-destructive/90'
                )}
              >
                {isVoiceListening ? (
                  <>
                    <Stop size={20} weight="fill" className="mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Microphone size={20} weight="duotone" className="mr-2" />
                    Start Speaking
                  </>
                )}
              </Button>

              {isSpeaking && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={stopSpeaking}
                  className="flex-shrink-0"
                >
                  <SpeakerHigh size={20} />
                </Button>
              )}
            </div>

            {!recognitionRef.current && (
              <p className="text-xs text-center text-muted-foreground">
                Voice recognition not supported in this browser
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="text" className="flex-1 flex flex-col mt-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex items-center justify-center p-4 rounded-xl bg-primary/10">
                    <Robot size={48} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Welcome to Support Chat!</h4>
                    <p className="text-sm text-muted-foreground">
                      I'm your AI assistant. Ask me about simulation controls, analytics, or any features.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-2',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'flex gap-2 max-w-[85%]',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      message.role === 'user' ? 'bg-accent text-accent-foreground' : 'bg-primary/20'
                    )}>
                      {message.role === 'user' ? <User size={18} weight="duotone" /> : <Robot size={18} weight="duotone" className="text-primary" />}
                    </div>
                    <div
                      className={cn(
                        'flex flex-col gap-1',
                        message.role === 'user' ? 'items-end' : 'items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2 text-sm',
                          message.role === 'user'
                            ? 'bg-accent text-accent-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {message.attachments.map(att => (
                            <div key={att.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                              {att.type === 'image' && <ImageIcon size={14} />}
                              {att.type === 'video' && <VideoCamera size={14} />}
                              {att.type === 'file' && <FileText size={14} />}
                              <span>{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground px-2">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Robot size={18} weight="duotone" className="text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border space-y-3">
            {suggestions.length > 0 && messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map(suggestion => (
                  <Button
                    key={suggestion.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            )}

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs"
                  >
                    {att.type === 'image' && <ImageIcon size={14} />}
                    {att.type === 'video' && <VideoCamera size={14} />}
                    {att.type === 'file' && <FileText size={14} />}
                    <span className="max-w-[120px] truncate">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping}
              >
                <Paperclip size={18} />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isTyping || (!inputValue.trim() && attachments.length === 0)}
              >
                <PaperPlaneRight size={18} weight="fill" />
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
