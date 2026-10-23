import React, { useState } from 'react';
import {
  Users,
  Copy,
  Zap,
  Sliders,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  ToggleLeft,
  ToggleRight,
  Activity,
  Sparkles,
  ArrowRight,
  X,
  Target,
  Play,
} from 'lucide-react';
import { MirroredWallet, MirrorTradeEvent } from '../types/sniper';
import { playClickSound, playSnipeChime } from '../utils/audio';

interface MirrorTradingProps {
  mirroredWallets: MirroredWallet[];
  mirrorEvents: MirrorTradeEvent[];
  onAddWallet: (wallet: Omit<MirroredWallet, 'id' | 'totalCopiedTrades' | 'winRate' | 'totalPnlSol' | 'createdAt'>) => void;
  onUpdateMultiplier: (walletId: string, multiplier: number) => void;
  onToggleWallet: (walletId: string) => void;
  onDeleteWallet: (walletId: string) => void;
  onSimulateTrade?: (walletId: string) => void;
  solPriceUsd: number;
}

const PRESET_ALPHA_WALLETS = [
  {
    address: '7xK9pLmQrZ2mP4qN8uV1bX0wE5tY3sD6fpump',
    alias: 'AlphaWhale.sol',
    winRate: 84.2,
    pnl30dSol: 42.8,
    style: 'Early Bonding Frontrunner',
    recommendedMultiplier: 0.5,
  },
  {
    address: '3mQ8rY1zJ5wL6uM8aX0oP1vB7eK1mR9tpump',
    alias: 'CurveRider.sol',
    winRate: 79.5,
    pnl30dSol: 28.4,
    style: 'Momentum Scalper',
    recommendedMultiplier: 0.25,
  },
  {
    address: '9yNm8uM4aX7oP2vB8eL6mR5tY1zK3wN8pump',
    alias: 'SnipeLord.sol',
    winRate: 88.0,
    pnl30dSol: 64.1,
    style: 'Shell Armor Verified Only',
    recommendedMultiplier: 1.0,
  },
];

