import React from 'react';
import { Bot, Zap, Activity, Cpu, ShieldCheck, Play, Pause, RefreshCw } from 'lucide-react';
import { AgentThought, StrategySettings } from '../types/sniper';
import { playClickSound, playSnipeChime } from '../utils/audio';

interface AgentTerminalProps {
  isAutonomousEnabled: boolean;
  onToggleAutonomous: () => void;
  thoughts: AgentThought[];
  settings: StrategySettings;
  onTriggerSimulation: () => void;
  totalEvaluated: number;
  totalSniped: number;
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({
  isAutonomousEnabled,
  onToggleAutonomous,
  thoughts,
  settings,
  onTriggerSimulation,
  totalEvaluated,
  totalSniped,
}) => {
  return (
    <div className="space-y-4">
      {/* Agent Master Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#0c1524] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">TryCua Autonomous Agent</h2>
                <span className="text-xs font-mono text-emerald-400 font-semibold">v2.4.2</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sub-50ms Pump.fun sniper with Shell Armor honeypot detection &amp; Jito MEV bundles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => {
                playClickSound();
                onTriggerSimulation();
              }}
              className="flex-1 sm:flex-none min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Launch</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onToggleAutonomous();
              }}
              className={`flex-1 sm:flex-none min-h-[44px] px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                isAutonomousEnabled
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {isAutonomousEnabled ? (
                <>
                  <Pause className="w-4 h-4 fill-black" />
                  <span>Agent Running</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Autonomous Snipe</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Telemetry Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> RPC Latency
            </span>
            <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
              34ms (Jito Bundle)
            </span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400" /> Tokens Evaluated
            </span>
            <span className="font-mono tabular-nums text-sm font-bold text-white">
              {totalEvaluated}
            </span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Armor Filter
            </span>
            <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
              &gt;{settings.minArmorScore} Score
            </span>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Activity className="w-3 h-3 text-purple-400" /> Total Sniped
            </span>
            <span className="font-mono tabular-nums text-sm font-bold text-purple-300">
              {totalSniped} Tokens
            </span>
          </div>
        </div>
      </div>

      {/* Live Agent Brain Reasoning Stream */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Autonomous Thought &amp; Execution Stream
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Block Slot: 312894108
          </span>
        </div>

        {/* Console logs */}
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {thoughts.map((th) => {
            const isSnipe = th.actionTaken === 'SNIPED';
            const isSkip = th.actionTaken === 'SKIPPED';
            const isAlert = th.level === 'ALERT';

            return (
              <div
                key={th.id}
                className={`p-3 rounded-xl border font-mono text-xs space-y-1 transition-all ${
                  isSnipe
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : isAlert || isSkip
                    ? 'bg-rose-950/20 border-rose-800/30 text-rose-300'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 tabular-nums">
                      {new Date(th.timestamp).toLocaleTimeString()}
                    </span>
                    {th.tokenSymbol && (
                      <span className="text-white font-bold">
                        ${th.tokenSymbol}
                      </span>
                    )}
                  </div>
                  {th.latencyMs && (
                    <span className="text-emerald-400 font-semibold tabular-nums">
                      {th.latencyMs}ms latency
                    </span>
                  )}
                </div>

                <p className="text-xs leading-relaxed">{th.message}</p>

                {th.actionTaken && (
                  <div className="pt-1 text-[10px] flex items-center gap-2">
                    <span className="text-slate-500 uppercase">Decision:</span>
                    <span
                      className={`font-bold ${
                        isSnipe
                          ? 'text-emerald-400'
                          : isSkip
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      [{th.actionTaken}]
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
