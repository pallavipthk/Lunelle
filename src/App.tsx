import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navigation, NavTab } from './components/Navigation';
import { HinglishVoiceModal } from './components/HinglishVoiceModal';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { MyHealthPage } from './pages/MyHealthPage';
import { SymptomTrackerPage } from './pages/SymptomTrackerPage';
import { WomensHealthPage } from './pages/WomensHealthPage';
import { HealthInsightsPage } from './pages/HealthInsightsPage';
import { LabReportsPage } from './pages/LabReportsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { GuidedAssessmentPage } from './pages/GuidedAssessmentPage';
import { RemindersPage } from './pages/RemindersPage';
import { MedicalVaultPage } from './pages/MedicalVaultPage';
import { HealthEducationPage } from './pages/HealthEducationPage';
import { SettingsPrivacyPage } from './pages/SettingsPrivacyPage';
import { Loader2, HeartPulse, Sparkles, BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  const { user, profile, isLoading } = useAuth();

  // Screen view state
  const [viewState, setViewState] = useState<'landing' | 'auth' | 'onboarding' | 'app'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // App navigation state
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-deep-sage flex items-center justify-center text-butter-cream font-serif text-xl font-bold shadow-soft mb-4">
          L
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <Loader2 className="w-4 h-4 animate-spin text-deep-sage" />
          <span>Opening Lunelle...</span>
        </div>
      </div>
    );
  }

  // 1. If not logged in and on landing
  if (!user && viewState === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => {
          setAuthMode('register');
          setViewState('auth');
        }}
        onLogIn={() => {
          setAuthMode('login');
          setViewState('auth');
        }}
      />
    );
  }

  // 2. Auth Page
  if (!user && viewState === 'auth') {
    return (
      <AuthPage
        initialMode={authMode}
        onBackToLanding={() => setViewState('landing')}
        onSuccess={(isNewUser) => {
          if (isNewUser) {
            setViewState('onboarding');
          } else {
            setViewState('app');
          }
        }}
      />
    );
  }

  // 3. Optional Onboarding for new accounts
  if (user && viewState === 'onboarding') {
    return (
      <OnboardingPage
        onComplete={() => setViewState('app')}
      />
    );
  }

  // 4. Authenticated Main Application
  return (
    <div className="min-h-screen bg-background flex">
      {/* Navigation Sidebar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setShowAssessment(false);
          setShowEducation(false);
        }}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top utility sub-bar */}
        <header className="px-6 py-3.5 bg-white/70 backdrop-blur-sm border-b border-border-soft flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-deep-sage capitalize">
              {showAssessment ? 'Guided Assessment' : showEducation ? 'Health Education' : currentTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAssessment(!showAssessment);
                setShowEducation(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
                showAssessment
                  ? 'bg-deep-sage text-butter-cream'
                  : 'bg-[#FAF8F2] border border-border-soft text-text-secondary hover:text-text-primary'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guided Assessment</span>
            </button>

            <button
              onClick={() => {
                setShowEducation(!showEducation);
                setShowAssessment(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
                showEducation
                  ? 'bg-deep-sage text-butter-cream'
                  : 'bg-[#FAF8F2] border border-border-soft text-text-secondary hover:text-text-primary'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Education Library</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto">
          {showAssessment ? (
            <GuidedAssessmentPage />
          ) : showEducation ? (
            <HealthEducationPage />
          ) : (
            <>
              {currentTab === 'overview' && (
                <DashboardOverview
                  onNavigate={(tab) => {
                    setCurrentTab(tab);
                    setShowAssessment(false);
                    setShowEducation(false);
                  }}
                  onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                />
              )}
              {currentTab === 'my-health' && <MyHealthPage />}
              {currentTab === 'symptoms' && (
                <SymptomTrackerPage onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />
              )}
              {currentTab === 'womens-health' && <WomensHealthPage />}
              {currentTab === 'insights' && <HealthInsightsPage />}
              {currentTab === 'lab-reports' && <LabReportsPage />}
              {currentTab === 'assistant' && (
                <AIAssistantPage onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />
              )}
              {currentTab === 'reminders' && <RemindersPage />}
              {currentTab === 'vault' && <MedicalVaultPage />}
              {currentTab === 'settings' && <SettingsPrivacyPage />}
            </>
          )}
        </div>
      </main>

      {/* Global Hinglish Voice Modal */}
      <HinglishVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSymptomSaved={() => {
          // If on symptoms or overview, trigger fresh view
        }}
      />
    </div>
  );
};
