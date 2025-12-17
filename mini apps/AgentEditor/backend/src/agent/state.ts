import { Annotation } from '@langchain/langgraph'

// Define the agent state using Annotation for proper type safety with LangGraph
export const AgentState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (x, y) => (y ? y : x || []), //This says: "If there's a new value (y), use it. Otherwise keep the old value (x)."
    default: () => []
  }),
  conversationId: Annotation<string>({
    reducer: (x, y) => (y ? y : x || ''),
    default: () => ''
  }),
  currentText: Annotation<string | null>({
    reducer: (x, y) => (y !== undefined ? y : x), // Allow null values to be set
    default: () => null
  }),
  userIntent: Annotation<string>({
    reducer: (x, y) => (y ? y : x || ''),
    default: () => ''
  }),
  toolsToUse: Annotation<string[]>({
    reducer: (x, y) => (y ? y : x || []),
    default: () => []
  }),
  toolResults: Annotation<Record<string, any>>({
    reducer: (x, y) => (y ? y : x || {}),
    default: () => ({})
  }),
  needsEditor: Annotation<boolean>({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => false
  }),
  finalResponse: Annotation<{
    message: string
    text: string | null
    tools_used: string[]
  } | null>({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => null
  })
})
