import React from 'react';
import { Activity, Globe, Radar, ShieldCheck, KeyRound } from 'lucide-react';
import type { NavTab } from '../types/vpn';

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isConnected: boolean;
  isConnecting: boolean;
  onPrimaryConnectAction: () => void;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'scanner', label: 'Scanner', icon: Radar },
  { id: 'map', label: 'World Map', icon: Globe },
  { id: 'diagnostics', label: 'Diagnostics', icon: ShieldCheck },
  { id: 'vault', label: 'Vault & APK', icon: KeyRound },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  isConnected,
  isConnecting,
  onPrimaryConnectAction,
}) => {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080C14]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6">
          {/* Zone 1: Single text element Brand Wordmark */}
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('dashboard');
            }}
            className="font-display text-base sm:text-lg font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0"
          >
            NordVPN IKEv2 Explorer
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded ${
                    active ? 'text-[#F8FAFC]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-[#00E5FF]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onPrimaryConnectAction}
              disabled={isConnecting}
              className={`min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] ${
                isConnected
                  ? 'bg-[#1E293B] text-[#F8FAFC] border border-[#00E676]/50 hover:border-[#FF1744]/70 hover:text-[#FF1744]'
                  : 'bg-[#2979FF] text-[#F8FAFC] hover:bg-[#1E66E5] shadow-[0_0_14px_rgba(41,121,255,0.3)]'
              } disabled:opacity-60`}
            >
              {isConnecting ? 'Negotiating...' : isConnected ? 'Disconnect' : 'Quick Connect'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (under 15% sticky height cap) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-white/10 bg-[#080C14]/95 backdrop-blur-md grid grid-cols-5 items-center"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors ${
                active ? 'text-[#00E5FF]' : 'text-[#94A3B8]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="mt-1 text-[10px] font-medium whitespace-nowrap truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
