import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, Users, Trophy, AtSign, Heart, Clock } from 'lucide-react';

interface NotificationPreferences {
  email_messages: boolean;
  email_comments: boolean;
  email_group_joins: boolean;
  email_challenges: boolean;
  email_mentions: boolean;
  email_likes: boolean;
  push_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_messages: true,
    email_comments: true,
    email_group_joins: true,
    email_challenges: false,
    email_mentions: true,
    email_likes: false,
    push_enabled: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPreferences(data);
    } else if (error?.code === 'PGRST116') {
      // No preferences found, create default
      await createDefaultPreferences(user.id);
    }
  };

  const createDefaultPreferences = async (userId: string) => {
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert([{ user_id: userId, ...preferences }])
      .select()
      .single();

    if (data) {
      setPreferences(data);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const savePreferences = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Notification preferences saved"
      });
    }
  };

  const notificationTypes = [
    {
      key: 'email_messages',
      icon: MessageSquare,
      title: 'Direct Messages',
      description: 'Get notified when you receive a direct message'
    },
    {
      key: 'email_comments',
      icon: MessageSquare,
      title: 'Comments',
      description: 'Get notified when someone comments on your posts'
    },
    {
      key: 'email_group_joins',
      icon: Users,
      title: 'Group Activity',
      description: 'Get notified when someone joins your mastermind group'
    },
    {
      key: 'email_mentions',
      icon: AtSign,
      title: 'Mentions',
      description: 'Get notified when someone mentions you'
    },
    {
      key: 'email_challenges',
      icon: Trophy,
      title: 'Challenge Updates',
      description: 'Get notified about challenge completions and updates'
    },
    {
      key: 'email_likes',
      icon: Heart,
      title: 'Likes',
      description: 'Get notified when someone likes your content'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to be notified about activity in the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="push">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable in-app notifications
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => updatePreference('push_enabled', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Email Notifications</h3>
            </div>
            
            {notificationTypes.map(({ key, icon: Icon, title, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor={key}>{title}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                <Switch
                  id={key}
                  checked={preferences[key as keyof NotificationPreferences] as boolean}
                  onCheckedChange={(checked) => updatePreference(key as keyof NotificationPreferences, checked)}
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Quiet Hours</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Set a time period when you don't want to receive notifications
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet-start">Start Time</Label>
                <Select
                  value={preferences.quiet_hours_start || ''}
                  onValueChange={(value) => updatePreference('quiet_hours_start', value)}
                >
                  <SelectTrigger id="quiet-start">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Disabled</SelectItem>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quiet-end">End Time</Label>
                <Select
                  value={preferences.quiet_hours_end || ''}
                  onValueChange={(value) => updatePreference('quiet_hours_end', value)}
                >
                  <SelectTrigger id="quiet-end">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Disabled</SelectItem>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
