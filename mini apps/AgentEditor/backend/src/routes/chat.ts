import { Router, type Request, type Response } from 'express'
import prisma from '../db/client.js'
import { createAgent } from '../agent/graph.js'

const router = Router()

// Create agent instance
const agent = createAgent()

// POST /api/chat - Send a message (Phase 2: LangGraph Agent)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { conversationId, message } = req.body

    if (!conversationId || !message) {
      return res.status(400).json({ error: 'conversationId and message are required' })
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content: message
      }
    })

    // Load conversation history
    const previousMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10
    })

    const messageHistory = previousMessages.map(m => ({
      role: m.role,
      content: m.content
    }))

    // Load current document text if exists
    const document = await prisma.document.findUnique({
      where: { conversationId }
    })

    // Create initial agent state
    const initialState = {
      messages: messageHistory,
      conversationId,
      currentText: document?.text || null,
      userIntent: '',
      toolsToUse: [],
      toolResults: {},
      needsEditor: false,
      finalResponse: null
    }

    // Run the agent
    console.log('🤖 Running agent for conversation:', conversationId)
    const result = await agent.invoke(initialState)

    // Extract final response
    const aiResponse = result.finalResponse || {
      message: 'I encountered an issue processing your request.',
      text: null,
      tools_used: []
    }

    console.log('✅ Agent completed. Tools used:', aiResponse.tools_used)

    // Save AI message
    await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: aiResponse.message
      }
    })

    // Auto-generate title if this is the first user message
    if (previousMessages.length === 1) {
      try {
        const { ChatOpenAI } = await import('@langchain/openai')
        const llm = new ChatOpenAI({ modelName: 'gpt-4', temperature: 0.3 })
        const titlePrompt = `Generate a very short title (3-5 words max) for a conversation that starts with: "${message}"

Respond with ONLY the title, no quotes or extra text.`
        const titleResponse = await llm.invoke([{ role: 'user', content: titlePrompt }])
        const title = (titleResponse.content as string).replace(/["']/g, '').trim()
        
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { title }
        })
      } catch (error) {
        console.error('Failed to generate title:', error)
      }
    }

    // Return structured response with tool usage
    res.json({
      message: aiResponse.message,
      text: aiResponse.text,
      tools_used: aiResponse.tools_used || []
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

export default router
