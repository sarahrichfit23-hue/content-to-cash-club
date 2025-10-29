import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortalHeader from './portal/PortalHeader';
import PortalOverview from './portal/PortalOverview';
import MessageCenter from './portal/MessageCenter';
import CoachingSessions from './portal/CoachingSessions';
import TaskManager from './portal/TaskManager';
import { FileManager } from './portal/FileManager';

interface ClientPortalViewProps {
  isClientView?: boolean;
}

export default function ClientPortalView({ isClientView = false }: ClientPortalViewProps) {
  const { clientId: routeClientId } = useParams();
  const [portal, setPortal] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    loadClientId();
  }, [routeClientId, isClientView]);

  const loadClientId = async () => {
    if (isClientView) {
      // Client is logged in, find their client record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (clientData) {
        setClientId(clientData.id);
        loadPortalData(clientData.id);
      }
    } else {
      // Coach is viewing a specific client
      setClientId(routeClientId || null);
      if (routeClientId) loadPortalData(routeClientId);
    }
  };

  const loadPortalData = async (id: string) => {
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientData) setClient(clientData);

    let { data: portalData } = await supabase
      .from('client_portals')
      .select('*')
      .eq('client_id', id)
      .single();

    if (!portalData) {
      const { data: newPortal } = await supabase
        .from('client_portals')
        .insert({
          client_id: id,
          coach_id: clientData?.coach_id,
          title: `${clientData?.name}'s Coaching Portal`,
          header_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200'
        })
        .select()
        .single();
      portalData = newPortal;
      
      // Create default sections for new portal
      if (newPortal) {
        await createDefaultSections(newPortal.id);
      }
    }

    setPortal(portalData);
    setLoading(false);
  };

  const createDefaultSections = async (portalId: string) => {
    const defaultSections = [
      { name: 'Onboarding', emoji: '🚀', order_index: 0 },
      { name: 'Program', emoji: '📚', order_index: 1 },
      { name: 'Offboarding', emoji: '🎓', order_index: 2 }
    ];

    for (const section of defaultSections) {
      const { data: sectionData } = await supabase
        .from('portal_sections')
        .insert({
          portal_id: portalId,
          name: section.name,
          emoji: section.emoji,
          order_index: section.order_index
        })
        .select()
        .single();

      // Add default pages for each section
      if (sectionData) {
        await createDefaultPages(sectionData.id, section.name);
      }
    }
  };

  const createDefaultPages = async (sectionId: string, sectionName: string) => {
    const pageTemplates: Record<string, any[]> = {
      'Onboarding': [
        { name: 'Start Here', icon: '🎯' },
        { name: 'Welcome Video', icon: '🎥' },
        { name: 'Getting Started Guide', icon: '📖' }
      ],
      'Program': [
        { name: 'Module 1', icon: '1️⃣' },
        { name: 'Module 2', icon: '2️⃣' },
        { name: 'Module 3', icon: '3️⃣' },
        { name: 'Resources', icon: '📚' }
      ],
      'Offboarding': [
        { name: 'Final Assessment', icon: '✅' },
        { name: 'Next Steps', icon: '🚀' },
        { name: 'Stay Connected', icon: '🤝' }
      ]
    };

    const pages = pageTemplates[sectionName] || [];
    
    for (let i = 0; i < pages.length; i++) {
      await supabase
        .from('portal_pages')
        .insert({
          section_id: sectionId,
          name: pages[i].name,
          icon: pages[i].icon,
          order_index: i
        });
    }
  };


  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader 
        portal={portal} 
        client={client} 
        onUpdate={() => clientId && loadPortalData(clientId)} 
        isClientView={isClientView}
      />

      
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>


          <TabsContent value="overview">
            <PortalOverview portalId={portal?.id} isClientView={isClientView} />
          </TabsContent>


          <TabsContent value="messages">
            <MessageCenter portalId={portal?.id} />
          </TabsContent>

          <TabsContent value="sessions">
            <CoachingSessions portalId={portal?.id} />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager portalId={portal?.id} />
          </TabsContent>

          <TabsContent value="files">
            <FileManager clientId={clientId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
