import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Users, Trophy, TrendingUp, Heart, Eye, Send, Search, Plus } from 'lucide-react';
import ForumSection from './community/ForumSection';
import MastermindGroups from './community/MastermindGroups';
import ChallengesSection from './community/ChallengesSection';
import Leaderboard from './community/Leaderboard';
import DirectMessages from './community/DirectMessages';

const CommunityHub = () => {
  const [activeTab, setActiveTab] = useState('forum');
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalMembers: 0,
    activeChallenges: 0,
    totalGroups: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
    fetchCommunityStats();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUser({ ...user, profile });
    }
  };

  const fetchCommunityStats = async () => {
    const [postsCount, membersCount, challengesCount, groupsCount] = await Promise.all([
      supabase.from('community_posts').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('challenges').select('id', { count: 'exact' }).gte('end_date', new Date().toISOString()),
      supabase.from('mastermind_groups').select('id', { count: 'exact' })
    ]);

    setStats({
      totalPosts: postsCount.count || 0,
      totalMembers: membersCount.count || 0,
      activeChallenges: challengesCount.count || 0,
      totalGroups: groupsCount.count || 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Community Hub</h2>
          <p className="text-muted-foreground">Connect, share, and grow with fellow coaches</p>
        </div>
        <Button onClick={() => setActiveTab('messages')} variant="outline">
          <Send className="w-4 h-4 mr-2" />
          Messages
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Challenges</p>
                <p className="text-2xl font-bold">{stats.activeChallenges}</p>
              </div>
              <Trophy className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mastermind Groups</p>
                <p className="text-2xl font-bold">{stats.totalGroups}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="groups">Mastermind Groups</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="forum" className="space-y-4">
          <ForumSection user={user} />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <MastermindGroups user={user} />
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <ChallengesSection user={user} />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <DirectMessages user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;
