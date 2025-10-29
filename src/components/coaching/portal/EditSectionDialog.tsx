import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Plus, Trash } from 'lucide-react';

interface Props {
  section: any;
  portalId: string;
  onClose: () => void;
}

export default function EditSectionDialog({ section, portalId, onClose }: Props) {
  const [title, setTitle] = useState(section?.title || '');
  const [imageUrl, setImageUrl] = useState(section?.image_url || '');
  const [pages, setPages] = useState<any[]>([]);
  const [newPageTitle, setNewPageTitle] = useState('');

  useEffect(() => {
    if (section?.id) loadPages();
  }, [section]);

  const loadPages = async () => {
    const { data } = await supabase
      .from('portal_pages')
      .select('*')
      .eq('section_id', section.id)
      .order('order_index');
    if (data) setPages(data);
  };

  const handleSave = async () => {
    if (section?.id) {
      await supabase
        .from('portal_sections')
        .update({ title, image_url: imageUrl })
        .eq('id', section.id);
    } else {
      await supabase
        .from('portal_sections')
        .insert({ title, image_url: imageUrl, portal_id: portalId, section_type: 'custom' });
    }
    onClose();
  };

  const addPage = async () => {
    if (!newPageTitle || !section?.id) return;
    await supabase
      .from('portal_pages')
      .insert({ title: newPageTitle, section_id: section.id, content: {} });
    setNewPageTitle('');
    loadPages();
  };

  const deletePage = async (id: string) => {
    await supabase.from('portal_pages').delete().eq('id', id);
    loadPages();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{section ? 'Edit Section' : 'Add Section'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>

          {section?.id && (
            <div>
              <Label>Pages</Label>
              <div className="space-y-2 mt-2">
                {pages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{page.title}</span>
                    <Button size="sm" variant="ghost" onClick={() => deletePage(page.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="New page title"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                  />
                  <Button onClick={addPage}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleSave} className="w-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
