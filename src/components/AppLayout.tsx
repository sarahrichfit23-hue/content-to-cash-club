mport { useState } from 'react';
import Hero from './Hero';
import PainSection from './PainSection';
import Features from './Features';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import Footer from './Footer';
import Navigation from './Navigation';
import StorySection from './StorySection';
import FinalCTA from './FinalCTA';



import Dashboard from './Dashboard';
import ContentEditor from './ContentEditor';
import AIPersonalizer from './AIPersonalizer';
import OnboardingQuiz from './OnboardingQuiz';
import EmailCampaignBuilder from './EmailCampaignBuilder';
import { AffiliateDashboard } from './affiliate/AffiliateDashboard';
import { SupportDashboard } from './support/SupportDashboard';
import { SMSDashboard } from './sms/SMSDashboard';
import { useApp } from '@/contexts/AppContext';
import { useLocation } from 'react-router-dom';

export default function AppLayout() {
  const { user } = useApp();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if we're on a specific route
  if (location.pathname === '/editor') {
    return <ContentEditor />;
  }

  if (location.pathname === '/personalizer') {
    return <AIPersonalizer />;
  }

  if (location.pathname === '/campaigns') {
    return <EmailCampaignBuilder />;
  }

  if (location.pathname === '/affiliate') {
    return <AffiliateDashboard />;
  }

  if (location.pathname === '/support') {
    return <SupportDashboard />;
  }

  if (location.pathname === '/sms') {
    return <SMSDashboard />;
  }
  
  // Show onboarding if needed
  if (showOnboarding && !user) {
    return <OnboardingQuiz onComplete={() => setShowOnboarding(false)} />;
  }

  // Show logged-in experience
  if (user) {
    return <Dashboard />;
  }

  // Show landing page
  return (
    <div className="min-h-screen bg-white">
      <Hero onGetStarted={() => setShowOnboarding(true)} />
      <PainSection />
      <Features />
      <StorySection />
      <Testimonials />
      <Pricing onSelectPlan={() => setShowOnboarding(true)} />
      <FinalCTA onGetStarted={() => setShowOnboarding(true)} />
      <Footer />
    </div>
  );
}
