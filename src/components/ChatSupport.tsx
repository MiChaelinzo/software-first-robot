import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ChatCircleDots,
  Trash,
  X,
  Sparkle,
  PaperPlaneRight,
  Paperclip,
  Image as ImageIcon,
  VideoCamera,
  File,
  ArrowUp,
  ArrowDown,
  Microphone,
  Stop
} from '@phosphor-icons/react'

type ChatAttachment = {  id: string
  type: 'image' | 'video' | 'file'
  name: string
  size: number
  dataUrl: string
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  attachments?: ChatAttachment[]
}

const DEFAULT_SUGGESTIONS = [
  { id: '1', text: 'How does collision avoidance work?', category: 'feature' as const, icon: '🛡️' },
  { id: '2', text: 'What is the learning rate?', category: 'metric' as const, icon: '📊' },
  { id: '3', text: 'How can I optimize performance?', category: 'question' as const, icon: '⚡' },
  { id: '4', text: 'Explain the heat trail system', category: 'feature' as const, icon: '🔥' },
  { id: '5', text: 'How do I add more robots?', category: 'question' as const, icon: '🤖' },
  { id: '6', text: 'What are swarm behaviors?', category: 'feature' as const, icon: '🐝' },
  { id: '7', text: 'Show me energy optimization tips', category: 'question' as const, icon: '🔋' },
  { id: '8', text: 'How does voice control work?', category: 'feature' as const, icon: '🎤' }
]

