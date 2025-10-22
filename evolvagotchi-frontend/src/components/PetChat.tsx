import { useState, useEffect, useRef } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { getPetResponse } from '../services/groqService'
import type { PetContext } from '../services/groqService'

interface Message {
  id: string
  text: string
  sender: 'user' | 'pet'
  timestamp: Date
}

interface PetChatProps {
  petName: string
  evolutionStage: number
  happiness: number
  hunger: number
  health: number
  age: number
}

export function PetChat({ petName, evolutionStage, happiness, hunger, health, age }: PetChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Only scroll if user is already near the bottom
    const chatDiv = chatMessagesRef.current
    if (!chatDiv) return
    const threshold = 80 // px
    const atBottom = chatDiv.scrollHeight - chatDiv.scrollTop - chatDiv.clientHeight < threshold
    if (atBottom) {
      scrollToBottom()
    }
  }, [messages])

  // Send greeting when component mounts
  useEffect(() => {
    handleGreeting()
  }, [])

  const addMessage = (text: string, sender: 'user' | 'pet') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleGreeting = async () => {
    setIsLoading(true)
    const context: PetContext = {
      name: petName,
      evolutionStage,
      happiness,
      hunger,
      health,
      age,
      interaction: 'greet',
    }

    const response = await getPetResponse(context)
    addMessage(response, 'pet')
    setIsLoading(false)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    addMessage(userMessage, 'user')

    setIsLoading(true)

    const context: PetContext = {
      name: petName,
      evolutionStage,
      happiness,
      hunger,
      health,
      age,
      interaction: 'chat',
      userMessage,
    }

    const response = await getPetResponse(context)
    addMessage(response, 'pet')
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="pet-chat">
      <div className="chat-header">
        <Sparkles size={18} />
        <h3>Talk to {petName}</h3>
      </div>

      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <div className="message-bubble">
              {msg.text}
            </div>
            <span className="message-time">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message pet">
            <div className="message-bubble loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Chat with ${petName}...`}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={!input.trim() || isLoading}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}