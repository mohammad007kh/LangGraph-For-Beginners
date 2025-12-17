interface TextEditorProps {
  content: string
}

export default function TextEditor({ content }: TextEditorProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Generated Text
        </h2>
        <p className="text-sm text-gray-500">
          AI-generated content
        </p>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <textarea
          value={content}
          readOnly
          className="w-full h-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none bg-white text-gray-900"
          placeholder="Generated text will appear here..."
        />
      </div>

      {/* Footer with actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {content.split(' ').filter(Boolean).length} words
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  )
}
