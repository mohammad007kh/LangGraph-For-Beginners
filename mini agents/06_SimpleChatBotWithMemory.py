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

history = []

userMessage = input("You: ")
while userMessage.lower() not in ["exit", "quit"]:
    history.append(HumanMessage(content=userMessage))
    result = app.invoke({"messages": history})
    history = result["messages"]
    userMessage = input("You: ")