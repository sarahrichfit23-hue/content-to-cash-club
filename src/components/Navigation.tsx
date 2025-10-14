import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, LogOut, CreditCard, LayoutDashboard } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import NotificationCenter from '@/components/accountability/NotificationCenter';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation: React.FC = () => {
  const { user, profile, subscription, signOut } = useApp();
  const navigate = useNavigate();

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'elite':
        return 'bg-gradient-to-r from-purple-600 to-purple-500';
      case 'pro':
        return 'bg-gradient-to-r from-olive-600 to-olive-500';
      default:
        return 'bg-gray-600';
    }
  };

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'elite':
        return 'Elite';
      case 'pro':
        return 'Pro';
      default:
        return 'Starter';
    }
  };

  const handleSignOut = async () => {
    await signOut(navigate);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-600" />
              <span className="text-xl font-bold text-gray-900">
                Content to Cash Club
              </span>
            </Link>

            {/* Links - Only show when authenticated */}
            {user && (
              <div className="hidden lg:flex items-center gap-6">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/library"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  My Library
                </Link>
                <Link
                  to="/community"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Community
                </Link>
                <Link
                  to="/analytics"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Analytics
                </Link>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Brand DNA Badge */}
                {profile?.brand_dna?.niche && (
                  <div className="hidden md:block px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-xs font-medium text-gray-700">
                      {profile.brand_dna.niche.split(' ').slice(0, 3).join(' ')}
                    </span>
                  </div>
                )}

                {/* Tier Badge */}
                {subscription && (
                  <div
                    className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getTierColor(
                      subscription.tier
                    )}`}
                  >
                    {getTierLabel(subscription.tier)}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-medium rounded-lg hover:shadow-md transition-all"
                >
                  Generate
                </button>

                {/* Notification Center */}
                <NotificationCenter />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <User className="w-5 h-5 text-gray-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/billing')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-medium rounded-lg hover:shadow-md transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
