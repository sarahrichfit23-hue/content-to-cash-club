import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

export function LeaderboardSettings() {
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_accountability')
      .select('show_on_leaderboard, display_name')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setShowOnLeaderboard(data.show_on_leaderboard || false);
      setDisplayName(data.display_name || '');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_accountability')
        .update({
          show_on_leaderboard: showOnLeaderboard,
          display_name: displayName
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Leaderboard Settings</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show on Leaderboard</Label>
            <p className="text-sm text-muted-foreground">
              Display your progress on the public leaderboard
            </p>
          </div>
          <Switch
            checked={showOnLeaderboard}
            onCheckedChange={setShowOnLeaderboard}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            placeholder="Your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <Button onClick={saveSettings} disabled={loading} className="w-full">
          Save Settings
        </Button>
      </div>
    </Card>
  );
}
export default LeaderboardSettings;
