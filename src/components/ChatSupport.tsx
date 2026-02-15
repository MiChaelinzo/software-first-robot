import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/but
import { ScrollArea } from '@/components/ui/scr
import { Badge } from '@/components/ui/badg
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

  url: string
}
export type ChatSuggestion = {
  text: string
}
const DEFAULT_
 

  { id: '6', text: 'How do I a

  const [isOpe
  const [inputValue, setInputValue] = useS
 

  const scrollAreaRef = useRef<HTMLDivElement>(
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
      setUnreadCount(0)
    }

    if (!isOpen && messages.length > 0) {
 

        }
    }

    messagesEndRef.current?.scrollIntoView({ behav

    const files = event.target.files


  
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
    toast.success('Cha
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
          </div>
   

          </div>
        <div className="flex items-center
            <Button
              size="icon"
   

          )}
            variant="ghost"
            onClick={() => setIsOpen(false)}
   

      </div>
      <Scrol
          {me
              <div className="inline-fl
              </d
                <h4 className="font-semibold mb-2">Welcome to Support Chat!</h4>
       
              </div>
          )}
          {messages.map((message) => (
              key={messag
                'f
          
              <
     
   

          
                )}
              
                className={cn(
                  message.role === 'user' ? 'items-end' 
              >
                
               
                      : 'bg-muted text-foreground rounded-bl-sm'
                >
                </div>
                
                
              
                      >
                        {att.type =
                   
                          <p 
                      </d
                  </div>

             
              </div>
          ))}
          {i
              <di
              </div>
                <div cl
                  <div className="w-2 h-2 ro
                </div>
           

        </div>

        <div

              <Button
                variant="outline"
                onClick={() => handle
              >
              </Button>
          </div>
      )}
      {attachments.
          <div className="flex flex-wrap gap-2">
              <div
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-
                {att
                {att
                <b
            

              </div>
          </div>
      )}
      <form onSubmit={handle
          <input
            type="file"
            acce
            c
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
          </Button
            val
            placeholder="Type your message..
            disabled={isTyping}
          <Button
            size="icon"
            classN
            <PaperPl
        </div>
    </Card>
}














































































































































