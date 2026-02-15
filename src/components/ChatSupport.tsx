import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  ArrowCounterClockwise,
  Sparkle
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

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
  url: string
  size: number
}

export type ChatSuggestion = {
  id: string
  text: string
  category: 'question' | 'action' | 'help'
}

const DEFAULT_SUGGESTIONS: ChatSuggestion[] = [
  { id: '1', text: 'How do I start the simulation?', category: 'question' },
  { id: '2', text: 'What do the robot colors mean?', category: 'question' },
  { id: '3', text: 'Optimize my warehouse layout', category: 'action' },
  { id: '4', text: 'Explain collision avoidance', category: 'help' },
  { id: '5', text: 'Show me performance tips', category: 'help' },
  { id: '6', text: 'How do I add more robots?', category: 'question' },
]

export function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useKV<ChatMessage[]>('chat_messages', [])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>(DEFAULT_SUGGESTIONS)
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      scrollToBottom()
    }
  }, [isOpen, messages])

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        const now = Date.now()
        if (now - lastMessage.timestamp < 2000) {
          setUnreadCount(prev => prev + 1)
        }
      }
    }
  }, [messages, isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  const generateAIResponse = async (userMessage: string, userAttachments?: ChatAttachment[]): Promise<string> => {
    try {
      let promptContext = `You are a helpful AI assistant for an autonomous warehouse robotics simulation platform. 
A user has sent you a message. Provide a helpful, concise, and friendly response.

User message: "${userMessage}"`

      if (userAttachments && userAttachments.length > 0) {
        promptContext += `\n\nThe user has attached ${userAttachments.length} file(s):`
        userAttachments.forEach(att => {
          promptContext += `\n- ${att.name} (${att.type})`
        })
        promptContext += `\n\nAcknowledge their attachments and provide relevant assistance.`
      }

      promptContext += `\n\nKeep your response under 3 sentences and be specific to warehouse robotics, simulation controls, or the platform features.`

      const prompt = window.spark.llmPrompt`${promptContext}`
      const response = await window.spark.llm(prompt, 'gpt-4o-mini')
      return response
    } catch (error) {
      return "I'm here to help! Could you please rephrase your question? I can assist with simulation controls, robot management, analytics, and more."
    }
  }

  const generateSmartSuggestions = async (conversationContext: ChatMessage[]): Promise<ChatSuggestion[]> => {
    if (conversationContext.length === 0) {
      return DEFAULT_SUGGESTIONS
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

      const prompt = window.spark.llmPrompt`${promptText}`
      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
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

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    sendMessage(suggestion.text)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() || attachments.length > 0) {
      sendMessage(inputValue, attachments.length > 0 ? [...attachments] : undefined)
    }
  }

  const handleClearChat = () => {
    setMessages([])
    setSuggestions(DEFAULT_SUGGESTIONS)
    setAttachments([])
    toast.success('Chat cleared')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 bg-primary hover:bg-primary/90"
      >
        <ChatCircleDots size={28} weight="duotone" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground">
            {unreadCount}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] shadow-2xl flex flex-col glass-panel overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Robot size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Support Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="h-8 w-8"
            >
              <Trash size={18} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex p-4 rounded-full bg-primary/10">
                <Sparkle size={32} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Welcome to Support Chat!</h4>
                <p className="text-sm text-muted-foreground">
                  Ask me anything about the warehouse simulation, controls, or features.
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  message.role === 'user' ? 'bg-accent/20' : 'bg-primary/20'
                )}
              >
                {message.role === 'user' ? (
                  <User size={18} weight="duotone" className="text-accent" />
                ) : (
                  <Robot size={18} weight="duotone" className="text-primary" />
                )}
              </div>
              
              <div
                className={cn(
                  'flex-1 space-y-2',
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'inline-block rounded-2xl px-4 py-2 max-w-[280px]',
                    message.role === 'user'
                      ? 'bg-accent text-accent-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  )}
                >
                  <p className="text-sm break-words">{message.content}</p>
                </div>

                {message.attachments && message.attachments.length > 0 && (
                  <div className="space-y-2">
                    {message.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg p-2 max-w-[280px]"
                      >
                        {att.type === 'image' && <ImageIcon size={16} />}
                        {att.type === 'video' && <VideoCamera size={16} />}
                        {att.type === 'file' && <FileText size={16} />}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{att.name}</p>
                          <p className="text-muted-foreground">{formatFileSize(att.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground px-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary/20">
                <Robot size={18} weight="duotone" className="text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {suggestions.length > 0 && messages.length < 6 && (
        <div className="px-4 py-2 border-t border-border/50 bg-card/30">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Suggested:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs h-7 rounded-full"
              >
                {suggestion.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-border/50 bg-card/30">
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs"
              >
                {att.type === 'image' && <ImageIcon size={14} />}
                {att.type === 'video' && <VideoCamera size={14} />}
                {att.type === 'file' && <FileText size={14} />}
                <span className="max-w-[100px] truncate">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/50">
        <div className="flex gap-2">
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
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Paperclip size={20} />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            type="submit"
            size="icon"
            disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
            className="flex-shrink-0"
          >
            <PaperPlaneRight size={20} weight="fill" />
          </Button>
        </div>
      </form>
    </Card>
  )
}
