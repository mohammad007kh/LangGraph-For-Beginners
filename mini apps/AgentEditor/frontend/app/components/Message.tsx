import { type Message } from '@/lib/api-client'

interface MessageProps {
  message: Message
  toolsUsed?: string[]
}

export default function MessageComponent({ message, toolsUsed }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs font-semibold">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
        </div>
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        {!isUser && toolsUsed && toolsUsed.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex flex-wrap gap-1">
              {toolsUsed.map((tool, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                  title={`Used tool: ${tool}`}
                >
                  🛠️ {tool.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
