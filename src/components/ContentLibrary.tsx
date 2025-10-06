import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import {
  Search, Folder, Tag, Star, Download, Edit, Trash2,
  Plus, Filter, Clock, FileText, Mail, Share2, Grid, List
} from 'lucide-react';
import ContentEditor from './ContentEditor';
import FolderManager from './FolderManager';
import TagManager from './TagManager';
import ExportDialog from './ExportDialog';

interface Content {
  id: string;
  title: string;
  content: string;
  type: string;
  folder_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  content_tags: Array<{ tag: { id: string; name: string; color: string } }>;
}

export default function ContentLibrary() {
  const { user } = useAppContext();
  const [contents, setContents] = useState<Content[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadContent();
      loadFolders();
      loadTags();
    }
  }, [user, selectedFolder, selectedTags]);

  const loadContent = async () => {
    try {
      let query = supabase
        .from('content')
        .select(`
          *,
          content_tags (
            tag:tags (*)
          )
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (selectedFolder) {
        query = query.eq('folder_id', selectedFolder);
      }

      if (selectedTags.length > 0) {
        const { data: taggedContent } = await supabase
          .from('content_tags')
          .select('content_id')
          .in('tag_id', selectedTags);
        
        const contentIds = taggedContent?.map(ct => ct.content_id) || [];
        if (contentIds.length > 0) {
          query = query.in('id', contentIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setContents(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading content',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    const { data } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user?.id)
      .order('name');
    setFolders(data || []);
  };

  const loadTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user?.id)
      .order('name');
    setTags(data || []);
  };

  const toggleFavorite = async (content: Content) => {
    const { error } = await supabase
      .from('content')
      .update({ is_favorite: !content.is_favorite })
      .eq('id', content.id);

    if (!error) {
      loadContent();
      toast({
        title: content.is_favorite ? 'Removed from favorites' : 'Added to favorites'
      });
    }
  };

  const deleteContent = async (id: string) => {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (!error) {
      loadContent();
      toast({ title: 'Content deleted' });
    }
  };

  const downloadContent = (content: Content) => {
    // Create a formatted text version of the content
    const textContent = `${content.title}\n${'='.repeat(content.title.length)}\n\nType: ${content.type}\nCreated: ${new Date(content.created_at).toLocaleDateString()}\n\n${content.content}`;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({ title: 'Content downloaded' });
  };


  const filteredContents = contents.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'blog': return <FileText className="w-4 h-4" />;
      case 'social': return <Share2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 p-4">
        <Button
          onClick={() => setShowEditor(true)}
          className="w-full mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Content
        </Button>

        <FolderManager
          folders={folders}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onUpdate={loadFolders}
        />

        <TagManager
          tags={tags}
          selectedTags={selectedTags}
          onSelectTags={setSelectedTags}
          onUpdate={loadTags}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={() => setShowExport(true)}
              disabled={selectedItems.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export ({selectedItems.length})
            </Button>
          </div>
        </div>

        {/* Content Grid/List */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No content found. Create your first piece of content!
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredContents.map((content) => (
                <Card
                  key={content.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedContent(content)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(content.type)}
                      <Badge variant="secondary">{content.type}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(content);
                      }}
                    >
                      <Star className={`w-4 h-4 ${content.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-1">{content.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">{content.content}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {content.content_tags?.map(ct => (
                      <Badge
                        key={ct.tag.id}
                        style={{ backgroundColor: ct.tag.color }}
                        className="text-xs"
                      >
                        {ct.tag.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(content.updated_at).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContent(content);
                          setShowEditor(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteContent(content.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContents.map((content) => (
                <Card
                  key={content.id}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(content.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, content.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== content.id));
                          }
                        }}
                      />
                      {getTypeIcon(content.type)}
                      <div className="flex-1">
                        <h3 className="font-semibold">{content.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{content.content}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {content.content_tags?.map(ct => (
                          <Badge
                            key={ct.tag.id}
                            style={{ backgroundColor: ct.tag.color }}
                            className="text-xs"
                          >
                            {ct.tag.name}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(content.updated_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(content)}
                        >
                          <Star className={`w-4 h-4 ${content.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedContent(content);
                            setShowEditor(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteContent(content.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Dialogs */}
      {showEditor && (
        <ContentEditor
          content={selectedContent}
          folders={folders}
          tags={tags}
          onClose={() => {
            setShowEditor(false);
            setSelectedContent(null);
          }}
          onSave={() => {
            loadContent();
            setShowEditor(false);
            setSelectedContent(null);
          }}
        />
      )}

      {showExport && (
        <ExportDialog
          contentIds={selectedItems}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
