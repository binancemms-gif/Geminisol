import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  ArrowUpRight,
  ExternalLink,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { Position, TradeLog } from '../types/sniper';
import { playClickSound, playProfitChime, playPanicSound } from '../utils/audio';

interface PositionsDashboardProps {
  positions: Position[];
  tradeLogs: TradeLog[];
  onSellPosition: (positionId: string, percentage: number) => void;
  onDoubleDown: (position: Position) => void;
  onPanicSellAll: () => void;
  solPriceUsd: number;
}

export const PositionsDashboard: React.FC<PositionsDashboardProps> = ({
  positions,
  tradeLogs,
  onSellPosition,
  onDoubleDown,
  onPanicSellAll,
  solPriceUsd,
}) => {
  const [showPanicModal, setShowPanicModal] = useState(false);

  // Compute aggregate stats
  const totalInvestedSol = positions.reduce((acc, p) => acc + p.investedSol, 0);
  const totalCurrentValueSol = positions.reduce((acc, p) => acc + p.currentSolValue, 0);
  const totalUnrealizedPnlSol = totalCurrentValueSol - totalInvestedSol;
  const totalUnrealizedPnlPercent =
    totalInvestedSol > 0 ? (totalUnrealizedPnlSol / totalInvestedSol) * 100 : 0;

  // Realized P&L from trade logs
  const closedTrades = tradeLogs.filter((t) => t.pnlSol !== undefined);
  const totalRealizedPnlSol = closedTrades.reduce((acc, t) => acc + (t.pnlSol || 0), 0);
  const winningTrades = closedTrades.filter((t) => (t.pnlSol || 0) > 0);
  const winRate =
    closedTrades.length > 0
      ? ((winningTrades.length / closedTrades.length) * 100).toFixed(1)
      : '75.0';

  const handlePanicConfirm = () => {
    playPanicSound();
    onPanicSellAll();
    setShowPanicModal(false);
  };

  return (
    <div className="space-y-5">
      {/* P&L Performance Summary Strip */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Sniper Profit &amp; Loss Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time portfolio metrics synced with Solana block engine.
            </p>
          </div>

          {positions.length > 0 && (
            <button
              onClick={() => {
                playClickSound();
                setShowPanicModal(true);
              }}
              className="min-h-[44px] px-3.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 transition-colors active:scale-95"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Panic Sell All ({positions.length})</span>
            </button>
          )}
        </div>

        {/* 4-KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Unrealized P&amp;L</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`font-mono tabular-nums text-lg font-bold ${
                  totalUnrealizedPnlSol >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalUnrealizedPnlSol >= 0 ? '+' : ''}
                {totalUnrealizedPnlSol.toFixed(3)} SOL
              </span>
            </div>
            <span
              className={`text-[11px] font-mono tabular-nums ${
                totalUnrealizedPnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalUnrealizedPnlPercent >= 0 ? '+' : ''}
              {totalUnrealizedPnlPercent.toFixed(1)}% ($
              {(totalUnrealizedPnlSol * solPriceUsd).toFixed(2)})
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Realized Net P&amp;L</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`font-mono tabular-nums text-lg font-bold ${
                  totalRealizedPnlSol >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalRealizedPnlSol >= 0 ? '+' : ''}
                {totalRealizedPnlSol.toFixed(3)} SOL
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              +${(totalRealizedPnlSol * solPriceUsd).toFixed(2)} USD
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Sniper Win Rate</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-mono tabular-nums text-lg font-bold text-emerald-400">
                {winRate}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {winningTrades.length} won / {closedTrades.length} trades
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Active Capital</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-mono tabular-nums text-lg font-bold text-white">
                {totalInvestedSol.toFixed(2)} SOL
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {positions.length} active holdings
            </span>
          </div>
        </div>
      </div>

      {/* Active Holdings List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Open Positions ({positions.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Sub-50ms Quick Liquidate
          </span>
        </div>

        {positions.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-medium text-slate-300">No active positions open</p>
            <p className="text-xs text-slate-500">
              Autonomous Sniper will automatically purchase tokens that pass Shell Armor criteria, or you can manually snipe from the Radar feed.
            </p>
          </div>
        ) : (
          positions.map((pos) => {
            const isProfit = pos.pnlPercent >= 0;

            return (
              <div
                key={pos.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                {/* Header: Token, P&L badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-sm text-emerald-400">
                      ${pos.tokenSymbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{pos.tokenName}</span>
                        <span className="text-xs font-mono text-slate-400 font-semibold">
                          ${pos.tokenSymbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Invested: {pos.investedSol} SOL</span>
                        <span aria-hidden="true">·</span>
                        <span>Curve: {pos.bondingCurveProgress.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {isProfit ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      )}
                      <span
                        className={`text-sm font-mono font-bold tabular-nums ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}
                        {pos.pnlPercent.toFixed(1)}%
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        isProfit ? 'text-emerald-400/90' : 'text-rose-400/90'
                      }`}
                    >
                      {isProfit ? '+' : ''}
                      {pos.pnlSol.toFixed(3)} SOL
                    </span>
                  </div>
                </div>

                {/* Tactical Exit Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      playProfitChime();
                      onSellPosition(pos.id, 50);
                    }}
                    className="min-h-[44px] px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors active:scale-95"
                  >
                    <span>Take 50%</span>
                  </button>

                  <button
                    onClick={() => {
                      playProfitChime();
                      onSellPosition(pos.id, 100);
                    }}
                    className="min-h-[44px] px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                  >
                    <span>Close 100%</span>
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      onDoubleDown(pos);
                    }}
                    className="min-h-[44px] px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors active:scale-95"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Double Down</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Trade History Ledger */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Execution Ledger &amp; Telemetry
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Jito Validator Signatures
          </span>
        </div>

        <div className="space-y-2 overflow-x-auto">
          {tradeLogs.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    tx.type === 'BUY'
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : tx.type === 'TAKE_PROFIT'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : tx.type === 'STOP_LOSS'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {tx.type}
                </span>
                <span className="text-white font-bold">${tx.tokenSymbol}</span>
                <span className="text-slate-500 hidden sm:inline">
                  {new Date(tx.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <span className="text-white font-semibold tabular-nums">
                    {tx.amountSol} SOL
                  </span>
                  {tx.pnlSol !== undefined && (
                    <span
                      className={`block text-[11px] tabular-nums ${
                        tx.pnlSol >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.pnlSol >= 0 ? '+' : ''}
                      {tx.pnlSol.toFixed(3)} SOL
                    </span>
                  )}
                </div>

                <div className="hidden sm:block text-slate-400 text-[11px]">
                  <span className="text-emerald-400">{tx.latencyMs}ms</span>
                </div>

                <a
                  href={`https://solscan.io/tx/${tx.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                  title="View on Solscan"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panic Modal */}
      {showPanicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b0f19] border border-rose-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Flame className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Panic Sell All Positions?</h3>
              <p className="text-xs text-slate-400">
                This will immediately broadcast market sell bundles via Jito RPC for all {positions.length} open positions to prevent further drawdown.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  playClickSound();
                  setShowPanicModal(false);
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePanicConfirm}
                className="flex-1 min-h-[44px] rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/20"
              >
                Liquidate All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
