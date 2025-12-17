// Base tool interface for all agent tools
export interface ToolInput {
  [key: string]: any
}

export interface ToolOutput {
  success: boolean
  [key: string]: any
}

export abstract class BaseTool {
  abstract name: string
  abstract description: string
  
  abstract execute(input: ToolInput): Promise<ToolOutput>
  
  // Convert tool to LangChain format
  toLangChainTool() {
    return {
      name: this.name,
      description: this.description,
      func: async (input: string) => {
        try {
          const parsedInput = typeof input === 'string' ? JSON.parse(input) : input
          const result = await this.execute(parsedInput)
          return JSON.stringify(result)
        } catch (error) {
          return JSON.stringify({ success: false, error: (error as Error).message })
        }
      }
    }
  }
}
