import React from 'react';
import { Volume2, VolumeX, Shield, Wallet, Zap } from 'lucide-react';
import { WalletState } from '../types/sniper';
import { setAudioMuted, getAudioMuted, playClickSound } from '../utils/audio';

interface HeaderProps {
  wallet: WalletState;
  onOpenWallet: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAutonomousEnabled: boolean;
  onToggleAutonomous: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onOpenWallet,
  activeTab,
  setActiveTab,
  isAutonomousEnabled,
  onToggleAutonomous,
}) => {
  const [muted, setMutedState] = React.useState(getAudioMuted());

  const handleToggleMute = () => {
    const next = !muted;
    setAudioMuted(next);
    setMutedState(next);
    if (!next) playClickSound();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('scanner');
            }}
            className="text-left font-bold text-lg tracking-tight text-white flex items-baseline gap-2 whitespace-nowrap shrink-0"
          >
            <span>ShellArmor</span>
            <span className="text-xs font-mono text-emerald-400 font-normal">v2.4</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, desktop view) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('scanner');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'scanner' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Pump.fun Scanner
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('agent');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'agent' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Agent Engine
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('positions');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'positions' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            P&L Positions
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('settings');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'settings' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Strategy & Armor
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('referral');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'referral' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Referrals (35%)
          </button>
        </nav>

        {/* Zone 3: Primary Action & Live Telemetry Controls */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Quick Sound Toggle */}
          <button
            onClick={handleToggleMute}
            aria-label={muted ? 'Unmute alerts' : 'Mute alerts'}
            className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Master Autonomous Quick Toggle */}
          <button
            onClick={() => {
              playClickSound();
              onToggleAutonomous();
            }}
            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all border ${
              isAutonomousEnabled
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isAutonomousEnabled ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            <span>AI SNIPER: {isAutonomousEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Primary Action: Wallet Trigger */}
          <button
            onClick={() => {
              playClickSound();
              onOpenWallet();
            }}
            className="min-h-[44px] px-3 lg:px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white text-xs lg:text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="font-mono tabular-nums text-emerald-400 font-semibold">
              {wallet.balanceSol.toFixed(2)} SOL
            </span>
            <span className="hidden lg:inline text-slate-400 text-xs">
              (${wallet.balanceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })})
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
