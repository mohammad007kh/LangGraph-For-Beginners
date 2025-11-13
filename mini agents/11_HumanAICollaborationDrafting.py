import json
from datetime import datetime
from typing import Annotated, Sequence, TypedDict
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END

load_dotenv()


class State(TypedDict):
    """State to track messages and drafting process"""
    messages: Annotated[Sequence[BaseMessage], add_messages]
    current_draft: str
    draft_version: int
    feedback_history: list[dict]


def create_draft_implementation(topic: str, state: State) -> dict:
    """Create an initial draft based on the user's topic"""
    system_prompt = """You are a professional writing assistant.
Create clear, well-structured drafts based on the user's request.

GUIDELINES:
- Be concise but complete
- Match the tone requested (formal, casual, professional, etc.)
- Use proper formatting and structure
- Make it ready to use with minimal edits

Generate ONLY the draft content, no explanations or meta-commentary."""
    
    llm = ChatOpenAI(model="gpt-4o")
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Create a draft for: {topic}")
    ])
    
    draft = response.content
    
    print("\n" + "="*60)
    print("📄 DRAFT VERSION 1")
    print("="*60)
    print(draft)
    print("="*60)
    
    return {
        "current_draft": draft,
        "draft_version": 1,
        "feedback_history": []
    }


def refine_draft_implementation(feedback: str, state: State) -> dict:
    """Refine the current draft based on user feedback"""
    if not state.get("current_draft"):
        return None
    
    # Log feedback to history
    new_feedback = {
        "version": state["draft_version"],
        "feedback": feedback,
        "timestamp": datetime.now().isoformat()
    }
    
    system_prompt = """You are a professional writing assistant.
Refine an existing draft based on specific feedback.

GUIDELINES:
- Keep the parts that work well
- Apply the feedback precisely
- Maintain coherent structure
- Preserve the original intent unless feedback changes it

Respond with ONLY the updated draft, no explanations."""
    
    llm = ChatOpenAI(model="gpt-4o")
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"""Here is the current draft:
---
{state['current_draft']}
---

User feedback: {feedback}

Please update the draft based on this feedback.""")
    ])
    
    draft = response.content
    new_version = state["draft_version"] + 1
    
    print("\n" + "="*60)
    print(f"📄 DRAFT VERSION {new_version}")
    print("="*60)
    print(draft)
    print("="*60)
    
    updated_history = state.get("feedback_history", []) + [new_feedback]
    
    return {
        "current_draft": draft,
        "draft_version": new_version,
        "feedback_history": updated_history
    }


def save_draft_implementation(filename: str, state: State) -> str:
    """Save the final approved draft with version history to a JSON file"""
    if not state.get("current_draft"):
        return "Error: No draft exists to save. Please create a draft first."
    
    if not filename.endswith('.json'):
        filename = f"{filename}.json"
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if filename == ".json":
        filename = f"draft_{timestamp}.json"
    
    output = {
        "final_draft": state["current_draft"],
        "final_version": state["draft_version"],
        "feedback_history": state.get("feedback_history", []),
        "created_at": datetime.now().isoformat(),
        "status": "approved"
    }
    
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Draft saved to: {filename}")
        print(f"📊 Total versions created: {state['draft_version']}")
        print(f"🔄 Feedback rounds: {len(state.get('feedback_history', []))}")
        print("\n✨ Session complete! Your draft is ready to use.\n")
        
        return f"Draft has been saved successfully to '{filename}'."
    
    except Exception as e:
        return f"Error saving draft: {str(e)}"


@tool
def create_draft(topic: str) -> str:
    """
    Create an initial draft based on the user's topic or request.
    
    Use this tool when the user wants to start a new draft.
    
    Args:
        topic: The topic or instruction for what to draft (e.g., "formal email requesting a meeting")
    
    Returns:
        Confirmation that draft was created
    """
    return "create_draft_placeholder"


@tool
def refine_draft(feedback: str) -> str:
    """
    Refine the current draft based on user feedback.
    
    Use this tool when the user provides feedback to improve the draft.
    
    Args:
        feedback: The user's feedback on how to improve the draft
    
    Returns:
        Confirmation that draft was refined
    """
    return "refine_draft_placeholder"


@tool
def save_draft(filename: str) -> str:
    """
    Save the final approved draft with version history to a JSON file.
    
    Use this tool when the user approves the draft and wants to save it.
    
    Args:
        filename: Name for the JSON file (without extension)
    
    Returns:
        Confirmation message
    """
    return "save_draft_placeholder"


tools = [create_draft, refine_draft, save_draft]
model = ChatOpenAI(model="gpt-4o").bind_tools(tools)


