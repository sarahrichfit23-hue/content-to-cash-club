import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Download, TrendingUp, Users, Eye, MousePointer, Share2, Target, Clock, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface AnalyticsData {
  contentAnalytics: any[];
  engagementMetrics: any[];
  userActivity: any[];
  conversionEvents: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    contentAnalytics: [],
    engagementMetrics: [],
    userActivity: [],
    conversionEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('analytics-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'content_analytics' 
      }, () => {
        fetchAnalytics();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = getStartDate(dateRange);

      const [analytics, engagement, activity, conversions] = await Promise.all([
        supabase.from('content_analytics')
          .select('*')
          .gte('date', startDate.toISOString())
          .order('date', { ascending: true }),
        supabase.from('engagement_metrics')
          .select('*')
          .gte('period_date', startDate.toISOString())
          .order('period_date', { ascending: true }),
        supabase.from('user_activity')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('conversion_events')
          .select('*')
          .gte('created_at', startDate.toISOString())
      ]);

      setData({
        contentAnalytics: analytics.data || [],
        engagementMetrics: engagement.data || [],
        userActivity: activity.data || [],
        conversionEvents: conversions.data || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string) => {
    const now = new Date();
    switch (range) {
      case '24h': return subDays(now, 1);
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      case '90d': return subDays(now, 90);
      default: return subDays(now, 7);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analytics-export', {
        body: { format, dateRange, metrics: data }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([format === 'json' ? JSON.stringify(data) : data], {
        type: format === 'csv' ? 'text/csv' : format === 'pdf' ? 'text/html' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Analytics exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics data',
        variant: 'destructive'
      });
    }
  };

  const calculateSummaryMetrics = () => {
    const totalViews = data.contentAnalytics.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalClicks = data.contentAnalytics.reduce((sum, item) => sum + (item.clicks || 0), 0);
    const totalShares = data.contentAnalytics.reduce((sum, item) => sum + (item.shares || 0), 0);
    const totalConversions = data.contentAnalytics.reduce((sum, item) => sum + (item.conversions || 0), 0);
    const avgEngagement = data.contentAnalytics.length > 0
      ? data.contentAnalytics.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / data.contentAnalytics.length
      : 0;

    return { totalViews, totalClicks, totalShares, totalConversions, avgEngagement };
  };

  const metrics = calculateSummaryMetrics();

  const chartData = data.engagementMetrics.map(item => ({
    date: format(new Date(item.period_date), 'MMM dd'),
    views: item.total_views,
    clicks: item.total_clicks,
    conversions: item.total_conversions
  }));

  const activityByType = data.userActivity.reduce((acc, item) => {
    acc[item.activity_type] = (acc[item.activity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(activityByType).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport('json')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{metrics.totalClicks.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Shares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{metrics.totalShares.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">{metrics.totalConversions.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold">{metrics.avgEngagement.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#0088FE" fill="#0088FE" />
                  <Area type="monotone" dataKey="clicks" stackId="1" stroke="#00C49F" fill="#00C49F" />
                  <Area type="monotone" dataKey="conversions" stackId="1" stroke="#FFBB28" fill="#FFBB28" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
