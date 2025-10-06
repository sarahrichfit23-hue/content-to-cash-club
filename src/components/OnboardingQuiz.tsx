import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { BrandDNA } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import AccountabilitySetup from './onboarding/AccountabilitySetup';
import { supabase } from '@/lib/supabase';

const OnboardingQuiz: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<BrandDNA>>({
    platforms: []
  });
  const [showAccountabilitySetup, setShowAccountabilitySetup] = useState(false);
  const { updateProfile, profile } = useApp();
  const navigate = useNavigate();

  // Redirect to dashboard if already completed onboarding
  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate]);


  const questions = [
    {
      field: 'niche',
      title: 'Who do you serve?',
      subtitle: 'Be specific about your ideal client',
      placeholder: 'e.g., Women 35+ on GLP-1 who want sustainable results'
    },
    {
      field: 'idealClient',
      title: 'Describe your ideal client',
      subtitle: 'What are they like? What do they struggle with?',
      placeholder: 'e.g., Busy professional moms who feel stuck in diet cycles'
    },
    {
      field: 'coreProblem',
      title: 'What\'s their biggest problem?',
      subtitle: 'The one thing keeping them stuck',
      placeholder: 'e.g., Can\'t lose the last 20lbs despite trying everything'
    },
    {
      field: 'coreOutcome',
      title: 'What transformation do you deliver?',
      subtitle: 'The result they desperately want',
      placeholder: 'e.g., Drop 2 dress sizes without giving up wine'
    },
    {
      field: 'programName',
      title: 'What\'s your program called?',
      subtitle: 'Your signature offer name',
      placeholder: 'e.g., The Metabolic Reset Method™'
    },
    {
      field: 'programPrice',
      title: 'What\'s your program price?',
      subtitle: 'Your main offer investment',
      placeholder: 'e.g., $2,997'
    },
    {
      field: 'tone',
      title: 'Choose your content tone',
      subtitle: 'How do you want to sound?',
      type: 'select',
      options: ['Bold/Direct', 'Mentor/Warm', 'Clinical/Expert']
    },
    {
      field: 'platforms',
      title: 'Where do you create content?',
      subtitle: 'Select all that apply',
      type: 'multi',
      options: ['IG Reels', 'IG Carousels', 'IG Stories', 'Email', 'DMs', 'TikTok']
    }
  ];

  const currentQuestion = questions[step];

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Show accountability setup after brand questions
      setShowAccountabilitySetup(true);
    }
  };

  const handleAccountabilityComplete = async (data: {
    postingGoal: number;
    contentTypes: string[];
    checkinTime: string;
  }) => {
    const brandDNA: BrandDNA = {
      ...answers as BrandDNA,
      currencyMetric: 'double revenue in 90 days',
      proofElement: 'client success stories',
      cta: 'Book a Strategy Audit',
      complianceNote: 'Avoid medical claims'
    };
    
    // Save brand DNA to profile
    await updateProfile({
      brand_dna: brandDNA,
      onboarding_completed: true
    });

    // Save accountability preferences
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_accountability').insert({
        user_id: user.id,
        posting_goal: data.postingGoal,
        preferred_content_types: data.contentTypes,
        daily_checkin_time: data.checkinTime
      });
    }
    
    navigate('/dashboard');
  };


  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.field]: value });
  };

  const handleMultiSelect = (value: string) => {
    const current = (answers.platforms || []) as string[];
    const updated = current.includes(value)
      ? current.filter(p => p !== value)
      : [...current, value];
    setAnswers({ ...answers, platforms: updated });
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6 pt-24">
        <div className="max-w-2xl w-full">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {showAccountabilitySetup ? questions.length + 1 : step + 1} of {questions.length + 1}</span>
              <span>{Math.round((showAccountabilitySetup ? 100 : ((step + 1) / (questions.length + 1)) * 100))}% Complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 to-olive-600 transition-all duration-500"
                style={{ width: `${showAccountabilitySetup ? 100 : ((step + 1) / (questions.length + 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {showAccountabilitySetup ? (
              <>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Daily Accountability</h2>
                <p className="text-gray-600 mb-6">Customize your goals and preferences to stay consistent</p>
                <AccountabilitySetup
                  onComplete={handleAccountabilityComplete}
                  onBack={() => setShowAccountabilitySetup(false)}
                />
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentQuestion.title}</h2>
                <p className="text-gray-600 mb-6">{currentQuestion.subtitle}</p>

                {currentQuestion.type === 'select' ? (
                  <div className="space-y-3">
                    {currentQuestion.options?.map(option => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          answers[currentQuestion.field] === option
                            ? 'border-olive-600 bg-olive-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option}</span>
                          {answers[currentQuestion.field] === option && (
                            <Check className="w-5 h-5 text-olive-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : currentQuestion.type === 'multi' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options?.map(option => (
                      <button
                        key={option}
                        onClick={() => handleMultiSelect(option)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          (answers.platforms || []).includes(option)
                            ? 'border-olive-600 bg-olive-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option}</span>
                          {(answers.platforms || []).includes(option) && (
                            <Check className="w-5 h-5 text-olive-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={(answers[currentQuestion.field] as string) || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-olive-600 focus:outline-none resize-none h-32"
                  />
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      step === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion.field] || (currentQuestion.type === 'multi' && (!answers.platforms || answers.platforms.length === 0))}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-olive-600 text-white rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {step === questions.length - 1 ? 'Next: Set Goals' : 'Next'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default OnboardingQuiz;
