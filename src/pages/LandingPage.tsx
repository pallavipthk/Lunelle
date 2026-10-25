import React from 'react';
import { 
  Sparkles, 
  Activity, 
  FileText, 
  ShieldCheck, 
  Bell, 
  Flower2, 
  Mic, 
  Lock, 
  ArrowRight,
  Heart,
  TrendingUp,
  Calendar,
  Check,
  Smile,
  Zap,
  Shield,
  Clock,
  Compass,
  Star,
  BookmarkCheck
} from 'lucide-react';
import { LunelleLogo } from '../components/LunelleLogo';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogIn }) => {
  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#303B33] selection:bg-[#DFE8DA] selection:text-[#345344] font-cute overflow-x-hidden">
      
      {/* 1. TOP HEADER - Strictly just Logo on Left + Log In & Get Started on Right */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#EFECE3]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Consistent Brand Logo */}
          <LunelleLogo size="md" showSubtitle={true} />

          {/* Right Action Buttons with 3D Claymorphic Depth */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLogIn}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-[#303B33] bg-white border border-[#E9E6DD] hover:bg-[#FAF8F2] shadow-[0_4px_12px_rgba(52,83,68,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] transition-all cursor-pointer hover:border-[#345344]"
            >
              Log In
            </button>
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 rounded-full bg-gradient-to-b from-[#3D6250] to-[#2B4438] text-[#F6EACB] text-xs font-bold shadow-[0_8px_20px_-3px_rgba(52,83,68,0.3),inset_0_2px_4px_rgba(255,255,255,0.25)] hover:shadow-[0_12px_24px_-4px_rgba(52,83,68,0.35)] transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION - Soft Typography, 3D Elements & Hero Woman Illustration */}
      <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto">
        {/* Glowing 3D Pastel Ambient Orbs */}
        <div className="absolute top-6 left-1/4 w-80 h-80 bg-gradient-to-br from-[#DFE8DA]/50 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#F2E0DB]/45 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-br from-[#F6EACB]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 text-left space-y-6">
            
            {/* Cute 3D Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#E9E6DD] shadow-[0_6px_16px_-3px_rgba(52,83,68,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] text-[11px] font-semibold text-[#345344]">
              <span className="text-[#B77D78]">🌸</span>
              <span>A little more in tune with you</span>
              <span className="text-[#A9BFA6]">✦</span>
            </div>

            {/* Main Headline with Soft Romantic Serif & Cursive Accent */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#345344] tracking-tight leading-[1.08]">
              Your health,<br />
              <span className="font-accent italic font-normal text-[#B77D78]">your story.</span> <span className="text-[#B77D78] text-4xl sm:text-5xl inline-block transform hover:scale-110 transition-transform">♡</span>
            </h1>

            {/* Supporting Subtext in Cute Font */}
            <p className="text-base sm:text-lg text-[#5A635B] max-w-lg leading-relaxed font-cute font-medium">
              Understand your body patterns, keep your medical records private, and make sense of symptoms & lab reports—with gentle clarity and calm confidence.
            </p>

            {/* 3D Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-b from-[#3D6250] to-[#2B4438] text-[#F6EACB] text-sm font-bold shadow-[0_10px_25px_-5px_rgba(52,83,68,0.35),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:shadow-[0_14px_30px_-5px_rgba(52,83,68,0.4)] transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Begin Your Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLogIn}
                className="px-8 py-4 rounded-full text-sm font-bold text-[#303B33] bg-white border-2 border-[#E9E6DD] hover:border-[#345344] shadow-[0_6px_18px_rgba(52,83,68,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all cursor-pointer"
              >
                Log In
              </button>
            </div>

            {/* Three 3D Cute Pillar Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E9E6DD]">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 border border-[#E9E6DD] shadow-[0_4px_14px_rgba(52,83,68,0.05)] hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#DFE8DA] to-[#CFDDCA] text-[#345344] flex items-center justify-center shadow-xs shrink-0 border border-[#A9BFA6]/40">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#303B33] leading-none">Voice & Text</p>
                  <p className="text-[10px] text-[#778078] mt-1 font-medium">Hinglish & English</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 border border-[#E9E6DD] shadow-[0_4px_14px_rgba(52,83,68,0.05)] hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#DFE8DA] to-[#CFDDCA] text-[#345344] flex items-center justify-center shadow-xs shrink-0 border border-[#A9BFA6]/40">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#303B33] leading-none">100% Private</p>
                  <p className="text-[10px] text-[#778078] mt-1 font-medium">Your data is safe</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 border border-[#E9E6DD] shadow-[0_4px_14px_rgba(52,83,68,0.05)] hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#F2E0DB] to-[#E5CBC4] text-[#B77D78] flex items-center justify-center shadow-xs shrink-0 border border-[#B77D78]/30">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#303B33] leading-none">Personalized</p>
                  <p className="text-[10px] text-[#778078] mt-1 font-medium">Just for you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Composition (Large Side Image + Small 3D Elements) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Small 3D Floating Element 1: Cute Clay Heart */}
            <div className="absolute -top-3 -left-2 z-20 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5E2DE] to-[#E8CBC3] text-[#B77D78] flex items-center justify-center shadow-[0_8px_20px_rgba(183,125,120,0.3)] border-2 border-white transform rotate-[-8deg] hover:rotate-0 transition-transform cursor-pointer">
              <Heart className="w-5 h-5 fill-[#B77D78]" />
            </div>

            {/* Small 3D Floating Element 2: Golden Sparkle Orb */}
            <div className="absolute -top-5 right-1/4 z-20 w-8 h-8 rounded-full bg-gradient-to-br from-[#F6EACB] to-[#ECDCAE] text-amber-700 flex items-center justify-center shadow-md border-2 border-white transform hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Small 3D Floating Element 3: Bottom Left Botanical Tag */}
            <div className="absolute -bottom-3 -left-2 z-20 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E9E6DD] shadow-[0_8px_20px_rgba(52,83,68,0.12)] flex items-center gap-1.5 text-[11px] font-bold text-[#345344] transform rotate-[-2deg] hover:rotate-0 transition-transform">
              <span className="text-[#A9BFA6]">🌸</span>
              <span>Listen to your body ♡</span>
            </div>

            {/* Main Lifestyle Photo Frame with Large 3D Prominence */}
            <div className="relative w-full max-w-lg lg:max-w-xl rounded-[38px] overflow-hidden bg-white p-2.5 border-4 border-white shadow-[0_28px_70px_-15px_rgba(52,83,68,0.26),0_0_0_1px_rgba(52,83,68,0.06),inset_0_2px_4px_rgba(255,255,255,0.95)]">
              <img
                src="/assets/hero_woman_exact.png"
                alt="Young woman smiling peacefully with morning tea and wellness journal"
                className="w-full h-auto object-cover rounded-[30px] max-h-[500px] transform hover:scale-102 transition-transform duration-500"
              />

              {/* 3D Floating Cute Polaroid Note Sticker */}
              <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#E9E6DD] shadow-[0_10px_24px_-4px_rgba(52,83,68,0.14),inset_0_1px_2px_rgba(255,255,255,0.9)] text-right rotate-[3deg] hover:rotate-0 transition-transform">
                <p className="font-accent italic text-xs text-[#345344] font-bold leading-tight">
                  Small steps,<br />big changes ♡
                </p>
              </div>

              {/* 3D Stack of Wellness Blocks */}
              <div className="absolute bottom-5 right-5 space-y-1.5">
                <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#DFE8DA] to-[#CFDDCA] text-[10px] font-bold text-[#345344] shadow-sm border border-[#A9BFA6]/40">
                  ✨ Better Health
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F2E0DB] to-[#E5CBC4] text-[10px] font-bold text-[#B77D78] shadow-sm border border-[#B77D78]/30">
                  🌸 Brighter Days
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F6EACB] to-[#ECDCAE] text-[10px] font-bold text-[#303B33] shadow-sm border border-[#ECDCAE]/50">
                  ♡ You Got This
                </div>
              </div>
            </div>

            {/* Floating 3D Mobile Phone with Realistic Depth */}
            <div className="absolute -right-2 sm:-right-4 bottom-2 w-64 bg-white rounded-[34px] p-3 shadow-[0_25px_60px_-15px_rgba(52,83,68,0.3),0_0_0_1px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.95)] border-4 border-[#303B33] hidden sm:block transform rotate-[1deg] hover:rotate-0 transition-transform">
              {/* Phone notch */}
              <div className="w-20 h-3.5 bg-[#303B33] rounded-full mx-auto mb-2" />

              {/* In-app header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE1] px-1">
                <span className="font-serif text-xs font-bold text-[#345344]">🌿 Lunelle</span>
                <span className="w-2 h-2 rounded-full bg-[#A9BFA6] shadow-xs" />
              </div>

              {/* In-app user greeting */}
              <div className="py-2.5 text-left px-1">
                <p className="text-[11px] font-bold text-[#303B33]">Good morning, Ananya ♡</p>
                <p className="text-[9px] text-[#778078]">Take a moment to check in with yourself.</p>
              </div>

              {/* In-app mood selector with 3D rounded tiles */}
              <div className="bg-[#FAF8F2] p-2.5 rounded-2xl border border-[#E9E6DD] text-left mb-2.5 shadow-xs">
                <p className="text-[9px] font-bold text-[#303B33] mb-1.5">How are you feeling today?</p>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {[
                    { label: 'Great', icon: '🌸' },
                    { label: 'Good', icon: '✨' },
                    { label: 'Okay', icon: '🌿' },
                    { label: 'Low', icon: '☕' },
                    { label: 'Not well', icon: '🌙' }
                  ].map((m, i) => (
                    <div key={i} className="p-1 rounded-xl bg-white border border-[#E9E6DD] text-[8px] font-semibold text-[#778078] shadow-xs hover:border-[#345344] transition-colors">
                      <div className="text-xs">{m.icon}</div>
                      <div>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In-app quick actions */}
              <div className="space-y-1.5 text-left mb-2">
                <div className="p-1.5 rounded-xl bg-white border border-[#E9E6DD] text-[9px] font-medium text-[#303B33] flex items-center gap-1.5 shadow-xs">
                  <Activity className="w-3 h-3 text-[#A9BFA6]" />
                  <span>Log Symptom</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white border border-[#E9E6DD] text-[9px] font-medium text-[#303B33] flex items-center gap-1.5 shadow-xs">
                  <Mic className="w-3 h-3 text-[#B77D78]" />
                  <span>Voice Note (Hinglish)</span>
                </div>
                <div className="p-1.5 rounded-xl bg-white border border-[#E9E6DD] text-[9px] font-medium text-[#303B33] flex items-center gap-1.5 shadow-xs">
                  <FileText className="w-3 h-3 text-[#345344]" />
                  <span>Interpret Lab Report</span>
                </div>
              </div>

              {/* In-app bottom nav */}
              <div className="flex items-center justify-around pt-1.5 border-t border-[#F0ECE1] text-[8px] text-[#778078]">
                <span className="text-[#345344] font-bold">Home</span>
                <span>Health</span>
                <span className="w-5 h-5 rounded-full bg-[#345344] text-white flex items-center justify-center shadow-xs font-bold">+</span>
                <span>Insights</span>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SUB-HERO 6-PILLAR RIBBON ("A more complete picture of your health") */}
      <section className="py-16 px-6 bg-[#FAF7F0] border-y border-[#E9E6DD]">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B77D78] uppercase tracking-wider mb-2">
              <span>✦</span>
              <span>Holistic Women's Wellness</span>
              <span>✦</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#345344]">
              A more complete picture of your health
            </h2>
            <p className="text-xs sm:text-sm text-[#778078] max-w-xl mx-auto mt-2 leading-relaxed font-cute">
              From everyday symptoms to long-term patterns, Lunelle brings everything together in one private, cozy space.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {/* 1. Track Symptoms */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer p-3 rounded-2xl hover:bg-white transition-all">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#F5E2DE] to-[#E8CBC3] text-[#B77D78] flex items-center justify-center shadow-[0_6px_16px_rgba(183,125,120,0.25)] group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-[#303B33]">Track Symptoms</h3>
              <p className="text-[11px] text-[#778078] leading-tight">Log how you feel, in your own words.</p>
            </div>

            {/* 2. Understand Reports */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer p-3 rounded-2xl hover:bg-white transition-all">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E2ECDE] to-[#CFDECB] text-[#345344] flex items-center justify-center shadow-[0_6px_16px_rgba(52,83,68,0.2)] group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-[#303B33]">Understand Reports</h3>
              <p className="text-[11px] text-[#778078] leading-tight">Get clear, simple explanations.</p>
            </div>

            {/* 3. Find Patterns */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer p-3 rounded-2xl hover:bg-white transition-all">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#F7EDD1] to-[#E9DCB5] text-[#303B33] flex items-center justify-center shadow-[0_6px_16px_rgba(246,234,203,0.4)] group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-[#303B33]">Find Patterns</h3>
              <p className="text-[11px] text-[#778078] leading-tight">See insights from your real data.</p>
            </div>

            {/* 4. Women's Health */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer p-3 rounded-2xl hover:bg-white transition-all">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#F5E2DE] to-[#E8CBC3] text-[#B77D78] flex items-center justify-center shadow-[0_6px_16px_rgba(183,125,120,0.25)] group-hover:scale-105 transition-transform">
                <Flower2 className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-[#303B33]">Women's Health</h3>
              <p className="text-[11px] text-[#778078] leading-tight">Cycle, PCOS & more — your choice.</p>
            </div>

            {/* 5. Stay Prepared */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer p-3 rounded-2xl hover:bg-white transition-all">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E2ECDE] to-[#CFDECB] text-[#345344] flex items-center justify-center shadow-[0_6px_16px_rgba(52,83,68,0.2)] group-hover:scale-105 transition-transform">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-[#303B33]">Stay Prepared</h3>
              <p className="text-[11px] text-[#778078] leading-tight">Reminders for meds & care.</p>
            </div>

            {/* 6. Keep It Private */}
            <div className="flex flex-col items-center space-y-3 group cursor-pointer p-3 rounded-2xl hover:bg-white transition-all">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E5ECE1] to-[#D5E0D0] text-[#345344] flex items-center justify-center shadow-[0_6px_16px_rgba(52,83,68,0.2)] group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-[#303B33]">Keep It Private</h3>
              <p className="text-[11px] text-[#778078] leading-tight">Your data, your control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MIDDLE SECTION ("Intelligent support for every stage") */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: 3D Tablet UI Mockup */}
          <div className="lg:col-span-7 relative">
            <div className="w-full bg-[#FAF8F2] rounded-[34px] p-4 border-4 border-[#303B33] text-left shadow-[0_25px_60px_-15px_rgba(52,83,68,0.25)]">
              {/* Tablet Screen */}
              <div className="bg-white rounded-2xl p-5 border border-[#E9E6DD] shadow-inner">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1] mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#345344]">Good morning, Ananya ♡</h3>
                    <p className="text-[11px] text-[#778078]">Here is your wellness summary for today.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-3 py-1 rounded-full bg-[#DFE8DA] text-[#345344] font-bold border border-[#A9BFA6]/40">Today</span>
                  </div>
                </div>

                {/* Dashboard 4-card grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#E9E6DD] shadow-xs hover:border-[#345344] transition-colors">
                    <div className="flex items-center justify-between text-[10px] text-[#778078] mb-1">
                      <span>Recent Symptom</span>
                      <span className="text-[8px] font-mono text-[#345344]">2 days ago</span>
                    </div>
                    <p className="text-xs font-bold text-[#303B33]">Headache</p>
                    <p className="text-[10px] text-[#778078]">Mild • 2 hours</p>
                    <span className="text-[10px] text-[#345344] font-semibold hover:underline block mt-2">View details →</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#E9E6DD] shadow-xs hover:border-[#345344] transition-colors">
                    <div className="flex items-center justify-between text-[10px] text-[#778078] mb-1">
                      <span>Upcoming Reminder</span>
                      <span className="text-[8px] font-mono text-[#345344]">Tomorrow</span>
                    </div>
                    <p className="text-xs font-bold text-[#303B33]">Vitamin D</p>
                    <p className="text-[10px] text-[#778078]">Tomorrow, 9:00 AM</p>
                    <span className="text-[10px] text-[#345344] font-semibold hover:underline block mt-2">View all →</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#E9E6DD] shadow-xs hover:border-[#345344] transition-colors">
                    <div className="flex items-center justify-between text-[10px] text-[#778078] mb-1">
                      <span>Latest Lab Report</span>
                      <span className="text-[8px] font-mono text-[#345344]">Verified</span>
                    </div>
                    <p className="text-xs font-bold text-[#303B33]">CBC & Thyroid</p>
                    <p className="text-[10px] text-[#778078]">Uploaded on 12 Apr 2026</p>
                    <span className="text-[10px] text-[#345344] font-semibold hover:underline block mt-2">View report →</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#E9E6DD] shadow-xs hover:border-[#345344] transition-colors">
                    <div className="flex items-center justify-between text-[10px] text-[#B77D78] font-bold mb-1">
                      <span>Health Insight</span>
                      <span className="text-[8px] font-mono text-[#B77D78]">Pattern</span>
                    </div>
                    <p className="text-xs font-bold text-[#303B33]">Sleep & Headache link</p>
                    <p className="text-[10px] text-[#778078]">Observed across 3 logs</p>
                    <span className="text-[10px] text-[#345344] font-semibold hover:underline block mt-2">View insights →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pitch & 3D CTA Button */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[#B77D78]">
              <span>✦</span>
              <span>YOUR HEALTH, IN YOUR HANDS</span>
              <span>✦</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#345344] tracking-tight leading-snug">
              Intelligent support for every stage.
            </h2>

            <p className="text-sm sm:text-base text-[#5A635B] leading-relaxed font-cute">
              Track, understand, and take charge of your health—with empathetic AI, real personal data, and a gentle approach to your well-being.
            </p>

            <div>
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-b from-[#3D6250] to-[#2B4438] text-[#F6EACB] text-xs font-bold shadow-[0_10px_25px_-5px_rgba(52,83,68,0.35)] hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. "HOW IT WORKS" 3-STEP JOURNEY */}
      <section className="py-20 px-6 bg-[#FAF7F0] border-t border-[#E9E6DD]">
        <div className="max-w-5xl mx-auto text-center space-y-14">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B77D78] uppercase tracking-wider mb-2">
              <span>🌸</span>
              <span>Simple & Intuitive</span>
              <span>🌸</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#345344]">
              How Lunelle Works
            </h2>
            <p className="text-xs sm:text-sm text-[#778078] mt-2 font-accent italic text-base">
              A gentle journey, designed around you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-7 rounded-[28px] bg-white border border-[#E9E6DD] text-center space-y-4 shadow-[0_8px_24px_rgba(52,83,68,0.06)] hover:shadow-md transition-all">
              <div className="flex items-center justify-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DFE8DA] to-[#CFDDCA] text-[#345344] font-serif font-bold text-sm flex items-center justify-center border border-[#A9BFA6]/40 shadow-xs">
                  1
                </span>
                <span className="text-2xl">✏️</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#345344]">
                Record what matters
              </h3>
              <p className="text-xs text-[#778078] leading-relaxed font-cute">
                Log symptoms, periods, or lab reports—in your own natural words via voice or text.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-[28px] bg-white border border-[#E9E6DD] text-center space-y-4 shadow-[0_8px_24px_rgba(52,83,68,0.06)] hover:shadow-md transition-all">
              <div className="flex items-center justify-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DFE8DA] to-[#CFDDCA] text-[#345344] font-serif font-bold text-sm flex items-center justify-center border border-[#A9BFA6]/40 shadow-xs">
                  2
                </span>
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#345344]">
                Understand your numbers
              </h3>
              <p className="text-xs text-[#778078] leading-relaxed font-cute">
                Get clear, friendly explanations and lab reference ranges without confusing medical jargon.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-[28px] bg-white border border-[#E9E6DD] text-center space-y-4 shadow-[0_8px_24px_rgba(52,83,68,0.06)] hover:shadow-md transition-all">
              <div className="flex items-center justify-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DFE8DA] to-[#CFDDCA] text-[#345344] font-serif font-bold text-sm flex items-center justify-center border border-[#A9BFA6]/40 shadow-xs">
                  3
                </span>
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#345344]">
                Feel in tune over time
              </h3>
              <p className="text-xs text-[#778078] leading-relaxed font-cute">
                Discover explainable patterns in your health history with full transparency and calm reassurance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PINTEREST LOVE NOTES / TESTIMONIALS */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center space-y-12">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B77D78] uppercase tracking-wider mb-2">
            <span>♡</span>
            <span>Real Stories</span>
            <span>♡</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#345344]">
            Loved by women everywhere
          </h2>
          <p className="text-xs sm:text-sm text-[#778078] mt-2 font-accent italic text-base">
            Gentle feedback from our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-[28px] bg-white border border-[#E9E6DD] shadow-[0_8px_24px_rgba(52,83,68,0.06)] space-y-3 transform rotate-[-0.8deg] hover:rotate-0 transition-transform">
            <div className="flex items-center gap-1 text-[#B77D78]">
              {'★'.repeat(5)}
            </div>
            <p className="text-xs text-[#5A635B] leading-relaxed font-cute">
              "Lunelle helped me connect the dots between my low ferritin and mid-cycle fatigue. Having my lab reports explained simply was a life-saver."
            </p>
            <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
              <span className="text-xs font-bold text-[#345344]">Ananya S.</span>
              <span className="text-[10px] text-[#778078]">Bangalore</span>
            </div>
          </div>

          <div className="p-6 rounded-[28px] bg-white border border-[#E9E6DD] shadow-[0_8px_24px_rgba(52,83,68,0.06)] space-y-3 transform rotate-[0.8deg] hover:rotate-0 transition-transform">
            <div className="flex items-center gap-1 text-[#B77D78]">
              {'★'.repeat(5)}
            </div>
            <p className="text-xs text-[#5A635B] leading-relaxed font-cute">
              "Being able to speak in Hinglish and have my symptoms understood without judgment feels like talking to an empathetic doctor friend."
            </p>
            <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
              <span className="text-xs font-bold text-[#345344]">Pooja M.</span>
              <span className="text-[10px] text-[#778078]">Mumbai</span>
            </div>
          </div>

          <div className="p-6 rounded-[28px] bg-white border border-[#E9E6DD] shadow-[0_8px_24px_rgba(52,83,68,0.06)] space-y-3 transform rotate-[-0.5deg] hover:rotate-0 transition-transform">
            <div className="flex items-center gap-1 text-[#B77D78]">
              {'★'.repeat(5)}
            </div>
            <p className="text-xs text-[#5A635B] leading-relaxed font-cute">
              "The cleanest, most respectful women's health journal I've used. No creepy trackers, no ads, just true peace of mind."
            </p>
            <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
              <span className="text-xs font-bold text-[#345344]">Dr. Radhika K.</span>
              <span className="text-[10px] text-[#778078]">Delhi</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WARM BOTTOM CALL TO ACTION */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="p-10 sm:p-14 rounded-[36px] bg-gradient-to-br from-[#FAF7F0] via-[#F2E0DB]/30 to-[#DFE8DA]/40 border-2 border-[#E9E6DD] text-center space-y-6 shadow-[0_16px_40px_rgba(52,83,68,0.1)]">
          <span className="text-3xl">🌸</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#345344]">
            Start your wellness story today.
          </h2>
          <p className="text-sm text-[#5A635B] max-w-md mx-auto leading-relaxed font-cute">
            Join thousands of women who are learning to listen to their bodies with gentle clarity and confidence.
          </p>
          <div>
            <button
              onClick={onGetStarted}
              className="px-9 py-4 rounded-full bg-gradient-to-b from-[#3D6250] to-[#2B4438] text-[#F6EACB] text-sm font-bold shadow-[0_10px_25px_-5px_rgba(52,83,68,0.35)] hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              Get Started with Lunelle ♡
            </button>
          </div>
        </div>
      </section>

      {/* 8. MINIMAL CLEAN FOOTER */}
      <footer className="py-12 px-6 bg-white border-t border-[#E9E6DD] text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3D6351] to-[#2B4438] flex items-center justify-center text-[#F6EACB] font-serif text-xs font-bold shadow-xs">
              L
            </div>
            <span className="font-serif text-lg font-bold text-[#345344]">Lunelle</span>
          </div>

          <p className="text-xs text-[#778078] max-w-lg mx-auto leading-relaxed font-cute">
            Your health, your story. A private, intelligent women's health sanctuary.
          </p>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E9E6DD] max-w-xl mx-auto text-[11px] text-[#778078] leading-relaxed shadow-xs">
            <strong className="text-[#303B33] block mb-0.5 font-bold">Medical Disclaimer:</strong>
            Lunelle provides informational guidance and personal health record management. It does not provide medical diagnoses or prescriptions. In emergencies, please contact 112 / 108 immediately.
          </div>

          <p className="text-[11px] text-[#778078] font-mono">
            © {new Date().getFullYear()} Lunelle. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
