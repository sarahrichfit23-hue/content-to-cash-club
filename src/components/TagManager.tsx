import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Tag, Plus, Edit2, Trash2, X } from 'lucide-react';

interface TagManagerProps {
  tags: any[];
  selectedTags: string[];
  onSelectTags: (tagIds: string[]) => void;
  onUpdate: () => void;
}

export default function TagManager({
  tags,
  selectedTags,
  onSelectTags,
  onUpdate
}: TagManagerProps) {
  const { user } = useAppContext();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#8B5CF6');

  const saveTag = async () => {
    if (!tagName) {
      toast({
        title: 'Error',
        description: 'Tag name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingTag) {
        await supabase
          .from('tags')
          .update({ name: tagName, color: tagColor })
          .eq('id', editingTag.id);
        toast({ title: 'Tag updated' });
      } else {
        await supabase
          .from('tags')
          .insert({
            user_id: user?.id,
            name: tagName,
            color: tagColor
          });
        toast({ title: 'Tag created' });
      }

      setShowDialog(false);
      setEditingTag(null);
      setTagName('');
      setTagColor('#8B5CF6');
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error saving tag',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteTag = async (tag: any) => {
    if (confirm(`Delete tag "${tag.name}"?`)) {
      try {
        await supabase
          .from('tags')
          .delete()
          .eq('id', tag.id);
        
        if (selectedTags.includes(tag.id)) {
          onSelectTags(selectedTags.filter(id => id !== tag.id));
        }
        
        toast({ title: 'Tag deleted' });
        onUpdate();
      } catch (error: any) {
        toast({
          title: 'Error deleting tag',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onSelectTags(selectedTags.filter(id => id !== tagId));
    } else {
      onSelectTags([...selectedTags, tagId]);
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Tags</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowDialog(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mb-2"
            onClick={() => onSelectTags([])}
          >
            Clear filters
          </Button>
        )}

        <div className="space-y-2">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="group flex items-center justify-between"
            >
              <Badge
                variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                className="cursor-pointer flex-1 justify-between"
                style={{
                  backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                  borderColor: tag.color
                }}
                onClick={() => toggleTag(tag.id)}
              >
                <span>{tag.name}</span>
                {selectedTags.includes(tag.id) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
              <div className="hidden group-hover:flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setEditingTag(tag);
                    setTagName(tag.name);
                    setTagColor(tag.color);
                    setShowDialog(true);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => deleteTag(tag)}
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
              {editingTag ? 'Edit Tag' : 'Create Tag'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Enter tag name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-500">{tagColor}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setEditingTag(null);
                setTagName('');
                setTagColor('#8B5CF6');
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveTag}>
              {editingTag ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
