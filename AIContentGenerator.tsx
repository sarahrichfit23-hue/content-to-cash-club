import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { Sparkles, Mail, Share2, BookOpen, Copy, Save, Loader2, Trash2 } from 'lucide-react';

const templates = {
  email: {
    welcome: 'Welcome email for new subscribers',
    nurture: 'Nurture sequence email',
    sales: 'Sales email with CTA',
    followup: 'Follow-up email after consultation'
  },
  social: {
    motivational: 'Motivational post with call to action',
    educational: 'Educational content with tips',
    story: 'Personal story or case study',
    engagement: 'Question to boost engagement'
  },
  course: {
    intro: 'Course module introduction',
    lesson: 'Lesson content with key points',
    exercise: 'Practical exercise or worksheet',
    summary: 'Module summary and takeaways'
  }
};

export function AIContentGenerator() {
  const { toast } = useToast();
  const { user, brandDNA } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('social');
  const [template, setTemplate] = useState('');
  const [tone, setTone] = useState('friendly');
  const [style, setStyle] = useState('professional');
  const [length, setLength] = useState('medium');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string[]>([]);

  const handleGenerate = async (e?: React.MouseEvent) => {
    e?.preventDefault?.();
    
    if (!template && !customPrompt) {
      toast({
        title: 'Missing Information',
        description: 'Please select a template or provide custom instructions',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      console.log('[AI] Starting generation...');

      const count = contentType === 'social' ? 5 : 1;

      const payload = {
        action: 'suggest-content',
        data: {
          niche: brandDNA?.niche ?? 'business coach',
          goal: 'engagement and lead generation',
          recentPosts: [],
          template: template ? `${contentType} - ${template}` : undefined,
          tone,
          style,
          length,
          instructions: customPrompt || undefined,
          count
        }
      };

      console.log('[AI] Request payload:', payload);

      const { data, error } = await supabase.functions.invoke('content-ai-operations', { 
        body: payload 
      });

      console.log('[AI] Response:', { data, error });

      if (error) {
        console.error('[AI] Supabase error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }

      const content = data?.suggestions || (Array.isArray(data?.content) ? data.content : [data?.content]);
      const filtered = content.filter((c: any) => c && String(c).trim());

      if (filtered.length === 0) {
        throw new Error('No content returned from AI');
      }

      setGeneratedContent(filtered);
      toast({
        title: 'Content Generated!',
        description: `${filtered.length} piece${filtered.length > 1 ? 's' : ''} of content ready`
      });
    } catch (err: any) {
      console.error('[AI] Generation error:', err);
      
      toast({
        title: 'Generation Failed',
        description: err.message || 'Failed to generate content. Please try again.',
        variant: 'destructive'
      });
      
      setGeneratedContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (generatedContent.length === 0) return;

    try {
      const inserts = generatedContent.map((content, idx) => ({
        user_id: user?.id,
        title: `AI ${contentType} #${idx + 1} - ${new Date().toLocaleDateString()}`,
        content,
        type: contentType,
        metadata: { template, tone, style, length }
      }));

      const { error } = await supabase.from('content').insert(inserts);
      if (error) throw error;

      toast({
        title: 'All Content Saved',
        description: `${generatedContent.length} pieces saved to My Library`
      });
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSaveOne = async (content: string, idx: number) => {
    try {
      const { error } = await supabase.from('content').insert({
        user_id: user?.id,
        title: `AI ${contentType} #${idx + 1} - ${new Date().toLocaleDateString()}`,
        content,
        type: contentType,
        metadata: { template, tone, style, length }
      });

      if (error) throw error;

      toast({
        title: 'Content Saved',
        description: 'Saved to My Library'
      });
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied!', description: 'Content copied to clipboard' });
  };

  const handleDelete = (idx: number) => {
    setGeneratedContent(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Generate personalized content using AI based on your brand DNA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={contentType} onValueChange={setContentType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email"><Mail className="h-4 w-4 mr-2" />Emails</TabsTrigger>
              <TabsTrigger value="social"><Share2 className="h-4 w-4 mr-2" />Social Posts</TabsTrigger>
              <TabsTrigger value="course"><BookOpen className="h-4 w-4 mr-2" />Course Content</TabsTrigger>
            </TabsList>

            <TabsContent value={contentType} className="space-y-4">
              <div>
                <Label>Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger><SelectValue placeholder="Choose a template..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(templates[contentType as keyof typeof templates]).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="empathetic">Empathetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Length</Label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Custom Instructions (Optional)</Label>
                <Textarea
                  placeholder="Add any specific instructions or context..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                type="button"
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Generate {contentType === 'social' ? '5 Posts' : 'Content'}</>
                )}
              </Button>
            </TabsContent>
          </Tabs>

          {generatedContent.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Content ({generatedContent.length})</h3>
                <Button size="sm" onClick={handleSaveAll}>
                  <Save className="mr-2 h-4 w-4" />Save All to Library
                </Button>
              </div>

              {generatedContent.map((content, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Post #{idx + 1}</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleCopy(content)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSaveOne(content, idx)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                      {content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
