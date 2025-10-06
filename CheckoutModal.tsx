import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, CreditCard, Shield, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: 'starter' | 'pro' | 'elite';
  userId: string | null;
}

const tierDetails = {
  starter: {
    name: 'Starter',
    price: 49,
    features: [
      'Current + last 2 months packs',
      'AI personalizer',
      'Community access',
      'Swipe of the Month',
      '50 generations/month'
    ]
  },
  pro: {
    name: 'Pro',
    price: 129,
    features: [
      'Full back catalog access',
      'Bulk generation (20 assets/run)',
      'Scheduled exports',
      'Bonus swipes',
      'Quarterly workshops',
      '300 generations/month'
    ]
  },
  elite: {
    name: 'Elite',
    price: 299,
    features: [
      'Everything in Pro',
      'Monthly group clinic',
      'Priority review thread',
      'White-label rights (10 clients)',
      '1000 generations/month'
    ]
  }
};

export function CheckoutModal({ isOpen, onClose, selectedTier, userId }: CheckoutModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { createCheckoutSession } = useSubscription(userId);
  const { toast } = useToast();
  const tier = tierDetails[selectedTier];

  const handleCheckout = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { url } = await createCheckoutSession(selectedTier, email);
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      toast({
        title: 'Checkout failed',
        description: error.message || 'Unable to create checkout session',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Start Your {tier.name} Plan</DialogTitle>
          <DialogDescription>
            7-day free trial • Cancel anytime
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{tier.name} Plan</h3>
              <Badge className="bg-olive-600 text-white">
                ${tier.price}/mo
              </Badge>
            </div>
            <ul className="space-y-2">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-olive-600 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="coach@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                <span>Powered by Stripe</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={loading || !email}
              className="w-full bg-black hover:bg-gray-800"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Start Free Trial
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              After your 7-day trial, you'll be charged ${tier.price}/month.
              Cancel anytime from your billing portal.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}