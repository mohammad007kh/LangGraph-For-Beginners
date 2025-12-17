import dotenv from 'dotenv'
// Load environment variables FIRST
dotenv.config()

import express, { type Request, type Response } from 'express'
import cors from 'cors'
import prisma from './db/client.js'
import chatRoutes from './routes/chat.js'
import conversationRoutes from './routes/conversations.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`, req.body)
  next()
})

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'LangGraph Text Editor API' })
})

// Routes
app.use('/api/chat', chatRoutes)
app.use('/api/conversations', conversationRoutes)

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
