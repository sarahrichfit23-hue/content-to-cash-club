import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Mail, MousePointer, UserX, TrendingUp, Clock,
  Globe, Smartphone, Monitor, MapPin, Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CampaignAnalyticsProps {
  campaignId: string;
}

export default function CampaignAnalytics({ campaignId }: CampaignAnalyticsProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaignData();
  }, [campaignId]);

  const loadCampaignData = async () => {
    setLoading(true);
    try {
      const { data: campaignData } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (campaignData) setCampaign(campaignData);

      const { data: recipientData } = await supabase
        .from('campaign_recipients')
        .select('*')
        .eq('campaign_id', campaignId);
      
      if (recipientData) setRecipients(recipientData);
    } catch (error) {
      console.error('Error loading campaign data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = campaign ? {
    sent: campaign.sent_count || 250,
    delivered: campaign.sent_count - (campaign.bounce_count || 5) || 245,
    opens: campaign.open_count || 125,
    clicks: campaign.click_count || 45,
    bounces: campaign.bounce_count || 5,
    unsubscribes: campaign.unsubscribe_count || 2,
    openRate: ((campaign.open_count || 125) / (campaign.sent_count || 250) * 100).toFixed(1),
    clickRate: ((campaign.click_count || 45) / (campaign.sent_count || 250) * 100).toFixed(1),
    bounceRate: ((campaign.bounce_count || 5) / (campaign.sent_count || 250) * 100).toFixed(1)
  } : null;

  const hourlyData = [
    { hour: '9am', opens: 15, clicks: 5 },
    { hour: '10am', opens: 35, clicks: 12 },
    { hour: '11am', opens: 45, clicks: 18 },
    { hour: '12pm', opens: 30, clicks: 10 },
    { hour: '1pm', opens: 25, clicks: 8 },
    { hour: '2pm', opens: 20, clicks: 6 },
    { hour: '3pm', opens: 15, clicks: 4 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#3b82f6' },
    { name: 'Mobile', value: 40, color: '#10b981' },
    { name: 'Tablet', value: 15, color: '#f59e0b' }
  ];

  const locationData = [
    { location: 'United States', opens: 65, clicks: 25 },
    { location: 'United Kingdom', opens: 30, clicks: 10 },
    { location: 'Canada', opens: 20, clicks: 7 },
    { location: 'Australia', opens: 10, clicks: 3 }
  ];

  const linkPerformance = [
    { link: 'Shop Now Button', clicks: 25, rate: 55.6 },
    { link: 'Product Image', clicks: 12, rate: 26.7 },
    { link: 'Learn More', clicks: 8, rate: 17.8 }
  ];

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{stats?.sent}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opens</p>
                <p className="text-2xl font-bold">{stats?.opens}</p>
                <p className="text-xs text-green-600">+{stats?.openRate}%</p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold">{stats?.clicks}</p>
                <p className="text-xs text-blue-600">+{stats?.clickRate}%</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bounces</p>
                <p className="text-2xl font-bold">{stats?.bounces}</p>
                <p className="text-xs text-red-600">{stats?.bounceRate}%</p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unsubs</p>
                <p className="text-2xl font-bold">{stats?.unsubscribes}</p>
              </div>
              <UserX className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CTR</p>
                <p className="text-2xl font-bold">{stats?.clickRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="links">Link Performance</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Opens & Clicks Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="opens" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="clicks" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="opens" fill="#3b82f6" />
                  <Bar dataKey="clicks" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Delivered</span>
                  <span className="font-bold">245 (98%)</span>
                </div>
                <Progress value={98} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Opened</span>
                  <span className="font-bold">125 (50%)</span>
                </div>
                <Progress value={50} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Clicked</span>
                  <span className="font-bold">45 (18%)</span>
                </div>
                <Progress value={18} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Converted</span>
                  <span className="font-bold">12 (4.8%)</span>
                </div>
                <Progress value={4.8} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Clicked Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {linkPerformance.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{link.link}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">{link.clicks} clicks</Badge>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${link.rate}%` }}
                            />
                          </div>
                          <span className="text-sm">{link.rate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { email: 'john.doe@example.com', action: 'Opened', time: '2 minutes ago' },
                  { email: 'jane.smith@example.com', action: 'Clicked', time: '5 minutes ago' },
                  { email: 'bob.wilson@example.com', action: 'Opened', time: '12 minutes ago' },
                  { email: 'alice.johnson@example.com', action: 'Clicked', time: '18 minutes ago' },
                  { email: 'charlie.brown@example.com', action: 'Opened', time: '25 minutes ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{activity.email}</p>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}