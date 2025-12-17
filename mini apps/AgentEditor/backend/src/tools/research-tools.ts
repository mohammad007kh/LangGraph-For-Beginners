import { BaseTool, type ToolInput, type ToolOutput } from './base-tool.js'
import wikipediaLib from 'wikipedia'

const wiki = wikipediaLib.default || wikipediaLib

// Tool 4: Wikipedia Search
export class WikipediaSearchTool extends BaseTool {
  name = 'wikipedia_search'
  description = 'Search Wikipedia for factual information. Use this when user needs research, facts, or background information. Input: { query: string, maxResults?: number }'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { query, maxResults = 3 } = input

      // Search Wikipedia
      const searchResults = await wiki.search(query, { limit: maxResults as number })
      
      const results = await Promise.all(
        searchResults.results.slice(0, maxResults as number).map(async (result: any) => {
          try {
            const page = await wiki.page(result.title)
            const summary = await page.summary()
            
            return {
              title: result.title,
              summary: summary.extract,
              url: page.fullurl
            }
          } catch (error) {
            return {
              title: result.title,
              summary: 'Could not fetch summary',
              url: ''
            }
          }
        })
      )

      return {
        success: true,
        results,
        query
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        results: []
      }
    }
  }
}
