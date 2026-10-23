import React, { useState } from 'react';
import { Search, ShieldCheck, Zap, Copy, Check, Eye, Bell } from 'lucide-react';
import { Token } from '../types/sniper';
import { playClickSound, playSnipeChime } from '../utils/audio';

interface TokenScannerProps {
  tokens: Token[];
  onSelectToken: (token: Token) => void;
  onQuickSnipe: (token: Token) => void;
  isAutonomousEnabled: boolean;
  defaultTradeSol: number;
  onOpenSetAlert?: (token: Token) => void;
}

export const TokenScanner: React.FC<TokenScannerProps> = ({
  tokens,
  onSelectToken,
  onQuickSnipe,
  isAutonomousEnabled,
  defaultTradeSol,
  onOpenSetAlert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'safe' | 'pumping' | 'lowdev'>('all');
  const [copiedMint, setCopiedMint] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, mint: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(mint);
    setCopiedMint(mint);
    playClickSound();
    setTimeout(() => setCopiedMint(null), 1800);
  };

  const filteredTokens = tokens.filter((tok) => {
    // Search filter
    const matchesSearch =
      tok.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tok.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tok.mint.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'safe') {
      return tok.armorScore >= 85 && tok.devHoldingPercent <= 6 && tok.freezeAuthorityDisabled;
    }
    if (filterMode === 'pumping') {
      return tok.bondingCurveProgress >= 25;
    }
    if (filterMode === 'lowdev') {
      return tok.devHoldingPercent <= 3.5;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Network & Live Radar Telemetry Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200">Pump.fun Bonding Radar</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-mono">v2.4 Engine Active</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-mono tabular-nums">Sub-50ms RPC</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <span>Tracking:</span>
            <span className="text-white font-bold tabular-nums">{tokens.length} Launches</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token name, symbol ($CUA), or mint address..."
            className="w-full h-11 pl-10 pr-4 bg-slate-900/90 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => {
              playClickSound();
              setFilterMode('all');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterMode === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({tokens.length})
          </button>
          <button
            onClick={() => {
              playClickSound();
              setFilterMode('safe');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterMode === 'safe'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Shell Safe (&gt;85)
          </button>
          <button
            onClick={() => {
              playClickSound();
              setFilterMode('pumping');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterMode === 'pumping'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bonding &gt;25%
          </button>
          <button
            onClick={() => {
              playClickSound();
              setFilterMode('lowdev');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterMode === 'lowdev'
                ? 'bg-slate-800 text-purple-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dev &lt;3.5%
          </button>
        </div>
      </div>

      {/* Autonomous Mode Banner Notice if Active */}
      {isAutonomousEnabled && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400 shrink-0" />
            <span>
              Autonomous sniper active: Evaluating launches and auto-buying {defaultTradeSol} SOL on verified Shell Armor passes.
            </span>
          </div>
        </div>
      )}

      {/* Tokens List */}
      <div className="space-y-2.5">
        {filteredTokens.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-medium text-slate-300">No launches match your current filters</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or selecting &quot;All&quot; to view incoming Pump.fun tokens.
            </p>
          </div>
        ) : (
          filteredTokens.map((token) => {
            const isSafe = token.armorScore >= 80;
            const isRug = token.armorScore < 50 || token.status === 'RUGGED';

            return (
              <div
                key={token.id}
                onClick={() => {
                  playClickSound();
                  onSelectToken(token);
                }}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all cursor-pointer group space-y-3"
              >
                {/* Header Row: Symbol, Name, Time, Mint Copy */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold font-mono text-sm text-emerald-400 shrink-0">
                      ${token.symbol.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {token.name}
                        </h3>
                        <span className="text-xs font-mono text-slate-400 font-semibold shrink-0">
                          ${token.symbol}
                        </span>
                      </div>
                      {/* Unboxed Metadata Discipline */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <button
                          onClick={(e) => handleCopy(e, token.mint)}
                          className="hover:text-slate-300 flex items-center gap-1 font-mono transition-colors"
                          title="Copy Contract Mint"
                        >
                          <span>{token.mint.slice(0, 4)}...{token.mint.slice(-4)}</span>
                          {copiedMint === token.mint ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <span aria-hidden="true">·</span>
                        <span>{token.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{Math.floor((Date.now() - token.createdAt) / 1000)}s ago</span>
                      </div>
                    </div>
                  </div>

                  {/* Shell Armor Badge Score */}
                  <div className="flex items-center gap-1.5 shrink-0 text-right">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <ShieldCheck
                          className={`w-3.5 h-3.5 ${
                            isSafe ? 'text-emerald-400' : isRug ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-mono font-bold tabular-nums ${
                            isSafe ? 'text-emerald-400' : isRug ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {token.armorScore}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {isSafe ? 'Shielded' : isRug ? 'Danger' : 'Moderate'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bonding Curve Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px] text-slate-500">Pump.fun Bonding Curve</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-medium">
                      {token.bondingCurveProgress.toFixed(1)}% / 100%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        token.bondingCurveProgress > 70
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(token.bondingCurveProgress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics Strip (Market Cap, Price, Dev Holding, Top 10) */}
                <div className="grid grid-cols-4 gap-2 py-2 border-y border-slate-800/80 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">MCap</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-200">
                      ${(token.marketCap / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Liquidity</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-200">
                      {token.liquiditySol} SOL
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Dev Holds</span>
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        token.devHoldingPercent > 6 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {token.devHoldingPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Top 10</span>
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        token.top10HoldersPercent > 25 ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      {token.top10HoldersPercent}%
                    </span>
                  </div>
                </div>

                {/* Actions: View Details vs Quick Snipe Button */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        onSelectToken(token);
                      }}
                      className="min-h-[44px] px-2.5 text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Audit</span>
                    </button>

                    {onOpenSetAlert && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          onOpenSetAlert(token);
                        }}
                        className="min-h-[44px] px-2.5 text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                        title="Set Custom Price Alert"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Alert</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSnipeChime();
                      onQuickSnipe(token);
                    }}
                    className="min-h-[44px] px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>Snipe {defaultTradeSol} SOL</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
