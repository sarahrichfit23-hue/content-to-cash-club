import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Flame } from 'lucide-react';
// import DirectMessages from './DirectMessages';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function BuddyListWithMessages() {
  const [buddies, setBuddies] = useState<any[]>([]);
  const [selectedBuddy, setSelectedBuddy] = useState<any>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadBuddies();
    const interval = setInterval(loadUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadBuddies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('accountability_buddies')
      .select(`
        *,
        buddy:buddy_id(id, email),
        user:user_id(id, email)
      `)
      .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (data) {
      const buddyList = data.map(b => ({
        id: b.user_id === user.id ? b.buddy_id : b.user_id,
        email: b.user_id === user.id ? b.buddy?.email : b.user?.email,
        streak: 0
      }));
      setBuddies(buddyList);
      loadStreaks(buddyList);
      loadUnreadCounts();
    }
  };

  const loadStreaks = async (buddyList: any[]) => {
    const streaks = await Promise.all(
      buddyList.map(async (buddy) => {
        const { data } = await supabase
          .from('user_accountability')
          .select('current_streak')
          .eq('user_id', buddy.id)
          .single();
        return { ...buddy, streak: data?.current_streak || 0 };
      })
    );
    setBuddies(streaks);
  };

  const loadUnreadCounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('buddy_messages')
      .select('sender_id')
      .eq('receiver_id', user.id)
      .is('read_at', null);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach(msg => {
        counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {buddies.map((buddy) => (
          <Card key={buddy.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{buddy.email}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">
                    {buddy.streak} day streak
                  </span>
                </div>
              </div>
              {unreadCounts[buddy.id] > 0 && (
                <Badge variant="destructive">{unreadCounts[buddy.id]}</Badge>
              )}
            </div>
            <Button onClick={() => setSelectedBuddy(buddy)} className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedBuddy} onOpenChange={() => setSelectedBuddy(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Messages with {selectedBuddy?.email || 'Buddy'}
            </DialogTitle>
          </DialogHeader>

          {/* Temporarily commented out to avoid missing file errors */}
          {/* <DirectMessages buddyId={selectedBuddy.id} buddyName={selectedBuddy.email} /> */}

          {selectedBuddy && (
            <div className="p-4 text-center text-gray-500 italic">
              💬 Direct messages feature coming soon!
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
