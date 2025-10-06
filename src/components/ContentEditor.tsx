import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { X, History } from 'lucide-react';

interface ContentEditorProps {
  content: any | null;
  folders: any[];
  tags: any[];
  onClose: () => void;
  onSave: () => void;
}

export default function ContentEditor({
  content,
  folders,
  tags,
  onClose,
  onSave
}: ContentEditorProps) {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [type, setType] = useState('document');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setContentText(content.content);
      setType(content.type);
      setFolderId(content.folder_id);
      setSelectedTags(content.content_tags?.map((ct: any) => ct.tag.id) || []);
      loadVersions();
    }
  }, [content]);

  const loadVersions = async () => {
    if (!content) return;
    
    const { data } = await supabase
      .from('content_versions')
      .select('*')
      .eq('content_id', content.id)
      .order('version_number', { ascending: false });
    
    setVersions(data || []);
  };

  const saveContent = async () => {
    if (!title || !contentText) {
      toast({
        title: 'Error',
        description: 'Title and content are required',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    try {
      if (content) {
        // Update existing content
        const { error } = await supabase
          .from('content')
          .update({
            title,
            content: contentText,
            type,
            folder_id: folderId,
            updated_at: new Date().toISOString()
          })
          .eq('id', content.id);

        if (error) throw error;

        // Create version history
        const { data: versionData } = await supabase
          .from('content_versions')
          .select('version_number')
          .eq('content_id', content.id)
          .order('version_number', { ascending: false })
          .limit(1);

        const nextVersion = (versionData?.[0]?.version_number || 0) + 1;

        await supabase
          .from('content_versions')
          .insert({
            content_id: content.id,
            version_number: nextVersion,
            title,
            content: contentText,
            metadata: { type, folder_id: folderId },
            created_by: user?.id
          });

        // Update tags
        await supabase
          .from('content_tags')
          .delete()
          .eq('content_id', content.id);

        if (selectedTags.length > 0) {
          await supabase
            .from('content_tags')
            .insert(
              selectedTags.map(tagId => ({
                content_id: content.id,
                tag_id: tagId
              }))
            );
        }

        toast({ title: 'Content updated successfully' });
      } else {
        // Create new content
        const { data: newContent, error } = await supabase
          .from('content')
          .insert({
            user_id: user?.id,
            title,
            content: contentText,
            type,
            folder_id: folderId
          })
          .select()
          .single();

        if (error) throw error;

        // Add initial version
        await supabase
          .from('content_versions')
          .insert({
            content_id: newContent.id,
            version_number: 1,
            title,
            content: contentText,
            metadata: { type, folder_id: folderId },
            created_by: user?.id
          });

        // Add tags
        if (selectedTags.length > 0) {
          await supabase
            .from('content_tags')
            .insert(
              selectedTags.map(tagId => ({
                content_id: newContent.id,
                tag_id: tagId
              }))
            );
        }

        toast({ title: 'Content created successfully' });
      }

      onSave();
    } catch (error: any) {
      toast({
        title: 'Error saving content',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const restoreVersion = (version: any) => {
    setTitle(version.title);
    setContentText(version.content);
    setShowVersions(false);
    toast({ title: 'Version restored' });
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {content ? 'Edit Content' : 'Create New Content'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter content title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="folder">Folder</Label>
                <Select value={folderId || ''} onValueChange={setFolderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No folder</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined
                    }}
                    onClick={() => {
                      if (selectedTags.includes(tag.id)) {
                        setSelectedTags(selectedTags.filter(id => id !== tag.id));
                      } else {
                        setSelectedTags([...selectedTags, tag.id]);
                      }
                    }}
                  >
                    {tag.name}
                    {selectedTags.includes(tag.id) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">Content</Label>
                {content && versions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVersions(true)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Version History ({versions.length})
                  </Button>
                )}
              </div>
              <Textarea
                id="content"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Enter your content here..."
                className="min-h-[300px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveContent} disabled={saving}>
              {saving ? 'Saving...' : content ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showVersions && (
        <Dialog open onOpenChange={() => setShowVersions(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Version History</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {versions.map(version => (
                <div
                  key={version.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">Version {version.version_number}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreVersion(version)}
                    >
                      Restore
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {version.content}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
