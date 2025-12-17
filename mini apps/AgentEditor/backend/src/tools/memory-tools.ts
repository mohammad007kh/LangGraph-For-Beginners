import { BaseTool, type ToolInput, type ToolOutput } from './base-tool.js'
import prisma from '../db/client.js'

// Tool 6: Conversation Memory
export class ConversationMemoryTool extends BaseTool {
  name = 'conversation_memory'
  description = 'Retrieve past messages from the conversation history. Use this to understand context or recall what was discussed. Input: { conversationId: string, lastN?: number }'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { conversationId, lastN = 10 } = input

      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: lastN
      })

      const formattedMessages = messages.reverse().map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt.toISOString()
      }))

      return {
        success: true,
        messages: formattedMessages,
        count: formattedMessages.length
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        messages: []
      }
    }
  }
}
