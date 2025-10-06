import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
  tier: 'starter' | 'pro' | 'elite';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  grace_period_end: string | null;
}

export interface Invoice {
  id: string;
  stripe_invoice_id: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  invoice_pdf: string;
  hosted_invoice_url: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export function useSubscription(userId: string | null) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }

        setSubscription(subData);

        // Fetch invoices
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (invoiceError && invoiceError.code !== 'PGRST116') {
          throw invoiceError;
        }

        setInvoices(invoiceData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Subscribe to changes
    const subscription = supabase
      .channel(`subscription_${userId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setSubscription(payload.new as Subscription);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const createCheckoutSession = async (tier: 'starter' | 'pro' | 'elite', email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'create-checkout-session',
          userId,
          tier,
          email,
          customerId: subscription?.stripe_customer_id
        }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createPortalSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'create-portal-session',
          userId
        }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateSubscription = async (newTier: 'starter' | 'pro' | 'elite') => {
    if (!subscription?.stripe_subscription_id) {
      throw new Error('No active subscription');
    }

    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'update-subscription',
          subscriptionId: subscription.stripe_subscription_id,
          newTier
        }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const cancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) {
      throw new Error('No active subscription');
    }

    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'cancel-subscription',
          subscriptionId: subscription.stripe_subscription_id
        }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const isInGracePeriod = () => {
    if (!subscription?.grace_period_end) return false;
    return new Date(subscription.grace_period_end) > new Date();
  };

  const hasActiveSubscription = () => {
    return subscription?.status === 'active' || 
           subscription?.status === 'trialing' ||
           (subscription?.status === 'past_due' && isInGracePeriod());
  };

  return {
    subscription,
    invoices,
    loading,
    error,
    createCheckoutSession,
    createPortalSession,
    updateSubscription,
    cancelSubscription,
    isInGracePeriod,
    hasActiveSubscription
  };
}
