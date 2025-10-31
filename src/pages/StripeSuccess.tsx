import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '@/lib/supabase'; // ✅ Added

const StripeSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          console.warn('Missing Stripe session ID');
          navigate('/login');
          return;
        }

        // 👇 Hit your backend API route to verify this session with Stripe
        const response = await axios.get(`/api/stripe/verify?session_id=${sessionId}`);

        if (response.data?.success) {
          console.log('✅ Payment verified, updating Supabase profile...');

          // 🪄 1️⃣ Get the current Supabase user
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            console.warn('No Supabase user found after payment');
            navigate('/login');
            return;
          }

          // 🪄 2️⃣ Update has_paid flag in the profiles table
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ has_paid: true })
            .eq('id', user.id);

          if (updateError) {
            console.error('❌ Failed to update has_paid:', updateError.message);
          } else {
            console.log('✅ Supabase profile updated: has_paid = true');
          }

          // 🧭 3️⃣ Redirect to onboarding quiz (Onboarding page)
          navigate('/onboarding');
        } else {
          console.warn('Stripe session not verified');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        navigate('/login');
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h2>🎉 Payment successful!</h2>
      <p>We’re setting up your account...</p>
      <p>You’ll be redirected to your BrandDNA onboarding in a moment.</p>
    </div>
  );
};

export default StripeSuccess;
