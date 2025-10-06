import React from 'react';
import { AlertCircle, Clock, TrendingDown } from 'lucide-react';

const PainSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              You Don't Need Another Generic Template.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 to-olive-700 mt-2">
                You Need Real Content + Real Accountability.
              </span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Let's be honest: You're tired of generic AI-generated posts that sound like everyone else. 
              You're tired of staring at blank screens. You're tired of wasting hours planning content that never gets posted.
            </p>
            
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              You start strong on Monday, but by Wednesday you've lost momentum. Your audience forgets you exist. 
              Your income stays stuck. And you're left wondering why consistency feels so impossible.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed font-semibold text-gray-900">
              What if you had hand-crafted content delivered monthly, daily challenges that keep you accountable, 
              and a community that won't let you quit? That's Content to Cash Club™.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <AlertCircle className="w-10 h-10 text-red-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Inconsistent Posting</h3>
              <p className="text-sm text-gray-600">You post when inspired, then disappear for weeks. Your audience loses trust.</p>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <Clock className="w-10 h-10 text-orange-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Wasted Time Planning</h3>
              <p className="text-sm text-gray-600">Hours spent planning content that never gets created. Burnout without results.</p>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <TrendingDown className="w-10 h-10 text-yellow-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Lost Momentum</h3>
              <p className="text-sm text-gray-600">You lose traction, confidence drops, and income stays flat or declines.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainSection;
