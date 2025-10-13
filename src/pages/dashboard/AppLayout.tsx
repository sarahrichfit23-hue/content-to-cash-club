import { useState } from 'react';
import Hero from '../../components/Hero';
import PainSection from '../../components/PainSection';
import Features from '../../components/Features';
import Pricing from '../../components/Pricing';
import Testimonials from '../../components/Testimonials';
import Footer from '../../components/Footer';
import Navigation from '../../components/Navigation';
import StorySection from '../../components/StorySection';
import FinalCTA from '../../components/FinalCTA';



import Dashboard from '../../components/Dashboard';
import ContentEditor from '../../components/ContentEditor';
import AIPersonalizer from '../../components/AIPersonalizer';
import OnboardingQuiz from '../../components/OnboardingQuiz';
import EmailCampaignBuilder from '../../components/EmailCampaignBuilder';
import AffiliateDashboard from '../../components/affiliate/AffiliateDashboard';
import ContentStrategyEngine from '../dashboard/ContentStrategy';
//import SupportDashboard from './support/SupportDashboard';
import SMSDashboard from '../../components/sms/SMSDashboard';
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

  //if (location.pathname === '/support') {
  //return <SupportDashboard />;
  //  }

  if (location.pathname === '/sms') {
    return <SMSDashboard />;
  }
  
  if (location.pathname === '/content-strategy') {
  return <ContentStrategyEngine />;
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
