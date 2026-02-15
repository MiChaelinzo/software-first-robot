import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ChatCircleDots,
  PaperPlaneRight,
  Trash,
  Image as ImageIcon,
  Microphone,
  VideoCamera,
  X,
  Sparkle,
  Paperclip,
  FileText,
  SpeakerHigh
} from '@phosphor-icons/react'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  attachments?: ChatAttachment[]
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
  { id: '5', text: 'How does collision avoidance work?', category: 'question' }
]

export function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>(DEFAULT_SUGGESTIONS)
  
  // Voice state
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0)
    }
  }, [isOpen, messages])

  const generateAIResponse = async (userMessage: string, userAttachments?: ChatAttachment[]) => {
    try {
      let promptContext = `You are a helpful AI assistant for an autonomous warehouse robotics simulation platform.
      
User message: "${userMessage}"`

      if (userAttachments && userAttachments.length > 0) {
        promptContext += `\n\nThe user has attached ${userAttachments.length} file(s):`
        userAttachments.forEach(att => {
          promptContext += `\n- ${att.name} (${att.type})`
        })
        promptContext += `\n\nAcknowledge their attachments and provide relevant assistance.`
      }

      // @ts-ignore
      if (window.spark?.llm) {
        // @ts-ignore
        const response = await window.spark.llm(promptContext, 'gpt-4o-mini')
        return response
      }
      
      // Fallback if LLM is not available
      return "I can help you with that simulation task. What specific parameters would you like to adjust?"
    } catch (error) {
      console.error('AI Error:', error)
      return "I'm having trouble connecting to the AI service right now. Please try again."
    }
  }

  const generateSmartSuggestions = async (conversationContext: ChatMessage[]) => {
    if (conversationContext.length === 0) return DEFAULT_SUGGESTIONS

    try {
      const recentMessages = conversationContext.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')
      const promptText = `Based on this conversation, suggest 3 follow-up actions:\n${recentMessages}\nReturn JSON with "suggestions" array ({text, category}).`
      
      // @ts-ignore
      if (window.spark?.llm) {
        // @ts-ignore
        const response = await window.spark.llm(promptText, 'gpt-4o-mini', true) // true for JSON
        const parsed = JSON.parse(response)
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return parsed.suggestions.map((s: any, idx: number) => ({
            id: `smart-${Date.now()}-${idx}`,
            text: s.text,
            category: s.category || 'question'
          }))
        }
      }
    } catch (error) {
      console.error('Failed to generate suggestions', error)
    }
    return DEFAULT_SUGGESTIONS
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

    // Simulate network delay for AI
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
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1)
      }

      const newSuggestions = await generateSmartSuggestions([...messages, userMessage, assistantMessage])
      setSuggestions(newSuggestions)
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() || attachments.length > 0) {
      sendMessage(inputValue, attachments.length > 0 ? [...attachments] : undefined)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newAttachments: ChatAttachment[] = []
    
    Array.from(files).forEach((file, i) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', { description: `${file.name} exceeds 10MB limit` })
        return
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
        setAttachments(prev => [...prev, attachment])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleClearChat = () => {
    setMessages([])
    setSuggestions(DEFAULT_SUGGESTIONS)
    toast.info('Chat cleared')
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg relative bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ChatCircleDots size={28} weight="duotone" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-destructive text-destructive-foreground rounded-full">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] z-50 glass-panel flex flex-col shadow-xl bg-card/95 backdrop-blur border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkle size={20} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Support</h3>
            <p className="text-xs text-muted-foreground">Online • GPT-4o</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={handleClearChat} title="Clear Chat">
            <Trash size={18} />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="voice">Voice Mode</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  <Sparkle size={48} className="mx-auto mb-4 opacity-20" />
                  <p>How can I help you with the simulation today?</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex gap-2 flex-wrap justify-end">
                      {msg.attachments.map(att => (
                        <div key={att.id} className="relative group rounded-md overflow-hidden border border-border w-16 h-16">
                          {att.type === 'image' ? (
                            <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-background">
                              <FileText size={24} className="text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <span className="text-[10px] text-muted-foreground px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-75" />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-150" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border bg-background/50">
            {suggestions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
                {suggestions.map(s => (
                  <Badge 
                    key={s.id} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 whitespace-nowrap"
                    onClick={() => sendMessage(s.text)}
                  >
                    {s.text}
                  </Badge>
                ))}
              </div>
            )}

            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2 overflow-x-auto py-2">
                {attachments.map(att => (
                  <div key={att.id} className="relative group w-12 h-12 flex-shrink-0">
                    {att.type === 'image' ? (
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover rounded-md border border-border" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted rounded-md border border-border">
                        <FileText size={20} />
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={20} />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" size="icon" disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}>
                <PaperPlaneRight size={20} weight="fill" />
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-0 space-y-6">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isVoiceListening ? 'bg-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.3)]' : 'bg-muted'}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-background transition-transform ${isVoiceListening ? 'scale-110' : 'scale-100'}`}>
              <Microphone 
                size={40} 
                weight={isVoiceListening ? "fill" : "regular"}
                className={isVoiceListening ? "text-primary animate-pulse" : "text-muted-foreground"} 
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Voice Control</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
              {isVoiceListening 
                ? "Listening... Speak naturally to control the simulation." 
                : "Tap the microphone to start voice commands."}
            </p>
          </div>

          <Button 
            size="lg" 
            variant={isVoiceListening ? "destructive" : "default"}
            onClick={() => setIsVoiceListening(!isVoiceListening)}
            className="w-full max-w-[200px]"
          >
            {isVoiceListening ? "Stop Listening" : "Start Listening"}
          </Button>

          {isVoiceListening && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              <SpeakerHigh size={14} />
              <span>Voice output active</span>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}