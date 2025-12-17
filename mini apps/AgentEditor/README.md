# LangGraph Text Editor 🚀

An AI-powered text editing assistant built with LangGraph, Next.js, and OpenAI. This project demonstrates real AI agent patterns through a practical application.

## 📖 Project Overview

**Mental Model:** ChatGPT + Google Docs + Agent Tools

This is a teaching project that shows how to build production-grade AI applications with:
- ✅ Real agent behavior (not just prompts)
- ✅ Tool-based architecture
- ✅ Structured outputs
- ✅ Smart memory management

## 🏗️ Architecture

```
Frontend (Next.js)          Backend (Express + LangGraph)        Database
├── Chat Interface    ←→    ├── AI Agent                   ←→   SQLite
├── Text Editor             ├── Tools (6 total)
└── Conversations           └── OpenAI Integration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- OpenAI API key
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo>
cd code
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npx prisma generate
npm run dev
```

3. **Setup Frontend** (in new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📂 Project Structure

```
code/
├── backend/                 # Express + LangGraph server
│   ├── src/
│   │   ├── server.ts       # Main server
│   │   ├── db/client.ts    # Prisma client
│   │   └── routes/
│   │       ├── chat.ts     # Chat endpoint
│   │       └── conversations.ts
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── frontend/               # Next.js 14 application
│   ├── app/
│   │   ├── page.tsx        # Main app
│   │   └── components/
│   │       ├── ConversationList.tsx
│   │       ├── ChatArea.tsx
│   │       ├── TextEditor.tsx
│   │       └── Message.tsx
│   ├── lib/
│   │   └── api-client.ts   # API wrapper
│   └── package.json
│
└── project-docs/           # Complete documentation
    └── docs/
        ├── 00-project-overview.md
        ├── 01-user-experience.md
        ├── 02-architecture.md
        ├── 03-tools-specification.md
        ├── 04-development-roadmap.md
        ├── 05-tech-stack-decisions.md
        └── 06-phase-based-implementation-plan.md
```

## 🎯 Current Status: Phase 2 Complete! ✅

### What's Working
- ✅ Full-stack application running with LangGraph agent
- ✅ Chat interface with multi-line input (Shift+Enter for new lines)
- ✅ 6 specialized tools (text ops, Wikipedia, calculator, memory)
- ✅ Auto-generated conversation titles (from first message)
- ✅ Editable conversation titles (click to edit inline)
- ✅ Confirmation dialog before deletion
- ✅ Tool usage badges on messages
- ✅ Strict separation: AI messages vs. generated text
- ✅ Document storage and updates
- ✅ Structured JSON responses
- ✅ Beautiful, responsive UI with proper contrast

### Try It Out!

1. Click "+ New Chat" to create a conversation
2. Type: **"Write a letter to my boss asking for a raise"**
3. Watch the AI:
   - Generate a title like "Salary Raise Request"
   - Show a brief message: "I've generated a 250-word letter for you."
   - Display the actual letter in the editor panel (not in chat!)
4. Continue: **"Make it shorter"** or **"What's 25 * 17?"**
5. Hover over conversations to edit titles or delete (with confirmation)
6. Use multi-line input for longer messages (Shift+Enter for new lines)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express
- **AI**: LangChain + LangGraph + OpenAI GPT-4
- **Database**: Prisma 5 + SQLite (native driver)
- **Agent**: LangGraph with 4-node workflow
- **Tools**: 6 specialized tools (text, research, math, memory)

### Key Features
- **Smart Agent**: Analyzes intent → Selects tools → Executes → Responds
- **Auto-Titles**: Generates conversation names from first message
- **Edit Mode**: Click any conversation title to rename
- **Safe Deletion**: Confirmation dialog prevents accidents
- **Multi-line Input**: 5-row textarea with Shift+Enter support
- **Tool Tracking**: See which tools were used for each response
- **Strict Separation**: AI messages stay concise, generated text goes to editor only

## 📚 Documentation

Comprehensive documentation is available in [`project-docs/docs/`](./project-docs/docs/):

- [Project Overview](./project-docs/docs/00-project-overview.md) - What we're building
- [User Experience](./project-docs/docs/01-user-experience.md) - UX flows
- [Architecture](./project-docs/docs/02-architecture.md) - System design
- [Tools Specification](./project-docs/docs/03-tools-specification.md) - Tool details
- [Development Roadmap](./project-docs/docs/04-development-roadmap.md) - Phase plan
- [Tech Stack Decisions](./project-docs/docs/05-tech-stack-decisions.md) - Why each tool
- [Implementation Plan](./project-docs/docs/06-phase-based-implementation-plan.md) - Step-by-step guide

## 🎓 Development Phases

### ✅ Phase 1: Foundation (COMPLETE)
- Basic chat + text generation
- Database setup
- UI implementation

### 🔜 Phase 2: Agent + Tools (Next)
- LangGraph integration
- 6 specialized tools:
  - `read_text` - Read editor content
  - `write_text` - Generate new text
  - `update_text` - Modify existing text
  - `wikipedia_search` - Research
  - `calculator` - Math operations
  - `conversation_memory` - Context retrieval

### 🔮 Phase 3: Memory & Context
- Conversation history management
- Rolling summaries
- Token optimization

### 🔮 Phase 4: Vector Database (Optional)
- Semantic memory
- Past draft retrieval
- Writing style analysis

## 🧪 Testing

### Backend
```bash
cd backend
# Test health endpoint
curl http://localhost:3001/health
```

### Frontend
```bash
cd frontend
npm run build  # Check for build errors
```

## 📝 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your-openai-api-key"
PORT=3001
OPENAI_MODEL="gpt-4"
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🤝 Contributing

This is a teaching project! Contributions welcome:
- 🐛 Bug reports
- 📚 Documentation improvements
- ✨ New tool ideas
- 🎨 UI enhancements

## 📧 Support

- 📚 Check the [documentation](./project-docs/docs/)
- 🐛 [Open an issue](https://github.com/your-repo/issues)
- 💬 [Start a discussion](https://github.com/your-repo/discussions)

## 📜 License

[Your License Here]

## 🎉 Acknowledgments

Built as part of a tutorial series on building AI agents with LangGraph.

---

**Ready to build?** Start with Phase 1 and follow the [Implementation Plan](./project-docs/docs/06-phase-based-implementation-plan.md)! 

**Allons-y!** 🚀
