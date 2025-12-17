import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  tools_used?: string[]
}

export interface Conversation {
  id: string
  title: string
  createdAt: string
  messages?: Message[]
  document?: {
    id: string
    text: string
    updatedAt: string
  }
}

export interface ChatResponse {
  message: string
  text: string | null
  tools_used?: string[]
}

// Conversation API
export const conversationApi = {
  getAll: async (): Promise<Conversation[]> => {
    const response = await apiClient.get('/api/conversations')
    return response.data
  },

  getById: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get(`/api/conversations/${id}`)
    return response.data
  },

  create: async (title?: string): Promise<Conversation> => {
    const response = await apiClient.post('/api/conversations', { title })
    return response.data
  },

  updateTitle: async (id: string, title: string): Promise<Conversation> => {
    const response = await apiClient.patch(`/api/conversations/${id}`, { title })
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/conversations/${id}`)
  },
}

// Chat API
export const chatApi = {
  sendMessage: async (conversationId: string, message: string): Promise<ChatResponse> => {
    const response = await apiClient.post('/api/chat', {
      conversationId,
      message,
    })
    return response.data
  },
}

export default apiClient
