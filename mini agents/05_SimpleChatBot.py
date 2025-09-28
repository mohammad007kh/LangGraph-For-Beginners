from typing import TypedDict
import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

class State(TypedDict):
    messages: list[HumanMessage]
    response: str


llm = ChatOpenAI(model="gpt-3.5-turbo")

def llm_node(state: State) -> State:
    """Simple llm node to communicate with the llm model and return the response"""
    state["response"] = llm.invoke(state["messages"])
    return state


graph = StateGraph(State)
graph.add_node("llm_node", llm_node)

graph.set_entry_point("llm_node")
graph.set_finish_point("llm_node")

app = graph.compile(debug=False)


userMessage = input("You: ")
while userMessage != "exit":    
    result = app.invoke({"messages": [HumanMessage(content=userMessage)]})
    print(f"chatgpt: {result['response'].content}")
    userMessage = input("You: ")