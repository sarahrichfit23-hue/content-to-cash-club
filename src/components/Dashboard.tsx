import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, TrendingUp, Users, FileText, 
  LayoutDashboard, Mail, Settings, Palette, 
  Megaphone, Bot, Store, HeadphonesIcon, MessageSquare,
  Zap, Webhook, ShoppingBag, Layout, Database, Brain, Users2, Gauge, Sparkles, Flame
} from 'lucide-react';

import ContentLibrary from './ContentLibrary';
import { AIContentGenerator } from './AIContentGenerator';
import AnalyticsDashboard from './AnalyticsDashboard';
import WhiteLabelDashboard from './whitelabel/WhiteLabelDashboard';
import APIUsageDashboard from './api/APIUsageDashboard';
import CommunityHub from './CommunityHub';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navigation from './Navigation';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import NotificationSettings from './NotificationSettings';
import { EmailEngagement } from './EmailEngagement';
import EmailCampaignBuilder from './EmailCampaignBuilder';
import EmailWorkflowBuilder from './EmailWorkflowBuilder';
import TemplateMarketplace from './marketplace/TemplateMarketplace';
import CreatorDashboard from './marketplace/CreatorDashboard';
import SMSDashboard from './sms/SMSDashboard';
import LandingPageBuilder from './landing/LandingPageBuilder';
import SubscriberDashboard from './crm/SubscriberDashboard';
import ContentPlanner from './content/ContentPlanner';
import AutomationDashboard from './automation/AutomationDashboard';
import WebhookDashboard from './webhooks/WebhookDashboard';
import TeamDashboard from './teams/TeamDashboard';
import BrandDNAWizard from './brand/BrandDNAWizard';
import BrandDNAPDFExport from './brand/BrandDNAPDFExport';

import DailyChallenge from './DailyChallenge';
import {WeeklyChallengeProgress } from './WeeklyChallengeProgress';
import {getTodaysQuote } from '@/data/dailyQuotes';

import { Video, Grid3x3, Hash, Target, Calendar, Star, Library, CreditCard, Bell, Activity, AlertTriangle, GitBranch } from 'lucide-react';
import ContentPackCard from './ContentPackCard';
import { seedPack } from '@/data/seedData';
import BillingPortal from './BillingPortal';
import PaymentUpdateModal from './PaymentUpdateModal';
import { useSubscription } from '@/hooks/useSubscription';
import MonthlyContentPack from './MonthlyContentPack';


