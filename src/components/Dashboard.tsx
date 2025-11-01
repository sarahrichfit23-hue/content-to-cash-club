import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Users,
  LayoutDashboard,
  Mail,
  Palette,
  Store,
  MessageSquare,
  Grid3x3,
  Target,
  Calendar,
  Library,
  CreditCard,
  Layout,
  Database,
  Brain,
  Users2,
  Sparkles,
  Flame,
  AlertTriangle,
  GitBranch,
  CalendarDays,
} from "lucide-react";
import ContentStrategyEngine from "./ContentStrategyEngine";
import { AIContentGenerator } from "./AIContentGenerator";
import AnalyticsDashboard from "./AnalyticsDashboard";
import WhiteLabelDashboard from "./whitelabel/WhiteLabelDashboard";
import APIUsageDashboard from "./APIUsageDashboard";
import CommunityHub from "./CommunityHub";
import Navigation from "./Navigation";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import NotificationSettings from "./NotificationSettings";
import { EmailEngagement } from "./EmailEngagement";
import EmailCampaignBuilder from "./EmailCampaignBuilder";
import EmailWorkflowBuilder from "./EmailWorkflowBuilder";
import TemplateMarketplace from "./marketplace/TemplateMarketplace";
import CreatorDashboard from "./marketplace/CreatorDashboard";
import SMSDashboard from "./sms/SMSDashboard";
import LandingPageBuilder from "./landing/LandingPageBuilder";
import SubscriberDashboard from "./crm/SubscriberDashboard";
import ContentPlannerBoard from "./content/ContentPlannerBoard";
import AutomationDashboard from "./automation/AutomationDashboard";
import WebhookDashboard from "./webhooks/WebhookDashboard";
import TeamDashboard from "./teams/TeamDashboard";
import BrandDNAWizard from "./brand/BrandDNAWizard";
import BrandDNAPDFExport from "./brand/BrandDNAPDFExport";
import ContentLibrary from "./ContentLibrary";
import TaskManager from "./Calendar/TaskManager";
import GoogleCalendarConnect from "./Calendar/GoogleCalendarConnect";
import { AdminCalendarDashboard } from "./Calendar/AdminCalendarDashboard";
import CalendarView from "./Calendar/CalendarView";
import ClientHomepage from "./coaching/ClientHomepage";
import DailyChallenge from "./DailyChallenge";
import WeeklyChallengeProgress from "./WeeklyChallengeProgress";
import { getTodaysQuote } from "@/data/dailyQuotes";
import ContentPackCard from "./ContentPackCard";
import { seedPack } from "@/data/seedData";
import BillingPortal from "./BillingPortal";
import PaymentUpdateModal from "./PaymentUpdateModal";
import { useSubscription } from "@/hooks/useSubscription";
import MonthlyContentPack from "./MonthlyContentPack";
import ClientAcquisitionDashboard from "@/pages/dashboard/ClientAcquisitionDashboard";
import MealPlanAssistant from "@/pages/MealPlanAssistant";
import UpgradeModal from "@/components/UpgradeModal";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "coaching"
    | "content"
    | "library"
    | "calendar"
    | "ai"
    | "community"
    | "billing"
    | "sms"
    | "subscribers"
    | "planner"
    | "whitelabel"
    | "branddna"
    | "accountability"
    | "clientacquisition"
    | "strategy"
    | "mealplans"
  >("overview");

  const [contentTab, setContentTab] = useState<"current" | "catalog" | "favorites">("current");
  const { user, profile } = useApp();
  const navigate = useNavigate();
  const { subscription, isInGracePeriod } = useSubscription(user?.id || "");
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const stats = [
    { label: "Assets Generated", value: "127", icon: <Sparkles className="w-5 h-5" /> },
    { label: "This Month", value: "42", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Saved", value: "89", icon: <Database className="w-5 h-5" /> },
    { label: "Community Wins", value: "15", icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-28">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {profile?.full_name || "Coach"}!
                </h1>
                <p className="text-gray-600">
                  Your {seedPack.theme} content pack is ready to personalize.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* 🍽️ Meal Plan Generator Button */}
                <Button
                  onClick={() => navigate("/meal-plan-assistant")}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  title="Generate customized AI meal plans"
                >
                  🍽️ Meal Plan Generator
                </Button>
                {/* 🔗 Manage subscription (Stripe Customer Portal) */}
                <Button
                  onClick={() =>
                    window.open(
                      "https://billing.stripe.com/p/login/fZu7sN5Ow5wGfTy5MBbjW00",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  title="Open billing portal to manage or cancel your subscription"
                >
                  💳 Manage subscription
                </Button>
                {/* 💎 Upgrade button (modal) */}
                {profile?.role !== "pro" && (
                  <>
                    <Button
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      💎 Upgrade
                    </Button>
                    {showUpgradeModal && (
                      <UpgradeModal
                        currentPlan={profile?.role || "starter"}
                        onClose={() => setShowUpgradeModal(false)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* 🚀 Brand DNA or Onboarding Section */}
          <div className="mb-10">
            {profile?.onboarding_completed ? (
              <div className="border rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-white shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Your Brand DNA</h2>
                <p className="text-gray-600 mb-4">
                  You’ve already completed your onboarding quiz! You can edit or refine your Brand
                  DNA anytime.
                </p>
                <Button
                  onClick={() => navigate("/branddna")}
                  className="bg-gradient-to-r from-yellow-600 to-olive-600 text-white font-medium"
                >
                  🧬 Edit My Brand DNA
                </Button>
              </div>
            ) : (
              <div className="border rounded-xl p-6 bg-gray-50 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">Finish Setting Up</h2>
                <p className="text-gray-600 mb-4">
                  Complete your onboarding quiz to unlock your dashboard features.
                </p>
                <Button
                  onClick={() => navigate("/onboarding")}
                  className="bg-gradient-to-r from-yellow-600 to-olive-600 text-white font-medium"
                >
                  🚀 Go to Onboarding
                </Button>
              </div>
            )}
          </div>
          {/* Grace period alert */}
          {isInGracePeriod() && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                Your payment failed. Please update your payment method to avoid service interruption.
                <button
                  onClick={() => setActiveTab("billing")}
                  className="ml-2 underline font-medium"
                >
                  Update Payment
                </button>
              </AlertDescription>
            </Alert>
          )}
          {/* ===== Dashboard Tabs ===== */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="mb-6 flex-wrap h-auto">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard Home
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Coach Calendar
              </TabsTrigger>
              <TabsTrigger value="accountability" className="flex items-center gap-2">
                <Flame className="w-4 h-4" /> Accountability
              </TabsTrigger>
              <TabsTrigger value="branddna" className="flex items-center gap-2">
                <Brain className="w-4 h-4" /> Brand DNA
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Generator
              </TabsTrigger>
              <TabsTrigger value="clientacquisition" className="flex items-center gap-2">
                <Target className="w-4 h-4" /> Client Acquisition
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" /> Content Packs
              </TabsTrigger>
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Life & Biz Board
              </TabsTrigger>
              <TabsTrigger value="subscribers" className="flex items-center gap-2">
                <Database className="w-4 h-4" /> CRM / Subscribers
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Library className="w-4 h-4" /> My Library
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Community
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> SMS
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Billing
              </TabsTrigger>
              <TabsTrigger value="whitelabel" className="flex items-center gap-2">
                <Palette className="w-4 h-4" /> White Label
              </TabsTrigger>
              <TabsTrigger value="mealplans" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Meal Plan Generator
              </TabsTrigger>
              <TabsTrigger value="coaching" className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Coaching Clients
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center mb-8 border-4 border-yellow-400">
                <p className="text-2xl lg:text-3xl font-bold text-white italic leading-relaxed">
                  "{getTodaysQuote()}"
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                  <Card key={stat.label} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                          {stat.icon}
                        </div>
                        <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="bg-gradient-to-r from-yellow-600 to-olive-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Weekly Challenge 🔥</h2>
                    <p className="mb-4">Complete all daily tasks to fill each bubble!</p>
                    <WeeklyChallengeProgress userId={user?.id} />
                  </div>
                  <Button
                    onClick={() => setActiveTab("accountability")}
                    className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    View Challenge
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Other Tabs */}
            <TabsContent value="accountability">
              <DailyChallenge />
            </TabsContent>
            <TabsContent value="branddna">
              <div className="space-y-6">
                <BrandDNAPDFExport />
                <BrandDNAWizard onComplete={() => setActiveTab("ai")} />
              </div>
            </TabsContent>
            <TabsContent value="calendar">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Coach Calendar & Task Manager</h2>
                <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col-reverse lg:flex-row gap-8">
                  <div className="w-full lg:w-[350px]">
                    <TaskManager />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <GoogleCalendarConnect />
                    <div className="mt-6">
                      <CalendarView />
                    </div>
                  </div>
                </div>
                {profile?.role === "admin" && <AdminCalendarDashboard />}
              </div>
            </TabsContent>
            <TabsContent value="ai">
              <AIContentGenerator />
            </TabsContent>
            <TabsContent value="strategy">
              <ContentStrategyEngine />
            </TabsContent>
            <TabsContent value="clientacquisition">
              <ClientAcquisitionDashboard />
            </TabsContent>
            <TabsContent value="content">
              <MonthlyContentPack />
            </TabsContent>
            <TabsContent value="planner">
              <ContentPlannerBoard />
            </TabsContent>
            <TabsContent value="subscribers">
              <SubscriberDashboard />
            </TabsContent>
            <TabsContent value="library">
              <ContentLibrary />
            </TabsContent>
            <TabsContent value="community">
              <CommunityHub />
            </TabsContent>
            <TabsContent value="sms">
              <SMSDashboard />
            </TabsContent>
            <TabsContent value="billing">
              <BillingPortal userId={user?.id || ""} />
            </TabsContent>
            <TabsContent value="whitelabel">
              <WhiteLabelDashboard />
            </TabsContent>
            <TabsContent value="mealplans">
              <MealPlanAssistant />
            </TabsContent>
            <TabsContent value="coaching">
              <ClientHomepage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Dashboard;