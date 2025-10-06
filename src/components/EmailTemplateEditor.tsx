import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Type, Image, Square, Columns, Link2, Code, 
  Plus, Trash2, MoveUp, MoveDown, Settings,
  Palette, Layout, Mail, FileText
} from 'lucide-react';

interface EmailBlock {
  id: string;
  type: string;
  content: any;
}

interface EmailTemplateEditorProps {
  content: { blocks: EmailBlock[] };
  onChange: (content: { blocks: EmailBlock[] }) => void;
}

export default function EmailTemplateEditor({ content, onChange }: EmailTemplateEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const blockTypes = [
    { type: 'header', icon: Layout, label: 'Header' },
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'button', icon: Square, label: 'Button' },
    { type: 'divider', icon: Columns, label: 'Divider' },
    { type: 'spacer', icon: Square, label: 'Spacer' },
    { type: 'social', icon: Link2, label: 'Social Links' },
    { type: 'html', icon: Code, label: 'HTML' }
  ];

  const addBlock = (type: string) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type)
    };
    onChange({ blocks: [...content.blocks, newBlock] });
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Enter your text here...' };
      case 'button':
        return { text: 'Click Here', url: '#', color: 'blue' };
      case 'image':
        return { url: '', alt: 'Image' };
      case 'header':
        return { title: 'Newsletter Title' };
      case 'divider':
        return { style: 'solid' };
      case 'spacer':
        return { height: 20 };
      case 'social':
        return { 
          facebook: '#', 
          twitter: '#', 
          instagram: '#', 
          linkedin: '#' 
        };
      case 'html':
        return { code: '<div>Custom HTML</div>' };
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, newContent: any) => {
    const updatedBlocks = content.blocks.map(block =>
      block.id === blockId ? { ...block, content: newContent } : block
    );
    onChange({ blocks: updatedBlocks });
  };

  const deleteBlock = (blockId: string) => {
    onChange({ blocks: content.blocks.filter(b => b.id !== blockId) });
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = content.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.blocks.length) return;
    
    const newBlocks = [...content.blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange({ blocks: newBlocks });
  };

  const renderBlockEditor = (block: EmailBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <Textarea
            value={block.content.text}
            onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
            placeholder="Enter text..."
            className="min-h-[100px]"
          />
        );
      case 'button':
        return (
          <div className="space-y-2">
            <Input
              value={block.content.text}
              onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
              placeholder="Button text"
            />
            <Input
              value={block.content.url}
              onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
              placeholder="Button URL"
            />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              value={block.content.url}
              onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
              placeholder="Image URL"
            />
            <Input
              value={block.content.alt}
              onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
              placeholder="Alt text"
            />
          </div>
        );
      case 'header':
        return (
          <Input
            value={block.content.title}
            onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })}
            placeholder="Header title"
          />
        );
      default:
        return null;
    }
  };

  const renderPreview = () => {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="max-w-[600px] mx-auto bg-white shadow-lg">
          {content.blocks.map(block => (
            <div key={block.id} className="border-b last:border-0">
              {block.type === 'text' && (
                <div className="p-4">
                  <p>{block.content.text}</p>
                </div>
              )}
              {block.type === 'button' && (
                <div className="p-4 text-center">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-md">
                    {block.content.text}
                  </button>
                </div>
              )}
              {block.type === 'image' && block.content.url && (
                <div className="p-4">
                  <img src={block.content.url} alt={block.content.alt} className="w-full" />
                </div>
              )}
              {block.type === 'header' && (
                <div className="p-4 bg-gray-50">
                  <h1 className="text-2xl font-bold text-center">{block.content.title}</h1>
                </div>
              )}
              {block.type === 'divider' && (
                <div className="p-4">
                  <hr className="border-gray-300" />
                </div>
              )}
              {block.type === 'spacer' && (
                <div style={{ height: `${block.content.height}px` }} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Blocks</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-2 gap-2">
              {blockTypes.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-20"
                  onClick={() => addBlock(type)}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Email Content</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
          </CardHeader>
          <CardContent>
            {previewMode ? (
              renderPreview()
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {content.blocks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Start by adding blocks from the left panel</p>
                    </div>
                  ) : (
                    content.blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className={`p-3 border rounded-lg ${
                          selectedBlock === block.id ? 'border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedBlock(block.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {block.type}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveBlock(block.id, 'up')}
                              disabled={index === 0}
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveBlock(block.id, 'down')}
                              disabled={index === content.blocks.length - 1}
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteBlock(block.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {renderBlockEditor(block)}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Newsletter Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Product Launch
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Welcome Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
