import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import apiClient from '../api/client.js';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  Reply,
  Trash2,
  Users,
  Image,
  FileText,
  Clock,
  ArrowDown,
} from 'lucide-react';

const EMOJI_LIST = ['👍', '🔥', '🚀', '❤️', '🎉', '💡'];
const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

export default function ChatPage() {
  const { user: currentUser } = useAuth();
  const { socket, onlineUserIds } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [replyMessage, setReplyMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingConv, setLoadingConv] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await apiClient.get('/chat/conversations');
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
        if (!activeConversation && res.data.conversations?.length > 0) {
          setActiveConversation(res.data.conversations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await apiClient.get(`/chat/conversations/${activeConversation._id}/messages`);
        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    // Join room on Socket.IO
    if (socket) {
      socket.emit('join_conversation', { conversationId: activeConversation._id });
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', { conversationId: activeConversation._id });
      }
    };
  }, [activeConversation?._id, socket]);

  // 3. Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.conversation === activeConversation?._id) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id || (m.clientMessageId && m.clientMessageId === msg.clientMessageId))) {
            return prev;
          }
          return [...prev, msg];
        });
      }

      // Update last message in conversation sidebar
      setConversations(prev =>
        prev.map(c =>
          c._id === msg.conversation
            ? { ...c, lastMessage: { text: msg.content, sender: msg.sender, createdAt: msg.createdAt } }
            : c
        )
      );
    };

    const handleUserTyping = ({ conversationId, fullName }) => {
      if (conversationId === activeConversation?._id) {
        setTypingUsers(prev => new Set(prev).add(fullName));
      }
    };

    const handleUserStopTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConversation?._id) {
        setTypingUsers(new Set());
      }
    };

    const handleMessageReaction = ({ messageId, reactions }) => {
      setMessages(prev =>
        prev.map(m => (m._id === messageId ? { ...m, reactions } : m))
      );
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('message_reaction', handleMessageReaction);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('message_reaction', handleMessageReaction);
    };
  }, [socket, activeConversation?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing indicator
  const handleTypingChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeConversation) return;

    socket.emit('typing_start', { conversationId: activeConversation._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: activeConversation._id });
    }, 1500);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const content = newMessage.trim();
    const replyToId = replyMessage?._id;
    const clientMessageId = `msg-${Date.now()}`;

    // If sending with file attachment, use multipart form via HTTP
    if (selectedFile) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('attachments', selectedFile);
      if (replyToId) formData.append('replyTo', replyToId);
      formData.append('clientMessageId', clientMessageId);

      try {
        const res = await apiClient.post(
          `/chat/conversations/${activeConversation._id}/messages`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (res.data?.success) {
          setNewMessage('');
          setSelectedFile(null);
          setReplyMessage(null);
        }
      } catch (err) {
        toast.error('Failed to upload file');
      }
    } else {
      // Direct via Socket.IO
      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConversation._id,
          content,
          replyTo: replyToId,
          clientMessageId,
        });
      }
      setNewMessage('');
      setReplyMessage(null);
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      await apiClient.post(`/chat/messages/${messageId}/reactions`, { emoji });
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv?.participants?.find(p => p._id?.toString() !== currentUser?._id?.toString());
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchTerm.trim()) return true;
    const other = getOtherParticipant(c);
    const title = c.type === 'team' ? c.team?.name : other?.fullName;
    return title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-[80vh] rounded-3xl glass-card overflow-hidden border border-gray-200 dark:border-dark-border shadow-xl flex">
      {/* 1. Left Sidebar: Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-dark-border flex flex-col justify-between bg-white dark:bg-dark-surface shrink-0">
        <div className="p-4 border-b border-gray-100 dark:border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              <span>Messages</span>
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-beige-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 border border-beige-200 dark:border-brand-900/50">
              {conversations.length}
            </span>
          </div>

          {/* Search conversation */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 bg-beige-50 dark:bg-dark-card border border-beige-200 dark:border-dark-border rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border">
          {loadingConv ? (
            <div className="p-4 text-center text-xs text-gray-400">Loading chats...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              No conversations found. Connect with teammates to start messaging!
            </div>
          ) : (
            filteredConversations.map((c) => {
              const other = getOtherParticipant(c);
              const isTeam = c.type === 'team';
              const title = isTeam ? c.team?.name : other?.fullName;
              const avatar = isTeam
                ? c.team?.logoUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=80&auto=format&fit=crop&q=80'
                : other?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80';
              const isOnline = !isTeam && (onlineUserIds.has(other?._id?.toString()) || other?.isOnline);
              const isSelected = activeConversation?._id === c._id;

              return (
                <div
                  key={c._id}
                  onClick={() => setActiveConversation(c)}
                  className={`p-3.5 flex items-center space-x-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-beige-100/80 dark:bg-brand-950/60 border-l-4 border-l-brand-700'
                      : 'hover:bg-beige-50/60 dark:hover:bg-dark-card/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={avatar}
                      alt={title}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {!isTeam && (
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-dark-surface ${
                          isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {title || 'Chat'}
                      </p>
                      {c.lastMessage?.createdAt && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-gray-500 truncate">
                        {c.lastMessage?.text || 'No messages yet'}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Right: Chat Conversation Stream & Input */}
      <div className="flex-1 flex flex-col justify-between bg-gray-50/50 dark:bg-dark-bg/50">
        {activeConversation ? (
          <>
            {/* Chat Room Header */}
            <div className="px-6 py-3.5 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {activeConversation.type === 'team' ? (
                  <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold text-sm shadow-royal">
                    {activeConversation.team?.name?.charAt(0)}
                  </div>
                ) : (
                  <img
                    src={getOtherParticipant(activeConversation)?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {activeConversation.type === 'team'
                      ? activeConversation.team?.name
                      : getOtherParticipant(activeConversation)?.fullName}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {activeConversation.type === 'team'
                      ? `${activeConversation.participants?.length} team members`
                      : onlineUserIds.has(getOtherParticipant(activeConversation)?._id?.toString())
                      ? 'Active now'
                      : 'Offline'}
                  </p>
                </div>
              </div>

              {activeConversation.type === 'team' && (
                <Link
                  to={`/teams/${activeConversation.team?._id}/workspace`}
                  className="text-xs font-semibold text-brand-700 dark:text-brand-300 hover:underline"
                >
                  Open Workspace Kanban →
                </Link>
              )}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => {
                const isMine = m.sender?._id?.toString() === currentUser?._id?.toString();

                return (
                  <div
                    key={m._id}
                    className={`flex items-end space-x-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMine && (
                      <img
                        src={m.sender?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'}
                        alt={m.sender?.fullName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                      />
                    )}

                    <div className={`max-w-[75%] sm:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!isMine && activeConversation.type === 'team' && (
                        <span className="text-[10px] font-semibold text-gray-400 mb-0.5 px-1">
                          {m.sender?.fullName?.split(' ')[0]}
                        </span>
                      )}

                      {/* Reply To Preview */}
                      {m.replyTo && (
                        <div className="text-[10px] px-3 py-1.5 rounded-t-xl bg-black/10 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-l-2 border-brand-600 mb-0.5 line-clamp-1">
                          ↳ Replying to: {m.replyTo.content}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                          isMine
                            ? 'bg-brand-700 text-white rounded-br-none shadow-royal'
                            : 'bg-white dark:bg-dark-card text-gray-900 dark:text-white rounded-bl-none border border-beige-200 dark:border-dark-border shadow-sm'
                        }`}
                      >
                        {/* Attachments */}
                        {m.attachments?.map((att, i) => (
                          <div key={i} className="mb-2">
                            {att.fileType === 'image' ? (
                              <img
                                src={`${SERVER_URL}${att.url}`}
                                alt="attachment"
                                className="rounded-xl max-h-48 object-cover cursor-pointer hover:opacity-90"
                                onClick={() => window.open(`${SERVER_URL}${att.url}`, '_blank')}
                              />
                            ) : (
                              <a
                                href={`${SERVER_URL}${att.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center space-x-2 p-2 rounded-lg bg-black/10 text-xs hover:underline"
                              >
                                <FileText className="w-4 h-4" />
                                <span>{att.originalName || 'Download attachment'}</span>
                              </a>
                            )}
                          </div>
                        ))}

                        <p className="whitespace-pre-wrap">{m.content}</p>

                        {/* Hover Quick Emoji Reactions Bar */}
                        <div
                          className={`absolute -top-3 ${
                            isMine ? 'right-0' : 'left-0'
                          } hidden group-hover:flex items-center space-x-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border px-1.5 py-0.5 rounded-full shadow-md z-10`}
                        >
                          {EMOJI_LIST.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleAddReaction(m._id, emoji)}
                              className="text-xs hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            onClick={() => setReplyMessage(m)}
                            className="text-gray-400 hover:text-brand-600 p-0.5"
                            title="Reply"
                          >
                            <Reply className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Reactions & Timestamp */}
                      <div className="flex items-center space-x-2 mt-1 px-1">
                        {m.reactions?.length > 0 && (
                          <div className="flex -space-x-1">
                            {m.reactions.map((r, i) => (
                              <span key={i} className="text-xs bg-beige-100 dark:bg-dark-card px-1 rounded-md border border-beige-300 dark:border-dark-border">
                                {r.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator bubble */}
              {typingUsers.size > 0 && (
                <div className="text-xs text-gray-400 italic flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" />
                  <span>{[...typingUsers].join(', ')} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply banner if replying */}
            {replyMessage && (
              <div className="px-6 py-2 bg-beige-100 dark:bg-brand-950/60 border-t border-beige-300 dark:border-brand-800 flex items-center justify-between text-xs text-brand-900 dark:text-brand-200">
                <span className="truncate">
                  Replying to: <strong>{replyMessage.content}</strong>
                </span>
                <button onClick={() => setReplyMessage(null)}>
                  ✕
                </button>
              </div>
            )}

            {/* Selected File Banner */}
            {selectedFile && (
              <div className="px-6 py-2 bg-beige-100 dark:bg-brand-950/60 border-t border-beige-300 dark:border-brand-800 text-xs text-brand-900 dark:text-brand-200 flex items-center justify-between">
                <span>Selected file: <strong>{selectedFile.name}</strong></span>
                <button onClick={() => setSelectedFile(null)}>✕</button>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border flex items-center space-x-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-brand-600 rounded-xl hover:bg-beige-100 dark:hover:bg-dark-card transition-colors"
                title="Attach image or file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={handleTypingChange}
                placeholder="Type a message... (Press Enter to send)"
                className="flex-1 px-4 py-2.5 bg-beige-50 dark:bg-dark-card border border-beige-200 dark:border-dark-border rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />

              <button
                type="submit"
                disabled={!newMessage.trim() && !selectedFile}
                className="p-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-40 text-white shadow-royal transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mb-3 text-gray-300 dark:text-dark-border" />
            <p className="text-sm font-semibold">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
