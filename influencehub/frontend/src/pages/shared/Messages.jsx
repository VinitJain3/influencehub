import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Paperclip, Search, MessageSquare } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuthStore } from '../../store/authStore'
import { useConversationStore } from '../../store/conversationStore'
import client from '../../api/client'

export default function Messages() {
  const role = useAuthStore((s) => s.role)
  const user = useAuthStore((s) => s.user)
  const { conversations, activeId, messages, setConversations, setActive, appendMessage, setMessages, markConversationRead } = useConversationStore()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    client.get('/api/conversations')
      .then(res => {
        const data = res.data || []
        setConversations(data)
        const paramId = searchParams.get('conversationId')
        if (paramId) {
          setActive(parseInt(paramId))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeId) return
    setMsgLoading(true)
    markConversationRead(activeId)
    client.get(`/api/conversations/${activeId}/messages`)
      .then(res => setMessages(activeId, res.data || []))
      .catch(() => {})
      .finally(() => setMsgLoading(false))
  }, [activeId])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages[activeId]?.length])

  const sendMessage = async () => {
    if (!text.trim() || !activeId) return
    const msg = { id: Date.now(), sender: 'me', text: text.trim(), time: new Date().toISOString() }
    appendMessage(activeId, msg)
    setText('')
    inputRef.current?.focus()
    try {
      await client.post(`/api/conversations/${activeId}/messages`, { text: msg.text })
    } catch (err) {
      // Revert optimistic update and show error
      setMessages(activeId, messages[activeId].filter(m => m.id !== msg.id))
      setText(msg.text)
      import('../../store/toastStore').then(({ useToast }) => {
        useToast.getState().toast.error('Failed to send message. Please try again.')
      })
    }
  }

  const filteredConversations = conversations.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))
  const currentConv = conversations.find(c => c.id === activeId)
  const currentMessages = messages[activeId] || []

  return (
    <AppLayout role={role}>
      <div className="flex gap-0 h-[calc(100vh-56px-56px)] -m-[28px]">
        {/* Conversation List */}
        <div className="w-[320px] bg-white border-r border-[#E0E0DB] flex flex-col">
          <div className="p-[14px] border-b border-[#E0E0DB]">
            <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-[10px]">Messages</h2>
            <div className="relative">
              <Search size={14} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#888888]" />
              <input placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-[34px] bg-[#F5F5F0] border border-[#E0E0DB] rounded-[6px] pl-[32px] pr-[10px] text-[13px] outline-none focus:border-[#108A00]" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? [1,2,3,4,5].map(i => <div key={i} className="p-[14px]"><Skeleton height={48} /></div>) :
              !filteredConversations.length ? (
                <div className="p-[20px] text-center text-[13px] text-[#888888]">No conversations.</div>
              ) : filteredConversations.map(conv => (
                <button key={conv.id} onClick={() => setActive(conv.id)}
                  className={`w-full flex items-center gap-[10px] px-[16px] py-[12px] cursor-pointer transition-colors text-left ${
                    activeId === conv.id ? 'bg-[#E8F5E6]' : 'hover:bg-[#FAFAF8]'
                  }`}>
                  <Avatar name={conv.name} src={conv.avatar} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{conv.name}</p>
                      <span className="text-[11px] text-[#888888] flex-shrink-0 ml-[8px]">{conv.lastTime}</span>
                    </div>
                    <p className="text-[12px] text-[#888888] truncate">{conv.lastMessage || 'No messages yet'}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-[18px] h-[18px] bg-[#108A00] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#F5F5F0]">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation from the left to start messaging." />
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-[56px] bg-white border-b border-[#E0E0DB] px-[20px] flex items-center gap-[10px]">
                <Avatar name={currentConv?.name} src={currentConv?.avatar} size={36} />
                <div>
                  <p className="text-[14px] font-semibold text-[#1C1C1C]">{currentConv?.name}</p>
                  <p className="text-[11px] text-[#888888]">{currentConv?.role || 'Online'}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-[20px] space-y-[12px]">
                {msgLoading ? [1,2,3].map(i => <Skeleton key={i} height={40} width={i % 2 === 0 ? '60%' : '40%'} className={i % 2 === 0 ? '' : 'ml-auto'} />) :
                  currentMessages.map(msg => {
                    const isMe = msg.sender === 'me'
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[65%] rounded-[12px] px-[14px] py-[10px] ${
                          isMe ? 'bg-[#108A00] text-white rounded-br-[4px]' : 'bg-white border border-[#E0E0DB] text-[#1C1C1C] rounded-bl-[4px]'
                        }`}>
                          <p className="text-[14px] leading-[1.5]">{msg.text}</p>
                          <p className={`text-[10px] mt-[4px] ${isMe ? 'text-white/60' : 'text-[#888888]'}`}>
                            {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-[#E0E0DB] p-[14px] flex gap-[10px]">
                <button className="w-[40px] h-[40px] flex items-center justify-center rounded-[6px] hover:bg-[#F5F5F0] cursor-pointer">
                  <Paperclip size={18} className="text-[#888888]" />
                </button>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 h-[40px] border border-[#E0E0DB] rounded-[8px] px-[14px] text-[14px] outline-none focus:border-[#108A00]"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className={`w-[40px] h-[40px] rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                    text.trim() ? 'bg-[#108A00] text-white hover:bg-[#0B6E00]' : 'bg-[#E0E0DB] text-[#888888]'
                  }`}>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
