// Agent Nodes - Individual processing steps
import { ChatOpenAI } from '@langchain/openai'
import type { AgentState } from './state.js'
import { tools, toolNames } from '../tools/index.js'

type State = typeof AgentState.State

const llm = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || 'gpt-4',
  temperature: 0.7,
})

// Node 1: Analyze user intent
export async function analyzeIntent(state: State): Promise<Partial<State>> {
  const lastMessage = state.messages[state.messages.length - 1]?.content || ''
  
  const analysisPrompt = `Analyze this user request and determine their intent:
User: "${lastMessage}"

Current context:
- Has existing text in editor: ${!!state.currentText}
- Conversation history: ${state.messages.length} messages

IMPORTANT RULES:
- "create_text" ONLY if user explicitly asks to write/generate/create text (e.g., "write a letter", "create an email", "draft a document")
- Simple greetings ("hello", "hi", "hey") are "ask_question" - NOT "create_text"
- Casual chat is "ask_question" - NOT "create_text"
- "update_text" ONLY if user asks to modify existing text AND there is text in editor
- Use "research" for factual questions about topics
- Use "calculate" for math problems

Respond with JSON:
{
  "intent": "create_text" | "update_text" | "ask_question" | "research" | "calculate",
  "needsText": boolean,
  "description": "brief description of what user wants"
}`

  const response = await llm.invoke([
    { role: 'system', content: 'You are an intent analyzer. Always respond with valid JSON.' },
    { role: 'user', content: analysisPrompt }
  ])

  try {
    const intent = JSON.parse(response.content as string)
    return {
      userIntent: intent.intent,
      needsEditor: intent.needsText
    }
  } catch (error) {
    return {
      userIntent: 'ask_question',
      needsEditor: false
    }
  }
}

// Node 2: Select appropriate tools
export async function selectTools(state: State): Promise<Partial<State>> {
  const toolsToUse: string[] = []
  
  // Always load conversation memory for context
  toolsToUse.push(toolNames.CONVERSATION_MEMORY)
  
  // Check if we need current text
  if (state.userIntent === 'update_text' || state.messages.some(m => 
    m.content.toLowerCase().includes('current') || 
    m.content.toLowerCase().includes('existing')
  )) {
    toolsToUse.push(toolNames.READ_TEXT)
  }
  
  // Based on intent, select tools
  const lastMessage = state.messages[state.messages.length - 1]?.content.toLowerCase() || ''
  const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|what's up|sup)\b/i.test(lastMessage.trim())
  
  switch (state.userIntent) {
    case 'create_text':
      // Extra safeguard: don't generate text for simple greetings
      if (!isGreeting) {
        toolsToUse.push(toolNames.WRITE_TEXT)
      }
      break
    case 'update_text':
      if (!toolsToUse.includes(toolNames.READ_TEXT)) {
        toolsToUse.push(toolNames.READ_TEXT)
      }
      toolsToUse.push(toolNames.UPDATE_TEXT)
      break
    case 'research':
      toolsToUse.push(toolNames.WIKIPEDIA_SEARCH)
      break
    case 'calculate':
      toolsToUse.push(toolNames.CALCULATOR)
      break
  }
  
  return {
    toolsToUse
  }
}

// Node 3: Execute tools
export async function executeTools(state: State): Promise<Partial<State>> {
  const toolResults: Record<string, any> = {}
  const lastMessage = state.messages[state.messages.length - 1]?.content || ''
  
  for (const toolName of state.toolsToUse) {
    try {
      let result
      
      switch (toolName) {
        case toolNames.READ_TEXT:
          result = await tools.readText.execute({
            conversationId: state.conversationId
          })
          toolResults[toolName] = result
          if (result.success && result.text) {
            state.currentText = result.text
          }
          break
          
        case toolNames.WRITE_TEXT:
          result = await tools.writeText.execute({
            conversationId: state.conversationId,
            prompt: lastMessage,
            style: 'professional'
          })
          toolResults[toolName] = result
          if (result.success) {
            state.currentText = result.text
          }
          break
          
        case toolNames.UPDATE_TEXT:
          if (state.currentText) {
            result = await tools.updateText.execute({
              conversationId: state.conversationId,
              instruction: lastMessage,
              currentText: state.currentText
            })
            toolResults[toolName] = result
            if (result.success) {
              state.currentText = result.text
            }
          }
          break
          
        case toolNames.WIKIPEDIA_SEARCH:
          // Extract search query from message
          const query = lastMessage.replace(/search|find|look up|about/gi, '').trim()
          result = await tools.wikipediaSearch.execute({
            query,
            maxResults: 2
          })
          toolResults[toolName] = result
          break
          
        case toolNames.CALCULATOR:
          // Extract math expression
          const expression = extractMathExpression(lastMessage)
          if (expression) {
            result = await tools.calculator.execute({ expression })
            toolResults[toolName] = result
          }
          break
          
        case toolNames.CONVERSATION_MEMORY:
          result = await tools.conversationMemory.execute({
            conversationId: state.conversationId,
            lastN: 5
          })
          toolResults[toolName] = result
          break
      }
    } catch (error) {
      toolResults[toolName] = {
        success: false,
        error: (error as Error).message
      }
    }
  }
  
  return {
    toolResults,
    currentText: state.currentText
  }
}

// Node 4: Generate final response
export async function generateResponse(state: State): Promise<Partial<State>> {
  const lastMessage = state.messages[state.messages.length - 1]?.content || ''
  
  // Build context from tool results
  let context = 'Tool Results:\n'
  for (const [toolName, result] of Object.entries(state.toolResults)) {
    if (result.success) {
      context += `- ${toolName}: ${JSON.stringify(result, null, 2)}\n`
    }
  }
  
  const responsePrompt = `Generate a helpful response to the user based on the tool results.

User Request: "${lastMessage}"
User Intent: ${state.userIntent}

${context}

IMPORTANT RULES:
1. Keep your response SHORT and conversational (1-3 sentences maximum)
2. DO NOT include the generated text content in your response
3. Only describe what you did or provide information requested
4. If text was generated, just mention it was created/updated - don't show the text itself

Examples:
- "I've generated a 250-word letter for you."
- "The result is 4."
- "I found information about Python's history."
- "I've updated the text as requested."

Response:`

  const response = await llm.invoke([
    { role: 'system', content: 'You are a helpful writing assistant. Be VERY concise. Never include generated text in your messages - that goes in the editor panel.' },
    { role: 'user', content: responsePrompt }
  ])

  const finalResponse = {
    message: response.content as string,
    text: state.currentText,
    tools_used: state.toolsToUse
  }

  return {
    finalResponse
  }
}

// Helper function to extract math expressions
function extractMathExpression(text: string): string | null {
  // Look for math patterns
  const patterns = [
    /(\d+\s*[\+\-\*\/\^]\s*\d+)+/g,
    /(\d+\s*\*\*\s*\d+)/g,
    /sqrt\(\d+\)/g,
    /(\d+)\s*days/gi,
    /(\d+)\s*weeks/gi
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[0].replace(/days|weeks/gi, '').trim()
    }
  }
  
  return null
}
