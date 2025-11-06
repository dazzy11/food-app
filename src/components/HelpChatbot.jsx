import React, { useState, useRef, useEffect } from 'react'
import { getGroqStream } from '../utils/groqClient'

const HelpChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your food and health assistant. How can I help you today?",
      isUser: false
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Add initial bot message
    const botMessageId = Date.now() + 1
    setMessages(prev => [...prev, {
      id: botMessageId,
      text: '',
      isUser: false
    }])

    try {
      const prompt = `You are a helpful food and health assistant. The user is asking: "${inputMessage}". 
      Please provide a helpful, accurate response about food, nutrition, health, or food recommendations. 
      Keep your response conversational and practical.`

      await getGroqStream(
        prompt,
        (chunk) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: msg.text + chunk }
              : msg
          ))
        },
        (completeResponse) => {
          setIsLoading(false)
        }
      )
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: "Sorry, I'm having trouble responding right now. Please try again." }
          : msg
      ))
      setIsLoading(false)
    }
  }

  return (
    <>
      <button 
        className="help-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

      {isOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <h3>Food & Health Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer'}}
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isUser ? 'user' : 'bot'}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="loading"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about food, health, or recommendations..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !inputMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default HelpChatbot