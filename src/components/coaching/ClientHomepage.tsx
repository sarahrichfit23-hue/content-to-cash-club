import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddClientDialog from './AddClientDialog';
import { Input } from '@/components/ui/input';
import { ClientInviteButton } from './ClientInviteButton';

interface Client {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  status: string;
  invitation_sent_at?: string;
}


export default function ClientHomepage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('coach_id', user.id)
      .order('name');

    if (!error && data) setClients(data);
    setLoading(false);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Client Homepage</h1>
          <p className="text-gray-600 mt-2">Manage your coaching clients</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <AddClientDialog open={showAddDialog} onClose={() => {
        setShowAddDialog(false);
        loadClients();
      }} />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div 
              className="flex items-center gap-4 cursor-pointer mb-4"
              onClick={() => navigate(`/coaching/portal/${client.id}`)}
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                {client.avatar_url ? (
                  <img src={client.avatar_url} alt={client.name} className="w-16 h-16 rounded-full" />
                ) : (
                  <User className="w-8 h-8 text-purple-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{client.name}</h3>
                <p className="text-sm text-gray-600">{client.email}</p>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1 inline-block">
                  {client.status}
                </span>
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <ClientInviteButton
                clientId={client.id}
                clientEmail={client.email}
                clientName={client.name}
                coachName="Coach"
                invitationSentAt={client.invitation_sent_at}
              />
            </div>
          </Card>

        ))}
      </div>
    </div>
  );
}
