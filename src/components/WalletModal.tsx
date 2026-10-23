import React, { useState } from 'react';
import { X, Wallet, Copy, Check, PlusCircle, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { WalletState } from '../types/sniper';
import { playClickSound, playProfitChime } from '../utils/audio';

interface WalletModalProps {
  wallet: WalletState;
  isOpen: boolean;
  onClose: () => void;
  onAddFaucetSol: (amount: number) => void;
  onSwitchProvider: (provider: WalletState['walletProvider']) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  wallet,
  isOpen,
  onClose,
  onAddFaucetSol,
  onSwitchProvider,
}) => {
  const [copied, setCopied] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFaucet = () => {
    playProfitChime();
    onAddFaucetSol(5.0);
    setFaucetSuccess(true);
    setTimeout(() => setFaucetSuccess(false), 2500);
  };

  const providers: WalletState['walletProvider'][] = [
    'Phantom',
    'Solflare',
    'Backpack',
    'Internal Paper Wallet',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0a0e17] border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Solana Sniper Wallet</h3>
              <span className="text-xs font-mono text-emerald-400">{wallet.walletProvider}</span>
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

        {/* Balance Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            Available Trading Balance
          </span>
          <div className="text-3xl font-mono font-bold text-emerald-400 tabular-nums">
            {wallet.balanceSol.toFixed(3)} SOL
          </div>
          <span className="text-xs font-mono text-slate-400 block tabular-nums">
            ≈ ${wallet.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </span>
        </div>

        {/* Public Key Display */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block">Solana Public Key</span>
            <span className="font-mono text-slate-300 truncate block">
              {wallet.address}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 shrink-0 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Faucet Test SOL Button */}
        <div className="space-y-1.5">
          <button
            onClick={handleFaucet}
            className="w-full min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>
              {faucetSuccess ? 'Air-dropped +5.0 SOL!' : 'Request +5.0 Test SOL Faucet'}
            </span>
          </button>
          <span className="text-[10px] text-slate-500 block text-center">
            Simulates instant Devnet / Paper test liquidity for risk-free sniper simulation.
          </span>
        </div>

        {/* Switch Provider */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
            Select Wallet Adapter
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {providers.map((p) => (
              <button
                key={p}
                onClick={() => {
                  playClickSound();
                  onSwitchProvider(p);
                }}
                className={`p-2.5 rounded-xl border text-left transition-colors font-mono ${
                  wallet.walletProvider === p
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
