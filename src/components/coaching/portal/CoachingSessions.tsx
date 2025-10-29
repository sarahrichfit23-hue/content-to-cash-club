import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Video, Calendar } from 'lucide-react';

export default function CoachingSessions({ portalId }: { portalId: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [zoomLink, setZoomLink] = useState('');

  useEffect(() => {
    loadSessions();
  }, [portalId]);

  const loadSessions = async () => {
    const { data } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('portal_id', portalId)
      .order('session_date');
    
    if (data) setSessions(data);
  };

  const addSession = async () => {
    if (!title || !date) return;

    await supabase.from('coaching_sessions').insert({
      portal_id: portalId,
      title,
      session_date: date,
      zoom_link: zoomLink
    });

    setTitle('');
    setDate('');
    setZoomLink('');
    setShowAdd(false);
    loadSessions();
  };

  const toggleComplete = async (id: string, isCompleted: boolean) => {
    await supabase
      .from('coaching_sessions')
      .update({ is_completed: !isCompleted })
      .eq('id', id);
    loadSessions();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-blue-50">
        <div className="flex items-center gap-3 mb-2">
          <Video className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Coaching Sessions</h2>
        </div>
        <p className="text-sm text-gray-600">
          Here is your personalized Zoom Link to join our calls: {zoomLink || 'https://zoom.us/'}
        </p>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <Video className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold">{session.title}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(session.session_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Checkbox
                checked={session.is_completed}
                onCheckedChange={() => toggleComplete(session.id, session.is_completed)}
              />
              <span className="text-sm">Done</span>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Coaching Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Session Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input placeholder="Zoom Link" value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} />
            <Button onClick={addSession} className="w-full">Add Session</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
