'use client'

import { useState, useEffect } from 'react'
import { conversationApi, chatApi, type Conversation, type Message } from '@/lib/api-client'
import ConversationList from './components/ConversationList'
import ChatArea from './components/ChatArea'
import TextEditor from './components/TextEditor'

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [editorContent, setEditorContent] = useState<string>('')
  const [editorVisible, setEditorVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const convos = await conversationApi.getAll()
      setConversations(convos)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const createNewConversation = async () => {
    try {
      const newConvo = await conversationApi.create('New Chat')
      setConversations([newConvo, ...conversations])
      setActiveConversation(newConvo)
      setMessages([])
      setEditorContent('')
      setEditorVisible(false)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const selectConversation = async (conversation: Conversation) => {
    try {
      const fullConvo = await conversationApi.getById(conversation.id)
      setActiveConversation(fullConvo)
      setMessages(fullConvo.messages || [])
      
      if (fullConvo.document?.text) {
        setEditorContent(fullConvo.document.text)
        setEditorVisible(true)
      } else {
        setEditorContent('')
        setEditorVisible(false)
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const editConversationTitle = async (id: string, title: string) => {
    try {
      const updated = await conversationApi.updateTitle(id, title)
      setConversations(conversations.map(c => c.id === id ? updated : c))
      if (activeConversation?.id === id) {
        setActiveConversation(updated)
      }
    } catch (error) {
      console.error('Failed to update conversation title:', error)
    }
  }

  const deleteConversation = async (id: string) => {
    try {
      await conversationApi.delete(id)
      setConversations(conversations.filter(c => c.id !== id))
      if (activeConversation?.id === id) {
        setActiveConversation(null)
        setMessages([])
        setEditorContent('')
        setEditorVisible(false)
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  const sendMessage = async (message: string) => {
    if (!activeConversation || !message.trim()) return

    setIsLoading(true)

    // Add user message optimistically
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await chatApi.sendMessage(activeConversation.id, message)

      // Add AI message with tool usage
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        createdAt: new Date().toISOString(),
        tools_used: response.tools_used || []
      }
      setMessages(prev => [...prev, aiMessage])

      // Update editor if text was generated
      if (response.text !== null) {
        setEditorContent(response.text)
        setEditorVisible(true)
      }

      // Refresh conversations list to update preview
      loadConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          onSelect={selectConversation}
          onNew={createNewConversation}
          onDelete={deleteConversation}
          onEditTitle={editConversationTitle}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${editorVisible ? 'max-w-[50%]' : ''}`}>
        <ChatArea
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          hasActiveConversation={!!activeConversation}
        />
      </div>

      {/* Editor (conditionally visible) */}
      {editorVisible && (
        <div className="w-1/2 border-l border-gray-200 bg-white">
          <TextEditor content={editorContent} />
        </div>
      )}
    </div>
  )
}
