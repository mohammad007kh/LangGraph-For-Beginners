import { BaseTool, type ToolInput, type ToolOutput } from './base-tool.js'
import prisma from '../db/client.js'
import { ChatOpenAI } from '@langchain/openai'

const llm = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || 'gpt-4',
  temperature: 0.7,
})

// Tool 1: Read current text from editor
export class ReadTextTool extends BaseTool {
  name = 'read_text'
  description = 'Read the current text content from the editor. Use this before updating text or when the user asks about the current content. Input: { conversationId: string }'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { conversationId } = input
      
      const document = await prisma.document.findUnique({
        where: { conversationId }
      })

      return {
        success: true,
        text: document?.text || null,
        hasText: !!document?.text
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        text: null
      }
    }
  }
}

// Tool 2: Write new text to editor
export class WriteTextTool extends BaseTool {
  name = 'write_text'
  description = 'Generate and write new text to the editor. Use this when user wants to create new content from scratch. Input: { conversationId: string, prompt: string, style?: string }'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { conversationId, prompt, style = 'professional' } = input

      // Generate text based on prompt
      const systemPrompt = `You are a professional writing assistant. Generate clear, well-structured text in a ${style} style.`
      
      const response = await llm.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ])

      const generatedText = response.content as string

      // Save to database
      const existingDoc = await prisma.document.findUnique({
        where: { conversationId }
      })

      if (existingDoc) {
        await prisma.document.update({
          where: { conversationId },
          data: { text: generatedText }
        })
      } else {
        await prisma.document.create({
          data: {
            conversationId,
            text: generatedText
          }
        })
      }

      return {
        success: true,
        text: generatedText,
        wordCount: generatedText.split(' ').filter(Boolean).length
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        text: null
      }
    }
  }
}

// Tool 3: Update existing text
export class UpdateTextTool extends BaseTool {
  name = 'update_text'
  description = 'Modify existing text in the editor based on user instructions. Use this when user wants to edit, refine, or change existing content. Input: { conversationId: string, instruction: string, currentText: string }'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { conversationId, instruction, currentText } = input

      if (!currentText) {
        return {
          success: false,
          error: 'No text to update. Use write_text instead.',
          text: null
        }
      }

      // Update text based on instruction
      const systemPrompt = 'You are a professional text editor. Apply the requested changes to the text while maintaining quality and coherence.'
      const userPrompt = `Current text:\n${currentText}\n\nInstruction: ${instruction}\n\nProvide the updated text:`

      const response = await llm.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ])

      const updatedText = response.content as string

      // Save to database
      await prisma.document.update({
        where: { conversationId },
        data: { text: updatedText }
      })

      return {
        success: true,
        text: updatedText,
        changesApplied: instruction,
        wordCount: updatedText.split(' ').filter(Boolean).length
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        text: null
      }
    }
  }
}
