import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface WeeklyChallengeProgressProps {
  userId?: string;
}

const WeeklyChallengeProgress: React.FC<WeeklyChallengeProgressProps> = ({ userId }) => {
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

// ✅ Updated query: safe and silences 406 warnings
const { data, error, status } = await supabase
  .from('daily_checkins')
  .select('challenges_completed')
  .eq('user_id', userId)
  .eq('checkin_date', dateStr)
  .maybeSingle(); // ✅ allows 0 or 1 rows safely

// Only log unexpected errors (not the 'no rows' 406 case)
if (error && error.code !== 'PGRST116') {
  console.warn('⚠️ daily_checkins fetch error:', error.message);
  continue;
}

// If there’s simply no data for this day, skip quietly
if (!data || status === 406 || status === 204) {
  continue;
}

// Mark day complete if all 5 challenges are done
if (data?.challenges_completed?.length === 5) {
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

export default WeeklyChallengeProgress;

