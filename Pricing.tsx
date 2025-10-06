import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

interface PricingProps {
  onSelectPlan?: (plan: string) => void;
}
const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'starter' | 'pro' | 'elite'>('starter');

  const handleSelectPlan = (tier: 'starter' | 'pro' | 'elite') => {
    if (!user) {
      // Redirect to signup if not authenticated
      navigate('/signup');
      return;
    }
    setSelectedTier(tier);
    setCheckoutModalOpen(true);
    if (onSelectPlan) {
      onSelectPlan(tier);
    }
  };

  const plans = [
    {
      name: 'Starter',
      tier: 'starter' as const,
      price: '$49',
      description: 'Perfect for coaches just starting',
      features: [
        'Current + last 2 months packs',
        'AI personalizer',
        'Save & export content',
        'Community access',
        'Swipe of the Month',
        '50 generations/month'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Pro',
      tier: 'pro' as const,
      price: '$129',
      description: 'For coaches ready to scale',
      features: [
        'Everything in Starter',
        'Full back catalog access',
        'Bulk generation (20 assets)',
        'Scheduled exports',
        'Bonus swipes',
        'Quarterly workshops',
        '300 generations/month'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Elite',
      tier: 'elite' as const,
      price: '$299',
      description: 'For high-volume creators',
      features: [
        'Everything in Pro',
        'Monthly group clinic',
        'Priority review thread',
        'White-label rights (10 clients)',
        'Custom templates',
        '1,000 generations/month',
        'Direct Slack access'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    }
  ];
  return (
    <>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Handcrafted Systems. <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 to-olive-700" style={{ WebkitTextStroke: '0.5px rgba(0,0,0,0.1)' }}>Proven Results.</span>

            </h2>
            <p className="text-xl text-gray-600 mb-2">
              Every content pack personally created using my no-fail systems
            </p>
            <p className="text-lg text-gray-500">
              7-day free trial • Cancel anytime • No credit card required
            </p>
          </div>


          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-yellow-50 to-white border-2 border-yellow-600 shadow-xl scale-105'
                    : 'bg-white border border-gray-200'
                } p-8`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-600 to-olive-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-olive-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.tier)}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-yellow-600 to-olive-600 text-white hover:shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        selectedTier={selectedTier}
        userId={user?.id || null}
      />
    </>
  );
};

export default Pricing;