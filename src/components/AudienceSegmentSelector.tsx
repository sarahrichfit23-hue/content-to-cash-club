import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Filter, Plus, Search, Tag, 
  TrendingUp, Clock, Mail, UserCheck 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AudienceSegmentSelectorProps {
  selectedSegment: string | null;
  onSelect: (segmentId: string | null) => void;
}

export default function AudienceSegmentSelector({ selectedSegment, onSelect }: AudienceSegmentSelectorProps) {
  const [segments, setSegments] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [engagementFilter, setEngagementFilter] = useState('all');

  useEffect(() => {
    loadSegments();
    loadSubscribers();
  }, []);

  useEffect(() => {
    filterSubscribers();
  }, [subscribers, searchTerm, selectedTags, engagementFilter]);

  const loadSegments = async () => {
    const { data } = await supabase
      .from('audience_segments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setSegments(data);
  };

  const loadSubscribers = async () => {
    const { data } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('status', 'active')
      .order('engagement_score', { ascending: false });
    
    if (data) setSubscribers(data);
  };

  const filterSubscribers = () => {
    let filtered = [...subscribers];

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(sub =>
        selectedTags.some(tag => sub.tags?.includes(tag))
      );
    }

    if (engagementFilter !== 'all') {
      switch (engagementFilter) {
        case 'high':
          filtered = filtered.filter(sub => sub.engagement_score >= 75);
          break;
        case 'medium':
          filtered = filtered.filter(sub => sub.engagement_score >= 40 && sub.engagement_score < 75);
          break;
        case 'low':
          filtered = filtered.filter(sub => sub.engagement_score < 40);
          break;
      }
    }

    setFilteredSubscribers(filtered);
  };

  const allTags = Array.from(new Set(subscribers.flatMap(s => s.tags || [])));

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedSegment || 'all'} onValueChange={onSelect}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">All Subscribers</p>
                        <p className="text-sm text-muted-foreground">Send to your entire list</p>
                      </div>
                      <Badge>{subscribers.length} subscribers</Badge>
                    </div>
                  </Label>
                </div>

                {segments.map(segment => (
                  <div key={segment.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={segment.id} id={segment.id} />
                    <Label htmlFor={segment.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{segment.name}</p>
                          <p className="text-sm text-muted-foreground">{segment.description}</p>
                        </div>
                        <Badge>{segment.subscriber_count} subscribers</Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <Button variant="outline" className="w-full mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create New Segment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriber List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={engagementFilter} onValueChange={setEngagementFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Engagement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Engagement</SelectItem>
                    <SelectItem value="high">High (75%+)</SelectItem>
                    <SelectItem value="medium">Medium (40-74%)</SelectItem>
                    <SelectItem value="low">Low (&lt;40%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Subscriber</th>
                      <th className="text-left p-3 text-sm font-medium">Tags</th>
                      <th className="text-left p-3 text-sm font-medium">Engagement</th>
                      <th className="text-left p-3 text-sm font-medium">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.slice(0, 10).map(subscriber => (
                      <tr key={subscriber.id} className="border-t">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{subscriber.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {subscriber.tags?.slice(0, 2).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${subscriber.engagement_score}%` }}
                              />
                            </div>
                            <span className="text-sm">{subscriber.engagement_score}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {subscriber.last_opened_at ? 
                            new Date(subscriber.last_opened_at).toLocaleDateString() : 
                            'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Showing {Math.min(10, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Segment Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Total Reach</span>
              </div>
              <span className="font-bold">{filteredSubscribers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Avg. Engagement</span>
              </div>
              <span className="font-bold">
                {filteredSubscribers.length > 0 
                  ? Math.round(filteredSubscribers.reduce((acc, s) => acc + s.engagement_score, 0) / filteredSubscribers.length)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Total Opens</span>
              </div>
              <span className="font-bold">
                {filteredSubscribers.reduce((acc, s) => acc + s.total_opens, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Active Users</span>
              </div>
              <span className="font-bold">
                {filteredSubscribers.filter(s => s.engagement_score > 50).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Segments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Recent Subscribers
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Most Engaged
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Never Opened
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Tag className="h-4 w-4 mr-2" />
              VIP Customers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
