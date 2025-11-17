'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  BookOpen, 
  Target,
  MessageCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { askTutor, TutorResponse } from '@/lib/api'

interface Message {
  id: string
  type: 'user' | 'tutor'
  content: string
  timestamp: Date
  tutorData?: TutorResponse
}

interface TutorChatProps {
  context?: string
  className?: string
}

export function TutorChat({ context, className }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'tutor',
      content: "Hello! I'm your AI tutor. I'm here to help you understand concepts from your document. Ask me anything!",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await askTutor(inputValue, context)
      
      const tutorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'tutor',
        content: response.explanation,
        timestamp: new Date(),
        tutorData: response
      }

      setMessages(prev => [...prev, tutorMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'tutor',
        content: "I'm sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto h-[600px] flex flex-col", className)}>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span>AI Tutor</span>
            <Badge variant="secondary" className="ml-auto">
              <MessageCircle className="h-3 w-3 mr-1" />
              {messages.length - 1} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-4",
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {message.type === 'user' ? 'You' : 'AI Tutor'}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="leading-relaxed">{message.content}</p>
                    
                    {message.tutorData && (
                      <div className="space-y-4 mt-4">
                        {/* Examples */}
                        {message.tutorData.examples.length > 0 && (
                          <div>
                            <h4 className="font-semibold flex items-center mb-2">
                              <Lightbulb className="h-4 w-4 mr-2" />
                              Examples
                            </h4>
                            <ul className="space-y-1">
                              {message.tutorData.examples.map((example, index) => (
                                <li key={index} className="text-sm bg-white/50 p-2 rounded">
                                  {example}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Practice Questions */}
                        {message.tutorData.practice_questions.length > 0 && (
                          <div>
                            <h4 className="font-semibold flex items-center mb-2">
                              <Target className="h-4 w-4 mr-2" />
                              Practice Questions
                            </h4>
                            <div className="space-y-2">
                              {message.tutorData.practice_questions.map((q, index) => (
                                <div key={index} className="bg-white/50 p-3 rounded">
                                  <p className="font-medium text-sm">{q.question}</p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    💡 Hint: {q.hint}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Tips */}
                        {message.tutorData.tips.length > 0 && (
                          <div>
                            <h4 className="font-semibold flex items-center mb-2">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Study Tips
                            </h4>
                            <ul className="space-y-1">
                              {message.tutorData.tips.map((tip, index) => (
                                <li key={index} className="text-sm bg-white/50 p-2 rounded">
                                  • {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Summary */}
                        {message.tutorData.summary.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Key Takeaways</h4>
                            <ul className="space-y-1">
                              {message.tutorData.summary.map((point, index) => (
                                <li key={index} className="text-sm bg-white/50 p-2 rounded">
                                  ✓ {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex items-center space-x-2 pt-2 border-t border-white/20">
                          <Badge className={getDifficultyColor(message.tutorData.difficulty_level)}>
                            {message.tutorData.difficulty_level}
                          </Badge>
                          {message.tutorData.related_topics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI Tutor is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the document..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}