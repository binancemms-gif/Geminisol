import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sliders,
  DollarSign,
  AlertTriangle,
  Lock,
  Layers,
  Save,
  RotateCcw,
} from 'lucide-react';
import { StrategySettings } from '../types/sniper';
import { playClickSound } from '../utils/audio';

interface StrategyArmorSettingsProps {
  settings: StrategySettings;
  onUpdateSettings: (newSettings: StrategySettings) => void;
  onResetDefaults: () => void;
}

export const StrategyArmorSettings: React.FC<StrategyArmorSettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults,
}) => {
  const [savedNotice, setSavedNotice] = React.useState(false);

  const handleChange = <K extends keyof StrategySettings>(
    key: K,
    value: StrategySettings[K]
  ) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleSave = () => {
    playClickSound();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Strategy &amp; Shell Armor Protection</h2>
              <p className="text-xs text-slate-400">
                Automated risk mitigation rules &amp; execution parameters for Pump.fun sniper.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClickSound();
                onResetDefaults();
              }}
              className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <button
              onClick={handleSave}
              className="min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{savedNotice ? 'Saved!' : 'Save Config'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Grid on Tablet/Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SECTION 1: TRADE & EXECUTION STRATEGY */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Trade Sizing &amp; Slippage
            </h3>
          </div>

          {/* Trade Size (SOL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Default Snipe Investment (SOL)</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                {settings.defaultTradeSol} SOL
              </span>
            </div>
            <input
              type="range"
              min={0.05}
              max={3.0}
              step={0.05}
              value={settings.defaultTradeSol}
              onChange={(e) => handleChange('defaultTradeSol', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Min: 0.05 SOL</span>
              <span>Max: 3.0 SOL</span>
            </div>
          </div>

          {/* Slippage Settings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Slippage Tolerance (%)</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                {settings.slippagePercent}%
              </span>
            </div>
            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 12, 20, 35, 49].map((slip) => (
                <button
                  key={slip}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    handleChange('slippagePercent', slip);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                    settings.slippagePercent === slip
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {slip}%
                </button>
              ))}
            </div>
          </div>

          {/* Take Profit Targets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Take Profit Target</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                +{settings.takeProfitPercent}%
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={500}
              step={10}
              value={settings.takeProfitPercent}
              onChange={(e) => handleChange('takeProfitPercent', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>+20% (Conservative)</span>
              <span>+500% (Moonbag)</span>
            </div>
          </div>

          {/* Stop Loss Target */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Stop Loss Hard Cap</span>
              <span className="font-mono text-rose-400 font-bold tabular-nums">
                -{settings.stopLossPercent}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={settings.stopLossPercent}
              onChange={(e) => handleChange('stopLossPercent', Number(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>-5% (Tight)</span>
              <span>-60% (Deep Dip)</span>
            </div>
          </div>

          {/* Auto-Sell on Bonding Curve Migration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Auto-Sell at Bonding Curve Progress
              </span>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">
                {settings.autoSellOnBondingCurvePercent}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={98}
              step={2}
              value={settings.autoSellOnBondingCurvePercent}
              onChange={(e) =>
                handleChange('autoSellOnBondingCurvePercent', Number(e.target.value))
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Automatically exits position before 100% curve completion to avoid Raydium migration fee dump.
            </p>
          </div>
        </div>

        {/* SECTION 2: SHELL ARMOR PROTECTION (SAFETY FILTERS) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Shell Armor Safety Filters
            </h3>
          </div>

          {/* Min Armor Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Minimum Armor Score Threshold</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                {settings.minArmorScore} / 100
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={95}
              step={1}
              value={settings.minArmorScore}
              onChange={(e) => handleChange('minArmorScore', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Autonomous sniper immediately rejects tokens scoring below this threshold.
            </p>
          </div>

          {/* Max Dev Holding Cap */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Max Developer Holding Cap</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                {settings.maxDevHoldingPercent}%
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={15.0}
              step={0.5}
              value={settings.maxDevHoldingPercent}
              onChange={(e) => handleChange('maxDevHoldingPercent', Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Rejects launches if developer wallet holds more than {settings.maxDevHoldingPercent}% of supply.
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-1">
            {/* Require Revoked Mint */}
            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">
                  Enforce Revoked Mint Authority
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Prevents developer from creating new tokens to dilute holders.
                </span>
              </div>
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="w-5 h-5 accent-emerald-400 cursor-not-allowed"
                title="Always enforced by Shell Armor v2.4"
              />
            </div>

            {/* Require Disabled Freeze */}
            <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">
                  Enforce Disabled Freeze Authority
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Prevents developer from freezing wallet balances (Honeypot protection).
                </span>
              </div>
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="w-5 h-5 accent-emerald-400 cursor-not-allowed"
                title="Always enforced by Shell Armor v2.4"
              />
            </div>

            {/* Anti-MEV Jito Tip */}
            <div className="space-y-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Anti-MEV Jito Validator Tip
                </span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  {settings.jitoTipSol} SOL
                </span>
              </div>
              <input
                type="range"
                min={0.001}
                max={0.05}
                step={0.001}
                value={settings.jitoTipSol}
                onChange={(e) => handleChange('jitoTipSol', Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Bribes Jito block engine validators to execute in the very first slot bundle before sandwich bots.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
