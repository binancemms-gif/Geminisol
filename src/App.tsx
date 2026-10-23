import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TokenScanner } from './components/TokenScanner';
import { TokenModal } from './components/TokenModal';
import { AgentTerminal } from './components/AgentTerminal';
import { PositionsDashboard } from './components/PositionsDashboard';
import { StrategyArmorSettings } from './components/StrategyArmorSettings';
import { ReferralProgram } from './components/ReferralProgram';
import { WalletModal } from './components/WalletModal';
import {
  Token,
  StrategySettings,
  Position,
  TradeLog,
  AgentThought,
  ReferralData,
  WalletState,
} from './types/sniper';
import {
  INITIAL_TOKENS,
  INITIAL_POSITIONS,
  INITIAL_TRADE_LOGS,
  INITIAL_AGENT_THOUGHTS,
  INITIAL_REFERRAL_DATA,
} from './utils/mockData';
import { generateRandomToken } from './utils/tokenGenerator';
import { playSnipeChime, playProfitChime, playAlertBuzzer, playPanicSound } from './utils/audio';

const SOL_PRICE_USD = 182.40;

const DEFAULT_STRATEGY: StrategySettings = {
  isAutonomousEnabled: true,
  executionMode: 'LIVE_RPC',
  minInvestmentSol: 0.1,
  maxInvestmentSol: 1.5,
  defaultTradeSol: 0.35,
  slippagePercent: 15,
  takeProfitPercent: 65,
  takeProfitHalfAt: 40,
  stopLossPercent: 20,
  maxDevHoldingPercent: 5.0,
  minArmorScore: 82,
  autoSellOnBondingCurvePercent: 88,
  trailingStopLossPercent: 12,
  jitoTipSol: 0.005,
  priorityFeeMicroLamports: 150000,
  antiMevEnabled: true,
  autoSellStagnantSeconds: 60,
  soundAlertsEnabled: true,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [tokens, setTokens] = useState<Token[]>(INITIAL_TOKENS);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>(INITIAL_TRADE_LOGS);
  const [thoughts, setThoughts] = useState<AgentThought[]>(INITIAL_AGENT_THOUGHTS);
  const [settings, setSettings] = useState<StrategySettings>(DEFAULT_STRATEGY);
  const [referralData, setReferralData] = useState<ReferralData>(INITIAL_REFERRAL_DATA);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const [wallet, setWallet] = useState<WalletState>({
    address: '7xKp4vY9wQ2mR8tZ1nB6eL3jP5uM0sD7fpump',
    connected: true,
    balanceSol: 14.85,
    balanceUsd: 14.85 * SOL_PRICE_USD,
    solPriceUsd: SOL_PRICE_USD,
    walletProvider: 'Phantom',
  });

  const [totalEvaluated, setTotalEvaluated] = useState(128);
  const [totalSniped, setTotalSniped] = useState(8);

  // Refs for current values inside interval loops
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const walletRef = useRef(wallet);
  walletRef.current = wallet;

  // 1. Live Pump.fun Token Stream Generator
  useEffect(() => {
    const streamInterval = setInterval(() => {
      const newToken = generateRandomToken();
      setTokens((prev) => [newToken, ...prev.slice(0, 35)]);
      setTotalEvaluated((c) => c + 1);

      // Autonomous Evaluation Engine
      const currentSettings = settingsRef.current;
      const currentWallet = walletRef.current;

      if (currentSettings.isAutonomousEnabled) {
        const passesArmor =
          newToken.armorScore >= currentSettings.minArmorScore &&
          newToken.devHoldingPercent <= currentSettings.maxDevHoldingPercent &&
          newToken.mintAuthorityRevoked &&
          newToken.freezeAuthorityDisabled &&
          newToken.honeypotPassed;

        const latency = Math.floor(31 + Math.random() * 17); // 31ms - 48ms

        if (passesArmor && currentWallet.balanceSol >= currentSettings.defaultTradeSol) {
          // Autonomous Snipe Trigger
          executeSnipe(newToken, currentSettings.defaultTradeSol, latency, true);
        } else {
          // Log Skip Reason
          const skipReason =
            newToken.armorScore < currentSettings.minArmorScore
              ? `Shell Armor score ${newToken.armorScore} < ${currentSettings.minArmorScore}`
              : newToken.devHoldingPercent > currentSettings.maxDevHoldingPercent
              ? `Dev holdings ${newToken.devHoldingPercent}% exceeds ${currentSettings.maxDevHoldingPercent}% cap`
              : !newToken.freezeAuthorityDisabled
              ? `Honeypot alert: Freeze authority active`
              : `Insufficient balance`;

          setThoughts((prev) => [
            {
              id: `th-${Date.now()}`,
              timestamp: Date.now(),
              level: newToken.armorScore < 50 ? 'ALERT' : 'WARNING',
              tokenSymbol: newToken.symbol,
              message: `Launch Evaluated in ${latency}ms: REJECTED (${skipReason}).`,
              actionTaken: 'SKIPPED',
              latencyMs: latency,
            },
            ...prev.slice(0, 40),
          ]);
        }
      }
    }, 8500);

    return () => clearInterval(streamInterval);
  }, []);

  // 2. Positions Price Fluctuation & Auto-Exit Rule Engine
  useEffect(() => {
    const priceInterval = setInterval(() => {
      setPositions((prevPositions) => {
        if (prevPositions.length === 0) return prevPositions;

        return prevPositions.map((pos) => {
          // Dynamic price swing: -4% to +6%
          const deltaFactor = 1 + (Math.random() * 0.10 - 0.04);
          const nextPriceSol = Number((pos.currentPriceSol * deltaFactor).toFixed(7));
          const nextPriceUsd = Number((nextPriceSol * SOL_PRICE_USD).toFixed(5));
          const currentValSol = Number(((pos.amountTokens * nextPriceSol)).toFixed(4));
          const pnlSol = Number((currentValSol - pos.investedSol).toFixed(4));
          const pnlPercent = Number(((pnlSol / pos.investedSol) * 100).toFixed(1));
          const nextBonding = Math.min(100, pos.bondingCurveProgress + Math.random() * 0.8);

          return {
            ...pos,
            currentPriceSol: nextPriceSol,
            currentPriceUsd: nextPriceUsd,
            currentSolValue: currentValSol,
            pnlSol,
            pnlPercent,
            bondingCurveProgress: nextBonding,
            highestPnlPercent: Math.max(pos.highestPnlPercent, pnlPercent),
          };
        });
      });
    }, 4000);

    return () => clearInterval(priceInterval);
  }, []);

  // 3. Auto-Exit Evaluation (Take-Profit & Stop-Loss)
  useEffect(() => {
    const curSettings = settings;
    positions.forEach((pos) => {
      // Auto Take-Profit Check
      if (pos.pnlPercent >= curSettings.takeProfitPercent) {
        handleAutoExit(pos, 'TAKE_PROFIT');
      }
      // Auto Stop-Loss Check
      else if (pos.pnlPercent <= -curSettings.stopLossPercent) {
        handleAutoExit(pos, 'STOP_LOSS');
      }
      // Auto Bonding Curve Migration Exit
      else if (pos.bondingCurveProgress >= curSettings.autoSellOnBondingCurvePercent) {
        handleAutoExit(pos, 'TAKE_PROFIT', 'Bonding Curve 88% target reached');
      }
    });
  }, [positions, settings]);

  const handleAutoExit = (pos: Position, exitType: 'TAKE_PROFIT' | 'STOP_LOSS', customNote?: string) => {
    // Remove position
    setPositions((prev) => prev.filter((p) => p.id !== pos.id));

    // Return funds + pnl to wallet
    const returnedSol = Math.max(0.01, pos.investedSol + pos.pnlSol);
    setWallet((prev) => ({
      ...prev,
      balanceSol: Number((prev.balanceSol + returnedSol).toFixed(3)),
      balanceUsd: Number(((prev.balanceSol + returnedSol) * SOL_PRICE_USD).toFixed(2)),
    }));

    // Log Trade
    const txSignature = `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`;
    setTradeLogs((prev) => [
      {
        id: `tx-${Date.now()}`,
        timestamp: Date.now(),
        type: exitType,
        tokenSymbol: pos.tokenSymbol,
        tokenMint: pos.tokenMint,
        amountSol: returnedSol,
        priceSol: pos.currentPriceSol,
        latencyMs: Math.floor(28 + Math.random() * 12),
        blockSlot: 312894100 + Math.floor(Math.random() * 500),
        signature: txSignature,
        jitoTipSol: settings.jitoTipSol,
        pnlSol: pos.pnlSol,
        pnlPercent: pos.pnlPercent,
      },
      ...prev,
    ]);

    // Log Agent Thought
    const isWin = pos.pnlPercent > 0;
    if (isWin) playProfitChime();
    else playAlertBuzzer();

    setThoughts((prev) => [
      {
        id: `th-${Date.now()}`,
        timestamp: Date.now(),
        level: isWin ? 'SUCCESS' : 'WARNING',
        tokenSymbol: pos.tokenSymbol,
        message: customNote
          ? `Auto-Exit Triggered: ${customNote}. Realized ${pos.pnlSol > 0 ? '+' : ''}${pos.pnlSol.toFixed(3)} SOL (${pos.pnlPercent}%).`
          : `Auto-${exitType} Executed: Closed position at ${pos.pnlPercent}% (${pos.pnlSol > 0 ? '+' : ''}${pos.pnlSol.toFixed(3)} SOL).`,
        actionTaken: 'SOLD',
        latencyMs: 34,
      },
      ...prev,
    ]);
  };

  // Execute Snipe (Manual or Autonomous)
  const executeSnipe = (token: Token, amountSol: number, latencyMs = 36, isAuto = false) => {
    if (wallet.balanceSol < amountSol) return;

    // Deduct wallet balance
    const nextBal = wallet.balanceSol - amountSol;
    setWallet((prev) => ({
      ...prev,
      balanceSol: Number(nextBal.toFixed(3)),
      balanceUsd: Number((nextBal * SOL_PRICE_USD).toFixed(2)),
    }));

    // Tokens bought
    const tokensBought = Number((amountSol / token.priceSol).toFixed(1));

    // Create new Position
    const newPos: Position = {
      id: `pos-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tokenMint: token.mint,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      category: token.category,
      entryPriceSol: token.priceSol,
      currentPriceSol: token.priceSol,
      entryPriceUsd: token.priceUsd,
      currentPriceUsd: token.priceUsd,
      amountTokens: tokensBought,
      investedSol: amountSol,
      currentSolValue: amountSol,
      pnlSol: 0,
      pnlPercent: 0,
      openedAt: Date.now(),
      highestPnlPercent: 0,
      bondingCurveProgress: token.bondingCurveProgress,
      status: 'OPEN',
    };

    setPositions((prev) => [newPos, ...prev]);
    setTotalSniped((c) => c + 1);

    // Trade Log
    const txSignature = `${Math.random().toString(36).substring(2, 7)}...${Math.random().toString(36).substring(2, 6)}`;
    setTradeLogs((prev) => [
      {
        id: `tx-${Date.now()}`,
        timestamp: Date.now(),
        type: 'BUY',
        tokenSymbol: token.symbol,
        tokenMint: token.mint,
        amountSol,
        priceSol: token.priceSol,
        latencyMs,
        blockSlot: 312894120 + Math.floor(Math.random() * 200),
        signature: txSignature,
        jitoTipSol: settings.jitoTipSol,
      },
      ...prev,
    ]);

    // Agent Thought
    setThoughts((prev) => [
      {
        id: `th-${Date.now()}`,
        timestamp: Date.now(),
        level: 'SUCCESS',
        tokenSymbol: token.symbol,
        message: `${
          isAuto ? 'Autonomous' : 'Manual'
        } Snipe Executed in ${latencyMs}ms! Dev ${token.devHoldingPercent}%, Armor Score ${token.armorScore}/100. Jito bundle broadcasted.`,
        actionTaken: 'SNIPED',
        latencyMs,
      },
      ...prev.slice(0, 40),
    ]);

    playSnipeChime();
  };

  // Sell individual position
  const handleSellPosition = (positionId: string, percentage: number) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    const fraction = percentage / 100;
    const solReceived = Number((pos.currentSolValue * fraction).toFixed(4));
    const pnlShare = Number((pos.pnlSol * fraction).toFixed(4));

    // Update wallet
    setWallet((prev) => ({
      ...prev,
      balanceSol: Number((prev.balanceSol + solReceived).toFixed(3)),
      balanceUsd: Number(((prev.balanceSol + solReceived) * SOL_PRICE_USD).toFixed(2)),
    }));

    // Trade Log
    const txSignature = `${Math.random().toString(36).substring(2, 7)}...${Math.random().toString(36).substring(2, 6)}`;
    setTradeLogs((prev) => [
      {
        id: `tx-${Date.now()}`,
        timestamp: Date.now(),
        type: pos.pnlPercent >= 0 ? 'TAKE_PROFIT' : 'STOP_LOSS',
        tokenSymbol: pos.tokenSymbol,
        tokenMint: pos.tokenMint,
        amountSol: solReceived,
        priceSol: pos.currentPriceSol,
        latencyMs: Math.floor(29 + Math.random() * 15),
        blockSlot: 312894180 + Math.floor(Math.random() * 200),
        signature: txSignature,
        jitoTipSol: settings.jitoTipSol,
        pnlSol: pnlShare,
        pnlPercent: pos.pnlPercent,
      },
      ...prev,
    ]);

    if (percentage >= 100) {
      setPositions((prev) => prev.filter((p) => p.id !== positionId));
    } else {
      setPositions((prev) =>
        prev.map((p) => {
          if (p.id === positionId) {
            const remTokens = p.amountTokens * (1 - fraction);
            const remInvested = p.investedSol * (1 - fraction);
            const remVal = p.currentSolValue * (1 - fraction);
            return {
              ...p,
              amountTokens: remTokens,
              investedSol: remInvested,
              currentSolValue: remVal,
              pnlSol: Number((remVal - remInvested).toFixed(4)),
            };
          }
          return p;
        })
      );
    }
  };

  // Double down on position
  const handleDoubleDown = (pos: Position) => {
    const addAmount = 0.5;
    if (wallet.balanceSol < addAmount) return;

    setWallet((prev) => ({
      ...prev,
      balanceSol: Number((prev.balanceSol - addAmount).toFixed(3)),
      balanceUsd: Number(((prev.balanceSol - addAmount) * SOL_PRICE_USD).toFixed(2)),
    }));

    const addedTokens = addAmount / pos.currentPriceSol;

    setPositions((prev) =>
      prev.map((p) => {
        if (p.id === pos.id) {
          const newTokens = p.amountTokens + addedTokens;
          const newInvested = p.investedSol + addAmount;
          const newVal = newTokens * p.currentPriceSol;
          return {
            ...p,
            amountTokens: newTokens,
            investedSol: newInvested,
            currentSolValue: newVal,
            pnlSol: Number((newVal - newInvested).toFixed(4)),
            pnlPercent: Number((((newVal - newInvested) / newInvested) * 100).toFixed(1)),
          };
        }
        return p;
      })
    );

    playSnipeChime();
  };

  // Panic Sell All
  const handlePanicSellAll = () => {
    if (positions.length === 0) return;

    let totalReturnedSol = 0;
    positions.forEach((pos) => {
      totalReturnedSol += pos.currentSolValue;
      const txSignature = `${Math.random().toString(36).substring(2, 7)}...${Math.random().toString(36).substring(2, 6)}`;
      setTradeLogs((prev) => [
        {
          id: `tx-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type: 'PANIC_SELL',
          tokenSymbol: pos.tokenSymbol,
          tokenMint: pos.tokenMint,
          amountSol: pos.currentSolValue,
          priceSol: pos.currentPriceSol,
          latencyMs: 28,
          blockSlot: 312894220,
          signature: txSignature,
          jitoTipSol: settings.jitoTipSol,
          pnlSol: pos.pnlSol,
          pnlPercent: pos.pnlPercent,
        },
        ...prev,
      ]);
    });

    setWallet((prev) => ({
      ...prev,
      balanceSol: Number((prev.balanceSol + totalReturnedSol).toFixed(3)),
      balanceUsd: Number(((prev.balanceSol + totalReturnedSol) * SOL_PRICE_USD).toFixed(2)),
    }));

    setPositions([]);
    playPanicSound();

    setThoughts((prev) => [
      {
        id: `th-${Date.now()}`,
        timestamp: Date.now(),
        level: 'ALERT',
        message: `EMERGENCY LIQUIDATION: Liquidated ${positions.length} active positions. +${totalReturnedSol.toFixed(2)} SOL returned to wallet.`,
        actionTaken: 'SOLD',
        latencyMs: 28,
      },
      ...prev,
    ]);
  };

  // Claim Referral Rewards
  const handleClaimRewards = () => {
    const claimAmount = referralData.unclaimedRewardsSol;
    if (claimAmount <= 0) return;

    setWallet((prev) => ({
      ...prev,
      balanceSol: Number((prev.balanceSol + claimAmount).toFixed(3)),
      balanceUsd: Number(((prev.balanceSol + claimAmount) * SOL_PRICE_USD).toFixed(2)),
    }));

    setReferralData((prev) => ({
      ...prev,
      unclaimedRewardsSol: 0,
      lifetimeEarningsSol: prev.lifetimeEarningsSol + claimAmount,
      claimedHistory: [
        {
          id: `cl-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amountSol: claimAmount,
          txHash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
        },
        ...prev.claimedHistory,
      ],
    }));
  };

  // Add Faucet SOL
  const handleAddFaucetSol = (amt: number) => {
    setWallet((prev) => ({
      ...prev,
      balanceSol: Number((prev.balanceSol + amt).toFixed(3)),
      balanceUsd: Number(((prev.balanceSol + amt) * SOL_PRICE_USD).toFixed(2)),
    }));
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans pb-20 md:pb-6">
      {/* Top Header */}
      <Header
        wallet={wallet}
        onOpenWallet={() => setIsWalletOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAutonomousEnabled={settings.isAutonomousEnabled}
        onToggleAutonomous={() =>
          setSettings((prev) => ({
            ...prev,
            isAutonomousEnabled: !prev.isAutonomousEnabled,
          }))
        }
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* TAB 1: RADAR / PUMP.FUN SCANNER */}
        {activeTab === 'scanner' && (
          <TokenScanner
            tokens={tokens}
            onSelectToken={(token) => setSelectedToken(token)}
            onQuickSnipe={(token) => executeSnipe(token, settings.defaultTradeSol)}
            isAutonomousEnabled={settings.isAutonomousEnabled}
            defaultTradeSol={settings.defaultTradeSol}
          />
        )}

        {/* TAB 2: AGENT ENGINE & SNIPES */}
        {activeTab === 'agent' && (
          <AgentTerminal
            isAutonomousEnabled={settings.isAutonomousEnabled}
            onToggleAutonomous={() =>
              setSettings((prev) => ({
                ...prev,
                isAutonomousEnabled: !prev.isAutonomousEnabled,
              }))
            }
            thoughts={thoughts}
            settings={settings}
            onTriggerSimulation={() => {
              const testTok = generateRandomToken();
              setTokens((prev) => [testTok, ...prev]);
              executeSnipe(testTok, settings.defaultTradeSol);
            }}
            totalEvaluated={totalEvaluated}
            totalSniped={totalSniped}
          />
        )}

        {/* TAB 3: POSITIONS & P&L */}
        {activeTab === 'positions' && (
          <PositionsDashboard
            positions={positions}
            tradeLogs={tradeLogs}
            onSellPosition={handleSellPosition}
            onDoubleDown={handleDoubleDown}
            onPanicSellAll={handlePanicSellAll}
            solPriceUsd={SOL_PRICE_USD}
          />
        )}

        {/* TAB 4: STRATEGY & SHELL ARMOR PROTECTION */}
        {activeTab === 'settings' && (
          <StrategyArmorSettings
            settings={settings}
            onUpdateSettings={setSettings}
            onResetDefaults={() => setSettings(DEFAULT_STRATEGY)}
          />
        )}

        {/* TAB 5: REFERRALS (15% - 35% TIERS) */}
        {activeTab === 'referral' && (
          <ReferralProgram
            referralData={referralData}
            onClaimRewards={handleClaimRewards}
            solPriceUsd={SOL_PRICE_USD}
          />
        )}
      </main>

      {/* Token Deep Inspection Modal */}
      <TokenModal
        token={selectedToken}
        onClose={() => setSelectedToken(null)}
        onExecuteTrade={(token, amount) => executeSnipe(token, amount)}
        walletBalanceSol={wallet.balanceSol}
      />

      {/* Wallet Management Modal */}
      <WalletModal
        wallet={wallet}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onAddFaucetSol={handleAddFaucetSol}
        onSwitchProvider={(prov) =>
          setWallet((prev) => ({ ...prev, walletProvider: prov }))
        }
      />

      {/* Mobile Fixed Bottom Tab Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openPositionsCount={positions.length}
      />
    </div>
  );
}
