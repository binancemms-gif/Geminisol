import React, { useState } from 'react';
import {
  Gift,
  Copy,
  Check,
  TrendingUp,
  Share2,
  Award,
  ChevronRight,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { ReferralData } from '../types/sniper';
import { REFERRAL_TIERS } from '../utils/mockData';
import { playClickSound, playProfitChime } from '../utils/audio';

interface ReferralProgramProps {
  referralData: ReferralData;
  onClaimRewards: () => void;
  solPriceUsd: number;
}

export const ReferralProgram: React.FC<ReferralProgramProps> = ({
  referralData,
  onClaimRewards,
  solPriceUsd,
}) => {
  const [copied, setCopied] = useState(false);
  const [calcReferrals, setCalcReferrals] = useState(15);
  const [calcVolumeSol, setCalcVolumeSol] = useState(5);

  const referralUrl = `https://solarmor.io/ref/${referralData.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = () => {
    if (referralData.unclaimedRewardsSol <= 0) return;
    playProfitChime();
    onClaimRewards();
  };

  // Commission calculator math:
  // Pump.fun fee ~1%. If tier rate is 22%, affiliate receives 0.22% of volume
  const getCommissionRateForCount = (count: number) => {
    if (count >= 51) return 0.35;
    if (count >= 21) return 0.28;
    if (count >= 6) return 0.22;
    return 0.15;
  };
  const projectedMonthlyVolume = calcReferrals * calcVolumeSol * 30;
  const affiliateFeeRate = 0.01 * getCommissionRateForCount(calcReferrals);
  const estimatedMonthlySol = projectedMonthlyVolume * affiliateFeeRate;

  const currentTier = REFERRAL_TIERS.find(
    (t) => t.tierNumber === referralData.currentTierNumber
  ) || REFERRAL_TIERS[0];

  const nextTier = REFERRAL_TIERS.find(
    (t) => t.tierNumber === referralData.currentTierNumber + 1
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#101b2b] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Tiered SOL Referral Program</h2>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Up to 35% Commission
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Earn ongoing SOL payouts from every transaction executed by snipers you introduce.
              </p>
            </div>
          </div>

          {/* Unclaimed Rewards Box */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Unclaimed SOL</span>
              <span className="font-mono tabular-nums text-lg font-bold text-emerald-400">
                {referralData.unclaimedRewardsSol.toFixed(2)} SOL
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                ≈ ${(referralData.unclaimedRewardsSol * solPriceUsd).toFixed(2)} USD
              </span>
            </div>
            <button
              onClick={handleClaim}
              disabled={referralData.unclaimedRewardsSol <= 0}
              className="min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              Claim Rewards
            </button>
          </div>
        </div>

        {/* User Referral Link Bar */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Your Referral Link:</span>
            <span className="font-mono text-xs text-emerald-300 truncate select-all">
              {referralUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="min-h-[44px] px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=Sniping%20Pump.fun%20launches%20sub-50ms%20with%20@trycua%20ShellArmor%20AI!%20Join%20my%20syndicate:%20${encodeURIComponent(
                referralUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share</span>
            </a>
          </div>
        </div>
      </div>

      {/* Tier Progress & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Active Referrals</span>
          <span className="font-mono tabular-nums text-xl font-bold text-white">
            {referralData.activeTraders} Traders
          </span>
          <span className="text-[11px] text-slate-400 block font-mono">
            {referralData.totalReferrals} total signed up
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Current Tier</span>
          <span className="font-mono text-xl font-bold text-emerald-400 flex items-center gap-1.5">
            <Award className="w-5 h-5 text-emerald-400" />
            {currentTier.name}
          </span>
          <span className="text-[11px] text-slate-400 block font-mono">
            {referralData.commissionPercent}% Commission Rate
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">Lifetime Earnings</span>
          <span className="font-mono tabular-nums text-xl font-bold text-purple-400">
            {referralData.lifetimeEarningsSol.toFixed(2)} SOL
          </span>
          <span className="text-[11px] text-slate-400 block font-mono">
            ≈ ${(referralData.lifetimeEarningsSol * solPriceUsd).toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Commission Tiers Ladder */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Commission Tiers Ladder
          </h3>
          {nextTier && (
            <span className="text-xs font-mono text-slate-400">
              {nextTier.minReferrals - referralData.activeTraders} more traders to {nextTier.name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {REFERRAL_TIERS.map((tier) => {
            const isCurrent = tier.tierNumber === referralData.currentTierNumber;
            const isAchieved = tier.tierNumber <= referralData.currentTierNumber;

            return (
              <div
                key={tier.tierNumber}
                className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : isAchieved
                    ? 'bg-slate-950/40 border-slate-800'
                    : 'bg-slate-950/20 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-slate-500">
                    Tier 0{tier.tierNumber}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Current
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{tier.name}</h4>
                  <span className="text-lg font-mono font-bold text-emerald-400 block">
                    {Math.round(tier.commissionRate * 100)}%
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  <span>Req: {tier.minReferrals}+ active traders</span>
                </div>

                <ul className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  {tier.perks.map((p, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commission Earnings Calculator */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Affiliate SOL Projection Calculator
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Referred Traders:</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  {calcReferrals} Traders ({Math.round(getCommissionRateForCount(calcReferrals) * 100)}% tier)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={80}
                value={calcReferrals}
                onChange={(e) => setCalcReferrals(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Avg Daily Volume per Sniper:</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  {calcVolumeSol} SOL / day
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={calcVolumeSol}
                onChange={(e) => setCalcVolumeSol(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-center space-y-2 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">
              Projected Monthly Commission
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tabular-nums">
              {estimatedMonthlySol.toFixed(2)} SOL
            </span>
            <span className="text-xs font-mono text-slate-400">
              ≈ ${(estimatedMonthlySol * solPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD / month
            </span>
            <p className="text-[10px] text-slate-500 pt-1">
              Based on standard 1% Pump.fun trading fee share distribution.
            </p>
          </div>
        </div>
      </div>

      {/* Claim History */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Commission Claim History
        </h3>

        <div className="space-y-2">
          {referralData.claimedHistory.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{item.date}</span>
                <span className="text-slate-500">·</span>
                <span className="text-emerald-400 font-bold">+{item.amountSol.toFixed(2)} SOL</span>
              </div>
              <span className="text-slate-500">{item.txHash}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