def drafting_agent(state: State) -> State:
    """The main agent that helps users create and refine drafts"""
    draft_version = state.get("draft_version", 0)
    current_draft = state.get("current_draft", "")
    
    system_prompt = SystemMessage(content=f"""You are Drafter, a helpful writing assistant AI.
You help users create and refine drafts of emails, reports, messages, and other documents.

TOOL USAGE GUIDELINES:
- Use 'create_draft' when the user wants to start a new draft
- Use 'refine_draft' when the user wants to improve or modify the current draft
- Use 'save_draft' when the user approves and wants to save the final version

Current draft version: {draft_version}
Current draft exists: {"Yes" if current_draft else "No"}

Be conversational and guide the user through the drafting process.""")
    
    if not state.get("messages"):
        user_input = "Hello! I'm ready to help you create a draft. What would you like to draft today?"
        user_message = HumanMessage(content=user_input)
    else:
        user_input = input("\n👤 You: ")
        print("")
        user_message = HumanMessage(content=user_input)
    
    all_messages = [system_prompt] + list(state.get("messages", [])) + [user_message]
    response = model.invoke(all_messages)
    
    print(f"🤖 Draft AI: {response.content}")
    
    if hasattr(response, "tool_calls") and response.tool_calls:
        print(f"🔧 USING TOOLS: {[tc['name'] for tc in response.tool_calls]}")
    
    return {"messages": [user_message, response]}


def execute_tools(state: State) -> dict:
    """Custom tool execution node that has access to state"""
    messages = state.get("messages", [])
    if not messages:
        return {}
    
    last_message = messages[-1]
    
    if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
        return {}
    
    tool_messages = []
    state_updates = {}
    
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        
        if tool_name == "create_draft":
            result = create_draft_implementation(tool_args["topic"], state)
            state_updates.update(result)
            tool_messages.append(
                ToolMessage(
                    content="Draft created successfully!",
                    tool_call_id=tool_call["id"]
                )
            )
        
        elif tool_name == "refine_draft":
            result = refine_draft_implementation(tool_args["feedback"], state)
            if result:
                state_updates.update(result)
                tool_messages.append(
                    ToolMessage(
                        content=f"Draft refined to version {result['draft_version']}!",
                        tool_call_id=tool_call["id"]
                    )
                )
            else:
                tool_messages.append(
                    ToolMessage(
                        content="Error: No draft exists yet.",
                        tool_call_id=tool_call["id"]
                    )
                )
        
        elif tool_name == "save_draft":
            result = save_draft_implementation(tool_args["filename"], state)
            tool_messages.append(
                ToolMessage(
                    content=result,
                    tool_call_id=tool_call["id"]
                )
            )
    
    state_updates["messages"] = tool_messages
    return state_updates


def should_continue(state: State) -> str:
    """Determine if we should continue or end"""
    messages = state.get("messages", [])
    
    if not messages:
        return "continue"
    
    for message in reversed(messages):
        if (isinstance(message, ToolMessage) and 
            "saved" in message.content.lower() and
            "successfully" in message.content.lower()):
            return "end"
    
    return "continue"


def route_after_agent(state: State) -> str:
    """Route after agent based on whether tools were called"""
    messages = state.get("messages", [])
    if not messages:
        return "continue"
    
    last_message = messages[-1]
    
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "continue"


# Build the graph
graph = StateGraph(State)

graph.add_node("agent", drafting_agent)
graph.add_node("tools", execute_tools)

graph.set_entry_point("agent")

graph.add_conditional_edges(
    "agent",
    route_after_agent,
    {
        "tools": "tools",
        "continue": "agent"
    }
)

graph.add_conditional_edges(
    "tools",
    should_continue,
    {
        "continue": "agent",
        "end": END,
    },
)

app = graph.compile()


def run_drafting_agent():
    """Run the interactive drafting session"""
    print("\n" + "="*60)
    print("📝 HUMAN-AI COLLABORATION DRAFTING AGENT")
    print("="*60)
    print("\nWelcome! I'll help you create and refine drafts.")
    print("Commands you can use:")
    print("  - 'Create a draft for [topic]'")
    print("  - 'Make it [feedback]' (e.g., 'make it shorter')")
    print("  - 'Save as [filename]' when you're happy with the draft")
    print("="*60)
    
    initial_state = {
        "messages": [],
        "current_draft": "",
        "draft_version": 0,
        "feedback_history": []
    }
    
    for step in app.stream(initial_state, stream_mode="values"):
        pass  # State is being updated automatically
    
    print("\n" + "="*60)
    print("✨ DRAFTING SESSION COMPLETE")
    print("="*60)


if __name__ == "__main__":
    run_drafting_agent()
