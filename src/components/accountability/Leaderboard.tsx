import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random';

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_accountability')
      .select('user_id, display_name, avatar_url, points')
      .order('points', { ascending: false })
      .limit(30);
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-amber-600">🏆 Leaderboard</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No users on the leaderboard yet.</div>
      ) : (
        <ol className="space-y-4">
          {users.map((user, i) => (
            <li
              key={user.user_id}
              className={`
                flex items-center justify-between p-3 rounded-lg
                ${i === 0 ? 'bg-yellow-100 font-bold text-amber-700' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-mono w-6 text-right">{i + 1}</span>
                <img
                  src={user.avatar_url || DEFAULT_AVATAR}
                  alt={user.display_name}
                  className="w-10 h-10 rounded-full border border-amber-200 object-cover"
                />
                <span>{user.display_name || 'User'}</span>
              </div>
              <span className="font-semibold text-lg">{user.points} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
