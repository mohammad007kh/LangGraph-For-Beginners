import json
from typing import TypedDict, Union
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph

load_dotenv()

class State(TypedDict):
    messages: list[Union[HumanMessage, AIMessage]]

llm = ChatOpenAI(model="gpt-4o")

def llm_node(state: State) -> State:
    """llm node to communicate with the llm model and return the response"""
    response = llm.invoke(state["messages"])
    state["messages"].append(AIMessage(content=response.content))
    print(f"\nAI: {response.content}")
    return state

graph = StateGraph(State)
graph.add_node("llm_node", llm_node)
graph.set_entry_point("llm_node")
graph.set_finish_point("llm_node")
app = graph.compile()


def save_history(history, filename="chat_history.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump([{"type": m.type, "content": m.content} for m in history], f, ensure_ascii=False, indent=2)

def load_history(filename="chat_history.json"):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [HumanMessage(content=m["content"]) if m["type"] == "human"
                    else AIMessage(content=m["content"]) for m in data]
    except FileNotFoundError:
        return []


history = load_history()

userMessage = input("You: ")
while userMessage.lower() not in ["exit", "quit"]:
    history.append(HumanMessage(content=userMessage))
    result = app.invoke({"messages": history})
    history = result["messages"]
    save_history(history) 
    userMessage = input("You: ")

print("Goodbye! Conversation saved.")
