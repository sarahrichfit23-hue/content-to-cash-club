import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PackUploader } from '@/components/admin/PackUploader';
import { PackPreview } from '@/components/admin/PackPreview';
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, Trash2, Eye, History } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { normalizePack } from '@/lib/normalizePack';

interface ContentPack {
  id: string;
  month: string;
  theme: string;
  file_url: string;
  pack_data: any;
  version: number;
  is_published: boolean;
  created_at: string;
  published_at?: string;
}

export default function AdminPanel() {
  const { user } = useAppContext();
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [packData, setPackData] = useState<any>(null);
  const [month, setMonth] = useState('');
  const [theme, setTheme] = useState('');
  const [editingPack, setEditingPack] = useState<ContentPack | null>(null);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    const { data, error } = await supabase
      .from('content_packs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPacks(data);
    }
    setLoading(false);
  };

  const handleFileSelect = (file: File, data: any) => {
    setSelectedFile(file);
    const normalized = normalizePack(data);
    setPackData(normalized);
    setMonth(normalized.month || '');
    setTheme(normalized.theme || '');
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('content-packs')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('content-packs')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!packData || !month || !theme) {
      toast.error('Please fill all fields');
      return;
    }

    setUploading(true);
    try {
      let fileUrl = editingPack?.file_url || '';
      
      if (selectedFile) {
        fileUrl = await uploadToStorage(selectedFile);
      }

      const packToSave = {
        month,
        theme,
        file_url: fileUrl,
        pack_data: packData,
        version: editingPack ? editingPack.version + 1 : 1,
        created_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (editingPack) {
        const { error } = await supabase
          .from('content_packs')
          .update(packToSave)
          .eq('id', editingPack.id);

        if (error) throw error;
        toast.success('Pack updated successfully');
      } else {
        const { error } = await supabase
          .from('content_packs')
          .insert([packToSave]);

        if (error) throw error;
        toast.success('Pack created successfully');
      }

      resetForm();
      fetchPacks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save pack');
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = async (pack: ContentPack) => {
    const { error } = await supabase
      .from('content_packs')
      .update({
        is_published: !pack.is_published,
        published_at: !pack.is_published ? new Date().toISOString() : null,
      })
      .eq('id', pack.id);

    if (error) {
      toast.error('Failed to update pack');
    } else {
      toast.success(pack.is_published ? 'Pack unpublished' : 'Pack published');
      fetchPacks();
    }
  };

  const deletePack = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pack?')) return;

    const { error } = await supabase
      .from('content_packs')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete pack');
    } else {
      toast.success('Pack deleted');
      fetchPacks();
    }
  };

  const editPack = (pack: ContentPack) => {
    setEditingPack(pack);
    setPackData(pack.pack_data);
    setMonth(pack.month);
    setTheme(pack.theme);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPackData(null);
    setMonth('');
    setTheme('');
    setEditingPack(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Admin Panel - Content Packs</h1>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <PackUploader onFileSelect={handleFileSelect} />
          
          <Card className="p-6">
            <h3 className="font-semibold mb-4">
              {editingPack ? 'Edit Pack Metadata' : 'Pack Metadata'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="e.g., January 2025"
                />
              </div>
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Input
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., New Year, Fresh Starts"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={uploading || !packData}
                  className="flex-1"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingPack ? 'Update' : 'Save'} Pack
                </Button>
                {editingPack && (
                  <Button onClick={resetForm} variant="outline">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div>
          {packData && <PackPreview data={packData} />}
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History
        </h3>
        <div className="space-y-4">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{pack.month}</h4>
                  <Badge variant="outline">v{pack.version}</Badge>
                  {pack.is_published && (
                    <Badge variant="default">Published</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{pack.theme}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Created: {new Date(pack.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={pack.is_published}
                  onCheckedChange={() => togglePublish(pack)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => editPack(pack)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePack(pack.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {packs.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No content packs yet. Upload one to get started!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
