import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { LunelleLogo } from '../components/LunelleLogo';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { profile, updateProfile } = useAuth();
  const [step, setStep] = useState(1);

  // Form states
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>(profile?.preferred_language || 'en');
  const [communicationStyle, setCommunicationStyle] = useState<'simple' | 'detailed' | 'conversational'>('simple');
  const [cycleEnabled, setCycleEnabled] = useState(true);
  const [pcosEnabled, setPcosEnabled] = useState(false);
  const [perimenopauseEnabled, setPerimenopauseEnabled] = useState(false);
  const [lifeStage, setLifeStage] = useState('Adult Wellbeing');
  const [reminderOptIn, setReminderOptIn] = useState(true);
  const [consentGiven, setConsentGiven] = useState(true);

  const handleFinish = async () => {
    await updateProfile({
      preferred_language: language,
      communication_style: communicationStyle,
      cycle_tracking_enabled: cycleEnabled,
      pcos_module_enabled: pcosEnabled,
      perimenopause_module_enabled: perimenopauseEnabled,
      data_consent: consentGiven
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#DFE8DA] selection:text-[#345344] font-cute">
      <div className="max-w-xl mx-auto w-full bg-white p-8 rounded-[32px] border-2 border-[#E9E6DD] shadow-[0_16px_45px_-8px_rgba(52,83,68,0.12)]">
        
        {/* Brand Logo Header */}
        <div className="text-center pb-4 mb-4 border-b border-[#E9E6DD]/60">
          <LunelleLogo size="md" showSubtitle={true} className="justify-center" />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E9E6DD]">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-rose tracking-wider">
              Optional Onboarding • Step {step} of 3
            </span>
            <h2 className="font-serif text-2xl font-bold text-deep-sage mt-1">
              {step === 1 && 'Language & Tone'}
              {step === 2 && 'Personal Health Modules'}
              {step === 3 && 'Privacy & Reminders'}
            </h2>
          </div>
          <button
            onClick={onComplete}
            className="text-xs text-text-secondary hover:text-text-primary px-3 py-1 rounded-pill hover:bg-[#FAF8F2]"
          >
            Skip for now
          </button>
        </div>

        {/* Step 1: Language & Communication Style */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2">
                Preferred Language
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'en', label: 'English', desc: 'Standard English' },
                  { id: 'hi', label: 'हिंदी', desc: 'Hindi & Hinglish' },
                  { id: 'mr', label: 'मराठी', desc: 'Marathi' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLanguage(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      language === item.id
                        ? 'border-deep-sage bg-pale-sage/40 text-deep-sage shadow-sm'
                        : 'border-border-soft hover:bg-[#FAF8F2]'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2">
                How should health explanations be phrased?
              </label>
              <div className="space-y-2">
                {[
                  { id: 'simple', label: 'Simple & Concise', desc: 'Everyday terms, direct bullet points, no medical jargon' },
                  { id: 'detailed', label: 'Comprehensive & Clinical', desc: 'In-depth physiological explanations and laboratory contexts' },
                  { id: 'conversational', label: 'Warm & Conversational', desc: 'Empathetic, dialogue-focused, easygoing' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCommunicationStyle(item.id as any)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      communicationStyle === item.id
                        ? 'border-deep-sage bg-pale-sage/40 text-deep-sage shadow-sm'
                        : 'border-border-soft hover:bg-[#FAF8F2]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">{item.desc}</p>
                    </div>
                    {communicationStyle === item.id && <Check className="w-4 h-4 text-deep-sage shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Health Modules */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary mb-2">
              Select which optional health areas you would like visible on your dashboard. You can alter this anytime in Settings.
            </p>

            <div
              onClick={() => setCycleEnabled(!cycleEnabled)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                cycleEnabled ? 'border-deep-sage bg-pale-sage/30' : 'border-border-soft hover:bg-[#FAF8F2]'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-text-primary">Menstrual & Cycle Tracking</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Log period start/end, flow levels, and cycle estimates without medical assumptions.
                </p>
              </div>
              <input
                type="checkbox"
                checked={cycleEnabled}
                onChange={() => {}}
                className="mt-0.5 accent-deep-sage"
              />
            </div>

            <div
              onClick={() => setPcosEnabled(!pcosEnabled)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                pcosEnabled ? 'border-deep-sage bg-pale-sage/30' : 'border-border-soft hover:bg-[#FAF8F2]'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-text-primary">PCOS Support & Education</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Track hormonal breakouts, hirsutism, irregular intervals, and lifestyle observations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={pcosEnabled}
                onChange={() => {}}
                className="mt-0.5 accent-deep-sage"
              />
            </div>

            <div
              onClick={() => setPerimenopauseEnabled(!perimenopauseEnabled)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                perimenopauseEnabled ? 'border-deep-sage bg-pale-sage/30' : 'border-border-soft hover:bg-[#FAF8F2]'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-text-primary">Perimenopause & Menopause</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Track hot flashes, sleep shifts, energy variations, and cycle changes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={perimenopauseEnabled}
                onChange={() => {}}
                className="mt-0.5 accent-deep-sage"
              />
            </div>
          </div>
        )}

        {/* Step 3: Consent & Privacy */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-card bg-[#FAF8F2] border border-border-soft text-xs text-text-secondary space-y-3 leading-relaxed">
              <h4 className="font-bold text-deep-sage text-sm">Privacy & Health Record Commitment</h4>
              <p>
                • Your personal logs, lab reports, and voice entries remain strictly within your account.
              </p>
              <p>
                • Lunelle distinguishes recorded facts from generated educational explanations.
              </p>
              <p>
                • You can export or permanently delete your entire health history at any time with a single tap.
              </p>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-border-soft hover:bg-[#FFFEFC] cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
                className="mt-0.5 accent-deep-sage"
              />
              <span className="text-xs text-text-primary">
                I understand that Lunelle is a personal health organizer and educational platform, not a doctor or diagnostic device.
              </span>
            </label>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-border-soft flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-pill border border-border-soft text-text-secondary hover:text-text-primary text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 shadow-soft"
            >
              <span>Complete Setup</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