export function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useKV<ChatMessage[]>('chat_messages', [])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [isOpen, messages, isTyping])

  const checkScrollButtons = () => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      setShowScrollButtons(scrollHeight > clientHeight && scrollTop > 100)
    }
  }

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons)
      checkScrollButtons()
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons)
    }
  }, [isOpen, messages])

  const scrollToTop = () => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateAIResponse = async (userMessage: string, conversationHistory: ChatMessage[]) => {
    try {
      const contextMessages = conversationHistory.slice(-3).map(
        msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n')

      const promptText = `You are a helpful AI assistant for a warehouse robotics simulation platform. Answer questions about the simulation, robotics, AI features, and help users understand the system.

Context:
${contextMessages}
User message: "${userMessage}"

Provide a helpful, concise response.`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini')
      return response || "I can help you with that! The simulation shows real-time warehouse robotics with AI-powered path planning. Try asking about specific metrics."
    } catch (error) {
      console.error('Failed to generate AI response:', error)
      return "I'm having trouble connecting right now. The simulation features AI-powered robotics with adaptive learning. What specific aspect would you like to know about?"
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments: ChatAttachment[] = []
    
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large (max 10MB)`)
        continue
      }

      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      let type: 'image' | 'video' | 'file' = 'file'
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('video/')) type = 'video'

      newAttachments.push({
        id: `attachment-${Date.now()}-${Math.random()}`,
        type,
        name: file.name,
        size: file.size,
        dataUrl
      })
    }

    setAttachments(prev => [...prev, ...newAttachments])
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.success(`Added ${newAttachments.length} file(s)`)
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          setAttachments(prev => [...prev, {
            id: `audio-${Date.now()}`,
            type: 'file',
            name: `voice-message-${Date.now()}.webm`,
            size: audioBlob.size,
            dataUrl
          }])
        }
        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsVoiceRecording(true)
      toast.success('Recording started')
    } catch (error) {
      toast.error('Could not access microphone')
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isVoiceRecording) {
      mediaRecorderRef.current.stop()
      setIsVoiceRecording(false)
      toast.success('Recording saved')
    }
  }

  const sendMessage = async (content: string, messageAttachments: ChatAttachment[] = []) => {
    if (!content.trim() && messageAttachments.length === 0) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim() || '(Sent attachments)',
      timestamp: Date.now(),
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined
    }
    
    setMessages((prev = []) => [...prev, userMessage])
    setInputValue('')
    setAttachments([])
    setIsTyping(true)

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const aiResponse = await generateAIResponse(content, messages || [])
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      }
      
      setMessages((prev = []) => [...prev, assistantMessage])
      if (!isOpen) {
        setUnreadCount(prev => prev + 1)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue, attachments)
  }

  const handleClearChat = () => {
    setMessages([])
    setAttachments([])
    toast.success('Chat cleared')
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {isVoiceChatOpen && (
          <Card className="p-4 shadow-xl glass-panel bg-card/95 backdrop-blur border-border w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Microphone size={20} weight="duotone" className="text-accent" />
                  </div>
                  <h3 className="font-semibold">Voice Chat</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsVoiceChatOpen(false)}>
                  <X size={16} />
                </Button>
              </div>
              
              <div className="text-center space-y-4">
                {!isVoiceRecording ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Click to start recording your voice message
                    </p>
                    <Button 
                      onClick={startVoiceRecording}
                      className="w-full"
                      size="lg"
                    >
                      <Microphone size={20} weight="duotone" className="mr-2" />
                      Start Recording
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center items-center gap-2 py-4">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                      <p className="text-sm font-medium">Recording...</p>
                    </div>
                    <Button 
                      onClick={stopVoiceRecording}
                      variant="destructive"
                      className="w-full"
                      size="lg"
                    >
                      <Stop size={20} weight="fill" className="mr-2" />
                      Stop Recording
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}
        
        <div className="flex flex-col gap-2 items-end">
          <Button
            onClick={() => setIsVoiceChatOpen(!isVoiceChatOpen)}
            className="h-12 w-12 rounded-full shadow-lg"
            size="icon"
            variant={isVoiceChatOpen ? "secondary" : "default"}
          >
            <Microphone size={20} weight="duotone" />
          </Button>
          
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg"
            size="icon"
          >
            <ChatCircleDots size={24} weight="duotone" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    )
  }

  const safeMessages = messages || []

  return (
    <Card className="fixed bottom-6 right-6 w-[440px] h-[680px] shadow-2xl z-50 flex flex-col glass-panel bg-card/95 backdrop-blur border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkle size={20} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">{safeMessages.length} messages</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {safeMessages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleClearChat} title="Clear Chat">
              <Trash size={16} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          {safeMessages.length === 0 && (
            <div className="text-center py-8">
              <Sparkle size={48} weight="duotone" className="mx-auto mb-4 opacity-20 text-primary" />
              <p className="text-sm text-muted-foreground mb-6">Ask me anything about the simulation!</p>
              
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Questions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_SUGGESTIONS.map((suggestion) => (
                    <Button
                      key={suggestion.id}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(suggestion.text)}
                      className="text-xs h-auto py-2.5 px-3 whitespace-normal text-left justify-start"
                    >
                      <span className="mr-2 text-base">{suggestion.icon}</span>
                      <span className="flex-1">{suggestion.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {safeMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-muted rounded-tl-none'
                  )}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {message.attachments.map((attachment) => (
                        <div key={attachment.id} className="rounded-lg overflow-hidden bg-background/20 border border-border/50">
                          {attachment.type === 'image' ? (
                            <img 
                              src={attachment.dataUrl} 
                              alt={attachment.name}
                              className="max-w-full h-auto max-h-48 object-contain"
                            />
                          ) : attachment.type === 'video' ? (
                            <video 
                              src={attachment.dataUrl}
                              controls
                              className="max-w-full h-auto max-h-48"
                            />
                          ) : (
                            <div className="p-2 flex items-center gap-2">
                              <File size={20} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{attachment.name}</p>
                                <p className="text-[10px] opacity-70">
                                  {(attachment.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {showScrollButtons && (
          <div className="absolute right-4 bottom-4 flex flex-col gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-lg"
              onClick={scrollToTop}
            >
              <ArrowUp size={16} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-lg"
              onClick={scrollToBottom}
            >
              <ArrowDown size={16} />
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border space-y-3 bg-background/50">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div 
                key={attachment.id}
                className="relative group bg-muted rounded-lg p-2 pr-8 flex items-center gap-2 max-w-[200px]"
              >
                {attachment.type === 'image' ? (
                  <ImageIcon size={16} className="flex-shrink-0" />
                ) : attachment.type === 'video' ? (
                  <VideoCamera size={16} className="flex-shrink-0" />
                ) : (
                  <File size={16} className="flex-shrink-0" />
                )}
                <span className="text-xs truncate flex-1">{attachment.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {safeMessages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendMessage('Tell me more about that')}
              className="text-xs h-7"
            >
              Tell me more
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendMessage('Can you explain in simpler terms?')}
              className="text-xs h-7"
            >
              Explain simply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => sendMessage('What else can I do?')}
              className="text-xs h-7"
            >
              What else?
            </Button>
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
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            title="Attach files"
          >
            <Paperclip size={18} />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button type="submit" size="icon" disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}>
            <PaperPlaneRight size={18} weight="fill" />
          </Button>
        </form>
      </div>
    </Card>
  )
}