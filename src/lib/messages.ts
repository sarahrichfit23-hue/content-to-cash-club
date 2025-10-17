import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  created_at: string;
  read: boolean;
}

// ✅ Fetch chat messages between two users
export async function fetchMessages(userId: string, buddyId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('accountability_messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${buddyId}),and(sender_id.eq.${buddyId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data as Message[];
}

// ✅ Send a message
export async function sendMessage(senderId: string, receiverId: string, messageText: string) {
  const { error } = await supabase.from('accountability_messages').insert([
    {
      sender_id: senderId,
      receiver_id: receiverId,
      message_text: messageText,
      read: false,
    },
  ]);

  if (error) console.error('Error sending message:', error);
}

// ✅ Mark all messages from buddy → user as read
export async function markMessagesAsRead(userId: string, buddyId: string) {
  const { error } = await supabase
    .from('accountability_messages')
    .update({ read: true })
    .eq('sender_id', buddyId)
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) console.error('Error marking messages as read:', error);
}

// ✅ Count unread messages for each buddy
export async function getUnreadCount(userId: string, buddyId: string): Promise<number> {
  const { count, error } = await supabase
    .from('accountability_messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', buddyId)
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error counting unread messages:', error);
    return 0;
  }

  return count ?? 0;
}
