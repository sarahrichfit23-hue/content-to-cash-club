import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import OnboardingQuiz from "@/components/OnboardingQuiz";

const Onboarding: React.FC = () => {
  const { profile, loading } = useApp();
  const navigate = useNavigate();

  // If profile is loading, show a placeholder
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading your profile...
      </div>
    );
  }

  // If onboarding already complete, redirect to dashboard
  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  // Otherwise, show quiz
  return <OnboardingQuiz />;
};

export default Onboarding;
