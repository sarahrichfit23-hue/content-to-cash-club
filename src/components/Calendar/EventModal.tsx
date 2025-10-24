import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  event?: any;
  selectedDate?: Date;
}

export function EventModal({ open, onClose, onSave, event, selectedDate }: EventModalProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startTime, setStartTime] = useState(event?.start || selectedDate?.toISOString().slice(0, 16) || '');
  const [endTime, setEndTime] = useState(event?.end || '');
  const [eventType, setEventType] = useState(event?.extendedProps?.event_type || 'meeting');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const eventData = {
        user_id: user.id,
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        event_type: eventType,
        color: eventType === 'call' ? '#F59E0B' : eventType === 'task' ? '#10B981' : '#3B82F6'
      };

      if (event?.id) {
        await supabase.from('calendar_events').update(eventData).eq('id', event.id);
        toast.success('Event updated!');
      } else {
        await supabase.from('calendar_events').insert(eventData);
        toast.success('Event created!');
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Coaching Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="content">Content Work</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Start Time</Label>
            <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
          <div>
            <Label>End Time</Label>
            <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}