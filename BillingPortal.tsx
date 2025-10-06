import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, Calendar, Download, AlertTriangle, 
  CheckCircle, XCircle, Loader2, ExternalLink,
  ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BillingPortalProps {
  userId: string;
}

const tierColors = {
  starter: 'bg-gray-600',
  pro: 'bg-olive-600',
  elite: 'bg-mustard-600'
};

const tierNames = {
  starter: 'Starter',
  pro: 'Pro',
  elite: 'Elite'
};

export function BillingPortal({ userId }: BillingPortalProps) {
  const { 
    subscription, 
    invoices, 
    loading, 
    createPortalSession,
    updateSubscription,
    cancelSubscription,
    isInGracePeriod,
    hasActiveSubscription
  } = useSubscription(userId);
  
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleManageBilling = async () => {
    setActionLoading('portal');
    try {
      const { url } = await createPortalSession();
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Unable to open billing portal',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async (newTier: 'pro' | 'elite') => {
    setActionLoading(`upgrade-${newTier}`);
    try {
      await updateSubscription(newTier);
      toast({
        title: 'Subscription upgraded!',
        description: `You've been upgraded to the ${tierNames[newTier]} plan.`
      });
    } catch (error: any) {
      toast({
        title: 'Upgrade failed',
        description: error.message || 'Unable to upgrade subscription',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDowngrade = async (newTier: 'starter' | 'pro') => {
    setActionLoading(`downgrade-${newTier}`);
    try {
      await updateSubscription(newTier);
      toast({
        title: 'Subscription changed',
        description: `You'll be moved to the ${tierNames[newTier]} plan at the end of your billing period.`
      });
    } catch (error: any) {
      toast({
        title: 'Change failed',
        description: error.message || 'Unable to change subscription',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll lose access at the end of your billing period.')) {
      return;
    }

    setActionLoading('cancel');
    try {
      await cancelSubscription();
      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription will end at the end of the current billing period.'
      });
    } catch (error: any) {
      toast({
        title: 'Cancellation failed',
        description: error.message || 'Unable to cancel subscription',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No active subscription found. Choose a plan to get started.
        </AlertDescription>
      </Alert>
    );
  }

  const isActive = hasActiveSubscription();
  const inGracePeriod = isInGracePeriod();

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Manage your plan and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">
                  {tierNames[subscription.tier]} Plan
                </h3>
                <Badge className={tierColors[subscription.tier]}>
                  ${subscription.tier === 'starter' ? 49 : subscription.tier === 'pro' ? 129 : 299}/mo
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {subscription.status === 'trialing' && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Trial ends {format(new Date(subscription.trial_end!), 'MMM d, yyyy')}
                  </span>
                )}
                {subscription.status === 'active' && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Active
                  </span>
                )}
                {subscription.status === 'past_due' && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-600" />
                    Payment failed
                  </span>
                )}
                {subscription.cancel_at_period_end && (
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-red-600" />
                    Cancels {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={handleManageBilling}
              variant="outline"
              disabled={actionLoading === 'portal'}
            >
              {actionLoading === 'portal' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </>
              )}
            </Button>
          </div>

          {inGracePeriod && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                Your payment failed. Please update your payment method by{' '}
                {format(new Date(subscription.grace_period_end!), 'MMM d, yyyy')} to avoid service interruption.
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">Billing Period</p>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {format(new Date(subscription.current_period_start), 'MMM d, yyyy')} - 
                {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Changes */}
      {isActive && !subscription.cancel_at_period_end && (
        <Card>
          <CardHeader>
            <CardTitle>Change Plan</CardTitle>
            <CardDescription>Upgrade or downgrade your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {subscription.tier === 'starter' && (
                <>
                  <Button
                    onClick={() => handleUpgrade('pro')}
                    disabled={actionLoading === 'upgrade-pro'}
                    className="justify-between"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowUpCircle className="w-4 h-4" />
                      Upgrade to Pro ($129/mo)
                    </span>
                    {actionLoading === 'upgrade-pro' && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleUpgrade('elite')}
                    disabled={actionLoading === 'upgrade-elite'}
                    className="justify-between"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowUpCircle className="w-4 h-4" />
                      Upgrade to Elite ($299/mo)
                    </span>
                    {actionLoading === 'upgrade-elite' && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </Button>
                </>
              )}
              
              {subscription.tier === 'pro' && (
                <>
                  <Button
                    onClick={() => handleDowngrade('starter')}
                    disabled={actionLoading === 'downgrade-starter'}
                    className="justify-between"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4" />
                      Downgrade to Starter ($49/mo)
                    </span>
                    {actionLoading === 'downgrade-starter' && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleUpgrade('elite')}
                    disabled={actionLoading === 'upgrade-elite'}
                    className="justify-between"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowUpCircle className="w-4 h-4" />
                      Upgrade to Elite ($299/mo)
                    </span>
                    {actionLoading === 'upgrade-elite' && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </Button>
                </>
              )}
              
              {subscription.tier === 'elite' && (
                <>
                  <Button
                    onClick={() => handleDowngrade('pro')}
                    disabled={actionLoading === 'downgrade-pro'}
                    className="justify-between"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4" />
                      Downgrade to Pro ($129/mo)
                    </span>
                    {actionLoading === 'downgrade-pro' && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDowngrade('starter')}
                    disabled={actionLoading === 'downgrade-starter'}
                    className="justify-between"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4" />
                      Downgrade to Starter ($49/mo)
                    </span>
                    {actionLoading === 'downgrade-starter' && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </Button>
                </>
              )}

              <Button
                onClick={handleCancel}
                disabled={actionLoading === 'cancel'}
                variant="destructive"
                className="mt-2"
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-gray-500">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      ${(invoice.amount_paid / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {invoice.status}
                    </Badge>
                    {invoice.invoice_pdf && (
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                      >
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BillingPortal;