import React, { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';
import { getUnreadCount } from '@/lib/messages';
import BuddyChat from './BuddyChat';

interface Buddy {
  id: string;
  buddy_id: string;
  buddy_name: string;
}

const BuddyListWithMessages: React.FC = () => {
  const user = useUser();
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.id) return;
    const loadBuddies = async () => {
      const { data } = await supabase
        .from('accountability_buddies')
        .select('*')
        .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`);
      setBuddies(data || []);
    };
    loadBuddies();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const updateCounts = async () => {
      const counts: Record<string, number> = {};
      for (const b of buddies) {
        const buddyId = b.user_id === user.id ? b.buddy_id : b.user_id;
        counts[buddyId] = await getUnreadCount(user.id, buddyId);
      }
      setUnreadCounts(counts);
    };
    updateCounts();
  }, [buddies, user?.id]);

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <div className="col-span-1 bg-muted rounded-2xl p-4 overflow-y-auto">
        <h2 className="font-semibold mb-3">Your Buddies</h2>
        <ul className="space-y-2">
          {buddies.map((b) => {
            const buddyId = b.user_id === user?.id ? b.buddy_id : b.user_id;
            const buddyName = b.buddy_name || 'Buddy';
            return (
              <li
                key={buddyId}
                onClick={() => setSelectedBuddy(b)}
                className={`flex justify-between items-center p-2 rounded-lg cursor-pointer hover:bg-accent ${
                  selectedBuddy?.buddy_id === buddyId ? 'bg-accent' : ''
                }`}
              >
                <span>{buddyName}</span>
                {unreadCounts[buddyId] > 0 && (
                  <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                    {unreadCounts[buddyId]}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="col-span-2">
        {selectedBuddy ? (
          <BuddyChat
            buddyId={selectedBuddy.user_id === user?.id ? selectedBuddy.buddy_id : selectedBuddy.user_id}
            buddyName={selectedBuddy.buddy_name}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a buddy to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default BuddyListWithMessages;
