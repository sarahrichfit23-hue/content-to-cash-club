import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

interface PaymentUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  gracePeriodEnd?: string;
}

export function PaymentUpdateModal({ isOpen, onClose, userId, gracePeriodEnd }: PaymentUpdateModalProps) {
  const [loading, setLoading] = useState(false);
  const { createPortalSession } = useSubscription(userId);
  const { toast } = useToast();

  const handleUpdatePayment = async () => {
    setLoading(true);
    try {
      const { url } = await createPortalSession();
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Unable to open billing portal',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = gracePeriodEnd 
    ? Math.ceil((new Date(gracePeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Payment Update Required</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              Your recent payment failed. Please update your payment method within {daysRemaining} days to maintain access to your subscription.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-olive-600 mt-0.5">•</span>
                <span>Update your payment method in the billing portal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-olive-600 mt-0.5">•</span>
                <span>We'll retry the payment automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-olive-600 mt-0.5">•</span>
                <span>Your subscription continues without interruption</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleUpdatePayment}
              disabled={loading}
              className="flex-1 bg-black hover:bg-gray-800"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Opening Portal...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Later
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            You have {daysRemaining} days remaining in your grace period
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
