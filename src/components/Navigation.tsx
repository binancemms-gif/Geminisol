import React from 'react';
import { Radar, Bot, TrendingUp, ShieldAlert, Gift } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openPositionsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  openPositionsCount,
}) => {
  const tabs = [
    { id: 'scanner', label: 'Radar', icon: Radar },
    { id: 'agent', label: 'Agent', icon: Bot },
    { id: 'positions', label: 'Positions', icon: TrendingUp, badge: openPositionsCount },
    { id: 'settings', label: 'Armor', icon: ShieldAlert },
    { id: 'referral', label: 'Rewards', icon: Gift },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 backdrop-blur-lg border-t border-slate-800/90 pb-safe">
      <div className="grid grid-cols-5 items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id);
              }}
              className="min-h-[44px] flex flex-col items-center justify-center relative py-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-emerald-400 scale-110' : 'text-slate-400'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-black font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
