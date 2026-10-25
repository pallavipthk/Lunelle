import React from 'react';
import { 
  LayoutDashboard, 
  HeartPulse, 
  Activity, 
  Flower2, 
  Sparkles, 
  FileText, 
  Bot, 
  Bell, 
  ShieldCheck, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { LunelleLogo } from './LunelleLogo';
import { useAuth } from '../context/AuthContext';

export type NavTab = 
  | 'overview' 
  | 'my-health' 
  | 'symptoms' 
  | 'womens-health' 
  | 'insights' 
  | 'lab-reports' 
  | 'assistant' 
  | 'reminders' 
  | 'vault' 
  | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  setMobileOpen
}) => {
  const { user, profile, logout } = useAuth();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'my-health', label: 'My Health', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'symptoms', label: 'Symptom Tracker', icon: <Activity className="w-4 h-4" /> },
    { id: 'womens-health', label: "Women's Health", icon: <Flower2 className="w-4 h-4" /> },
    { id: 'insights', label: 'Health Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'lab-reports', label: 'Lab Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI Health Assistant', icon: <Bot className="w-4 h-4" /> },
    { id: 'reminders', label: 'Reminders', icon: <Bell className="w-4 h-4" /> },
    { id: 'vault', label: 'Medical Vault', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & Privacy', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-border-soft sticky top-0 z-30">
        <LunelleLogo size="sm" showSubtitle={false} onClick={() => onSelectTab('overview')} />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-text-primary hover:bg-pale-sage/40 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-text-primary/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop left fixed, mobile drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-border-soft flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-border-soft/60">
          <LunelleLogo size="md" showSubtitle={true} onClick={() => onSelectTab('overview')} />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-pale-sage/70 text-deep-sage font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-[#FAF8F2]'
                }`}
              >
                <span className={`${isActive ? 'text-deep-sage' : 'text-text-secondary'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-4 border-t border-border-soft/60 bg-[#FFFEFC]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-dusty-rose flex items-center justify-center text-muted-rose font-medium text-xs">
                {profile?.preferred_name ? profile.preferred_name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {profile?.preferred_name || 'My Health'}
                </p>
                <p className="text-[10px] text-text-secondary truncate">
                  {user?.email || 'Logged in'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 rounded-lg text-text-secondary hover:text-red-700 hover:bg-red-50 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
