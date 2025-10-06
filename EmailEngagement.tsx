import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  MailOpen, 
  MousePointer, 
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface EngagementData {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  engagement_score: number;
  is_active: boolean;
  last_opened_at?: string;
  last_clicked_at?: string;
}

interface EmailEvent {
  id: string;
  event_type: string;
  email: string;
  timestamp: string;
  url?: string;
  bounce_reason?: string;
}

export function EmailEngagement() {
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [recentEvents, setRecentEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementData();
    fetchRecentEvents();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('email-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'email_events'
      }, () => {
        fetchEngagementData();
        fetchRecentEvents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchEngagementData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('email_engagement')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setEngagement(data);
    }
    setLoading(false);
  };

  const fetchRecentEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('email_events')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentEvents(data);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'open': return <MailOpen className="h-4 w-4 text-blue-500" />;
      case 'click': return <MousePointer className="h-4 w-4 text-purple-500" />;
      case 'bounce': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'unsubscribe': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'click': return 'bg-purple-100 text-purple-800';
      case 'bounce': return 'bg-red-100 text-red-800';
      case 'unsubscribe': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateRate = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return <div className="animate-pulse">Loading email engagement...</div>;
  }

  if (!engagement) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No email engagement data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engagement Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Email Engagement Score</span>
            <Badge variant={engagement.is_active ? 'default' : 'destructive'}>
              {engagement.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Activity className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{Math.round(engagement.engagement_score)}%</span>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <Progress value={engagement.engagement_score} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{engagement.total_sent}</p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{engagement.total_delivered}</p>
                <p className="text-xs text-muted-foreground">
                  {calculateRate(engagement.total_delivered, engagement.total_sent)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opened</p>
                <p className="text-2xl font-bold">{engagement.total_opened}</p>
                <p className="text-xs text-muted-foreground">
                  {calculateRate(engagement.total_opened, engagement.total_delivered)}%
                </p>
              </div>
              <MailOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clicked</p>
                <p className="text-2xl font-bold">{engagement.total_clicked}</p>
                <p className="text-xs text-muted-foreground">
                  {calculateRate(engagement.total_clicked, engagement.total_opened)}%
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bounced</p>
                <p className="text-2xl font-bold">{engagement.total_bounced}</p>
                <p className="text-xs text-muted-foreground">
                  {calculateRate(engagement.total_bounced, engagement.total_sent)}%
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unsubscribed</p>
                <p className="text-2xl font-bold">{engagement.total_unsubscribed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Email Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent events</p>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  {getEventIcon(event.event_type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getEventColor(event.event_type)}>
                        {event.event_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {event.bounce_reason && (
                      <p className="text-sm text-muted-foreground mt-1">{event.bounce_reason}</p>
                    )}
                    {event.url && (
                      <p className="text-sm text-muted-foreground mt-1">Clicked: {event.url}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}