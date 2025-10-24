import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { EventModal } from './EventModal';
import { Button } from '@/components/ui/button';
import { Plus, Video } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'sonner';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView() {
  // For live date/time
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [events, setEvents] = useState<any[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (data) {
      const formattedEvents = data.map(e => ({
        id: e.id,
        title: e.title,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        extendedProps: e
      }));
      setEvents(formattedEvents);
    }
  };

  const handleSelectSlot = ({ start }: any) => {
    setSelectedDate(start);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // Zoom meeting creation
  const createZoomMeeting = async () => {
    try {
      const { data } = await supabase.functions.invoke('create-zoom-meeting', {
        body: { topic: 'Coaching Call', duration: 60 }
      });
      toast.success('Zoom link created!');
      navigator.clipboard.writeText(data.join_url);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 flex flex-col">
      {/* Live date/time above calendar */}
      <div className="text-lg font-bold mb-4 text-black">
        {format(now, "EEEE, MMMM d, yyyy • h:mm:ss a")}
      </div>
      {/* Calendar controls */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Button
          onClick={() => setView('month')}
          className={`px-6 py-3 font-semibold rounded-lg shadow ${
            view === 'month'
              ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white'
              : 'bg-white border-2 border-yellow-600 text-yellow-600'
          }`}
        >
          Month
        </Button>
        <Button
          onClick={() => setView('week')}
          className={`px-6 py-3 font-semibold rounded-lg shadow ${
            view === 'week'
              ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white'
              : 'bg-white border-2 border-yellow-600 text-yellow-600'
          }`}
        >
          Week
        </Button>
        <Button
          onClick={() => setView('day')}
          className={`px-6 py-3 font-semibold rounded-lg shadow ${
            view === 'day'
              ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white'
              : 'bg-white border-2 border-yellow-600 text-yellow-600'
          }`}
        >
          Day
        </Button>
        <Button
          onClick={createZoomMeeting}
          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2"
        >
          <Video className="w-4 h-4" /> Create Zoom
        </Button>
        <Button
          onClick={() => { setSelectedEvent(null); setModalOpen(true); }}
          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>
      {/* Calendar grid */}
      <div className="flex-1 bg-white rounded-lg">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          style={{ height: '100%' }}
          eventPropGetter={() => ({
            style: {
              borderWidth: '3px',
              borderRadius: '6px',
              backgroundColor: '#e6b325',
              color: '#fff',
            }
          })}
        />
      </div>
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={loadEvents}
        event={selectedEvent}
        selectedDate={selectedDate}
      />
      {/* FIXED: Use standard style tag, not jsx/global */}
      <style>{`
        .rbc-time-slot {
          border-bottom: 2px solid #e6b325 !important;
        }
        .rbc-event {
          border-width: 3px !important;
          border-radius: 6px !important;
        }
        .rbc-toolbar button {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}