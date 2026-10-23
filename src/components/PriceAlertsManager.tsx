import React, { useState } from 'react';
import {
  Bell,
  Trash2,
  TrendingUp,
  TrendingDown,
  Layers,
  Plus,
  CheckCircle,
  ExternalLink,
  Target,
  ToggleLeft,
  ToggleRight,
  Zap,
} from 'lucide-react';
import { PriceAlert, Token } from '../types/sniper';
import { playClickSound } from '../utils/audio';

interface PriceAlertsManagerProps {
  alerts: PriceAlert[];
  tokens: Token[];
  onToggleAlert: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
  onOpenCreateModal: (token?: Token) => void;
  onSelectToken: (token: Token) => void;
  solPriceUsd: number;
}

export const PriceAlertsManager: React.FC<PriceAlertsManagerProps> = ({
  alerts,
  tokens,
  onToggleAlert,
  onDeleteAlert,
  onOpenCreateModal,
  onSelectToken,
  solPriceUsd,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('all');
  const [selectedDlmmToken, setSelectedDlmmToken] = useState<Token>(tokens[0] || null);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'active') return a.active && !a.triggered;
    if (filter === 'triggered') return a.triggered;
    return true;
  });

  // Meteora DLMM synthetic bin generator for active visualization
  const activeBasePrice = selectedDlmmToken ? selectedDlmmToken.priceSol : 0.000045;
  const activeBinId = 10420;
  const binStepBps = 20; // 0.2%
  const binStepFactor = 1 + binStepBps / 10000;

  // Generate 9 surrounding DLMM bins (-4 to +4)
  const dlmmBins = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((offset) => {
    const binId = activeBinId + offset;
    const priceSol = activeBasePrice * Math.pow(binStepFactor, offset);
    const hasTargetAlert = alerts.some(
      (a) => a.tokenMint === selectedDlmmToken?.mint && a.dlmmBinId === binId
    );
    const liquidity = Math.floor(18 + Math.sin(offset + 4) * 14 + (offset === 0 ? 30 : 0));

    return {
      binId,
      priceSol,
      priceUsd: priceSol * solPriceUsd,
      isActive: offset === 0,
      isTargetBin: hasTargetAlert,
      liquiditySol: liquidity,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#121c2d] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Custom Price Target Engine</h2>
                <span className="text-xs font-mono text-amber-400 font-semibold">
                  Meteora DLMM &amp; Devnet
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated threshold notifications triggering instant visual and audio alerts when tokens reach target price bins.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onOpenCreateModal();
            }}
            className="min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Alert</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Active Watchers</span>
            <span className="font-mono tabular-nums text-lg font-bold text-emerald-400">
              {alerts.filter((a) => a.active && !a.triggered).length} Armed
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Triggered Targets</span>
            <span className="font-mono tabular-nums text-lg font-bold text-amber-400">
              {alerts.filter((a) => a.triggered).length} Hit
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">DLMM Precision</span>
            <span className="font-mono tabular-nums text-lg font-bold text-cyan-400">
              20 bps / Bin
            </span>
          </div>
        </div>
      </div>

      {/* Meteora DLMM Active Bin Viewer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Meteora DLMM Active Bin Tracker
            </h3>
          </div>

          {/* Token selector for DLMM */}
          {tokens.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Inspecting:</span>
              <select
                value={selectedDlmmToken?.id}
                onChange={(e) => {
                  const found = tokens.find((t) => t.id === e.target.value);
                  if (found) setSelectedDlmmToken(found);
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-mono rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                {tokens.slice(0, 6).map((t) => (
                  <option key={t.id} value={t.id}>
                    ${t.symbol} ({t.name})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* DLMM Bin Ladder Grid */}
        <div className="space-y-1.5 overflow-x-auto">
          <div className="min-w-[540px]">
            <div className="grid grid-cols-5 text-[10px] text-slate-500 uppercase pb-1 border-b border-slate-800 px-3">
              <span>DLMM Bin ID</span>
              <span>Bin Price (SOL)</span>
              <span>USD Value</span>
              <span>Pool Liquidity</span>
              <span className="text-right">Watcher Status</span>
            </div>

            <div className="space-y-1 pt-1 font-mono text-xs">
              {dlmmBins.map((bin) => (
                <div
                  key={bin.binId}
                  className={`grid grid-cols-5 items-center px-3 py-2 rounded-xl border transition-colors ${
                    bin.isActive
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold'
                      : bin.isTargetBin
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-medium'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {bin.isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    #{bin.binId}
                  </span>
                  <span className="tabular-nums">{bin.priceSol.toFixed(7)}</span>
                  <span className="tabular-nums text-slate-400">${bin.priceUsd.toFixed(5)}</span>
                  <span className="tabular-nums">{bin.liquiditySol} SOL</span>
                  <span className="text-right text-[11px]">
                    {bin.isActive ? (
                      <span className="text-emerald-400 font-semibold">ACTIVE TRADING BIN</span>
                    ) : bin.isTargetBin ? (
                      <span className="text-amber-400 font-semibold">🎯 TARGET ARMED</span>
                    ) : (
                      <span className="text-slate-600">Idle Bin</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'active' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Armed ({alerts.filter((a) => a.active && !a.triggered).length})
          </button>
          <button
            onClick={() => setFilter('triggered')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'triggered' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Triggered ({alerts.filter((a) => a.triggered).length})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-medium text-slate-300">No price alerts found in this view</p>
            <p className="text-xs text-slate-500">
              Set custom price targets on any token in the scanner to receive instant visual notifications when thresholds are reached.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isAbove = alert.condition === 'ABOVE';
            const pct =
              ((alert.targetPriceSol - alert.initialPriceSol) / alert.initialPriceSol) * 100;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  alert.triggered
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                    : alert.active
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-sm text-amber-400 shrink-0">
                      ${alert.tokenSymbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{alert.tokenName}</span>
                        <span className="text-xs font-mono text-slate-400 font-semibold">
                          ${alert.tokenSymbol}
                        </span>
                        {alert.triggered && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            TRIGGERED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                        <span>Set at: {alert.initialPriceSol.toFixed(7)} SOL</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`flex items-center gap-0.5 font-semibold ${
                            isAbove ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isAbove ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {pct >= 0 ? '+' : ''}
                          {pct.toFixed(1)}% target
                        </span>
                        {alert.dlmmBinId && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>DLMM Bin #{alert.dlmmBinId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Toggle & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        onToggleAlert(alert.id);
                      }}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                      title={alert.active ? 'Deactivate alert' : 'Activate alert'}
                    >
                      {alert.active ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        onDeleteAlert(alert.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Target Price and Condition Banner */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Target Price</span>
                    <span className="text-white font-bold tabular-nums">
                      {alert.condition} {alert.targetPriceSol.toFixed(7)} SOL
                    </span>
                    <span className="text-slate-400 text-[11px] block">
                      ≈ ${alert.targetPriceUsd.toFixed(5)} USD
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Current Price</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {alert.currentPriceSol.toFixed(7)} SOL
                    </span>
                    <span className="text-slate-400 text-[11px] block">
                      ${alert.currentPriceUsd.toFixed(5)} USD
                    </span>
                  </div>
                </div>

                {alert.note && (
                  <p className="text-xs text-slate-300 font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    Execution note: {alert.note}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
