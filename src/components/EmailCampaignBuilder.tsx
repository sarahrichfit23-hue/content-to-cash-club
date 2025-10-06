import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Users, Calendar, Send, Save, Eye, 
  BarChart3, Target, Clock, CheckCircle, 
  AlertCircle, Pause, Play, TestTube 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import EmailTemplateEditor from './EmailTemplateEditor';
import AudienceSegmentSelector from './AudienceSegmentSelector';
import CampaignAnalytics from './CampaignAnalytics';
import ABTestSetup from './ABTestSetup';

export default function EmailCampaignBuilder() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('compose');
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    content: { blocks: [] },
    segmentId: null,
    scheduledAt: null,
    status: 'draft'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);

  const handleSaveCampaign = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          user_id: user.id,
          name: campaign.name,
          subject: campaign.subject,
          from_name: campaign.fromName,
          from_email: campaign.fromEmail,
          content: campaign.content,
          segment_id: campaign.segmentId,
          scheduled_at: campaign.scheduledAt,
          status: campaign.status
        });

      if (error) throw error;
      
      toast({
        title: "Campaign saved",
        description: "Your email campaign has been saved successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error saving campaign",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendCampaign = async (testMode = false) => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: { 
          campaignId: 'sample-campaign-id', // Would be actual ID
          testMode 
        }
      });

      if (error) throw error;
      
      toast({
        title: testMode ? "Test sent" : "Campaign sent",
        description: data.message
      });
    } catch (error: any) {
      toast({
        title: "Error sending campaign",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const campaignStats = {
    totalRecipients: 1250,
    estimatedOpenRate: 24.5,
    estimatedClickRate: 3.8,
    sendTime: '2 minutes'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Email Campaign Builder</h2>
          <p className="text-muted-foreground">Create and send email campaigns to your audience</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSaveCampaign()}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline" onClick={() => handleSendCampaign(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Send Test
          </Button>
          <Button onClick={() => handleSendCampaign()} disabled={isSending}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Campaign'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recipients</p>
                <p className="text-2xl font-bold">{campaignStats.totalRecipients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Open Rate</p>
                <p className="text-2xl font-bold">{campaignStats.estimatedOpenRate}%</p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Click Rate</p>
                <p className="text-2xl font-bold">{campaignStats.estimatedClickRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Send Time</p>
                <p className="text-2xl font-bold">{campaignStats.sendTime}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="abtest">A/B Test</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Campaign Name</Label>
                <Input 
                  placeholder="Internal campaign name"
                  value={campaign.name}
                  onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Subject Line</Label>
                <Input 
                  placeholder="Email subject line"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({...campaign, subject: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Name</Label>
                  <Input 
                    placeholder="Your Company"
                    value={campaign.fromName}
                    onChange={(e) => setCampaign({...campaign, fromName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>From Email</Label>
                  <Input 
                    type="email"
                    placeholder="noreply@company.com"
                    value={campaign.fromEmail}
                    onChange={(e) => setCampaign({...campaign, fromEmail: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <EmailTemplateEditor 
            content={campaign.content}
            onChange={(content) => setCampaign({...campaign, content})}
          />
        </TabsContent>

        <TabsContent value="audience">
          <AudienceSegmentSelector 
            selectedSegment={campaign.segmentId}
            onSelect={(segmentId) => setCampaign({...campaign, segmentId})}
          />
        </TabsContent>

        <TabsContent value="abtest">
          <ABTestSetup 
            enabled={abTestEnabled}
            onToggle={setAbTestEnabled}
            campaign={campaign}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignAnalytics campaignId="sample-campaign-id" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
