import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckSquare } from 'lucide-react';

const MONTHS = ['Onboarding', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];

export default function TaskManager({ portalId }: { portalId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Onboarding');

  useEffect(() => {
    loadTasks();
  }, [portalId]);

  const loadTasks = async () => {
    const { data } = await supabase
      .from('client_tasks')
      .select('*')
      .eq('portal_id', portalId)
      .order('order_index');
    
    if (data) setTasks(data);
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    await supabase.from('client_tasks').insert({
      portal_id: portalId,
      title: newTask,
      month_category: selectedMonth.toLowerCase().replace(' ', '_')
    });

    setNewTask('');
    loadTasks();
  };

  const toggleComplete = async (id: string, isCompleted: boolean) => {
    await supabase
      .from('client_tasks')
      .update({ is_completed: !isCompleted })
      .eq('id', id);
    loadTasks();
  };

  const getTasksByMonth = (month: string) => {
    const monthKey = month.toLowerCase().replace(' ', '_');
    return tasks.filter(t => t.month_category === monthKey);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-green-50">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-6 h-6 text-green-600" />
          <div>
            <h2 className="text-xl font-semibold">Task Manager</h2>
            <p className="text-sm text-gray-600">Task Overview for your entire Program</p>
          </div>
        </div>
      </Card>

      <Tabs value={selectedMonth} onValueChange={setSelectedMonth}>
        <TabsList className="w-full flex-wrap h-auto">
          {MONTHS.map((month) => (
            <TabsTrigger key={month} value={month} className="flex-1">
              {month}
            </TabsTrigger>
          ))}
        </TabsList>

        {MONTHS.map((month) => (
          <TabsContent key={month} value={month}>
            <Card className="p-6">
              <div className="space-y-3">
                {getTasksByMonth(month).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={() => toggleComplete(task.id, task.is_completed)}
                    />
                    <span className={task.is_completed ? 'line-through text-gray-500' : ''}>
                      {task.title}
                    </span>
                    {task.due_date && (
                      <span className="ml-auto text-sm text-gray-500">
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}

                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Add new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Button onClick={addTask}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
