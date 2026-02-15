import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ChatCircleDots,
  Trash,
  X,
  Sparkle,
  PaperPlaneRight
} from '@phosphor-icons/react'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const DEFAULT_SUGGESTIONS = [
  { id: '1', text: 'How does collision avoidance work?', category: 'feature' as const },
  { id: '2', text: 'What is the learning rate?', category: 'metric' as const },
  { id: '3', text: 'How can I optimize performance?', category: 'question' as const }
]

export function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [isOpen, messages, isTyping])

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

      // @ts-ignore
      const response = await window.spark.llm(promptText, 'gpt-4o-mini')
      return response || "I can help you with that! The simulation shows real-time warehouse robotics with AI-powered path planning. Try asking about specific metrics."
    } catch (error) {
      console.error('Failed to generate AI response:', error)
      return "I'm having trouble connecting right now. The simulation features AI-powered robotics with adaptive learning. What specific aspect would you like to know about?"
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Scroll immediately after user message
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const aiResponse = await generateAIResponse(content, messages)
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, assistantMessage])
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
    sendMessage(inputValue)
  }

  const handleClearChat = () => {
    setMessages([])
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <ChatCircleDots size={24} weight="duotone" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground">
            {unreadCount}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col glass-panel bg-card/95 backdrop-blur border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkle size={20} weight="duotone" className="text-primary" />
          </div>
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleClearChat} title="Clear Chat">
              <Trash size={16} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkle size={48} weight="duotone" className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">Ask me anything about the simulation!</p>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted rounded-tl-none'
                )}
              >
                <p>{message.content}</p>
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

      <div className="p-4 border-t border-border space-y-3 bg-background/50">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(suggestion.text)}
                className="text-xs h-auto py-1 whitespace-normal text-left"
              >
                {suggestion.text}
              </Button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}>
            <PaperPlaneRight size={18} weight="fill" />
          </Button>
        </form>
      </div>
    </Card>
  )
}