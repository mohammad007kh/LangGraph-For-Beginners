// LangGraph Agent Graph
import { StateGraph, END } from '@langchain/langgraph'
import { AgentState } from './state.js'
import {
  analyzeIntent,
  selectTools,
  executeTools,
  generateResponse
} from './nodes.js'

// Create the agent graph
export function createAgent() {
  // Create workflow with the Annotation-based state
  const workflow = new StateGraph(AgentState)

  // Add nodes
  workflow.addNode('analyzeIntent', analyzeIntent)
  workflow.addNode('selectTools', selectTools)
  workflow.addNode('executeTools', executeTools)
  workflow.addNode('generateResponse', generateResponse)
  
  // Add edges from START to first node
  workflow.addEdge('__start__', 'analyzeIntent' as any)
  workflow.addEdge('analyzeIntent' as any, 'selectTools' as any)
  workflow.addEdge('selectTools' as any, 'executeTools' as any)
  workflow.addEdge('executeTools' as any, 'generateResponse' as any)
  workflow.addEdge('generateResponse' as any, END as any)

  // Compile the graph
  return workflow.compile()
}
