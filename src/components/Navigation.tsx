import React, { useEffect, useRef, useState } from 'react';
import { Radar, Bot, TrendingUp, Bell, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openPositionsCount: number;
  triggeredAlertsCount?: number;
}

const TABS = [
  { id: 'scanner', label: 'Scanner', fullTitle: 'Radar Scanner', icon: Radar },
  { id: 'agent', label: 'Terminal', fullTitle: 'Agent Terminal', icon: Bot },
  { id: 'positions', label: 'Positions', fullTitle: 'P&L Positions', icon: TrendingUp },
  { id: 'alerts', label: 'Alerts', fullTitle: 'Price Alerts', icon: Bell },
  { id: 'settings', label: 'Armor', fullTitle: 'Shell Armor', icon: ShieldAlert },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  openPositionsCount,
  triggeredAlertsCount = 0,
}) => {
  const [swipeFeedback, setSwipeFeedback] = useState<'left' | 'right' | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const currentIndex = TABS.findIndex((t) => t.id === activeTab);

  // Navigate to next or previous tab
  const navigateByOffset = (offset: number) => {
    const nextIndex = Math.max(0, Math.min(TABS.length - 1, currentIndex + offset));
    if (nextIndex !== currentIndex) {
      playClickSound();
      setActiveTab(TABS[nextIndex].id);
      setSwipeFeedback(offset > 0 ? 'left' : 'right');
      setTimeout(() => setSwipeFeedback(null), 300);
    }
  };

  // Global mobile swipe listener for fluid tab switching across screen
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Don't trigger if user is interacting with an input, slider, or modal
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('input') ||
        target?.closest('textarea') ||
        target?.closest('select') ||
        target?.closest('[role="dialog"]')
      ) {
        touchStartRef.current = null;
        return;
      }

      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touchEnd = e.changedTouches[0];
      const deltaX = touchEnd.clientX - touchStartRef.current.x;
      const deltaY = touchEnd.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      touchStartRef.current = null;

      // Ensure it is a deliberate horizontal swipe (horizontal distance > 48px,
      // horizontal movement is at least 1.6x vertical movement, and completed within 500ms)
      if (
        Math.abs(deltaX) > 48 &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.6 &&
        deltaTime < 500
      ) {
        if (deltaX < 0) {
          // Swiped left -> navigate to next tab (e.g. scanner -> terminal -> positions)
          navigateByOffset(1);
        } else {
          // Swiped right -> navigate to previous tab (e.g. positions -> terminal -> scanner)
          navigateByOffset(-1);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex]);

  return (
    <>
      {/* Floating Mobile Gesture Pill Indicator */}
      <div className="md:hidden fixed bottom-18 left-0 right-0 z-30 flex items-center justify-center pointer-events-none px-4">
        <div
          className={`px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-400 backdrop-blur-md shadow-lg flex items-center gap-2 transition-all duration-200 ${
            swipeFeedback ? 'scale-105 border-emerald-500/50 text-emerald-300' : 'opacity-85'
          }`}
        >
          <ChevronLeft className="w-3 h-3 text-slate-500" />
          <span>
            {currentIndex > 0 ? TABS[currentIndex - 1].label : '•'}
            {' · '}
            <strong className="text-emerald-400 font-semibold">
              {TABS[currentIndex]?.label || 'Tab'}
            </strong>
            {' · '}
            {currentIndex < TABS.length - 1 ? TABS[currentIndex + 1].label : '•'}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar with touch navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 backdrop-blur-lg border-t border-slate-800/90 pb-safe touch-pan-x"
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            touchStartRef.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
              time: Date.now(),
            };
          }
        }}
      >
        <div className="grid grid-cols-5 items-center h-16 relative">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badgeCount =
              tab.id === 'positions'
                ? openPositionsCount
                : tab.id === 'alerts'
                ? triggeredAlertsCount
                : 0;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id);
                }}
                className="min-h-[44px] flex flex-col items-center justify-center relative py-1 text-slate-400 hover:text-slate-200 transition-all select-none active:scale-95"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'text-emerald-400 scale-110' : 'text-slate-400'
                    }`}
                  />
                  {badgeCount > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${
                        tab.id === 'alerts'
                          ? 'bg-amber-400 text-black animate-pulse'
                          : 'bg-emerald-500 text-black'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap transition-colors ${
                    isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-400 rounded-full transition-all shadow-sm shadow-emerald-500/50" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
