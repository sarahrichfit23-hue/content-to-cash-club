import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Sparkles } from 'lucide-react';
import SectionCard from './SectionCard';
import EditSectionDialog from './EditSectionDialog';

interface Section {
  id: string;
  title: string;
  section_type: string;
  image_url: string;
  order_index: number;
}

export default function PortalOverview({ portalId, isClientView = false }: { portalId: string; isClientView?: boolean }) {

  const [sections, setSections] = useState<Section[]>([]);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadSections();
  }, [portalId]);

  const loadSections = async () => {
    const { data } = await supabase
      .from('portal_sections')
      .select('*')
      .eq('portal_id', portalId)
      .order('order_index');

    if (data && data.length === 0) {
      await createDefaultSections();
    } else if (data) {
      setSections(data);
    }
  };

  const createDefaultSections = async () => {
    const defaultSections = [
      { title: 'ONBOARDING', section_type: 'onboarding', order_index: 0, image_url: 'https://d64gsuwffb70l.cloudfront.net/681e3256325a7878a02dbce9_1761633821340_e7c5d20a.png' },
      { title: 'PROGRAM', section_type: 'program', order_index: 1, image_url: 'https://d64gsuwffb70l.cloudfront.net/681e3256325a7878a02dbce9_1761633854495_4c90b87d.png' },
      { title: 'OFFBOARDING', section_type: 'offboarding', order_index: 2, image_url: 'https://d64gsuwffb70l.cloudfront.net/681e3256325a7878a02dbce9_1761633890073_e51b2c3c.png' }
    ];

    for (const section of defaultSections) {
      await supabase.from('portal_sections').insert({ ...section, portal_id: portalId });
    }
    
    loadSections();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-purple-50">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h3 className="font-semibold text-lg mb-2">Welcome Message</h3>
            <p className="text-gray-700">
              This is the portal for all documents and resources for your coaching journey!
            </p>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Portal Overview</h2>
          {!isClientView && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onEdit={() => setEditingSection(section)}
              isClientView={isClientView}
            />
          ))}
        </div>
      </div>

      {!isClientView && (editingSection || showAddDialog) && (
        <EditSectionDialog
          section={editingSection}
          portalId={portalId}
          onClose={() => {
            setEditingSection(null);
            setShowAddDialog(false);
            loadSections();
          }}
        />
      )}
    </div>
  );
}

