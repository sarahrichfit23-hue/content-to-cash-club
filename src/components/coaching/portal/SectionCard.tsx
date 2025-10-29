import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Plus, FileText, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Props {
  section: any;
  onEdit: () => void;
  isClientView?: boolean;
}

export default function SectionCard({ section, onEdit, isClientView = false }: Props) {

  const [pages, setPages] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPages();
  }, [section.id]);

  const loadPages = async () => {
    const { data } = await supabase
      .from('portal_pages')
      .select('*')
      .eq('section_id', section.id)
      .order('order_index');
    
    if (data) setPages(data);
  };

  return (
    <div className="space-y-3">
      <div 
        className="h-32 bg-cover bg-center rounded-lg relative group"
        style={{ backgroundImage: `url(${section.image_url})` }}
      >
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
          <h3 className="text-white text-xl font-semibold italic">{section.title}</h3>
        </div>
        {!isClientView && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onEdit}
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}

      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {section.title}
          </h4>
        </div>

        <div className="space-y-2">
          {pages.map((page) => (
            <button
              key={page.id}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2 text-sm"
              onClick={() => navigate(`/coaching/page/${page.id}`)}
            >
              <LinkIcon className="w-3 h-3" />
              {page.title}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