export const MirrorTrading: React.FC<MirrorTradingProps> = ({
  mirroredWallets,
  mirrorEvents,
  onAddWallet,
  onUpdateMultiplier,
  onToggleWallet,
  onDeleteWallet,
  onSimulateTrade,
  solPriceUsd,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [aliasInput, setAliasInput] = useState('');
  const [multiplierInput, setMultiplierInput] = useState(0.5);
  const [maxCapInput, setMaxCapInput] = useState(1.0);
  const [copyBuysInput, setCopyBuysInput] = useState(true);
  const [copySellsInput, setCopySellsInput] = useState(true);
  const [requireArmorInput, setRequireArmorInput] = useState(true);

  // Quick inline input state
  const [quickAddress, setQuickAddress] = useState('');
  const [quickAlias, setQuickAlias] = useState('');
  const [quickMultiplier, setQuickMultiplier] = useState(0.5);
  const [quickCopiedFeedback, setQuickCopiedFeedback] = useState<string | null>(null);

  // Stats calculation
  const totalMirroredTrades = mirrorEvents.filter((e) => e.status === 'MIRRORED').length;
  const totalMirroredPnlSol = mirroredWallets.reduce((acc, w) => acc + w.totalPnlSol, 0);
  const activeWalletsCount = mirroredWallets.filter((w) => w.active).length;

  const handleOpenAddModal = (preset?: typeof PRESET_ALPHA_WALLETS[0]) => {
    playClickSound();
    if (preset) {
      setAddressInput(preset.address);
      setAliasInput(preset.alias);
      setMultiplierInput(preset.recommendedMultiplier);
    } else {
      setAddressInput('');
      setAliasInput('');
      setMultiplierInput(0.5);
    }
    setIsAddModalOpen(true);
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;

    playSnipeChime();
    onAddWallet({
      address: addressInput.trim(),
      alias: aliasInput.trim() || `Whale-${addressInput.slice(0, 4)}`,
      multiplier: multiplierInput,
      maxSolCap: maxCapInput,
      copyBuys: copyBuysInput,
      copySells: copySellsInput,
      requireArmor: requireArmorInput,
      active: true,
    });

    setIsAddModalOpen(false);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = quickAddress.trim();
    if (!cleanAddr) return;

    playSnipeChime();
    onAddWallet({
      address: cleanAddr,
      alias: quickAlias.trim() || `Whale-${cleanAddr.slice(0, 4)}`,
      multiplier: quickMultiplier,
      maxSolCap: 1.5,
      copyBuys: true,
      copySells: true,
      requireArmor: true,
      active: true,
    });

    setQuickAddress('');
    setQuickAlias('');
  };

  const copyToClipboard = (text: string, id: string) => {
    playClickSound();
    navigator.clipboard.writeText(text);
    setQuickCopiedFeedback(id);
    setTimeout(() => setQuickCopiedFeedback(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. MASTER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#121f2f] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Pump.fun Wallet Mirroring Engine</h2>
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  Real-Time Copy Sniper
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Input any Pump.fun wallet address to automatically mirror their buys & sells with custom multiplier scaling and sub-50ms execution.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="min-h-[44px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95 self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Wallet to Mirror</span>
          </button>
        </div>

        {/* Telemetry KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Active Mirror Targets</span>
            <span className="font-mono tabular-nums text-lg font-bold text-cyan-400">
              {activeWalletsCount} / {mirroredWallets.length} Wallets
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Mirrored Trades Executed</span>
            <span className="font-mono tabular-nums text-lg font-bold text-white">
              {totalMirroredTrades} Executions
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Net Mirror P&amp;L</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`font-mono tabular-nums text-lg font-bold ${
                  totalMirroredPnlSol >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalMirroredPnlSol >= 0 ? '+' : ''}
                {totalMirroredPnlSol.toFixed(3)} SOL
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              ≈ ${(totalMirroredPnlSol * solPriceUsd).toFixed(2)} USD
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase block">Execution Latency</span>
            <span className="font-mono tabular-nums text-lg font-bold text-emerald-400">
              32ms (Jito Bundle)
            </span>
          </div>
        </div>
      </div>

      {/* 2. DIRECT INLINE INPUT: FAST WALLET ADD */}
      <div className="bg-[#0b1220] border border-cyan-500/25 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Input · Mirror Any Pump.fun Wallet
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Paste address &amp; set multiplier
          </span>
        </div>

        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-6">
              <input
                type="text"
                required
                placeholder="Pump.fun wallet address (e.g. 7xK9pLmQrZ...pump)"
                value={quickAddress}
                onChange={(e) => setQuickAddress(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl font-mono text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="Alias (e.g. Whale Alpha)"
                value={quickAlias}
                onChange={(e) => setQuickAlias(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full h-11 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Start Mirroring</span>
              </button>
            </div>
          </div>

          {/* Quick multiplier selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Multiplier:</span>
              <div className="flex items-center gap-1">
                {[0.25, 0.5, 1.0, 1.5, 2.0].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setQuickMultiplier(m);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      quickMultiplier === m
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-400 text-[11px]">
              Target buys 1.0 SOL → You mirror <strong className="text-cyan-400">{quickMultiplier.toFixed(2)} SOL</strong>
            </span>
          </div>
        </form>
      </div>

      {/* 3. PRESET CURATED ALPHA WALLETS (SMART MONEY SYNDICATE) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Smart Money Syndicate · Verified Pump.fun Alpha Wallets
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">1-Tap Mirror</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_ALPHA_WALLETS.map((preset) => {
            const isAlreadyAdded = mirroredWallets.some((w) => w.address === preset.address);

            return (
              <div
                key={preset.address}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{preset.alias}</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {preset.winRate}% Win
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <span className="truncate">{preset.address.slice(0, 6)}...{preset.address.slice(-6)}</span>
                    <a
                      href={`https://pump.fun/profile/${preset.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      title="View Pump.fun profile"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono pt-1">
                    <span>30d Gain: </span>
                    <span className="text-emerald-400 font-semibold">+{preset.pnl30dSol} SOL</span>
                    <span className="text-slate-600"> · </span>
                    <span>{preset.style}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAddModal(preset)}
                  disabled={isAlreadyAdded}
                  className={`min-h-[40px] w-full rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isAlreadyAdded
                      ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300'
                  }`}
                >
                  {isAlreadyAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Already Mirroring</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Mirror {preset.recommendedMultiplier}x Size</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CURRENT TRACKED WALLETS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Tracked Target Wallets ({mirroredWallets.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Adjustable Multiplier per Address
          </span>
        </div>

        {mirroredWallets.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-medium text-slate-300">No target wallets configured yet</p>
            <p className="text-xs text-slate-500">
              Input any Pump.fun wallet address above to automatically replicate their trades with customizable multiplier sizing.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mirroredWallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  wallet.active
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Header row: Alias, Address, Active toggle, Simulate, Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-sm text-cyan-400 shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{wallet.alias}</span>
                        {wallet.requireArmor && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded flex items-center gap-1 shrink-0">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Armor Guard
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                        <span className="truncate">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</span>
                        <button
                          onClick={() => copyToClipboard(wallet.address, wallet.id)}
                          className="hover:text-slate-300 transition-colors"
                          title="Copy address"
                        >
                          {quickCopiedFeedback === wallet.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={`https://pump.fun/profile/${wallet.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          title="View on Pump.fun"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 font-semibold">{wallet.winRate}% Win</span>
                        <span aria-hidden="true">·</span>
                        <span>{wallet.totalCopiedTrades} trades</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Instant Test Trade Trigger */}
                    {onSimulateTrade && (
                      <button
                        onClick={() => {
                          playClickSound();
                          onSimulateTrade(wallet.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono flex items-center gap-1 transition-all"
                        title="Simulate target trade execution now"
                      >
                        <Play className="w-3 h-3 fill-cyan-400" />
                        <span className="hidden sm:inline">Simulate Trade</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        playClickSound();
                        onToggleWallet(wallet.id);
                      }}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                      title={wallet.active ? 'Pause mirroring' : 'Activate mirroring'}
                    >
                      {wallet.active ? (
                        <ToggleRight className="w-7 h-7 text-cyan-400" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-600" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        onDeleteWallet(wallet.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove wallet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Multiplier Slider & Controls */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">Trade Size Multiplier</span>
                    <span className="text-cyan-400 font-bold tabular-nums">
                      {wallet.multiplier.toFixed(2)}x (Cap: {wallet.maxSolCap} SOL)
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0.1}
                    max={3.0}
                    step={0.05}
                    value={wallet.multiplier}
                    onChange={(e) => onUpdateMultiplier(wallet.id, Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />

                  {/* Multiplier Quick Presets */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Target buys 2.0 SOL → You mirror <strong className="text-white">{(Math.min(2.0 * wallet.multiplier, wallet.maxSolCap)).toFixed(2)} SOL</strong>
                    </span>
                    <div className="flex items-center gap-1">
                      {[0.25, 0.5, 1.0, 2.0].map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            playClickSound();
                            onUpdateMultiplier(wallet.id, m);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                            wallet.multiplier === m
                              ? 'bg-cyan-500 text-black font-bold'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {m}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. REAL-TIME MIRRORED TRANSACTIONS STREAM */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Mirrored Execution Feed
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Direct Pump.fun Slot Listener
          </span>
        </div>

        <div className="space-y-2">
          {mirrorEvents.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    event.action === 'BUY'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  MIRROR {event.action}
                </span>
                <span className="text-white font-bold">${event.tokenSymbol}</span>
                <span className="text-slate-500">via</span>
                <span className="text-cyan-300 font-semibold">{event.walletAlias}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-right">
                <div className="text-slate-400 text-[11px]">
                  <span>Target: {event.originalAmountSol} SOL → </span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    You: {event.mirroredAmountSol} SOL ({event.multiplier}x)
                  </span>
                </div>

                <span className="text-emerald-400 text-[11px] tabular-nums">
                  {event.latencyMs}ms
                </span>

                <a
                  href={`https://solscan.io/tx/${event.signature}`}
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

      {/* 6. ADD WALLET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0f1d] border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Pump.fun Wallet to Mirror</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Real-Time Sub-50ms Copy Trading
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setIsAddModalOpen(false);
                }}
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWallet} className="space-y-4">
              {/* Wallet Address Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Target Wallet Address (Solana Public Key)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7xK9pLmQrZ2mP4qN8uV1bX0wE5tY3sD6fpump"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl font-mono text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Alias / Nickname */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Wallet Alias / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Top Insider Whale"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Multiplier Slider & Value */}
              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Trade Size Multiplier</span>
                  <span className="font-mono text-cyan-400 font-bold tabular-nums">
                    {multiplierInput.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3.0}
                  step={0.05}
                  value={multiplierInput}
                  onChange={(e) => setMultiplierInput(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[0.25, 0.5, 1.0, 2.0].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMultiplierInput(m)}
                      className={`py-1 rounded text-xs font-mono font-medium transition-colors ${
                        multiplierInput === m
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Max SOL Cap Limit */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Max Allocation Cap (SOL)</span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">
                    {maxCapInput} SOL Max
                  </span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={maxCapInput}
                  onChange={(e) => setMaxCapInput(Number(e.target.value))}
                  className="w-full h-11 px-3.5 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl font-mono text-xs text-white focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 block">
                  Prevents copying excessive sizes if the whale buys with 20+ SOL.
                </span>
              </div>

              {/* Safety: Require Shell Armor Pass */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-200 block">
                    Shell Armor Honeypot Guard
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Aborts mirroring if target wallet buys a token that fails zero-rug verification.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={requireArmorInput}
                  onChange={(e) => setRequireArmorInput(e.target.checked)}
                  className="w-5 h-5 accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Start Real-Time Mirroring</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
