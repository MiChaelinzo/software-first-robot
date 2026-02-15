import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scr
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
  ChatCircleDots,
  Trash,
  X
import {
  ChatCircleDots,
  PaperPlaneRight,
  Trash,
  Sparkle,
  X
} from '@phosphor-icons/react'

interface ChatMessage {
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
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
     
  }, [isOpen, messages])

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
      return response || "I can help you with that! The simulation shows real-time warehouse robotics with AI-powered path planning and collision avoidance. Try asking about specific metrics or features you'd like to understand better."
    } catch (error) {
      console.error('Failed to generate

  }
  c


      id: `msg-${Date.now()}`,

    }
    setMessages(prev => [...prev, userMessage])

    setTimeout(async () => {

        id: `msg-${Date.now()}-ai`,
        content: aiResponse,
      }
      setMessages(prev => [...prev, 

        setUnreadCount(prev => prev + 1)

      set
  }
  const handleSuggest
  }
  con

  }
  i

          onClick={() => setIsOpen(true)}
          className="r

            <Badge className="abso

        </Button>
    )

    <Card className="fixed
        <div className="fle
     

            <Button variant="ghost" size="icon"
            </Button>
          <Button var

      </div>
      <ScrollArea className="flex-1 p-4">

            <p className="text-sm">Ask me any
        )}
        <div className="sp
            <div
              className={cn(
       

                className={cn(
                )}

                    
                      ? 'bg-primary text
       

                <div className="text-xs text-muted-foreground px-2">
                    hour: '2-digit',
           
   

          {isTyping && (
              <div className="bg-m
   

              </div>
          )}
          <div ref={messagesEndRef} />
      </ScrollArea>
   

              <B
            
                onClick={() => handleSuggestionClic
               
            ))}
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
         
            placeholder="Ask a question..."
          />
            <PaperPlaneRight size={18} weight="bold" />
        </form>
    </Card>
}



















            <X size={16} />


























                <div






















                <div className="flex gap-1">





















              >



          </div>














    </Card>

}
