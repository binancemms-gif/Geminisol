import React, { useState } from 'react';
import { X, Bell, TrendingUp, TrendingDown, Layers, Check, Target } from 'lucide-react';
import { Token, PriceAlert } from '../types/sniper';
import { playClickSound, playSnipeChime } from '../utils/audio';

interface PriceAlertModalProps {
  token: Token | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  solPriceUsd: number;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  token,
  isOpen,
  onClose,
  onSaveAlert,
  solPriceUsd,
}) => {
  if (!isOpen || !token) return null;

  const currentPrice = token.priceSol;
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPriceSol, setTargetPriceSol] = useState<number>(
    Number((currentPrice * 1.25).toFixed(7))
  );
  const [note, setNote] = useState('');

  // Quick preset calculation
  const setQuickTarget = (multiplier: number, cond: 'ABOVE' | 'BELOW') => {
    playClickSound();
    setCondition(cond);
    setTargetPriceSol(Number((currentPrice * multiplier).toFixed(7)));
  };

  // Meteora DLMM Bin calculation (20 bps / 0.20% per bin)
  const BIN_STEP_BPS = 20; // 0.2%
  const binStepFactor = 1 + BIN_STEP_BPS / 10000;
  const activeBinId = 10420;
  const deltaBins = Math.round(
    Math.log(targetPriceSol / (currentPrice || 0.00001)) / Math.log(binStepFactor)
  );
  const calculatedDlmmBinId = activeBinId + deltaBins;

  const pctDiff = ((targetPriceSol - currentPrice) / currentPrice) * 100;
  const targetPriceUsd = targetPriceSol * solPriceUsd;

  const handleSave = () => {
    playSnipeChime();
    onSaveAlert({
      tokenMint: token.mint,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      targetPriceSol,
      targetPriceUsd,
      condition,
      currentPriceSol: currentPrice,
      currentPriceUsd: token.priceUsd,
      initialPriceSol: currentPrice,
      active: true,
      note: note.trim() || undefined,
      dlmmBinId: calculatedDlmmBinId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#090d16] border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Set Custom Price Target</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {token.name} (${token.symbol}) · Devnet / Testnet Monitoring
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Price Reference */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Current Live Price</span>
            <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
              {currentPrice.toFixed(7)} SOL
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">USD Equivalent</span>
            <span className="font-mono tabular-nums text-sm font-bold text-slate-200">
              ${(currentPrice * solPriceUsd).toFixed(5)} USD
            </span>
          </div>
        </div>

        {/* Condition Selector (ABOVE vs BELOW) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Trigger Condition</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setCondition('ABOVE');
              }}
              className={`min-h-[44px] rounded-xl border p-2.5 flex items-center justify-center gap-2 font-mono text-xs font-semibold transition-all ${
                condition === 'ABOVE'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Price Climbs ABOVE</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setCondition('BELOW');
              }}
              className={`min-h-[44px] rounded-xl border p-2.5 flex items-center justify-center gap-2 font-mono text-xs font-semibold transition-all ${
                condition === 'BELOW'
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Price Dips BELOW</span>
            </button>
          </div>
        </div>

        {/* Quick Multiplier Presets */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Quick Target Presets</label>
          <div className="grid grid-cols-6 gap-1.5">
            {[
              { label: '+10%', mult: 1.1, cond: 'ABOVE' as const },
              { label: '+25%', mult: 1.25, cond: 'ABOVE' as const },
              { label: '+50%', mult: 1.5, cond: 'ABOVE' as const },
              { label: '+100%', mult: 2.0, cond: 'ABOVE' as const },
              { label: '-10%', mult: 0.9, cond: 'BELOW' as const },
              { label: '-25%', mult: 0.75, cond: 'BELOW' as const },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setQuickTarget(p.mult, p.cond)}
                className="py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Price Inputs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Target Price Threshold (SOL)</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                pctDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {pctDiff >= 0 ? '+' : ''}
              {pctDiff.toFixed(1)}% ({condition})
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              step="0.0000001"
              value={targetPriceSol}
              onChange={(e) => setTargetPriceSol(Number(e.target.value))}
              className="w-full h-11 px-3.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl font-mono text-sm text-white focus:outline-none"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
              SOL
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>≈ ${targetPriceUsd.toFixed(5)} USD</span>
            <span>Meteora DLMM Bin #{calculatedDlmmBinId}</span>
          </div>
        </div>

        {/* Meteora DLMM Bin Monitoring Note */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5 text-xs">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-200 block">
              Meteora DLMM Active Bin Watcher
            </span>
            <span className="text-[11px] text-slate-400 block leading-relaxed">
              Target is mapped to DLMM price bin #{calculatedDlmmBinId} (active: #{activeBinId}, step: {BIN_STEP_BPS} bps). When the Solana block engine processes swaps crossing this bin, ShellArmor triggers visual and audio telemetry immediately.
            </span>
          </div>
        </div>

        {/* Optional Action Note */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Trigger Note / Execution Plan</label>
          <input
            type="text"
            placeholder="e.g. Sell 50% on breakout, or buy the dip with 0.5 SOL..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-10 px-3 bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={targetPriceSol <= 0}
            className="w-full min-h-[48px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Target className="w-4 h-4 fill-black" />
            <span>Arm Custom Price Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
