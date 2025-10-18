import Leaderboard from './accountability/Leaderboard';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import StreakTracker from './accountability/StreakTracker';
import BadgeDisplay from './accountability/BadgeDisplay';
import BuddyFinder from './accountability/BuddyFinder';
import BuddyListWithMessages from './accountability/BuddyListWithMessages';
import LeaderboardSettings from './accountability/LeaderboardSettings';
import NotificationCenter from './accountability/NotificationCenter';
import { AVAILABLE_BADGES } from '@/data/badges';

const DAILY_CHALLENGES = [
  {
    id: 'content',
    text: 'Post content (choose one: Carousel, Reel, or Static Image)',
    options: ['Carousel', 'Reel', 'Static Image'],
  },
  { id: 'comments', text: "Comment on at least 10 ideal client's posts", options: [] },
  { id: 'dm_followers', text: 'DM anyone who has followed you today', options: [] },
  { id: 'engage_niche', text: 'Engage with 5 accounts in your niche', options: [] },
  { id: 'story_cta', text: 'Share a story with a CTA', options: [] },
];

const DailyChallenge: React.FC = () => {
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [accountability, setAccountability] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { toast } = useToast();

  // 🧠 Load user accountability data
  useEffect(() => {
    loadAccountabilityData();
  }, []);

  const loadAccountabilityData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from('user_accountability')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(); // ✅ safer than .single()

    if (error) {
      console.warn('⚠️ Error loading user_accountability:', error.message);
    }

    if (data) {
      setAccountability(data);
    }
  };

  // ✅ Toggle challenge + save to daily_checkins
  const toggleChallenge = async (challenge: string) => {
    const updated = completedChallenges.includes(challenge)
      ? completedChallenges.filter((c) => c !== challenge)
      : [...completedChallenges, challenge];

    setCompletedChallenges(updated);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

const { data, error } = await supabase
  .from('daily_checkins')
  .upsert({
    user_id: user.id,
    checkin_date: today,
    challenges_completed: updated,
  })
  .select(); // ✅ this alone handles return cleanly — no 406 risk

if (error) {
  console.error('❌ daily_checkins upsert error:', error.message);
} else {
  console.log('✅ daily_checkins updated:', data);
}

    // Notify buddies if all challenges completed
    if (updated.length === DAILY_CHALLENGES.length) {
      await notifyBuddies(user.id, 'challenge_complete', 'Your buddy completed all daily challenges! 🎉');
    }

    toast({
      title: 'Progress Saved!',
      description: `${updated.length} challenges completed today`,
    });
  };

  // 📨 Notify accepted accountability buddies
  const notifyBuddies = async (userId: string, type: string, message: string) => {
    const { data: buddies, error } = await supabase
      .from('accountability_buddies')
      .select('user_id, buddy_id')
      .or(`user_id.eq.${userId},buddy_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) {
      console.error('⚠️ Error loading buddies:', error.message);
      return;
    }

    if (buddies) {
      for (const buddy of buddies) {
        const buddyId = buddy.user_id === userId ? buddy.buddy_id : buddy.user_id;
        await supabase.functions.invoke('send-buddy-notification', {
          body: { buddyId, type, message },
        });
      }
    }
  };

  const badges = AVAILABLE_BADGES.map((badge) => ({
    ...badge,
    earned: accountability?.badges_earned?.includes(badge.id) || false,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daily Accountability</h2>
        <NotificationCenter />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <StreakTracker
          currentStreak={accountability?.current_streak || 0}
          longestStreak={accountability?.longest_streak || 0}
          totalCheckins={accountability?.total_checkins || 0}
        />
        <BadgeDisplay badges={badges} />
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Find Accountability Buddies</h3>
          <BuddyFinder />
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Your Accountability Buddies</h3>
          <BuddyListWithMessages />
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Leaderboard Settings</h3>
          <LeaderboardSettings />
        </Card>
      </div>

      <Card className="p-6">
  <Leaderboard />
</Card>


      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Today's Challenges</h3>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-bold">
              {completedChallenges.length}/{DAILY_CHALLENGES.length}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {DAILY_CHALLENGES.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => toggleChallenge(challenge.id)}
              className="w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all hover:border-olive-300 text-left"
            >
              {completedChallenges.includes(challenge.id) ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
              )}
              <span
                className={
                  completedChallenges.includes(challenge.id)
                    ? 'line-through text-gray-500'
                    : ''
                }
              >
                {challenge.text}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DailyChallenge;

