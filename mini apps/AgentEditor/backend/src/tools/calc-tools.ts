import { BaseTool, type ToolInput, type ToolOutput } from './base-tool.js'
import { evaluate } from 'mathjs'

// Tool 5: Calculator
export class CalculatorTool extends BaseTool {
  name = 'calculator'
  description = 'Perform mathematical calculations. Use this when user needs to calculate numbers, dates, or solve math problems. Input: { expression: string }'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { expression } = input

      // Evaluate mathematical expression
      const result = evaluate(expression)

      return {
        success: true,
        result,
        expression
      }
    } catch (error) {
      return {
        success: false,
        error: `Invalid expression: ${(error as Error).message}`,
        result: null
      }
    }
  }
}
