import { useState, useRef, useEffect } from 'react'
import { type Message } from '@/lib/api-client'
import MessageComponent from './Message'

interface ChatAreaProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading: boolean
  hasActiveConversation: boolean
}

export default function ChatArea({
  messages,
  onSendMessage,
  isLoading,
  hasActiveConversation,
}: ChatAreaProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px' // 120px ≈ 5 rows
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-semibold text-gray-900">
          LangGraph Text Editor
        </h1>
        <p className="text-sm text-gray-500">
          AI-powered text editing assistant
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasActiveConversation ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Welcome to LangGraph Text Editor
              </h2>
              <p className="text-gray-500">
                Create a new chat to get started
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">
                Start a conversation...
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-pulse">●</div>
            <div className="animate-pulse animation-delay-200">●</div>
            <div className="animate-pulse animation-delay-400">●</div>
            <span className="ml-2">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={hasActiveConversation ? "Type your message... (Shift+Enter for new line)" : "Create a conversation first"}
            disabled={!hasActiveConversation || isLoading}
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-900 placeholder-gray-400 resize-none overflow-y-auto max-h-[120px]"
          />
          <button
            type="submit"
            disabled={!hasActiveConversation || isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium h-10"
          >
            Send
          </button>
        </form>
      </div>
    </>
  )
}
