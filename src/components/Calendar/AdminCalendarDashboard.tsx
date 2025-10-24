import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';

export function AdminCalendarDashboard() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEvents: 0, completedTasks: 0, pendingTasks: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load all users with coach role
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'coach');

    if (profiles) {
      const coachData = await Promise.all(
        profiles.map(async (coach) => {
          const { data: events } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('user_id', coach.id);

          const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', coach.id);

          return {
            ...coach,
            eventCount: events?.length || 0,
            taskCount: tasks?.length || 0,
            completedTasks: tasks?.filter(t => t.status === 'completed').length || 0
          };
        })
      );

      setCoaches(coachData);

      // Calculate stats
      const { data: allEvents } = await supabase.from('calendar_events').select('*');
      const { data: allTasks } = await supabase.from('tasks').select('*');

      setStats({
        totalEvents: allEvents?.length || 0,
        completedTasks: allTasks?.filter(t => t.status === 'completed').length || 0,
        pendingTasks: allTasks?.filter(t => t.status === 'pending').length || 0
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Coaches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coaches.map((coach) => (
              <div key={coach.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-gray-600" />
                  <div>
                    <p className="font-medium">{coach.full_name || coach.email}</p>
                    <p className="text-sm text-gray-600">{coach.email}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Badge variant="outline">{coach.eventCount} Events</Badge>
                  <Badge variant="outline">{coach.completedTasks}/{coach.taskCount} Tasks</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
