from typing import Annotated, Sequence, TypedDict
from dotenv import load_dotenv  
from langchain_core.messages import BaseMessage
from langchain_core.messages import ToolMessage
from langchain_core.messages import SystemMessage 
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
import requests
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END
import sys
from langgraph.prebuilt import ToolNode


load_dotenv()

class State(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]


@tool
def eval_expression(expression: str) -> str:
    """
    Evaluate a mathematical expression and return the numerical result.
    
    Use this tool for:
    - Arithmetic calculations (addition, subtraction, multiplication, division)
    - Complex mathematical expressions with parentheses
    - Any numeric computation
    
    Args:
        expression: A valid Python mathematical expression as a string (e.g., "(12 + 3) * 5")
    
    Returns:
        A string with the computed result
    """
    try:
        result = eval(expression)
        return f"The result is: {result}"
    except Exception as e:
        return f"Error: {str(e)}"

@tool
def get_fact(query: str) -> str:
    """
    Look up factual information from Wikipedia.
    
    Use this tool for:
    - Factual queries about people, places, countries, or historical events
    - Current or historical data (population, geography, dates, etc.)
    - General knowledge questions that require verified information
    
    Do NOT use this tool for:
    - Mathematical calculations (use eval_expression instead)
    - Creative content like poems or stories
    - Opinions or subjective questions
    
    Args:
        query: A search query to look up on Wikipedia (e.g., "Population of France")
    
    Returns:
        A text summary from the relevant Wikipedia article
    """
    try:
        # Wikipedia requires a proper User-Agent header
        headers = {
            "User-Agent": "LangGraphEducationalBot/1.0 (Educational purposes; Python/requests)"
        }
        
        # Step 1: Search for pages
        search_url = "https://en.wikipedia.org/w/api.php"
        search_params = {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": query,
            "srlimit": 1
        }
        
        search_resp = requests.get(search_url, params=search_params, headers=headers, timeout=10)
        search_resp.raise_for_status()
        search_data = search_resp.json()
        
        if not search_data.get("query", {}).get("search"):
            return f"No Wikipedia results found for '{query}'."
        
        # Get the page title
        page_title = search_data["query"]["search"][0]["title"]
        
        # Step 2: Get page extract
        extract_params = {
            "action": "query",
            "format": "json",
            "prop": "extracts",
            "exintro": True,
            "explaintext": True,
            "titles": page_title
        }
        
        extract_resp = requests.get(search_url, params=extract_params, headers=headers, timeout=10)
        extract_resp.raise_for_status()
        extract_data = extract_resp.json()
        
        pages = extract_data.get("query", {}).get("pages", {})
        if not pages:
            return f"Could not retrieve summary for '{page_title}'."
        
        # Get first page
        page = list(pages.values())[0]
        extract = page.get("extract", "")
        
        if not extract:
            return f"No summary available for '{page_title}'."
        
        # Return first 500 chars for brevity
        return extract[:500] + ("..." if len(extract) > 500 else "")
        
    except requests.Timeout:
        return "Wikipedia request timed out. Please try again."
    except requests.RequestException as e:
        return f"Wikipedia API error: {str(e)}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"


tools = [eval_expression, get_fact]

# Bind tools to the model so the model can emit tool calls
model = ChatOpenAI(model="gpt-4o").bind_tools(tools)


def call_model(state: State) -> State:
    """Send current messages to the LLM and wrap the reply into state."""
    system_prompt = SystemMessage(content="""You are a helpful AI assistant with access to tools.

TOOL USAGE GUIDELINES:
- Use 'get_fact' to look up factual information from Wikipedia (population, geography, historical facts, etc.)
- Use 'eval_expression' to perform mathematical calculations and arithmetic operations
- For creative tasks (poems, stories, opinions), answer directly WITHOUT using tools

DECISION PROCESS:
1. Analyze the user's query carefully
2. If it requires factual data you don't have, use 'get_fact'
3. If it requires numerical computation, use 'eval_expression'  
4. If it's creative/subjective, respond directly with your own knowledge
5. You can use multiple tools in parallel if needed

Always provide clear, helpful responses based on the tool results or your own knowledge."""
    )
    # ensure we pass a list of messages to the model
    response = model.invoke([system_prompt] + list(state["messages"]))
    return {"messages": [response]}


def decide_route(state: State):
    """Return 'continue' when the last message contains tool calls, else 'end'."""
    messages = state["messages"]
    last_message = messages[-1]
    # continue only if the last message carried tool_calls metadata
    if getattr(last_message, "tool_calls", None):
        return "continue"
    return "end"
    

graph = StateGraph(State)
graph.add_node("the_agent", call_model)


tool_node = ToolNode(tools=tools)
graph.add_node("tools", tool_node)

graph.set_entry_point("the_agent")

graph.add_conditional_edges(
    "the_agent",
    decide_route,
    {
        "continue": "tools",
        "end": END,
    },
)

graph.add_edge("tools", "the_agent")

app = graph.compile()

def print_stream(stream):
    def safe_print(text: str):
        try:
            print(text)
        except UnicodeEncodeError:
            enc = getattr(sys.stdout, "encoding", "utf-8") or "utf-8"
            print(text.encode(enc, errors="replace").decode(enc))

    step = 0
    for s in stream:
        step += 1
        safe_print(f"\n--- Stream update #{step} ---")
        
        # Print ALL messages in this update to see tool results
        messages = s.get("messages", [])
        for msg in messages[-3:]:  # Show last 3 messages for context
            try:
                if isinstance(msg, tuple):
                    role, content = msg
                    safe_print(f"{role.upper()}: {content}")
                    continue

                # Prefer pretty_repr when available to get a string representation
                pretty = None
                if hasattr(msg, "pretty_repr"):
                    try:
                        pretty = msg.pretty_repr(html=False)
                    except Exception:
                        pretty = None

                if pretty:
                    safe_print(pretty)
                else:
                    role = getattr(msg, "role", getattr(msg, "type", "assistant"))
                    content = getattr(msg, "content", str(msg))
                    safe_print(f"{role}: {content}")

                tool_calls = getattr(msg, "tool_calls", None)
                if tool_calls:
                    safe_print("Tool calls:")
                    for tc in tool_calls:
                        safe_print(f" - {tc}")

            except Exception as e:
                safe_print(f"<print error: {e}>")

inputs = {"messages": [("user", "Tell the population of France. Next, add 12 + 3 and then multiply the result by 3. Also, tell me a poem about sea please.")]}
print_stream(app.stream(inputs, stream_mode="values"))