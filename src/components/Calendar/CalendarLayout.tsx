import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { EventModal } from './EventModal';
import { Button } from '@/components/ui/button';
import { Plus, Video, Calendar as CalIcon } from 'lucide-react';
import TaskManager from '@/components/calendar/TaskManager';     // ✅ no curly braces
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'sonner';

// Layout: Calendar left, Tasks right
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function GoogleCalendarButton({ connected, onConnect, onDisconnect, onSync }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-yellow-200 shadow p-3 mb-4">
      <CalIcon className="w-6 h-6 text-yellow-600" />
      <span className="font-semibold text-black">Google Calendar</span>
      {connected ? (
        <>
          <span className="bg-yellow-500 text-white px-3 py-1 rounded-lg font-semibold">Connected</span>
          <Button
            onClick={onSync}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold rounded-lg px-4 py-2"
          >
            Sync Now
          </Button>
          <Button
            onClick={onDisconnect}
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold rounded-lg px-4 py-2"
          >
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          onClick={onConnect}
          className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold rounded-lg px-4 py-2"
        >
          Connect
        </Button>
      )}
    </div>
  );
}

export default function CalendarLayout() {
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
  const [googleConnected, setGoogleConnected] = useState(false);

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

  const handleGoogleConnect = async () => {
    toast.info('Google OAuth should be implemented here. This just simulates connection.');
    setGoogleConnected(true);
  };
  const handleGoogleDisconnect = async () => {
    setGoogleConnected(false);
    toast.success('Disconnected from Google Calendar');
  };
  const handleGoogleSync = async () => {
    toast.success('Calendar synced! (Simulated)');
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
    <div className="bg-[#ede8e3] min-h-screen p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Calendar + Google/Zoom controls */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-4">Coach Calendar & Task Manager</h1>
            <div className="mb-3">
              <GoogleCalendarButton
                connected={googleConnected}
                onConnect={handleGoogleConnect}
                onDisconnect={handleGoogleDisconnect}
                onSync={handleGoogleSync}
              />
            </div>
            <div className="text-lg font-bold mb-4 text-black">
              {format(now, "EEEE, MMMM d, yyyy • h:mm:ss a")}
            </div>
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
                style={{ height: '420px' }}
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
            {/* Custom calendar slot styling */}
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
        </div>
        {/* Right: Tasks */}
        <div className="w-full lg:w-[350px]">
          <TaskManager />
        </div>
      </div>
    </div>
  );
}