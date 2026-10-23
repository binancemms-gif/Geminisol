import React from 'react';
import {
  BellRing,
  X,
  Zap,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { TriggeredAlertEvent } from '../types/sniper';
import { playClickSound, playSnipeChime } from '../utils/audio';

interface PriceAlertBannerProps {
  alerts: TriggeredAlertEvent[];
  onDismiss: (alertEventId: string) => void;
  onInstantBuy: (tokenMint: string, symbol: string, name: string, priceSol: number) => void;
  onInstantSell?: (tokenMint: string) => void;
  onOpenAlertsManager: () => void;
}

export const PriceAlertBanner: React.FC<PriceAlertBannerProps> = ({
  alerts,
  onDismiss,
  onInstantBuy,
  onInstantSell,
  onOpenAlertsManager,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-4 max-w-4xl mx-auto space-y-2 pointer-events-none">
      {alerts.slice(0, 3).map((event) => {
        const { alert, triggeredPriceSol } = event;
        const isAbove = alert.condition === 'ABOVE';
        const pctDiff =
          ((triggeredPriceSol - alert.initialPriceSol) / alert.initialPriceSol) * 100;

        return (
          <div
            key={event.id}
            className="pointer-events-auto bg-[#0a0f1d] border-2 border-emerald-500/80 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 animate-in slide-in-from-top-4 duration-300 space-y-3"
          >
            {/* Top row: Bell, Token, Trigger Status, Dismiss */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      🎯 Custom Price Target Reached
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <span>${alert.tokenSymbol}</span>
                    <span className="text-slate-400 font-normal">({alert.tokenName})</span>
                    <span
                      className={`font-mono text-xs font-semibold flex items-center gap-0.5 ${
                        isAbove ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isAbove ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {pctDiff >= 0 ? '+' : ''}
                      {pctDiff.toFixed(1)}%
                    </span>
                  </h4>
                </div>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  onDismiss(event.id);
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price Trigger Data */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Target Defined</span>
                <span className="font-mono text-slate-200 font-bold">
                  {alert.condition} {alert.targetPriceSol.toFixed(7)} SOL
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Trigger Price</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {triggeredPriceSol.toFixed(7)} SOL
                </span>
              </div>
              {alert.dlmmBinId && (
                <div className="hidden sm:block">
                  <span className="text-[10px] text-slate-500 block uppercase">Meteora DLMM</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    Active Bin #{alert.dlmmBinId}
                  </span>
                </div>
              )}
              {alert.note && (
                <div className="w-full text-[11px] text-slate-300 border-t border-slate-800/60 pt-1 font-mono">
                  Plan: {alert.note}
                </div>
              )}
            </div>

            {/* Tactical Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAlertsManager();
                }}
                className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>DLMM Bins</span>
              </button>

              <div className="flex items-center gap-2">
                {onInstantSell && (
                  <button
                    onClick={() => {
                      playClickSound();
                      onInstantSell(alert.tokenMint);
                      onDismiss(event.id);
                    }}
                    className="min-h-[44px] px-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all active:scale-95"
                  >
                    Quick Sell 100%
                  </button>
                )}

                <button
                  onClick={() => {
                    playSnipeChime();
                    onInstantBuy(
                      alert.tokenMint,
                      alert.tokenSymbol,
                      alert.tokenName,
                      triggeredPriceSol
                    );
                    onDismiss(event.id);
                  }}
                  className="min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Execute 0.5 SOL Snipe</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
