import { Router, type Request, type Response } from 'express'
import prisma from '../db/client.js'

const router = Router()

// GET /api/conversations - Get all conversations
router.get('/', async (req: Request, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    res.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

// POST /api/conversations - Create a new conversation
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title } = req.body
    console.log('Creating conversation with title:', title || 'New Chat')

    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Chat'
      }
    })

    console.log('Conversation created successfully:', conversation.id)
    res.json(conversation)
  } catch (error) {
    console.error('Error creating conversation:', error)
    console.error('Error details:', (error as Error).message)
    console.error('Error stack:', (error as Error).stack)
    res.status(500).json({ error: 'Failed to create conversation' })
  }
})

// PATCH /api/conversations/:id - Update conversation title
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Conversation ID is required' })
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: { title: title.trim() }
    })

    res.json(conversation)
  } catch (error) {
    console.error('Error updating conversation:', error)
    res.status(500).json({ error: 'Failed to update conversation' })
  }
})

// GET /api/conversations/:id - Get a specific conversation with messages
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'Conversation ID is required' })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        document: true
      }
    })

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    res.json(conversation)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
})

// DELETE /api/conversations/:id - Delete a conversation
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'Conversation ID is required' })
    }

    await prisma.conversation.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    res.status(500).json({ error: 'Failed to delete conversation' })
  }
})

export default router
