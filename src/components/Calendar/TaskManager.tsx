import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function TaskManager() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) console.error('User fetch error:', userError);
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('Loaded tasks:', data, error);
    setTasks(data ?? []);
  };

  const createTask = async () => {
    if (!newTask.trim()) return;
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('User fetch error: ' + userError.message);
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: newTask,
        status: 'pending'
      });

      console.log('Inserted task:', data, error);

      setNewTask('');
      await loadTasks();
      toast.success('Task created!');
    } catch (error: any) {
      toast.error(error.message);
      console.error('Task creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null })
      .eq('id', task.id);
    if (error) console.error('Toggle task error:', error);
    await loadTasks();
  };

  const convertToEvent = async (task: any) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) console.error('User fetch error:', userError);
    if (!user) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const { error } = await supabase.from('Calendar_events').insert({
      user_id: user.id,
      title: task.title,
      description: task.description,
      start_time: tomorrow.toISOString(),
      end_time: new Date(tomorrow.getTime() + 3600000).toISOString(),
      event_type: 'task'
    });
    if (error) console.error('Convert to event error:', error);

    toast.success('Added to Calendar!');
  };

  // Show a message if there are no tasks
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && createTask()}
        />
        <Button onClick={createTask} disabled={loading}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-gray-500 text-sm p-4 text-center bg-gray-50 rounded-lg">
            No tasks yet. Add one above!
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox checked={task.status === 'completed'} onCheckedChange={() => toggleTask(task)} />
              <span className={task.status === 'completed' ? 'line-through flex-1' : 'flex-1'}>{task.title}</span>
              <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>{task.status}</Badge>
              <Button size="sm" variant="ghost" onClick={() => convertToEvent(task)}>
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}