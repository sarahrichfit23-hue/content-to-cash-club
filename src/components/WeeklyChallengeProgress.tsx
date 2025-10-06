import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface WeeklyChallengeProgressProps {
  userId?: string;
}

export const WeeklyChallengeProgress: React.FC<WeeklyChallengeProgressProps> = ({ userId }) => {
  const [weeklyProgress, setWeeklyProgress] = useState<boolean[]>([false, false, false, false, false, false, false]);

  useEffect(() => {
    if (userId) {
      loadWeeklyProgress();
    }
  }, [userId]);

  const loadWeeklyProgress = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const progress = [false, false, false, false, false, false, false];

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(startOfWeek.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const { data } = await supabase
        .from('daily_checkins')
        .select('challenges_completed')
        .eq('user_id', userId)
        .eq('checkin_date', dateStr)
        .single();

      if (data && data.challenges_completed && data.challenges_completed.length === 5) {
        progress[i] = true;
      }
    }

    setWeeklyProgress(progress);
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex gap-2">
      {weeklyProgress.map((completed, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              completed ? 'bg-white text-yellow-600' : 'bg-white/20 text-white'
            }`}
          >
            {completed ? '✓' : days[index]}
          </div>
        </div>
      ))}
    </div>
  );
};
