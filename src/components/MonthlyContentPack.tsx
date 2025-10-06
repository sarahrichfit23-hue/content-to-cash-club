import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Video, Grid3x3, FileText, Hash, Mail, MessageSquare, Target, Zap, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { normalizePack } from '@/lib/normalizePack';

interface ContentPackData {
  month: string;
  theme: string;
  reels: any[];
  carousels: any[];
  captions: any[];
  emails: any[];
  dm_scripts: any[];
  swipe_of_the_month: any;
  cta_bank: any[];
  hashtags: any[];
}

const CACHE_KEY = 'c2c_latest_pack';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCachedPack() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, ts } = JSON.parse(cached);
    const age = Date.now() - ts;
    if (age < CACHE_DURATION) {
      return { data, isFresh: true };
    }
    return { data, isFresh: false };
  } catch {
    return null;
  }
}

function setCachedPack(data: any) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch (e) {
    console.warn('Failed to cache pack:', e);
  }
}

function clearCachedPack() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    console.warn('Failed to clear cache:', e);
  }
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      const delay = i * 1000; // 0s, 1s, 2s
      if (delay > 0) {
        toast({
          title: `Retry ${i + 1}/${maxRetries - 1}`,
          description: `Retrying in ${delay / 1000}s...`,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Max retries reached');
}

export default function MonthlyContentPack() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [packData, setPackData] = useState<ContentPackData | null>(null);
  const [packInfo, setPackInfo] = useState<any>(null);

  useEffect(() => {
    loadContentPack();
  }, []);

  const loadContentPack = async (forceRefresh = false) => {
    try {
      // Try cache first unless force refresh
      if (!forceRefresh) {
        const cached = getCachedPack();
        if (cached) {
          const normalizedPack = normalizePack(cached.data.packData);
          setPackData(normalizedPack);
          setPackInfo(cached.data.packInfo);
          setLoading(false);
          
          // If cache is fresh, refresh in background
          if (cached.isFresh) {
            fetchContentPack(true); // background refresh
            return;
          }
        }
      }

      // No cache or stale cache - show spinner
      if (!packData) {
        setLoading(true);
      }
      await fetchContentPack(false);
    } catch (error: any) {
      console.error('Error loading content pack:', error);
      setPackData(normalizePack({}));
    } finally {
      setLoading(false);
    }
  };

  const fetchContentPack = async (isBackground = false) => {
    try {
      // Query latest content pack
      const { data: pack, error: packError } = await supabase
        .from('content_packs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (packError) throw packError;
      
      if (!pack || !pack.file_url) {
        if (!isBackground) {
          toast({
            title: 'No content pack found',
            description: 'No content packs available yet.',
            variant: 'destructive'
          });
        }
        setPackData(normalizePack({}));
        return;
      }

      setPackInfo(pack);

      // Fetch JSON from file_url with retry
      const response = await fetchWithRetry(pack.file_url);
      const fetchedJson = await response.json();
      
      // Normalize the pack data
      const normalizedPack = normalizePack(fetchedJson);
      setPackData(normalizedPack);

      // Cache the result
      setCachedPack({ packData: fetchedJson, packInfo: pack });

      if (!isBackground) {
        toast({
          title: 'Content pack loaded',
          description: `Loaded ${pack.name || 'latest pack'} successfully`
        });
      }
    } catch (error: any) {
      console.error('Error fetching content pack:', error);
      if (!isBackground) {
        toast({
          title: 'Error loading content pack',
          description: error.message,
          variant: 'destructive'
        });
      }
      // Only set empty data if we don't have cached data
      if (!packData) {
        setPackData(normalizePack({}));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContentPack(false);
    setRefreshing(false);
  };

  const handleForceRefresh = async () => {
    clearCachedPack();
    setRefreshing(true);
    await loadContentPack(true);
    setRefreshing(false);
    toast({
      title: 'Cache cleared',
      description: 'Content pack refreshed from server'
    });
  };


  const renderEmptyState = (type: string) => (
    <div className="text-center py-12 text-gray-500">
      <p className="text-lg">No {type} available in this pack</p>
    </div>
  );

  const renderReels = (reels: any[]) => {
    if (!reels || reels.length === 0) return renderEmptyState('Reels');
    return (
      <div className="grid gap-4">
        {(reels || []).map((reel, idx) => (
          <Card key={idx} className="p-4">
            <h4 className="font-semibold mb-2">Reel #{idx + 1}</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Hook:</strong> {reel.hook}</div>
              <div><strong>Truth:</strong> {reel.truth}</div>
              <div><strong>CTA:</strong> {reel.cta}</div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderCarousels = (carousels: any[]) => {
    if (!carousels || carousels.length === 0) return renderEmptyState('Carousels');
    return (
      <div className="grid gap-4">
        {(carousels || []).map((carousel, idx) => (
          <Card key={idx} className="p-4">
            <h4 className="font-semibold mb-2">Carousel #{idx + 1}</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Slides:</strong></div>
              {(carousel.slides || []).map((slide: any, sIdx: number) => (
                <div key={sIdx} className="ml-4 p-2 bg-gray-50 rounded">
                  Slide {sIdx + 1}: {slide.text || JSON.stringify(slide)}
                </div>
              ))}
              <div className="mt-2"><strong>Caption:</strong> {carousel.caption}</div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderEmails = (emails: any[]) => {
    if (!emails || emails.length === 0) return renderEmptyState('Emails');
    return (
      <div className="grid gap-4">
        {(emails || []).map((email, idx) => (
          <Card key={idx} className="p-4">
            <h4 className="font-semibold mb-2">Email #{idx + 1}</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Subject:</strong> {email.subject}</div>
              <div><strong>Body:</strong> <pre className="whitespace-pre-wrap">{email.body}</pre></div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderDMs = (dms: any[]) => {
    if (!dms || dms.length === 0) return renderEmptyState('DM Scripts');
    return (
      <div className="grid gap-4">
        {(dms || []).map((dm, idx) => (
          <Card key={idx} className="p-4">
            <h4 className="font-semibold mb-2">DM Script #{idx + 1}</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Nurture:</strong> {dm.nurture}</div>
              <div><strong>Follow-up:</strong> {dm.follow_up}</div>
              <div><strong>CTA:</strong> {dm.cta}</div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderTextList = (items: any[], type: string, icon: React.ReactNode) => {
    if (!items || items.length === 0) return renderEmptyState(type);
    return (
      <div className="grid gap-4">
        {(items || []).map((item, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">{type} #{idx + 1}</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {typeof item === 'string' ? item : (item.text || JSON.stringify(item))}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">{packInfo?.name || 'Monthly Content Pack'}</h2>
          <p className="text-gray-600">{packInfo?.description || 'Latest content pack'}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleForceRefresh} disabled={refreshing} variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Force Refresh
          </Button>
        </div>
      </div>


      {/* Debug info showing file URL and counts */}
      {packData && (
        <div className="mb-4 text-xs text-gray-500 bg-gray-50 p-2 rounded break-all">
          <div className="mb-1"><strong>File URL:</strong> {packInfo?.file_url || 'N/A'}</div>
          <div>Loaded: reels {packData.reels.length} • carousels {packData.carousels.length} • captions {packData.captions.length} • emails {packData.emails.length} • DMs {packData.dm_scripts.length} • CTAs {packData.cta_bank.length} • hashtags {packData.hashtags.length}</div>
        </div>
      )}



      <Tabs defaultValue="reels" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="reels">
            Reels <Badge className="ml-1">{packData?.reels?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="carousels">
            Carousels <Badge className="ml-1">{packData?.carousels?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="captions">
            Captions <Badge className="ml-1">{packData?.captions?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="emails">
            Emails <Badge className="ml-1">{packData?.emails?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="dms">
            DMs <Badge className="ml-1">{packData?.dm_scripts?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="swipe">
            Swipe <Badge className="ml-1">{packData?.swipe_of_the_month ? 1 : 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ctas">
            CTAs <Badge className="ml-1">{packData?.cta_bank?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="hashtags">
            Hashtags <Badge className="ml-1">{packData?.hashtags?.length || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reels" className="mt-6">
          {renderReels(packData?.reels || [])}
        </TabsContent>

        <TabsContent value="carousels" className="mt-6">
          {renderCarousels(packData?.carousels || [])}
        </TabsContent>

        <TabsContent value="captions" className="mt-6">
          {renderTextList(packData?.captions || [], 'Caption', <FileText className="w-5 h-5" />)}
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          {renderEmails(packData?.emails || [])}
        </TabsContent>

        <TabsContent value="dms" className="mt-6">
          {renderDMs(packData?.dm_scripts || [])}
        </TabsContent>

        <TabsContent value="swipe" className="mt-6">
          {packData?.swipe_of_the_month && typeof packData.swipe_of_the_month === 'object' ? (
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Swipe of the Month</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{JSON.stringify(packData.swipe_of_the_month, null, 2)}</p>
            </Card>
          ) : (
            renderEmptyState('Swipe of the Month')
          )}
        </TabsContent>

        <TabsContent value="ctas" className="mt-6">
          {renderTextList(packData?.cta_bank || [], 'CTA', <Target className="w-5 h-5" />)}
        </TabsContent>

        <TabsContent value="hashtags" className="mt-6">
          {renderTextList(packData?.hashtags || [], 'Hashtag', <Hash className="w-5 h-5" />)}
        </TabsContent>

      </Tabs>
    </div>
  );
}
