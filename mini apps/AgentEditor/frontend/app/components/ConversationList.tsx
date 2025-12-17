import { useState } from 'react'
import { type Conversation } from '@/lib/api-client'
import ConfirmDialog from './ConfirmDialog'

interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId?: string
  onSelect: (conversation: Conversation) => void
  onNew: () => void
  onDelete: (id: string) => void
  onEditTitle: (id: string, title: string) => void
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  onNew,
  onDelete,
  onEditTitle,
}: ConversationListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNew}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors"
        >
          + New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                activeConversationId === conversation.id ? 'bg-blue-50 hover:bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelect(conversation)}
                >
                  {editingId === conversation.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        if (editValue.trim() && editValue !== conversation.title) {
                          onEditTitle(conversation.id, editValue.trim())
                        }
                        setEditingId(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur()
                        } else if (e.key === 'Escape') {
                          setEditingId(null)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="w-full text-sm font-medium text-gray-900 px-2 py-1 border border-blue-500 rounded focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </h3>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm) {
            onDelete(deleteConfirm.id)
            setDeleteConfirm(null)
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingId(conversation.id)
                      setEditValue(conversation.title)
                    }}
                    className="text-gray-400 hover:text-blue-600 p-1"
                    title="Edit title"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm({ id: conversation.id, title: conversation.title })
                    }}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Delete conversation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
