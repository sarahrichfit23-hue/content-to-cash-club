import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';
import { fetchMessages, sendMessage, markMessagesAsRead } from '@/lib/messages';
import type { Message } from '@/lib/messages';

interface BuddyChatProps {
  buddyId: string;
  buddyName: string;
}

const BuddyChat: React.FC<BuddyChatProps> = ({ buddyId, buddyName }) => {
  const user = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load & subscribe to chat
  useEffect(() => {
    if (!user?.id || !buddyId) return;

    const load = async () => {
      const msgs = await fetchMessages(user.id, buddyId);
      setMessages(msgs);
      await markMessagesAsRead(user.id, buddyId);
    };
    load();

    const channel = supabase
      .channel(`accountability_chat_${user.id}_${buddyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'accountability_messages',
          filter: `or(and(sender_id.eq.${buddyId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${buddyId}))`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          if (newMsg.sender_id === buddyId) {
            await markMessagesAsRead(user.id, buddyId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, buddyId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id) return;
    await sendMessage(user.id, buddyId, newMessage);
    setNewMessage('');
    const msgs = await fetchMessages(user.id, buddyId);
    setMessages(msgs);
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-2xl p-4">
      <div className="text-lg font-semibold mb-3">{buddyName}</div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg max-w-[75%] ${
              msg.sender_id === user?.id
                ? 'bg-primary text-primary-foreground self-end ml-auto'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {msg.message_text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex mt-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-xl px-3 py-2 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default BuddyChat;
