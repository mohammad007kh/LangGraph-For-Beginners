# Backend - LangGraph Text Editor

Phase 1 backend implementation with Express, Prisma, and OpenAI.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY="your-actual-api-key-here"
```

4. Run database migration (already done):
```bash
npm run prisma:migrate
```

5. Generate Prisma client:
```bash
npm run prisma:generate
```

## Development

Start the development server:
```bash
npm run dev
```

Server will run on http://localhost:3001

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Conversations
- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create new conversation
  - Body: `{ "title": "Chat Title" }`
- `GET /api/conversations/:id` - Get conversation with messages
- `DELETE /api/conversations/:id` - Delete conversation

### Chat
- `POST /api/chat` - Send a message
  - Body: `{ "conversationId": "...", "message": "..." }`
  - Returns: `{ "message": "AI response", "text": "generated text or null" }`

## Database

View database with Prisma Studio:
```bash
npm run prisma:studio
```

## Project Structure

```
src/
├── server.ts           # Express server setup
├── db/
│   └── client.ts       # Prisma client
└── routes/
    ├── chat.ts         # Chat endpoint (Phase 1)
    └── conversations.ts # Conversation CRUD
```

## Phase 1 Features

✅ Basic chat functionality
✅ Text generation with OpenAI
✅ Conversation management
✅ Document storage
✅ Structured JSON responses

## Next Steps (Phase 2)

- [ ] Add LangGraph agent
- [ ] Implement 6 tools
- [ ] Enhanced structured output
- [ ] Tool visualization
