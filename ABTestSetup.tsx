import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, Users, Clock, TrendingUp, 
  Mail, MousePointer, DollarSign, Award
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ABTestSetupProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  campaign: any;
}

export default function ABTestSetup({ enabled, onToggle, campaign }: ABTestSetupProps) {
  const { toast } = useToast();
  const [testType, setTestType] = useState('subject');
  const [testPercentage, setTestPercentage] = useState([20]);
  const [winningMetric, setWinningMetric] = useState('open_rate');
  const [testDuration, setTestDuration] = useState('4');
  const [variantA, setVariantA] = useState({
    subject: campaign.subject || '',
    fromName: campaign.fromName || '',
    content: campaign.content || {}
  });
  const [variantB, setVariantB] = useState({
    subject: '',
    fromName: '',
    content: {}
  });

  const handleStartTest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create A/B test record
      const { data: abTest, error } = await supabase
        .from('campaign_ab_tests')
        .insert({
          campaign_id: 'sample-campaign-id', // Would be actual campaign ID
          test_type: testType,
          variant_a: variantA,
          variant_b: variantB,
          test_percentage: testPercentage[0],
          winning_metric: winningMetric,
          test_duration_hours: parseInt(testDuration)
        })
        .select()
        .single();

      if (error) throw error;

      // Start the test
      const { data, error: fnError } = await supabase.functions.invoke('campaign-ab-test', {
        body: { 
          campaignId: 'sample-campaign-id',
          action: 'start'
        }
      });

      if (fnError) throw fnError;

      toast({
        title: "A/B test started",
        description: data.message
      });
    } catch (error: any) {
      toast({
        title: "Error starting A/B test",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>A/B Testing</CardTitle>
            <Switch checked={enabled} onCheckedChange={onToggle} />
          </div>
        </CardHeader>
        <CardContent>
          {!enabled ? (
            <div className="text-center py-8">
              <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">A/B Testing Disabled</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enable A/B testing to optimize your campaign performance
              </p>
              <Button onClick={() => onToggle(true)}>
                Enable A/B Testing
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <Label>Test Type</Label>
                <RadioGroup value={testType} onValueChange={setTestType} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subject" id="subject" />
                    <Label htmlFor="subject">Subject Line</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="content" id="content" />
                    <Label htmlFor="content">Email Content</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="from_name" id="from_name" />
                    <Label htmlFor="from_name">From Name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="send_time" id="send_time" />
                    <Label htmlFor="send_time">Send Time</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Variant A (Control)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testType === 'subject' && (
                      <div>
                        <Label>Subject Line</Label>
                        <Input 
                          value={variantA.subject}
                          onChange={(e) => setVariantA({...variantA, subject: e.target.value})}
                          placeholder="Enter subject line for variant A"
                        />
                      </div>
                    )}
                    {testType === 'from_name' && (
                      <div>
                        <Label>From Name</Label>
                        <Input 
                          value={variantA.fromName}
                          onChange={(e) => setVariantA({...variantA, fromName: e.target.value})}
                          placeholder="Enter from name for variant A"
                        />
                      </div>
                    )}
                    {testType === 'content' && (
                      <div>
                        <Label>Content Preview</Label>
                        <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                          <p className="text-sm text-muted-foreground">
                            Use the template editor to create variant A content
                          </p>
                        </div>
                      </div>
                    )}
                    {testType === 'send_time' && (
                      <div>
                        <Label>Send Time</Label>
                        <Input type="time" defaultValue="09:00" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Variant B (Test)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testType === 'subject' && (
                      <div>
                        <Label>Subject Line</Label>
                        <Input 
                          value={variantB.subject}
                          onChange={(e) => setVariantB({...variantB, subject: e.target.value})}
                          placeholder="Enter subject line for variant B"
                        />
                      </div>
                    )}
                    {testType === 'from_name' && (
                      <div>
                        <Label>From Name</Label>
                        <Input 
                          value={variantB.fromName}
                          onChange={(e) => setVariantB({...variantB, fromName: e.target.value})}
                          placeholder="Enter from name for variant B"
                        />
                      </div>
                    )}
                    {testType === 'content' && (
                      <div>
                        <Label>Content Preview</Label>
                        <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                          <p className="text-sm text-muted-foreground">
                            Use the template editor to create variant B content
                          </p>
                        </div>
                      </div>
                    )}
                    {testType === 'send_time' && (
                      <div>
                        <Label>Send Time</Label>
                        <Input type="time" defaultValue="14:00" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label>Test Audience Size</Label>
                <div className="mt-2 space-y-2">
                  <Slider 
                    value={testPercentage} 
                    onValueChange={setTestPercentage}
                    min={10}
                    max={50}
                    step={5}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{testPercentage[0]}% of audience for testing</span>
                    <span>{100 - testPercentage[0]}% for winning variant</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Winning Metric</Label>
                  <Select value={winningMetric} onValueChange={setWinningMetric}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open_rate">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Open Rate
                        </div>
                      </SelectItem>
                      <SelectItem value="click_rate">
                        <div className="flex items-center gap-2">
                          <MousePointer className="h-4 w-4" />
                          Click Rate
                        </div>
                      </SelectItem>
                      <SelectItem value="conversion_rate">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Conversion Rate
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Test Duration</Label>
                  <Select value={testDuration} onValueChange={setTestDuration}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">How it works</p>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800">
                        <li>• {testPercentage[0]}% of your audience will be split between variants</li>
                        <li>• After {testDuration} hours, performance will be measured</li>
                        <li>• The variant with the best {winningMetric.replace('_', ' ')} wins</li>
                        <li>• The winning variant is sent to the remaining {100 - testPercentage[0]}%</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleStartTest} className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Start A/B Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}