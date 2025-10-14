import React from 'react';
import { Award, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
// import { SocialShare } from './SocialShare';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  earned: boolean;
}

interface BadgeDisplayProps {
  badges: Badge[];
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-bold text-gray-900">Your Badges</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`text-center p-4 rounded-lg border-2 transition-all ${
              badge.earned
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 bg-gray-50 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2 relative">
              {badge.icon}
              {!badge.earned && (
                <Lock className="w-4 h-4 absolute top-0 right-0 text-gray-400" />
              )}
            </div>
            <p className="font-bold text-sm text-gray-900">{badge.name}</p>
            <p className="text-xs text-gray-600 mt-1 mb-2">{badge.description}</p>

            {badge.earned && (
              <div className="text-xs text-gray-400 italic">
                Sharing feature coming soon!
              </div>
              /* Placeholder instead of <SocialShare /> */
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BadgeDisplay;
