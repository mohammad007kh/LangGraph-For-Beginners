import { BaseTool, type ToolInput, type ToolOutput } from './base-tool.js'

export class GetDateTool extends BaseTool {
  name = 'get_date'
  description = 'Return the current date and time in ISO and human-readable formats.'

  async execute(_input: ToolInput): Promise<ToolOutput> {
    try {
      const now = new Date()
      return {
        success: true,
        iso: now.toISOString(),
        human: now.toString(),
        timestamp: now.getTime()
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}