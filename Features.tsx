import React from 'react';
import { Target, Sparkles, Users, TrendingUp, Mail, BarChart, Zap, Shield, Calendar, Megaphone, Palette, Package } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Monthly Hand-Crafted Content Packs',
      benefit: 'Get done-for-you content curated by a 6-figure coach—not generic AI.',
      description: 'Every month, receive professionally crafted posts, captions, and prompts designed to grow your authority and income. This is not AI slop—it\'s strategic content built from real coaching experience.'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Daily Content Challenges',
      benefit: 'Turn consistency into a game that grows your audience and income.',
      description: 'Get a new prompt every day that keeps you posting, building momentum, and staying top-of-mind with your audience.'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI Content Generator',
      benefit: 'Never stare at a blank screen again—create on-brand content in minutes.',
      description: 'Generate captions, emails, and posts that sound like YOU with AI that learns your voice and style. Use it to customize the monthly packs or create fresh content on demand.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Accountability Dashboard',
      benefit: 'Track streaks, earn badges, and stay motivated to keep showing up.',
      description: 'Gamified system that rewards consistency and keeps you accountable to your goals every single day.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community Hub',
      benefit: 'Collaborate, compete, and connect with coaches chasing the same goal.',
      description: 'Join a community of high-performers who push you to stay consistent and celebrate your wins.'
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: 'Analytics & CRM',
      benefit: 'See what works, nurture leads, and turn engagement into revenue.',
      description: 'Track performance, manage subscribers, segment your audience, and convert followers into paying clients.'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Marketing Suite',
      benefit: 'Build campaigns that nurture subscribers and convert them into clients.',
      description: 'Create automated email workflows, newsletters, and sequences that sell while you sleep.'
    },
    {
      icon: <Megaphone className="w-6 h-6" />,
      title: 'SMS Marketing',
      benefit: 'Reach your audience instantly with high-converting text campaigns.',
      description: 'Send SMS campaigns and automated workflows that get opened and drive immediate action.'
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Landing Page Builder',
      benefit: 'Create high-converting pages in minutes—no designer or developer needed.',
      description: 'Drag-and-drop builder with proven templates that capture leads and sell your offers.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Automation Tools',
      benefit: 'Save hours every week with automated content, emails, and follow-ups.',
      description: 'Set it and forget it—let the platform handle repetitive tasks while you focus on coaching.'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Content Planner',
      benefit: 'Plan your entire month in one visual dashboard—no more scattered notes.',
      description: 'Organize, schedule, and batch your content so you always know what to post next.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Growth Analytics',
      benefit: 'Double down on what converts and stop wasting time on what doesn\'t.',
      description: 'See exactly which content drives engagement, leads, and sales so you can do more of what works.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Create, Post & Profit
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 to-olive-700 mt-2">
              Without Generic Content or Guesswork
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6">
            Hand-crafted monthly content packs + AI tools + accountability + community. 
            This is the complete system that keeps you consistent, saves you time, and helps you make more money.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="p-6 rounded-xl border border-gray-200 hover:border-olive-600 hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-olive-600 rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-olive-700 font-semibold mb-2">{feature.benefit}</p>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
