import React from 'react';
import { Volume2, VolumeX, Shield, Wallet, Zap, Bell, Radio } from 'lucide-react';
import { WalletState } from '../types/sniper';
import { setAudioMuted, getAudioMuted, playClickSound } from '../utils/audio';

interface HeaderProps {
  wallet: WalletState;
  onOpenWallet: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAutonomousEnabled: boolean;
  onToggleAutonomous: () => void;
  activeAlertsCount: number;
  triggeredAlertsCount: number;
  devnetSlot?: number;
  clusterLatencyMs?: number;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onOpenWallet,
  activeTab,
  setActiveTab,
  isAutonomousEnabled,
  onToggleAutonomous,
  activeAlertsCount,
  triggeredAlertsCount,
  devnetSlot,
  clusterLatencyMs,
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
              setActiveTab('mirror');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'mirror' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <span>Mirror Wallets</span>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/40">
              New
            </span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('alerts');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'alerts' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <span>Price Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40">
                {activeAlertsCount}
              </span>
            )}
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
          {/* Real Solana Devnet Cluster Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Devnet:</span>
            <span className="text-white tabular-nums">#{devnetSlot || 514391633}</span>
            {clusterLatencyMs && (
              <span className="text-emerald-400 tabular-nums">({clusterLatencyMs}ms)</span>
            )}
          </div>

          {/* Price Alerts Notification Bell */}
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('alerts');
            }}
            aria-label="Price target alerts"
            className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 relative flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Bell className={`w-4 h-4 ${activeAlertsCount > 0 ? 'text-amber-400' : ''}`} />
            {triggeredAlertsCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {triggeredAlertsCount}
              </span>
            ) : activeAlertsCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-slate-800 text-amber-300 font-mono text-[9px] w-3.5 h-3.5 rounded-full border border-amber-500/50 flex items-center justify-center">
                {activeAlertsCount}
              </span>
            ) : null}
          </button>

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
