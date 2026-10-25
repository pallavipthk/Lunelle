import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ArrowLeft, Loader2, Sparkles, Lock, Mail, User, Flower2, Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LunelleLogo } from '../components/LunelleLogo';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onBackToLanding: () => void;
  onSuccess: (isNewUser: boolean) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onBackToLanding,
  onSuccess
}) => {
  const { login, register } = useAuth();
  const { showToast } = useNotifications();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await register(email, password, preferredName, preferredLanguage);
        showToast('success', 'Account Created', `Welcome to Lunelle, ${preferredName || 'friend'}!`);
        onSuccess(true);
      } else {
        await login(email, password);
        showToast('success', 'Welcome Back', 'Logged in securely.');
        onSuccess(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-center selection:bg-[#DFE8DA] selection:text-[#345344] font-cute py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with back button */}
      <div className="max-w-6xl mx-auto w-full mb-4">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#778078] hover:text-[#345344] px-4 py-2 rounded-full bg-white/90 border border-[#E9E6DD] hover:bg-white shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Lunelle Home</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: 3D REALISTIC VISUAL (WARM HUG FOR LOGIN / LUSH BOUQUET FOR REGISTER) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col space-y-6 pr-4">
          <div className="relative p-6 rounded-[34px] bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F2] to-[#F5ECE1] border-2 border-[#E9E6DD] shadow-[0_20px_50px_-10px_rgba(52,83,68,0.18)] overflow-hidden transition-all duration-500">
            
            {/* Top Tape Sticker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-[#F6EACB] border border-amber-200 text-[11px] font-mono tracking-wide text-[#303B33] shadow-xs rotate-[-1.5deg] mb-4">
              <span>{mode === 'login' ? '♡ The Comforting Sanctuary' : '🌸 Fresh Floral Welcome'}</span>
            </div>

            {/* Realistic 3D Centerpiece Image */}
            <div className="relative rounded-[26px] overflow-hidden border-3 border-white shadow-md mb-5 max-h-[320px]">
              <img
                src={mode === 'login' ? '/assets/auth_hug.jpg' : '/assets/auth_bouquet.jpg'}
                alt={mode === 'login' ? '3D Realistic warm comforting hug' : '3D Realistic lush flower bouquet'}
                className="w-full h-[320px] object-cover rounded-[24px] transform hover:scale-102 transition-transform duration-500"
              />
              
              {/* Floating 3D Badge on Image */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E9E6DD] shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-[#345344]">
                <span>{mode === 'login' ? '☕ Warm cup of tea & rest' : '💐 Handpicked for you'}</span>
              </div>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#345344] tracking-tight leading-snug mb-2">
              {mode === 'login' 
                ? '“Welcome back home to yourself.”' 
                : '“A gentle, private space designed around your rhythm.”'}
            </h2>
            <p className="font-accent italic text-sm text-[#778078] leading-relaxed mb-4">
              {mode === 'login'
                ? 'Your health history, daily symptom patterns, and diagnostic lab reports are safe, private, and ready whenever you are.'
                : 'Welcome to your wellness sanctuary. Log symptoms in your natural voice, understand lab numbers, and listen to your body without judgment.'}
            </p>

            {/* Floating Pinterest Tags */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-[#E9E6DD]/70">
              <span className="text-[10px] px-3 py-1 rounded-full bg-[#DFE8DA]/70 border border-[#A9BFA6]/40 text-[#345344] font-bold">
                🌸 100% Private Data
              </span>
              <span className="text-[10px] px-3 py-1 rounded-full bg-[#F2E0DB]/70 border border-[#B77D78]/30 text-[#B77D78] font-bold">
                ✨ Hinglish Voice Support
              </span>
              <span className="text-[10px] px-3 py-1 rounded-full bg-[#F6EACB] border border-amber-200 text-[#303B33] font-bold">
                ♡ Made with Care
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED AUTHENTICATION CARD */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white py-8 px-6 sm:px-9 shadow-[0_16px_45px_-8px_rgba(52,83,68,0.12)] rounded-[32px] border-2 border-[#E9E6DD] relative text-left">
            {/* Top Consistent Brand Logo */}
            <div className="text-center mb-6">
              <LunelleLogo size="lg" showSubtitle={true} className="justify-center mb-2" />
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#345344] mt-2">
                {mode === 'register' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-xs text-[#778078] font-soft mt-1">
                {mode === 'register' ? 'Begin writing your personal health story' : 'Your private health sanctuary is ready'}
              </p>
            </div>

            {/* Mode Switcher Pill */}
            <div className="flex rounded-pill bg-[#FAF8F2] p-1 border border-border-soft mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-pill transition-all ${
                  mode === 'login' ? 'bg-white text-deep-sage shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-pill transition-all ${
                  mode === 'register' ? 'bg-white text-deep-sage shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Create Account
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs mb-4 text-left">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      What should we call you? (Optional)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-text-secondary absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={preferredName}
                        onChange={e => setPreferredName(e.target.value)}
                        placeholder="e.g. Priya, Ananya"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage focus:ring-1 focus:ring-deep-sage"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={e => setPreferredLanguage(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage focus:ring-1 focus:ring-deep-sage"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi & Hinglish)</option>
                      <option value="mr">मराठी (Marathi)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage focus:ring-1 focus:ring-deep-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage focus:ring-1 focus:ring-deep-sage"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 shadow-soft transition-all disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{mode === 'register' ? 'Create Your Health Sanctuary' : 'Log In to Lunelle'}</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-border-soft/60 flex items-center justify-center gap-2 text-[11px] text-text-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-botanical-green" />
              <span>Private, authorized data isolation. Never shared with third parties.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
