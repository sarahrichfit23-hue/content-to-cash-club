import React from 'react';
import { ArrowRight, Check, Zap } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

const FinalCTA: React.FC<FinalCTAProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA Box */}
          <div className="bg-gradient-to-br from-yellow-600 to-olive-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Join Hundreds of Coaches Growing Daily</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Your Content. Your Community.
              <span className="block mt-2">Your Cash Machine.</span>
            </h2>
            
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
              Get hand-crafted monthly content packs, daily challenges, AI tools, and a community that keeps you accountable. 
              This is the platform built for coaches who refuse to post generic content and are ready to grow.
            </p>

            <button
              onClick={() => window.location.href = 'https://www.contenttocashclub.com/signup'}
              className="px-10 py-5 bg-white text-gray-900 font-bold text-lg rounded-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              Start My Free Trial
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-olive-600" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-olive-600" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-olive-600" />
              <span>No credit card required</span>
            </div>
          </div>

          {/* Final Message */}
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-700 font-medium">
              Stop wasting time on what doesn't work.
            </p>
            <p className="text-2xl text-gray-900 font-bold mt-2">
              Start building the consistent income you deserve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;