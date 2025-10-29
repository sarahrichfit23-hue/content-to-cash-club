import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, Trash, Image as ImageIcon } from 'lucide-react';

interface ContentBlock {
  type: 'text' | 'heading' | 'image' | 'link';
  content: string;
  url?: string;
}

export default function PageEditor() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
    const { data } = await supabase
      .from('portal_pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (data) {
      setPage(data);
      setTitle(data.title);
      setBlocks(data.content?.blocks || []);
    }
  };

  const savePage = async () => {
    await supabase
      .from('portal_pages')
      .update({ title, content: { blocks } })
      .eq('id', pageId);
    
    navigate(-1);
  };

  const addBlock = (type: ContentBlock['type']) => {
    setBlocks([...blocks, { type, content: '' }]);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold"
          placeholder="Page Title"
        />
        <Button onClick={savePage}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <Card className="p-6 mb-4">
        <div className="flex gap-2 mb-4">
          <Button size="sm" onClick={() => addBlock('heading')}>+ Heading</Button>
          <Button size="sm" onClick={() => addBlock('text')}>+ Text</Button>
          <Button size="sm" onClick={() => addBlock('image')}>+ Image</Button>
          <Button size="sm" onClick={() => addBlock('link')}>+ Link</Button>
        </div>

        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={index} className="border rounded p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{block.type}</span>
                <Button size="sm" variant="ghost" onClick={() => deleteBlock(index)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>

              {block.type === 'heading' && (
                <Input
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  placeholder="Heading text"
                />
              )}

              {block.type === 'text' && (
                <Textarea
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  placeholder="Paragraph text"
                  rows={4}
                />
              )}

              {block.type === 'image' && (
                <Input
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  placeholder="Image URL"
                />
              )}

              {block.type === 'link' && (
                <div className="space-y-2">
                  <Input
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="Link text"
                  />
                  <Input
                    value={block.url || ''}
                    onChange={(e) => updateBlock(index, { url: e.target.value })}
                    placeholder="URL"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
