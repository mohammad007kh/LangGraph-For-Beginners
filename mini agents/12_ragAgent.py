from dotenv import load_dotenv
import os

from typing import TypedDict, Annotated, Sequence
from operator import add as add_messages

from langchain_core.messages import (
    BaseMessage,
    SystemMessage,
    HumanMessage,
    ToolMessage
)

from langgraph.graph import StateGraph, END

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma

from langchain_core.tools import tool

# ===============================
# Setup
# ===============================

load_dotenv()

llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0   # minimal hallucination
)

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small"
)

pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "RagFiles", "A Comprehensive History of Artificial Intelligence.pdf"))

if not os.path.exists(pdf_path):
    raise FileNotFoundError(f"PDF not found: {pdf_path}")

# ===============================
# Load PDF
# ===============================

try:
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    print(f"PDF loaded successfully ({len(documents)} pages)")
except Exception as e:
    raise RuntimeError(f"Error loading PDF: {e}")

# ===============================
# Chunking
# ===============================

splitter = RecursiveCharacterTextSplitter(
    chunk_size=900,
    chunk_overlap=200
)

chunks = splitter.split_documents(documents)

# ===============================
# Vector Store (ChromaDB)
# ===============================

persist_dir = "./ai_history_rag_db"
collection_name = "ai_history"

if not os.path.exists(persist_dir):
    os.makedirs(persist_dir)

try:
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_dir,
        collection_name=collection_name
    )
    print("Vectorstore created.")
except Exception as e:
    raise RuntimeError(f"ChromaDB setup error: {e}")

retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5}
)

# ===============================
# Tool: Retriever
# ===============================

@tool
def search_history(query: str) -> str:
    """Searches the AI History PDF and returns relevant extracted text."""
    docs = retriever.invoke(query)

    if not docs:
        return "No relevant information found."

    out = []
    for idx, d in enumerate(docs):
        out.append(f"Result {idx+1}:\n{d.page_content}")

    return "\n\n".join(out)

tools = [search_history]
tools_dict = {t.name: t for t in tools}

llm = llm.bind_tools(tools)

# ===============================
# LangGraph State
# ===============================

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

def should_continue(state: AgentState):
    last = state["messages"][-1]
    return hasattr(last, "tool_calls") and len(last.tool_calls) > 0

system_prompt = """
You are an AI assistant specialized in answering questions.
Your knowledge comes ONLY from the PDF that was loaded into the system.

Use the tool `search_history` whenever you need to fetch factual info.
Cite the information you retrieve.
"""

# ===============================
# LLM Call
# ===============================

def call_llm(state: AgentState) -> AgentState:
    msgs = [SystemMessage(content=system_prompt)] + list(state["messages"])
    response = llm.invoke(msgs)
    return {"messages": [response]}

# ===============================
# Tool Execution
# ===============================

def run_tool(state: AgentState) -> AgentState:
    tool_calls = state["messages"][-1].tool_calls
    results = []

    for call in tool_calls:
        tool_name = call["name"]
        args = call["args"].get("query", "")

        print(f"Using tool: {tool_name} | Query: {args}")

        if tool_name not in tools_dict:
            tool_output = "Invalid tool name."
        else:
            tool_output = tools_dict[tool_name].invoke(args)

        results.append(
            ToolMessage(
                tool_call_id=call["id"],
                name=tool_name,
                content=str(tool_output)
            )
        )

    return {"messages": results}

# ===============================
# Build LangGraph
# ===============================

graph = StateGraph(AgentState)

graph.set_entry_point("llm")

graph.add_node("llm", call_llm)
graph.add_node("tool_node", run_tool)

graph.add_edge("tool_node", "llm")

graph.add_conditional_edges(
    "llm",
    should_continue,
    {True: "tool_node", False: END}
)

rag_agent = graph.compile()

# ===============================
# CLI Runner
# ===============================

def run():
    print("\n=== AI HISTORY RAG AGENT ===")

    while True:
        user_input = input("\nYour question: ")

        if user_input.lower() in ["exit", "quit"]:
            break

        result = rag_agent.invoke({"messages": [HumanMessage(content=user_input)]})
        print("\n=== ANSWER ===")
        print(result["messages"][-1].content)

run()
