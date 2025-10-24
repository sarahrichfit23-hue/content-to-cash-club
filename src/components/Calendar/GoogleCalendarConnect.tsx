import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalIcon, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function GoogleCalendarConnect() {
  // Always start as not connected for testing!
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // === For testing, remove checkConnection logic so the "Connect" button always shows ===
  // useEffect(() => {
  //   checkConnection();
  // }, []);

  // const checkConnection = async () => {
  //   const { data: { user } } = await supabase.auth.getUser();
  //   if (!user) return;

  //   // Check for real token in DB
  //   const { data } = await supabase
  //     .from('google_calendar_connections')
  //     .select('*')
  //     .eq('user_id', user.id)
  //     .single();

  //   setConnected(!!data?.access_token); // Only set to true if there is a real connection
  // };

  // This is the real Google OAuth flow trigger
  const handleConnect = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/Calendar/start`;
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // TODO: Implement real sync logic (call backend/Google API)
      toast.success('Calendar synced! (Simulated)');
    } catch (error) {
      toast.error('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    // TODO: Remove Google token from DB
    setConnected(false);
    toast.success('Disconnected from Google Calendar');
  };

  return (
    <Card className="p-4 mb-4 bg-white rounded-2xl shadow">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <CalIcon className="w-8 h-8 text-black" />
          <div>
            <h3 className="font-semibold text-lg text-black">Google Calendar</h3>
            <p className="text-sm text-gray-600">Sync events automatically</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <Badge variant="default" className="gap-1 bg-[#e6b325] text-white font-semibold px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </Badge>
              <Button
                onClick={handleSync}
                disabled={syncing}
                style={{
                  backgroundColor: '#e6b325',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  opacity: syncing ? 0.7 : 1,
                  borderRadius: '0.5rem',
                  minWidth: '100px'
                }}
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button
                onClick={handleDisconnect}
                style={{
                  backgroundColor: '#e6b325',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  borderRadius: '0.5rem',
                  minWidth: '100px'
                }}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="gap-1 bg-gray-200 text-gray-700 font-semibold px-3 py-1 rounded-lg">
                <XCircle className="w-3 h-3" /> Not Connected
              </Badge>
              <Button
                onClick={handleConnect}
                style={{
                  backgroundColor: '#e6b325',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  borderRadius: '0.5rem',
                  minWidth: '180px'
                }}
              >
                Connect to Google Calendar
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}