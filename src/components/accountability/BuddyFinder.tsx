import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function BuddyFinder() {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchEmail.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Search would need admin API - for now show message
      toast.info('Buddy search coming soon! Share your email with friends to connect.');
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Find Accountability Buddy</h3>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Enter email to find buddy..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
        />
        <Button onClick={searchUsers} disabled={loading}>
          <Search className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Share your email with a friend to become accountability buddies!
      </p>
    </Card>
  );
}
export default BuddyFinder;