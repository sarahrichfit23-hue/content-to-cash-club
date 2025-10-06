import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';

interface ContentPackCardProps {
  type: string;
  title: string;
  count: number;
  icon: React.ReactNode;
  locked?: boolean;
  onClick: () => void;
}

const ContentPackCard: React.FC<ContentPackCardProps> = ({
  type,
  title,
  count,
  icon,
  locked = false,
  onClick
}) => {
  const getCardColor = () => {
    switch(type) {
      case 'reel': return 'from-pink-500 to-rose-500';
      case 'carousel': return 'from-blue-500 to-indigo-500';
      case 'caption': return 'from-purple-500 to-violet-500';
      case 'hashtag': return 'from-green-500 to-emerald-500';
      case 'email': return 'from-orange-500 to-amber-500';
      case 'dm': return 'from-teal-500 to-cyan-500';
      case 'cta': return 'from-yellow-500 to-yellow-600';
      case 'swipe': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`relative group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
        locked ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1'
      }`}
    >
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${getCardColor()}`} />
      
      <div className="p-6">
        {/* Icon and Lock */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${getCardColor()} bg-opacity-10`}>
            <div className="text-gray-700">{icon}</div>
          </div>
          {locked && <Lock className="w-5 h-5 text-gray-400" />}
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{count} templates ready</p>

        {/* Action */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {locked ? 'Upgrade to access' : 'Personalize'}
          </span>
          {!locked && <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />}
        </div>
      </div>
    </button>
  );
};

export default ContentPackCard;