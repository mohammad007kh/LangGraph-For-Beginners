// Tool Registry - Central export for all tools
import { ReadTextTool, WriteTextTool, UpdateTextTool } from './text-tools.js'
import { WikipediaSearchTool } from './research-tools.js'
import { CalculatorTool } from './calc-tools.js'
import { ConversationMemoryTool } from './memory-tools.js'

// Create tool instances
export const tools = {
  readText: new ReadTextTool(),
  writeText: new WriteTextTool(),
  updateText: new UpdateTextTool(),
  wikipediaSearch: new WikipediaSearchTool(),
  calculator: new CalculatorTool(),
  conversationMemory: new ConversationMemoryTool()
};

// Array of all tools for easy iteration
export const allTools = Object.values(tools)

// Tool names for easy reference
export const toolNames = {
  READ_TEXT: 'read_text',
  WRITE_TEXT: 'write_text',
  UPDATE_TEXT: 'update_text',
  WIKIPEDIA_SEARCH: 'wikipedia_search',
  CALCULATOR: 'calculator',
  CONVERSATION_MEMORY: 'conversation_memory'
}
