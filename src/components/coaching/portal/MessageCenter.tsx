import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Mail } from 'lucide-react';

export default function MessageCenter({ portalId }: { portalId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadMessages();
  }, [portalId]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('client_messages')
      .select('*')
      .eq('portal_id', portalId)
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await supabase.from('client_messages').insert({
      portal_id: portalId,
      sender_type: 'coach',
      message: newMessage
    });

    setNewMessage('');
    loadMessages();
  };

  const toggleRead = async (id: string, isRead: boolean) => {
    await supabase
      .from('client_messages')
      .update({ is_read: !isRead })
      .eq('id', id);
    loadMessages();
  };

  const toggleDone = async (id: string, isDone: boolean) => {
    await supabase
      .from('client_messages')
      .update({ is_done: !isDone })
      .eq('id', id);
    loadMessages();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Message Center</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Click +New to add a new message. You can use the @ sign to tag the client.
        </p>

        <div className="space-y-2 mb-4">
          <Textarea
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
          />
          <Button onClick={sendMessage}>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {messages.map((msg) => (
          <Card key={msg.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">{msg.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Checkbox
                  checked={msg.is_read}
                  onCheckedChange={() => toggleRead(msg.id, msg.is_read)}
                />
                <span className="text-xs">Read</span>
                <Checkbox
                  checked={msg.is_done}
                  onCheckedChange={() => toggleDone(msg.id, msg.is_done)}
                />
                <span className="text-xs">Done</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
