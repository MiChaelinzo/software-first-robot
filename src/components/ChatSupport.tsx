import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ChatCircleDots,
  PaperPlaneRight,
  Trash,
  Sparkle,
  X
} from '@phosphor-icons/react'

  id: string
  content: s
}
const DEFAULT_SUG
  { id: '2', text: 
]

  const [messages, setMessage
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS)

 

  }, [isOpen, messages])
  const generateAIResponse = async (userMessa
      const contextMessages = conversationHistory.slice(-3).m
      ).join('\n')
      const promptText = `You are a helpful AI as

${contextMessages}
User message: "${userMessage}"

      const respons
    } catch (erro
      return "I can hel
  }
  con


      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
        c
          return parsed.suggestions.map((s: any, idx: number) => ({
            text: s.text,
          }))

      console.error('Failed to generate suggestions', error)


  const handleSubmit =


      id: `msg-${Date.now()}`,

    }

    setIsTyping(true)
    setTimeout(async 

      console.error('AI Error:', error)
      return "I can help you with that! The simulation shows real-time warehouse robotics with AI-powered path planning and collision avoidance. Try asking about specific metrics or features you'd like to understand better."
    }
  }

  const generateSmartSuggestions = async (conversationContext: ChatMessage[]) => {
    if (conversationContext.length === 0) return DEFAULT_SUGGESTIONS

    try {
      const promptText = `Based on this conversation, suggest 3 follow-up questions a user might ask. Return as JSON with format: {"suggestions":[{"text":"question 1"},{"text":"question 2"},{"text":"question 3"}]}`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      if (response) {
        const parsed = JSON.parse(response)
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return parsed.suggestions.map((s: any, idx: number) => ({
            id: `suggestion-${idx}`,
            text: s.text,
            category: 'question' as const
          }))
        }
      }
    } catch (error) {
      console.error('Failed to generate suggestions', error)
    }

    return DEFAULT_SUGGESTIONS
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputValue, [...messages, userMessage])

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
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
    }, 100)
  }

  const handleSuggestionClick = (suggestion: typeof DEFAULT_SUGGESTIONS[0]) => {
    setInputValue(suggestion.text)
  }

  const handleClearChat = () => {
    setMessages([])
    setSuggestions(DEFAULT_SUGGESTIONS)
    toast.success('Chat cleared')
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg relative bg-primary hover:bg-primary/90"
        >
          <ChatCircleDots size={28} weight="duotone" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 rounded-full bg-destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] z-50 glass-panel flex flex-col shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkle size={20} weight="duotone" className="text-accent" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={handleClearChat} className="h-8 w-8">
              <Trash size={16} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
          )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Sparkle size={48} weight="duotone" className="mx-auto mb-4 text-accent" />
            <p className="text-sm">Ask me anything about the warehouse simulation!</p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] space-y-2'
                )}
              >

                  className={cn(
                    'p-3 rounded-2xl text-sm',
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  )}
                >
                  {msg.content}
                </div>
                <div className="text-xs text-muted-foreground px-2">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-2xl">

                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-3">
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map(suggestion => (
              <Badge 
                key={suggestion.id}
                variant="outline" 
                className="cursor-pointer hover:bg-accent/10 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}

                {suggestion.text}
              </Badge>
            ))}

        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim()}>
            <PaperPlaneRight size={18} weight="bold" />
          </Button>
        </form>
      </div>

  )