const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'library' | 'ai' | 'analytics' | 'community' | 'billing' | 'notifications' | 'engagement' | 'campaigns' | 'workflows' | 'marketplace' | 'creator' | 'sms' | 'landing' | 'subscribers' | 'planner' | 'automation' | 'webhooks' | 'teams' | 'api' | 'whitelabel' | 'branddna' | 'accountability'>('overview');



  const [contentTab, setContentTab] = useState<'current' | 'catalog' | 'favorites'>('current');
  const { user, profile } = useApp();
  const navigate = useNavigate();
  const { subscription, isInGracePeriod } = useSubscription(user?.id || '');
  
  const assetTypes = [
    { type: 'reel', title: 'Reels Scripts', icon: <Video className="w-5 h-5" />, count: 3 },
    { type: 'carousel', title: 'Carousels', icon: <Grid3x3 className="w-5 h-5" />, count: 2 },
    { type: 'caption', title: 'Captions', icon: <FileText className="w-5 h-5" />, count: 3 },
    { type: 'hashtag', title: 'Hashtags', icon: <Hash className="w-5 h-5" />, count: 25 },
    { type: 'email', title: 'Email Copy', icon: <Mail className="w-5 h-5" />, count: 2 },
    { type: 'dm', title: 'DM Scripts', icon: <MessageSquare className="w-5 h-5" />, count: 3 },
    { type: 'cta', title: 'CTA Bank', icon: <Target className="w-5 h-5" />, count: 10 },
    { type: 'swipe', title: 'Swipe of the Month', icon: <Zap className="w-5 h-5" />, count: 1 },
  ];

  const stats = [
    { label: 'Assets Generated', value: '127', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'This Month', value: '42', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Saved', value: '89', icon: <Star className="w-5 h-5" /> },
    { label: 'Community Wins', value: '15', icon: <Users className="w-5 h-5" /> },
  ];
  const handleSelectAsset = (assetType: string) => {
    // Navigate to AI Personalizer with selected asset type
    navigate('/personalizer', { state: { assetType } });
  };
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-6 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name || 'Coach'}!
            </h1>
            <p className="text-gray-600">
              Your {seedPack.theme} content pack is ready to personalize
            </p>
          </div>
        {/* Grace Period Alert */}
        {isInGracePeriod() && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              Your payment failed. Please update your payment method to avoid service interruption.
              <button 
                onClick={() => setActiveTab('billing')}
                className="ml-2 underline font-medium"
              >
                Update Payment
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard Home
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Content Packs
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              My Library
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="branddna" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Brand DNA
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Content Planner
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Campaigns
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Email Workflows
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Email Engagement
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="landing" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Landing Pages
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              CRM/Subscribers
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="creator" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Creator Dashboard
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="accountability" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Accountability
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              API Usage
            </TabsTrigger>
            <TabsTrigger value="whitelabel" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              White Label
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
          </TabsList>


          {/* Overview Tab Content - Main Dashboard Home */}
          <TabsContent value="overview">
            {/* Daily Quote Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center mb-8 border-4 border-yellow-400">
              <p className="text-2xl lg:text-3xl font-bold text-white italic leading-relaxed">"{getTodaysQuote()}"</p>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <Card key={stat.label} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">{stat.icon}</div>
                      <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>


            {/* Quick Actions Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('content')}>
                  <CardHeader>
                    <Grid3x3 className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Content Packs</CardTitle>
                    <CardDescription className="text-sm">Access monthly content</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('ai')}>
                  <CardHeader>
                    <Sparkles className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">AI Generator</CardTitle>
                    <CardDescription className="text-sm">Create custom content</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('branddna')}>
                  <CardHeader>
                    <Brain className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Brand DNA</CardTitle>
                    <CardDescription className="text-sm">Define your brand voice</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('analytics')}>
                  <CardHeader>
                    <BarChart3 className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Analytics</CardTitle>
                    <CardDescription className="text-sm">Track performance</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('planner')}>
                  <CardHeader>
                    <Calendar className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Content Planner</CardTitle>
                    <CardDescription className="text-sm">Schedule your posts</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('campaigns')}>
                  <CardHeader>
                    <Mail className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Email Campaigns</CardTitle>
                    <CardDescription className="text-sm">Build email campaigns</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('sms')}>
                  <CardHeader>
                    <MessageSquare className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">SMS Marketing</CardTitle>
                    <CardDescription className="text-sm">Send SMS campaigns</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('automation')}>
                  <CardHeader>
                    <Zap className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Automation</CardTitle>
                    <CardDescription className="text-sm">Automate workflows</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('landing')}>
                  <CardHeader>
                    <Layout className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Landing Pages</CardTitle>
                    <CardDescription className="text-sm">Build landing pages</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('subscribers')}>
                  <CardHeader>
                    <Database className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">CRM</CardTitle>
                    <CardDescription className="text-sm">Manage subscribers</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('community')}>
                  <CardHeader>
                    <Users className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Community</CardTitle>
                    <CardDescription className="text-sm">Connect with coaches</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('accountability')}>
                  <CardHeader>
                    <Flame className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Accountability</CardTitle>
                    <CardDescription className="text-sm">Track challenges</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('marketplace')}>
                  <CardHeader>
                    <Store className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Marketplace</CardTitle>
                    <CardDescription className="text-sm">Browse templates</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('teams')}>
                  <CardHeader>
                    <Users2 className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">Teams</CardTitle>
                    <CardDescription className="text-sm">Collaborate together</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('whitelabel')}>
                  <CardHeader>
                    <Palette className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">White Label</CardTitle>
                    <CardDescription className="text-sm">Brand customization</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('api')}>
                  <CardHeader>
                    <Gauge className="w-8 h-8 text-yellow-600 mb-2" />
                    <CardTitle className="text-base">API Usage</CardTitle>
                    <CardDescription className="text-sm">Monitor API calls</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>


            {/* Monthly Challenge Banner */}
            <div className="bg-gradient-to-r from-yellow-600 to-olive-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Weekly Challenge 🔥</h2>
                  <p className="mb-4">Complete all daily tasks to fill each bubble!</p>
                  <WeeklyChallengeProgress userId={user?.id} />
                </div>
                <Button 
                  onClick={() => setActiveTab('accountability')}
                  className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  View Challenge
                </Button>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="content">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gray-100 rounded-lg">{stat.icon}</div>
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Content Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setContentTab('current')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  contentTab === 'current' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                This Month
                {contentTab === 'current' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600" />
                )}
              </button>
              <button
                onClick={() => setContentTab('catalog')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  contentTab === 'catalog' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Back Catalog
                {(!subscription || subscription.tier === 'starter') && (
                  <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                )}
                {contentTab === 'catalog' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600" />
                )}
              </button>
              <button
                onClick={() => setContentTab('favorites')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  contentTab === 'favorites' 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Favorites
                {contentTab === 'favorites' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600" />
                )}
              </button>
            </div>

            {/* Monthly Content Pack Component */}
            {contentTab === 'current' && (
              <MonthlyContentPack />
            )}

            {contentTab === 'catalog' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Back catalog feature coming soon...</p>
              </div>
            )}

            {contentTab === 'favorites' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Favorites feature coming soon...</p>
              </div>
            )}



            {/* Monthly Challenge Banner */}
            <div className="mt-12 bg-gradient-to-r from-yellow-600 to-olive-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">October Challenge 🔥</h2>
                  <p className="mb-4">Post 3 Reels + 1 Carousel + 1 Email this week</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((day) => (
                      <div
                        key={day}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                          day <= 2 ? 'bg-white text-olive-600' : 'bg-white/20'
                        }`}
                      >
                        {day <= 2 ? '✓' : day}
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => setActiveTab('accountability')}
                  className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  View Challenge
                </Button>

              </div>
            </div>
          </TabsContent>

          <TabsContent value="library">
            <ContentLibrary />
          </TabsContent>

          <TabsContent value="ai">
            <AIContentGenerator />
          </TabsContent>
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="community">
            <CommunityHub />
          </TabsContent>

          <TabsContent value="billing">
            <BillingPortal userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="engagement">
            <EmailEngagement />
          </TabsContent>
          
          <TabsContent value="campaigns">
            <EmailCampaignBuilder />
          </TabsContent>
          
          <TabsContent value="workflows">
            <EmailWorkflowBuilder />
          </TabsContent>
          
          <TabsContent value="marketplace">
            <TemplateMarketplace />
          </TabsContent>
          
          <TabsContent value="creator">
            <CreatorDashboard />
          </TabsContent>
          
          <TabsContent value="sms">
            <SMSDashboard />
          </TabsContent>
          
          <TabsContent value="landing">
            <LandingPageBuilder />
          </TabsContent>
          
          <TabsContent value="subscribers">
            <SubscriberDashboard />
          </TabsContent>
          
          <TabsContent value="planner">
            <ContentPlanner />
          </TabsContent>
          
          <TabsContent value="automation">
            <AutomationDashboard />
          </TabsContent>
          
          <TabsContent value="webhooks">
            <WebhookDashboard />
          </TabsContent>
          
          <TabsContent value="teams">
            <TeamDashboard />
          </TabsContent>
          
          <TabsContent value="api">
            <APIUsageDashboard />
          </TabsContent>
          
          <TabsContent value="whitelabel">
            <WhiteLabelDashboard />
          </TabsContent>
          
          <TabsContent value="branddna">
            <div className="space-y-6">
              <BrandDNAPDFExport userId={user?.id || ''} />
              <BrandDNAWizard onComplete={() => setActiveTab('ai')} />
            </div>
          </TabsContent>

          
          <TabsContent value="accountability">
            <DailyChallenge />
          </TabsContent>

        </Tabs>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
