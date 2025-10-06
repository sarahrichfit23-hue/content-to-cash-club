import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Folder, Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';

interface FolderManagerProps {
  folders: any[];
  selectedFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onUpdate: () => void;
}

export default function FolderManager({
  folders,
  selectedFolder,
  onSelectFolder,
  onUpdate
}: FolderManagerProps) {
  const { user } = useAppContext();
  const [showDialog, setShowDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#3B82F6');

  const saveFolder = async () => {
    if (!folderName) {
      toast({
        title: 'Error',
        description: 'Folder name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingFolder) {
        await supabase
          .from('folders')
          .update({ name: folderName, color: folderColor })
          .eq('id', editingFolder.id);
        toast({ title: 'Folder updated' });
      } else {
        await supabase
          .from('folders')
          .insert({
            user_id: user?.id,
            name: folderName,
            color: folderColor
          });
        toast({ title: 'Folder created' });
      }

      setShowDialog(false);
      setEditingFolder(null);
      setFolderName('');
      setFolderColor('#3B82F6');
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error saving folder',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteFolder = async (folder: any) => {
    if (confirm(`Delete folder "${folder.name}"? Content will be moved to uncategorized.`)) {
      try {
        await supabase
          .from('folders')
          .delete()
          .eq('id', folder.id);
        
        if (selectedFolder === folder.id) {
          onSelectFolder(null);
        }
        
        toast({ title: 'Folder deleted' });
        onUpdate();
      } catch (error: any) {
        toast({
          title: 'Error deleting folder',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Folders</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowDialog(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <Button
            variant={selectedFolder === null ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onSelectFolder(null)}
          >
            <Folder className="w-4 h-4 mr-2" />
            All Content
          </Button>

          {folders.map(folder => (
            <div
              key={folder.id}
              className="group flex items-center"
            >
              <Button
                variant={selectedFolder === folder.id ? 'secondary' : 'ghost'}
                className="flex-1 justify-start"
                onClick={() => onSelectFolder(folder.id)}
              >
                <Folder
                  className="w-4 h-4 mr-2"
                  style={{ color: folder.color }}
                />
                {folder.name}
              </Button>
              <div className="hidden group-hover:flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setEditingFolder(folder);
                    setFolderName(folder.name);
                    setFolderColor(folder.color);
                    setShowDialog(true);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => deleteFolder(folder)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFolder ? 'Edit Folder' : 'Create Folder'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={folderColor}
                  onChange={(e) => setFolderColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-500">{folderColor}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setEditingFolder(null);
                setFolderName('');
                setFolderColor('#3B82F6');
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveFolder}>
              {editingFolder ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
