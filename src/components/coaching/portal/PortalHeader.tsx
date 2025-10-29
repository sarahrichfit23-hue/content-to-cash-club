import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  portal: any;
  client: any;
  onUpdate: () => void;
  isClientView?: boolean;
}

export default function PortalHeader({ portal, client, onUpdate, isClientView = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [headerImage, setHeaderImage] = useState(portal?.header_image || '');
  const [title, setTitle] = useState(portal?.title || '');

  const handleSave = async () => {
    await supabase
      .from('client_portals')
      .update({ header_image: headerImage, title })
      .eq('id', portal.id);
    
    setEditing(false);
    onUpdate();
  };

  return (
    <>
      <div 
        className="relative h-64 bg-gradient-to-r from-purple-100 to-pink-100 bg-cover bg-center"
        style={headerImage ? { backgroundImage: `url(${headerImage})` } : {}}
      >
        {!isClientView && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setEditing(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Header
          </Button>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
            <p className="text-white/90">{client?.name}</p>
          </div>
        </div>
      </div>

      {!isClientView && (
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Portal Header</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Header Image URL</label>
                <Input value={headerImage} onChange={(e) => setHeaderImage(e.target.value)} />
              </div>
              <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
