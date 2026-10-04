'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message } from '@/lib/chat-server';
import {
  Minimize2,
  Maximize2,
  Send,
  ArrowLeft,
  Search,
  User,
  ShieldAlert,
  Loader2,
  MessageCircle,
  MessageSquare,
  PenLine,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatJamMenit, formatWaktuRelatif } from '@/lib/date';

interface SearchUserItem {
  user_id: string;
  nama: string;
  foto_url: string;
  status_badge: string;
}

export default function DoveChatBubble() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputIsi, setInputIsi] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUserItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isBlockedState, setIsBlockedState] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch unread count & conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        const list: Conversation[] = data.conversations || [];
        setConversations(list);
        const total = list.reduce((acc, cur) => acc + (cur.unread_count || 0), 0);
        setUnreadTotal(total);
      }
    } catch {
      // Abaikan bila belum login
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/chat/conversations');
        if (res.ok && isMounted) {
          const data = await res.json();
          const list: Conversation[] = data.conversations || [];
          setConversations(list);
          const total = list.reduce((acc, cur) => acc + (cur.unread_count || 0), 0);
          setUnreadTotal(total);
        }
      } catch {}
    };

    load();
    const interval = setInterval(load, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch current user UID
  useEffect(() => {
    let active = true;
    async function loadMe() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok && active) {
          const d = await res.json();
          if (d.user_id) setCurrentUserId(d.user_id);
          else if (d.user?.uid) setCurrentUserId(d.user.uid);
        }
      } catch {}
    }
    loadMe();
    return () => {
      active = false;
    };
  }, []);

  // Fetch messages when a conversation is active
  useEffect(() => {
    if (!activeConvId) return;

    let isMounted = true;
    const loadMsg = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/messages?conversation_id=${activeConvId}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setMessages(data.messages || []);
          if (data.current_user_id) setCurrentUserId(data.current_user_id);
          setIsBlockedState(!!data.is_blocked);
        }
      } catch {} finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    loadMsg();

    // Mark as read
    fetch('/api/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: activeConvId }),
    }).then(() => {
      if (isMounted) fetchConversations();
    });

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/messages?conversation_id=${activeConvId}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch {}
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(poll);
    };
  }, [activeConvId, fetchConversations]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle search authors
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/chat/conversations?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users || []);
        }
      } catch {} finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setActiveConvId(conv.id);
    setIsSearchMode(false);
    setErrorNotice(null);
  };

  const handleStartDirectChat = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveConvId(data.conversation_id);
        const match = conversations.find((c) => c.id === data.conversation_id);
        setActiveConv(
          match || {
            id: data.conversation_id,
            created_at: new Date(),
            updated_at: new Date(),
            other_user_id: targetUserId,
            other_user_name: 'Penulis Sastra',
          }
        );
        setIsSearchMode(false);
        setSearchQuery('');
        setSearchResults([]);
        fetchConversations();
      } else {
        const err = await res.json();
        setErrorNotice(err.error || 'Gagal membuka percakapan.');
      }
    } catch {
      setErrorNotice('Terjadi kesalahan jaringan.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !inputIsi.trim() || isSending) return;

    setErrorNotice(null);
    setIsSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: activeConvId,
          isi: inputIsi.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setInputIsi('');
        fetchConversations();
      } else {
        const errData = await res.json();
        setErrorNotice(errData.error || 'Gagal mengirim pesan.');
      }
    } catch {
      setErrorNotice('Gagal terhubung ke peladen.');
    } finally {
      setIsSending(false);
    }
  };

  if (pathname?.startsWith('/chat')) {
    return null;
  }

  return (
    <>
      {/* Tombol Chat Melayang (Message Action Button) - disembunyikan saat modal terbuka agar tidak menumpuk */}
      {!isOpen && (
        <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 md:bottom-6 md:right-6 z-40 select-none">
          <button
            onClick={() => {
              const nextState = !isOpen;
              setIsOpen(nextState);
              if (nextState) fetchConversations();
            }}
            className="relative group w-13 h-13 rounded-full bg-[#C85A32] hover:bg-[#A94728] text-white shadow-lg active:scale-95 transition-all duration-150 flex items-center justify-center border border-[#A94728] cursor-pointer"
            title="Pesan Sastra"
            aria-label="Buka Pesan Sastra"
          >
            <MessageCircle className="w-6 h-6 text-white" />

            {/* Badge Pesan Belum Terbaca */}
            {unreadTotal > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#2C2A29] border-2 border-white text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}

            {/* Tooltip */}
            <span className="absolute -top-8 right-0 bg-[#2C2A29] text-white text-[11px] font-sans py-0.5 px-2 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Pesan Sastra
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal / Drawer - Selalu terlihat utuh di atas navigasi bawah dan aman dari tepi atas */}
      {isOpen && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-2 sm:right-6 md:bottom-6 z-50 w-[calc(100vw-1rem)] sm:w-[380px] max-w-[420px] h-[min(560px,calc(100dvh-5.5rem-env(safe-area-inset-bottom,0px)))] bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8DED6] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-[#FAF8F5] border-b border-[#E8DED6] text-[#2C2A29] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              {activeConvId ? (
                <button
                  onClick={() => {
                    setActiveConvId(null);
                    setActiveConv(null);
                    setErrorNotice(null);
                    fetchConversations();
                  }}
                  className="p-1 hover:bg-[#E8DED6]/50 rounded-lg transition cursor-pointer text-[#6B625D]"
                  title="Kembali ke Daftar Pesan"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : isSearchMode ? (
                <button
                  onClick={() => setIsSearchMode(false)}
                  className="p-1 hover:bg-[#E8DED6]/50 rounded-lg transition cursor-pointer text-[#6B625D]"
                  title="Kembali"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
              )}
              <div>
                <h3 className="font-serif font-bold text-sm leading-tight text-[#2C2A29]">
                  {activeConv
                    ? activeConv.other_user_name || 'Penulis Sastra'
                    : isSearchMode
                    ? 'Cari Penulis'
                    : 'Pesan Sastra'}
                </h3>
                <p className="text-[11px] text-[#6B625D] leading-none mt-0.5">
                  {activeConv
                    ? isBlockedState
                      ? 'Status: Diblokir'
                      : 'Percakapan Pribadi'
                    : 'Bertukar pesan antar penulis'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {activeConvId && (
                <Link
                  href={`/chat/${activeConvId}`}
                  className="p-1 hover:bg-[#E8DED6]/50 rounded-lg transition text-[#6B625D]"
                  title="Buka Layar Penuh"
                >
                  <Maximize2 className="w-4 h-4" />
                </Link>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#E8DED6]/50 rounded-lg transition text-[#6B625D] cursor-pointer"
                title="Tutup Jendela"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifikasi error / peringatan */}
          {errorNotice && (
            <div className="bg-[#FAF0E6] border-b border-[#E8DED6] text-[#A94728] text-xs px-3 py-1.5 flex items-center justify-between">
              <span>{errorNotice}</span>
              <button onClick={() => setErrorNotice(null)} className="text-[#A94728] ml-2 font-bold cursor-pointer">
                ×
              </button>
            </div>
          )}

          {/* Body Konten */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col bg-[#FAF8F5]/60 overscroll-contain">
            {activeConvId ? (
              /* --- TAMPILAN PESAN DALAM PERCAKAPAN --- */
              <div className="flex-1 flex flex-col space-y-2.5">
                {loadingMessages ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-[#6B625D] text-xs gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#C85A32]" />
                    <span>Memuat pesan...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <MessageSquare className="w-8 h-8 text-[#E8DED6]" />
                    <p className="font-serif text-xs text-[#6B625D]">
                      Belum ada jejak percakapan. Mulai sapa penulis di bawah ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 flex-1">
                    {messages.map((m) => {
                      const isMe = m.sender_user_id === currentUserId;
                      const timeStr = formatJamMenit(m.created_at);

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                              isMe
                                ? 'bg-[#C85A32] text-white rounded-br-xs'
                                : 'bg-[#FFFDF9] text-[#2C2A29] border border-[#E8DED6] rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.isi}</p>
                            <span
                              className={`block text-[9px] mt-1 text-right ${
                                isMe ? 'text-white/80' : 'text-[#6B625D]'
                              }`}
                            >
                              {timeStr}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            ) : isSearchMode ? (
              /* --- TAMPILAN CARI PENULIS --- */
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      if (!val.trim()) setSearchResults([]);
                    }}
                    placeholder="Ketik nama penulis..."
                    className="w-full text-xs bg-[#FFFDF9] border border-[#E8DED6] rounded-xl pl-8 pr-3 py-2 text-[#2C2A29] placeholder-[#6B625D]/60 focus:outline-none focus:border-[#C85A32]"
                    autoFocus
                  />
                  <Search className="w-3.5 h-3.5 text-[#6B625D] absolute left-2.5 top-2.5" />
                </div>

                {isSearching ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-[#C85A32] mx-auto" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1.5">
                    {searchResults.map((u) => (
                      <div
                        key={u.user_id}
                        onClick={() => handleStartDirectChat(u.user_id)}
                        className="bg-[#FFFDF9] hover:bg-[#FAF8F5] border border-[#E8DED6] p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {u.foto_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.foto_url}
                              alt={u.nama}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#E8DED6]"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E8DED6] text-[#C85A32] flex items-center justify-center text-xs font-bold shrink-0">
                              {u.nama ? u.nama.charAt(0).toUpperCase() : 'P'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-serif font-bold text-xs text-[#2C2A29] truncate">
                              {u.nama}
                            </p>
                            <span className="text-[10px] text-[#6B625D]">
                              {u.status_badge || 'Pelajar Sastra'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-[#C85A32] font-semibold shrink-0">
                          Kirim Pesan →
                        </span>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <p className="text-center text-xs text-[#6B625D] py-6">
                    Penulis tidak ditemukan.
                  </p>
                ) : (
                  <p className="text-center text-xs text-[#6B625D] py-6">
                    Ketik nama penulis untuk mulai bertukar pesan.
                  </p>
                )}
              </div>
            ) : (
              /* --- TAMPILAN DAFTAR PERCAKAPAN --- */
              <div className="space-y-3">
                <button
                  onClick={() => setIsSearchMode(true)}
                  className="w-full py-2 px-3 bg-[#FFFDF9] hover:bg-[#FAF8F5] border border-[#E8DED6] rounded-xl text-xs text-[#C85A32] flex items-center justify-center gap-2 font-medium transition cursor-pointer"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>Kirim Pesan Baru</span>
                </button>

                {conversations.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <MessageSquare className="w-10 h-10 text-[#E8DED6] mx-auto" />
                    <p className="font-serif font-bold text-xs text-[#2C2A29]">
                      Kotak Pesan Masih Kosong
                    </p>
                    <p className="text-[11px] text-[#6B625D] max-w-[220px] mx-auto">
                      Belum ada pesan. Buka profil penulis untuk mulai bertukar pikiran.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((c) => {
                      const timeStr = c.last_message_at
                        ? formatWaktuRelatif(c.last_message_at)
                        : '';

                      return (
                        <div
                          key={c.id}
                          onClick={() => handleOpenConversation(c)}
                          className="bg-[#FFFDF9] hover:bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8DED6] cursor-pointer transition flex items-center gap-3 shadow-2xs"
                        >
                          {c.other_user_foto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={c.other_user_foto}
                              alt={c.other_user_name || 'Penulis'}
                              loading="lazy"
                              decoding="async"
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E8DED6]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8DED6] text-[#C85A32] flex items-center justify-center font-bold text-xs shrink-0">
                              {c.other_user_name ? c.other_user_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-serif font-bold text-xs text-[#2C2A29] truncate">
                                {c.other_user_name || 'Penulis Sastra'}
                              </h4>
                              <span className="text-[10px] text-[#6B625D] shrink-0">
                                {timeStr}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6B625D] truncate mt-0.5">
                              {c.last_message || 'Belum ada pesan...'}
                            </p>
                          </div>

                          {c.unread_count && c.unread_count > 0 ? (
                            <div className="w-5 h-5 rounded-full bg-[#C85A32] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {c.unread_count}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Input saat percakapan terbuka */}
          {activeConvId && (
            <div className="p-2.5 bg-[#FFFDF9] border-t border-[#E8DED6] shrink-0 z-10 shadow-xs">
              {isBlockedState ? (
                <div className="text-center py-1 text-xs text-rose-700 font-medium flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Percakapan ini dinonaktifkan (status blokir).</span>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputIsi}
                    onChange={(e) => setInputIsi(e.target.value)}
                    placeholder="Tulis balasan pesan..."
                    className="flex-1 text-xs bg-[#FAF8F5] border border-[#E8DED6] rounded-xl px-3 py-2 text-[#2C2A29] placeholder-[#6B625D]/60 focus:outline-none focus:border-[#C85A32]"
                    maxLength={2000}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputIsi.trim()}
                    className="p-2 bg-[#C85A32] hover:bg-[#A94728] disabled:opacity-40 text-white rounded-xl transition shrink-0 cursor-pointer"
                    title="Kirim Pesan"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
