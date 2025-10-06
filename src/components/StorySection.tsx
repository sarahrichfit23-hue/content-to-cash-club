import React from 'react';
import { Award, BookOpen, TrendingUp, Heart, Target, Zap } from 'lucide-react';

const StorySection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              I Built This for the Coach
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 to-olive-700 mt-2">
                I Once Was
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Overworked. Under-consistent. But Determined to Win.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <p className="text-xl leading-relaxed">
                I'm an <span className="font-semibold text-gray-900">Air Force veteran</span>, <span className="font-semibold text-gray-900">Amazon #1 bestselling author</span> in marketing and entrepreneurship, 
                and a <span className="font-semibold text-gray-900">single mom</span> who built a 6-figure coaching business from absolute scratch.
              </p>
              
              <p className="leading-relaxed">
                No connections. No safety net. No excuses.
              </p>
              
              <p className="leading-relaxed">
                In <span className="font-semibold text-gray-900">2021</span>, I hit my first 6 figures as a health coach—not by luck, 
                but by building <span className="font-semibold text-gray-900">no-fail systems</span> that kept me consistent even when life got chaotic. 
                Systems that made showing up non-negotiable.
              </p>
              
              <p className="leading-relaxed">
                I know what it's like to feel stuck, overwhelmed, and inconsistent. To waste hours planning content that never gets posted. 
                To lose momentum and watch your income flatline.
              </p>
              
              <p className="leading-relaxed font-semibold text-gray-900 text-xl">
                So I turned my chaos into a 6-figure business through systems and discipline—then turned those same systems into a platform 
                that now helps other coaches do the same.
              </p>

              <p className="leading-relaxed">
                Content to Cash Club™ isn't theory. It's the <span className="font-semibold text-gray-900">exact system</span> that took me from 
                struggling single mom to multiple 6 figures. Every monthly content pack is <span className="font-semibold text-gray-900">hand-crafted by me</span>—
                not outsourced, not AI-generated. Real strategy from real experience.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 border border-yellow-200">
              <Award className="w-10 h-10 text-yellow-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Air Force Veteran</h3>
              <p className="text-sm text-gray-600">Built on discipline, strategy, and showing up every day</p>
            </div>
            
            <div className="bg-gradient-to-br from-olive-50 to-white rounded-xl p-6 border border-olive-200">
              <BookOpen className="w-10 h-10 text-olive-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Amazon #1 Bestseller</h3>
              <p className="text-sm text-gray-600">Marketing & entrepreneurship authority</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 border border-yellow-200">
              <TrendingUp className="w-10 h-10 text-yellow-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">$1M+ Generated</h3>
              <p className="text-sm text-gray-600">For clients using these proven systems</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
