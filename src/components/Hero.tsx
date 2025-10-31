import React from 'react';
import { ArrowRight, Sparkles, Award, BookOpen, TrendingUp } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-600 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-olive-600 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-900">Hand-Crafted Content + Accountability Platform</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Done-For-You Content
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 to-olive-700" style={{ WebkitTextStroke: '0.5px rgba(0,0,0,0.1)' }}>
                + Accountability That Pays.
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Get monthly hand-crafted content packs, daily challenges, and AI tools that turn consistency into cash—all in one platform built for coaches who refuse to post generic content.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.href = 'https://www.contenttocashclub.com/signup'}
                className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Start My Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                See How It Works
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-olive-600" />
                <span className="text-sm text-gray-600">Built by Air Force Veteran</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-olive-600" />
                <span className="text-sm text-gray-600">Amazon #1 Bestseller</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-olive-600" />
                <span className="text-sm text-gray-600">6-Figure Proven Systems</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://d64gsuwffb70l.cloudfront.net/681e3256325a7878a02dbce9_1759644977567_926a74f4.JPG"
                alt="Marketing expert and business coach"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 space-y-2">
              <div className="text-3xl font-bold text-gray-900">$1M+</div>
              <div className="text-sm text-gray-600">Generated for Clients</div>
              <div className="text-xs text-olive-600 font-medium">Using These Exact Systems</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;