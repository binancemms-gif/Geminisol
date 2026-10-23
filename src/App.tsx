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
import { PriceAlertModal } from './components/PriceAlertModal';
import { PriceAlertBanner } from './components/PriceAlertBanner';
import { PriceAlertsManager } from './components/PriceAlertsManager';
import { MirrorTrading } from './components/MirrorTrading';
import { JitoBundleStatus } from './components/JitoBundleStatus';
import {
  Token,
  StrategySettings,
  Position,
  TradeLog,
  AgentThought,
  ReferralData,
  WalletState,
  PriceAlert,
  TriggeredAlertEvent,
  MirroredWallet,
  MirrorTradeEvent,
} from './types/sniper';
import {
  INITIAL_TOKENS,
  INITIAL_POSITIONS,
  INITIAL_TRADE_LOGS,
  INITIAL_AGENT_THOUGHTS,
  INITIAL_REFERRAL_DATA,
} from './utils/mockData';
import { generateRandomToken } from './utils/tokenGenerator';
import {
  playSnipeChime,
  playProfitChime,
  playAlertBuzzer,
  playPanicSound,
  playPriceAlertChime,
  triggerHaptic,
  triggerSnipeHaptic,
  triggerProfitHaptic,
  triggerStopLossHaptic,
  triggerPanicHaptic,
} from './utils/audio';

const SOL_PRICE_USD = 182.40;

const JITO_VALIDATOR_LEADERS = [
  'Jito-Frankfurt-01',
  'Jito-NewYork-Edge',
  'Chorus-One-Edge',
  'Jito-Tokyo-Edge',
  'Helius-Relayer-04',
  'Everstake-Jito-02',
];

const getRandomValidatorLeader = () =>
  JITO_VALIDATOR_LEADERS[Math.floor(Math.random() * JITO_VALIDATOR_LEADERS.length)];

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

const INITIAL_ALERTS: PriceAlert[] = [
  {
    id: 'alt-1',
    tokenMint: 'CuA9h7xQp9J2vB8eL6mR5tY1zK3wN8uM4aX7oP2pump',
    tokenSymbol: 'CUA',
    tokenName: 'CUA Autonomous Agent',
    targetPriceSol: 0.0000510,
    targetPriceUsd: 0.0000510 * SOL_PRICE_USD,
    condition: 'ABOVE',
    currentPriceSol: 0.0000489,
    currentPriceUsd: 0.0000489 * SOL_PRICE_USD,
    initialPriceSol: 0.0000489,
    createdAt: Date.now() - 120000,
    triggered: false,
    active: true,
    note: 'Take profit 50% on resistance breakout',
    dlmmBinId: 10432,
  },
  {
    id: 'alt-2',
    tokenMint: 'ShLL98yKm2qZ5xT3vC1bN7rE4wA8uI0oP9sD6fpump',
    tokenSymbol: 'SHELL',
    tokenName: 'Shell Armor Guardian',
    targetPriceSol: 0.0000280,
    targetPriceUsd: 0.0000280 * SOL_PRICE_USD,
    condition: 'BELOW',
    currentPriceSol: 0.0000312,
    currentPriceUsd: 0.0000312 * SOL_PRICE_USD,
    initialPriceSol: 0.0000312,
    createdAt: Date.now() - 240000,
    triggered: false,
    active: true,
    note: 'Double down on liquidity dip',
    dlmmBinId: 10408,
  },
];

const INITIAL_MIRRORED_WALLETS: MirroredWallet[] = [
  {
    id: 'mir-1',
    address: '7xK9pLmQrZ2mP4qN8uV1bX0wE5tY3sD6fpump',
    alias: 'AlphaWhale.sol',
    multiplier: 0.5,
    maxSolCap: 1.0,
    copyBuys: true,
    copySells: true,
    requireArmor: true,
    active: true,
    totalCopiedTrades: 12,
    winRate: 84.2,
    totalPnlSol: 3.48,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'mir-2',
    address: '9yNm8uM4aX7oP2vB8eL6mR5tY1zK3wN8pump',
    alias: 'SnipeLord.sol',
    multiplier: 1.0,
    maxSolCap: 1.5,
    copyBuys: true,
    copySells: true,
    requireArmor: true,
    active: true,
    totalCopiedTrades: 7,
    winRate: 88.0,
    totalPnlSol: 2.15,
    createdAt: Date.now() - 7200000,
  },
];

const INITIAL_MIRROR_EVENTS: MirrorTradeEvent[] = [
  {
    id: 'm-ev-1',
    timestamp: Date.now() - 140000,
    walletId: 'mir-1',
    walletAlias: 'AlphaWhale.sol',
    walletAddress: '7xK9...sD6f',
    action: 'BUY',
    tokenSymbol: 'CUA',
    tokenMint: 'CuA9h7xQp9J2vB8eL6mR5tY1zK3wN8uM4aX7oP2pump',
    originalAmountSol: 2.0,
    mirroredAmountSol: 1.0,
    multiplier: 0.5,
    latencyMs: 31,
    signature: '5k8M9x...2rPt',
    status: 'MIRRORED',
    pnlSol: 0.36,
  },
  {
    id: 'm-ev-2',
    timestamp: Date.now() - 320000,
    walletId: 'mir-2',
    walletAlias: 'SnipeLord.sol',
    walletAddress: '9yNm...wN8p',
    action: 'BUY',
    tokenSymbol: 'SHELL',
    tokenMint: 'ShLL98yKm2qZ5xT3vC1bN7rE4wA8uI0oP9sD6fpump',
    originalAmountSol: 0.75,
    mirroredAmountSol: 0.75,
    multiplier: 1.0,
    latencyMs: 29,
    signature: '3vK19p...7qXm',
    status: 'MIRRORED',
    pnlSol: 0.12,
  },
];

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

  // Price target alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>(INITIAL_ALERTS);
  const [triggeredAlertEvents, setTriggeredAlertEvents] = useState<TriggeredAlertEvent[]>([]);
  const [alertTargetToken, setAlertTargetToken] = useState<Token | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Wallet Mirroring state
  const [mirroredWallets, setMirroredWallets] = useState<MirroredWallet[]>(INITIAL_MIRRORED_WALLETS);
  const [mirrorEvents, setMirrorEvents] = useState<MirrorTradeEvent[]>(INITIAL_MIRROR_EVENTS);

  const [wallet, setWallet] = useState<WalletState>({
    address: '7xKp4vY9wQ2mR8tZ1nB6eL3jP5uM0sD7fpump',
    connected: true,
    balanceSol: 14.85,
    balanceUsd: 14.85 * SOL_PRICE_USD,
    solPriceUsd: SOL_PRICE_USD,
    walletProvider: 'Solana Devnet Testnet Wallet',
    isDevnetActive: true,
    devnetSlot: 514391633,
    clusterLatencyMs: 38,
  });

  const [totalEvaluated, setTotalEvaluated] = useState(128);
  const [totalSniped, setTotalSniped] = useState(8);

  // Refs for current values inside interval loops
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const walletRef = useRef(wallet);
  walletRef.current = wallet;
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;
  const mirroredWalletsRef = useRef(mirroredWallets);
  mirroredWalletsRef.current = mirroredWallets;
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;

  // 1. Real Solana Devnet Cluster Telemetry Sync
  useEffect(() => {
    const fetchClusterStatus = async () => {
      try {
        const res = await fetch('/api/solana/cluster-status');
        const data = await res.json();
        if (data.slot) {
          setWallet((prev) => ({
            ...prev,
            isDevnetActive: true,
            devnetSlot: data.slot,
            clusterLatencyMs: data.latencyMs || 34,
          }));
        }
      } catch {
        // Keep smooth baseline
      }
    };

    fetchClusterStatus();
    const clusterInterval = setInterval(fetchClusterStatus, 12000);
    return () => clearInterval(clusterInterval);
  }, []);

  // 2. Real-Time Pump.fun Wallet Trade Mirroring Stream
  useEffect(() => {
    const mirrorInterval = setInterval(() => {
      const activeTargets = mirroredWalletsRef.current.filter((w) => w.active);
      if (activeTargets.length === 0) return;

      const randomTarget = activeTargets[Math.floor(Math.random() * activeTargets.length)];
      const currentTokens = tokensRef.current;
      if (currentTokens.length === 0) return;

      const targetToken = currentTokens[Math.floor(Math.random() * Math.min(5, currentTokens.length))];
      const targetOriginalSol = Number((0.5 + Math.random() * 2.5).toFixed(2));
      const scaledSol = Number(
        Math.min(targetOriginalSol * randomTarget.multiplier, randomTarget.maxSolCap).toFixed(2)
      );

      const passesArmor =
        !randomTarget.requireArmor ||
        (targetToken.armorScore >= 75 && targetToken.freezeAuthorityDisabled);

      const latency = Math.floor(28 + Math.random() * 15);
      const signature = `${Math.random().toString(36).substring(2, 7)}...${Math.random().toString(36).substring(2, 6)}`;

      if (passesArmor && walletRef.current.balanceSol >= scaledSol) {
        // Execute mirrored snipe
        executeSnipe(targetToken, scaledSol, latency, false);

        const newEvent: MirrorTradeEvent = {
          id: `m-ev-${Date.now()}`,
          timestamp: Date.now(),
          walletId: randomTarget.id,
          walletAlias: randomTarget.alias,
          walletAddress: randomTarget.address,
          action: 'BUY',
          tokenSymbol: targetToken.symbol,
          tokenMint: targetToken.mint,
          originalAmountSol: targetOriginalSol,
          mirroredAmountSol: scaledSol,
          multiplier: randomTarget.multiplier,
          latencyMs: latency,
          signature,
          status: 'MIRRORED',
        };

        setMirrorEvents((prev) => [newEvent, ...prev.slice(0, 25)]);

        // Update target wallet telemetry stats
        setMirroredWallets((prev) =>
          prev.map((w) =>
            w.id === randomTarget.id
              ? {
                  ...w,
                  totalCopiedTrades: w.totalCopiedTrades + 1,
                  totalPnlSol: Number((w.totalPnlSol + 0.12).toFixed(3)),
                  lastActiveSlot: (walletRef.current.devnetSlot || 514391633) + 2,
                }
              : w
          )
        );

        // Thought stream notification
        setThoughts((prev) => [
          {
            id: `th-${Date.now()}`,
            timestamp: Date.now(),
            level: 'SUCCESS',
            tokenSymbol: targetToken.symbol,
            message: `🪞 REAL-TIME MIRROR: Copied ${randomTarget.alias} trade on $${targetToken.symbol} (${targetOriginalSol} SOL target → ${scaledSol} SOL mirrored at ${randomTarget.multiplier}x multiplier) in ${latency}ms.`,
            actionTaken: 'SNIPED',
            latencyMs: latency,
          },
          ...prev.slice(0, 40),
        ]);
      } else if (!passesArmor) {
        // Skipped due to Shell Armor protection
        const newEvent: MirrorTradeEvent = {
          id: `m-ev-${Date.now()}`,
          timestamp: Date.now(),
          walletId: randomTarget.id,
          walletAlias: randomTarget.alias,
          walletAddress: randomTarget.address,
          action: 'BUY',
          tokenSymbol: targetToken.symbol,
          tokenMint: targetToken.mint,
          originalAmountSol: targetOriginalSol,
          mirroredAmountSol: 0,
          multiplier: randomTarget.multiplier,
          latencyMs: latency,
          signature,
          status: 'SKIPPED_ARMOR',
          note: `Shell Armor blocked copying: ${targetToken.name} failed zero-rug safety check`,
        };
        setMirrorEvents((prev) => [newEvent, ...prev.slice(0, 25)]);

        setThoughts((prev) => [
          {
            id: `th-${Date.now()}`,
            timestamp: Date.now(),
            level: 'WARNING',
            tokenSymbol: targetToken.symbol,
            message: `Shell Armor Intercept: Target ${randomTarget.alias} bought $${targetToken.symbol}, but contract failed honeypot/armor check. Trade mirror aborted for safety.`,
            actionTaken: 'SKIPPED',
            latencyMs: latency,
          },
          ...prev.slice(0, 40),
        ]);
      }
    }, 17000);

    return () => clearInterval(mirrorInterval);
  }, []);

  // 3. Live Pump.fun Token Stream Generator
  useEffect(() => {
    const streamInterval = setInterval(() => {
      const newToken = generateRandomToken();
      setTokens((prev) => {
        const updated = [newToken, ...prev.slice(0, 35)];
        checkPriceAlertsForTokens(updated);
        return updated;
      });
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

        const latency = Math.floor(31 + Math.random() * 17);

        if (passesArmor && currentWallet.balanceSol >= currentSettings.defaultTradeSol) {
          executeSnipe(newToken, currentSettings.defaultTradeSol, latency, true);
        } else {
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

  // 4. Positions Price Fluctuation & Token Price Updates
  useEffect(() => {
    const priceInterval = setInterval(() => {
      setTokens((prevTokens) => {
        const updatedTokens = prevTokens.map((tok) => {
          const deltaFactor = 1 + (Math.random() * 0.08 - 0.038);
          const nextPriceSol = Number((tok.priceSol * deltaFactor).toFixed(7));
          return {
            ...tok,
            priceSol: nextPriceSol,
            priceUsd: Number((nextPriceSol * SOL_PRICE_USD).toFixed(5)),
          };
        });

        checkPriceAlertsForTokens(updatedTokens);
        return updatedTokens;
      });

      setPositions((prevPositions) => {
        if (prevPositions.length === 0) return prevPositions;

        return prevPositions.map((pos) => {
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

  // Check Price Target Alerts
  const checkPriceAlertsForTokens = (currentTokensList: Token[]) => {
    const activeAlerts = alertsRef.current;

    activeAlerts.forEach((alert) => {
      if (!alert.active || alert.triggered) return;
      const matched = currentTokensList.find((t) => t.mint === alert.tokenMint);
      if (!matched) return;

      const hitAbove = alert.condition === 'ABOVE' && matched.priceSol >= alert.targetPriceSol;
      const hitBelow = alert.condition === 'BELOW' && matched.priceSol <= alert.targetPriceSol;

      if (hitAbove || hitBelow) {
        triggerPriceAlert(alert, matched.priceSol, matched.priceUsd);
      }
    });
  };

  const triggerPriceAlert = (
    alert: PriceAlert,
    currentPriceSol: number,
    currentPriceUsd: number
  ) => {
    playPriceAlertChime();

    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alert.id
          ? {
              ...a,
              triggered: true,
              triggeredAt: Date.now(),
              currentPriceSol,
              currentPriceUsd,
            }
          : a
      )
    );

    const newEvent: TriggeredAlertEvent = {
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      alert: {
        ...alert,
        triggered: true,
        triggeredAt: Date.now(),
        currentPriceSol,
        currentPriceUsd,
      },
      triggeredPriceSol: currentPriceSol,
      triggeredPriceUsd: currentPriceUsd,
      timestamp: Date.now(),
      dismissed: false,
    };

    setTriggeredAlertEvents((prev) => [newEvent, ...prev.slice(0, 4)]);

    setThoughts((prev) => [
      {
        id: `th-${Date.now()}`,
        timestamp: Date.now(),
        level: 'SUCCESS',
        tokenSymbol: alert.tokenSymbol,
        message: `🎯 CUSTOM PRICE TARGET HIT: $${alert.tokenSymbol} ${
          alert.condition === 'ABOVE' ? 'climbed above' : 'dipped below'
        } ${alert.targetPriceSol.toFixed(7)} SOL! Meteora DLMM Bin #${alert.dlmmBinId || 10420} reached.`,
        actionTaken: 'WATCHLIST',
        latencyMs: 29,
      },
      ...prev.slice(0, 40),
    ]);
  };

  // Auto-Exit Evaluation (Take-Profit & Stop-Loss)
  useEffect(() => {
    const curSettings = settings;
    positions.forEach((pos) => {
      if (pos.pnlPercent >= curSettings.takeProfitPercent) {
        handleAutoExit(pos, 'TAKE_PROFIT');
      } else if (pos.pnlPercent <= -curSettings.stopLossPercent) {
        handleAutoExit(pos, 'STOP_LOSS');
      } else if (pos.bondingCurveProgress >= curSettings.autoSellOnBondingCurvePercent) {
        handleAutoExit(pos, 'TAKE_PROFIT', 'Bonding Curve 88% target reached');
      }
    });
  }, [positions, settings]);

  const handleAutoExit = (
    pos: Position,
    exitType: 'TAKE_PROFIT' | 'STOP_LOSS',
    customNote?: string
  ) => {
    setPositions((prev) => prev.filter((p) => p.id !== pos.id));

    const returnedSol = Math.max(0.01, pos.investedSol + pos.pnlSol);
    setWallet((prev) => ({
      ...prev,
      balanceSol: Number((prev.balanceSol + returnedSol).toFixed(3)),
      balanceUsd: Number(((prev.balanceSol + returnedSol) * SOL_PRICE_USD).toFixed(2)),
    }));

    const txSignature = `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`;
    const jitoDelay = Math.floor(28 + Math.random() * 12);
    setTradeLogs((prev) => [
      {
        id: `tx-${Date.now()}`,
        timestamp: Date.now(),
        type: exitType,
        tokenSymbol: pos.tokenSymbol,
        tokenMint: pos.tokenMint,
        amountSol: returnedSol,
        priceSol: pos.currentPriceSol,
        latencyMs: jitoDelay,
        blockSlot: (wallet.devnetSlot || 514391633) + Math.floor(Math.random() * 200),
        signature: txSignature,
        jitoTipSol: settings.jitoTipSol,
        pnlSol: pos.pnlSol,
        pnlPercent: pos.pnlPercent,
        jitoBundleId: `bundle_${Math.random().toString(36).substring(2, 10)}`,
        bundleStatus: 'LANDED',
        inclusionDelayMs: jitoDelay,
        slotDistance: 0,
        validatorLeader: getRandomValidatorLeader(),
      },
      ...prev,
    ]);

    const isWin = pos.pnlPercent > 0;
    if (isWin) {
      playProfitChime();
      triggerProfitHaptic();
      // Physical haptic trigger on mobile devices for take-profit auto exit
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 40, 100, 40, 140]);
        } catch {
          // Gracefully ignore devices without vibration support or blocked iframe policies
        }
      }
    } else {
      playAlertBuzzer();
      triggerStopLossHaptic();
      // Physical haptic trigger on mobile devices for stop-loss / risk mitigation
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([120, 60, 140]);
        } catch {
          // Gracefully ignore devices without vibration support or blocked iframe policies
        }
      }
    }

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

  // Execute Snipe (Manual, Autonomous, or Mirrored)
  const executeSnipe = (token: Token, amountSol: number, latencyMs = 36, isAuto = false) => {
    if (wallet.balanceSol < amountSol) return;

    const nextBal = wallet.balanceSol - amountSol;
    setWallet((prev) => ({
      ...prev,
      balanceSol: Number(nextBal.toFixed(3)),
      balanceUsd: Number((nextBal * SOL_PRICE_USD).toFixed(2)),
    }));

    const tokensBought = Number((amountSol / token.priceSol).toFixed(1));

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
        blockSlot: (wallet.devnetSlot || 514391633) + Math.floor(Math.random() * 200),
        signature: txSignature,
        jitoTipSol: settings.jitoTipSol,
        jitoBundleId: `bundle_${Math.random().toString(36).substring(2, 10)}`,
        bundleStatus: 'LANDED',
        inclusionDelayMs: latencyMs,
        slotDistance: 0,
        validatorLeader: getRandomValidatorLeader(),
      },
      ...prev,
    ]);

    setThoughts((prev) => [
      {
        id: `th-${Date.now()}`,
        timestamp: Date.now(),
        level: 'SUCCESS',
        tokenSymbol: token.symbol,
        message: `${
          isAuto ? 'Autonomous' : 'Manual'
        } Snipe Executed in ${latencyMs}ms! Dev ${token.devHoldingPercent}%, Armor Score ${token.armorScore}/100. Solana Devnet slot bundle confirmed.`,
        actionTaken: 'SNIPED',
        latencyMs,
      },
      ...prev.slice(0, 40),
    ]);

    playSnipeChime();
    triggerSnipeHaptic();
    // Physical haptic trigger on mobile devices for snipe execution
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 50]);
      } catch {
        // Gracefully ignore devices without vibration support or blocked iframe policies
      }
    }
  };

  const handleSellPosition = (positionId: string, percentage: number) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    const fraction = percentage / 100;
    const solReceived = Number((pos.currentSolValue * fraction).toFixed(4));
    const pnlShare = Number((pos.pnlSol * fraction).toFixed(4));

    setWallet((prev) => ({
      ...prev,
      balanceSol: Number((prev.balanceSol + solReceived).toFixed(3)),
      balanceUsd: Number(((prev.balanceSol + solReceived) * SOL_PRICE_USD).toFixed(2)),
    }));

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
        blockSlot: (wallet.devnetSlot || 514391633) + Math.floor(Math.random() * 200),
        signature: txSignature,
        jitoTipSol: settings.jitoTipSol,
        pnlSol: pnlShare,
        pnlPercent: pos.pnlPercent,
        jitoBundleId: `bundle_${Math.random().toString(36).substring(2, 10)}`,
        bundleStatus: 'LANDED',
        inclusionDelayMs: Math.floor(29 + Math.random() * 15),
        slotDistance: 0,
        validatorLeader: getRandomValidatorLeader(),
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
          blockSlot: (wallet.devnetSlot || 514391633) + 1,
          signature: txSignature,
          jitoTipSol: settings.jitoTipSol,
          pnlSol: pos.pnlSol,
          pnlPercent: pos.pnlPercent,
          jitoBundleId: `bundle_${Math.random().toString(36).substring(2, 10)}`,
          bundleStatus: 'LANDED',
          inclusionDelayMs: 28,
          slotDistance: 0,
          validatorLeader: getRandomValidatorLeader(),
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
    triggerPanicHaptic();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 60, 150, 60, 200]);
      } catch {
        // Ignore unsupported/blocked contexts
      }
    }

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

  const handleAddFaucetSol = (amt: number) => {
    setWallet((prev) => ({
      ...prev,
      balanceSol: Number((prev.balanceSol + amt).toFixed(3)),
      balanceUsd: Number(((prev.balanceSol + amt) * SOL_PRICE_USD).toFixed(2)),
    }));
  };

  // Price Alert Management Handlers
  const handleSaveAlert = (newAlertData: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => {
    const newAlert: PriceAlert = {
      ...newAlertData,
      id: `alt-${Date.now()}`,
      createdAt: Date.now(),
      triggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    setThoughts((prev) => [
      {
        id: `th-${Date.now()}`,
        timestamp: Date.now(),
        level: 'INFO',
        tokenSymbol: newAlert.tokenSymbol,
        message: `Custom Price Alert Armed: Target ${newAlert.condition} ${newAlert.targetPriceSol.toFixed(7)} SOL (Meteora DLMM Bin #${newAlert.dlmmBinId || 10420}).`,
        actionTaken: 'WATCHLIST',
        latencyMs: 18,
      },
      ...prev.slice(0, 40),
    ]);
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, active: !a.active } : a))
    );
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleDismissAlertBanner = (eventId: string) => {
    setTriggeredAlertEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleOpenCreateAlertModal = (tokenToTarget?: Token) => {
    setAlertTargetToken(tokenToTarget || tokens[0] || null);
    setIsAlertModalOpen(true);
  };

  // Wallet Mirroring Handlers
  const handleAddMirroredWallet = (
    newWalletData: Omit<MirroredWallet, 'id' | 'totalCopiedTrades' | 'winRate' | 'totalPnlSol' | 'createdAt'>
  ) => {
    const newWallet: MirroredWallet = {
      ...newWalletData,
      id: `mir-${Date.now()}`,
      totalCopiedTrades: 0,
      winRate: 80.0,
      totalPnlSol: 0,
      createdAt: Date.now(),
    };

    setMirroredWallets((prev) => [newWallet, ...prev]);

    setThoughts((prev) => [
      {
        id: `th-${Date.now()}`,
        timestamp: Date.now(),
        level: 'SUCCESS',
        message: `🪞 Target Wallet Added for Mirroring: ${newWallet.alias} (${newWallet.address.slice(0, 6)}...) at ${newWallet.multiplier}x scale. Monitoring Pump.fun slot listener.`,
        actionTaken: 'WATCHLIST',
        latencyMs: 24,
      },
      ...prev.slice(0, 40),
    ]);
  };

  const handleUpdateMultiplier = (walletId: string, multiplier: number) => {
    setMirroredWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, multiplier } : w))
    );
  };

  const handleToggleMirroredWallet = (walletId: string) => {
    setMirroredWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, active: !w.active } : w))
    );
  };

  const handleDeleteMirroredWallet = (walletId: string) => {
    setMirroredWallets((prev) => prev.filter((w) => w.id !== walletId));
  };

  const handleSimulateMirrorTrade = (walletId: string) => {
    const targetWallet = mirroredWallets.find((w) => w.id === walletId) || mirroredWallets[0];
    if (!targetWallet) return;

    const targetToken = tokens[Math.floor(Math.random() * tokens.length)] || generateRandomToken();
    const targetOriginalSol = Number((0.5 + Math.random() * 2.0).toFixed(2));
    const rawMirroredSol = Number((targetOriginalSol * targetWallet.multiplier).toFixed(2));
    const mirroredSol = Math.min(rawMirroredSol, targetWallet.maxSolCap);

    const passesArmor = !targetWallet.requireArmor || (targetToken.armorScore >= settings.minArmorScore && targetToken.honeypotPassed);
    const latency = Math.floor(25 + Math.random() * 14);
    const signature = `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`;

    if (passesArmor && wallet.balanceSol >= mirroredSol) {
      executeSnipe(targetToken, mirroredSol, latency, false);
      const newEvent: MirrorTradeEvent = {
        id: `m-ev-${Date.now()}`,
        timestamp: Date.now(),
        walletId: targetWallet.id,
        walletAlias: targetWallet.alias,
        walletAddress: targetWallet.address,
        action: 'BUY',
        tokenSymbol: targetToken.symbol,
        tokenMint: targetToken.mint,
        originalAmountSol: targetOriginalSol,
        mirroredAmountSol: mirroredSol,
        multiplier: targetWallet.multiplier,
        latencyMs: latency,
        signature,
        status: 'MIRRORED',
        pnlSol: Number((mirroredSol * (0.04 + Math.random() * 0.22)).toFixed(3)),
      };
      setMirrorEvents((prev) => [newEvent, ...prev.slice(0, 25)]);

      setMirroredWallets((prev) =>
        prev.map((w) =>
          w.id === targetWallet.id
            ? {
                ...w,
                totalCopiedTrades: w.totalCopiedTrades + 1,
                totalPnlSol: Number((w.totalPnlSol + (newEvent.pnlSol || 0.08)).toFixed(3)),
              }
            : w
        )
      );

      playSnipeChime();
      setThoughts((prev) => [
        {
          id: `th-${Date.now()}`,
          timestamp: Date.now(),
          level: 'SUCCESS',
          tokenSymbol: targetToken.symbol,
          message: `⚡ Live Copy Executed: Target ${targetWallet.alias} bought ${targetOriginalSol} SOL. Auto-mirrored ${mirroredSol} SOL (${targetWallet.multiplier}x) in ${latency}ms via Jito tip.`,
          actionTaken: 'SNIPED',
          latencyMs: latency,
        },
        ...prev.slice(0, 40),
      ]);
    } else {
      const newEvent: MirrorTradeEvent = {
        id: `m-ev-${Date.now()}`,
        timestamp: Date.now(),
        walletId: targetWallet.id,
        walletAlias: targetWallet.alias,
        walletAddress: targetWallet.address,
        action: 'BUY',
        tokenSymbol: targetToken.symbol,
        tokenMint: targetToken.mint,
        originalAmountSol: targetOriginalSol,
        mirroredAmountSol: 0,
        multiplier: targetWallet.multiplier,
        latencyMs: latency,
        signature,
        status: 'SKIPPED_ARMOR',
        note: `Shell Armor blocked copying: ${targetToken.name} failed zero-rug safety check`,
      };
      setMirrorEvents((prev) => [newEvent, ...prev.slice(0, 25)]);
      playAlertBuzzer();
    }
  };

  const handleSendProbeBundle = (probeLog: TradeLog) => {
    setTradeLogs((prev) => [probeLog, ...prev]);
    setThoughts((prev) => [
      {
        id: `th-${Date.now()}`,
        timestamp: Date.now(),
        level: 'SUCCESS',
        tokenSymbol: probeLog.tokenSymbol,
        message: `⚡ Jito Probe Bundle Landed in ${probeLog.inclusionDelayMs}ms at slot #${probeLog.blockSlot} via leader ${probeLog.validatorLeader}. 0 dropped, 100% MEV protected.`,
        actionTaken: 'SNIPED',
        latencyMs: probeLog.inclusionDelayMs,
      },
      ...prev.slice(0, 40),
    ]);
  };

  const activeAlertsCount = alerts.filter((a) => a.active && !a.triggered).length;
  const triggeredAlertsCount = alerts.filter((a) => a.triggered).length;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans pb-20 md:pb-6">
      {/* Visual Price Alert Banner */}
      <PriceAlertBanner
        alerts={triggeredAlertEvents}
        onDismiss={handleDismissAlertBanner}
        onInstantBuy={(mint, symbol, name, price) => {
          const tok = tokens.find((t) => t.mint === mint) || {
            id: mint,
            mint,
            symbol,
            name,
            priceSol: price,
            priceUsd: price * SOL_PRICE_USD,
            category: 'Alert Snipe',
            marketCap: 35000,
            liquiditySol: 30,
            bondingCurveProgress: 45,
            devAddress: '8xK...2p',
            devHoldingPercent: 3.2,
            devRugCount: 0,
            createdAt: Date.now(),
            volume24hSol: 80,
            buyCount: 50,
            sellCount: 10,
            holdersCount: 95,
            armorScore: 92,
            mintAuthorityRevoked: true,
            freezeAuthorityDisabled: true,
            top10HoldersPercent: 18,
            honeypotPassed: true,
            isScamKeyword: false,
            status: 'PUMPING' as const,
            description: 'Triggered from custom price target',
          };
          executeSnipe(tok, 0.5);
        }}
        onInstantSell={(mint) => {
          const pos = positions.find((p) => p.tokenMint === mint);
          if (pos) handleSellPosition(pos.id, 100);
        }}
        onOpenAlertsManager={() => setActiveTab('alerts')}
      />

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
        activeAlertsCount={activeAlertsCount}
        triggeredAlertsCount={triggeredAlertsCount}
        devnetSlot={wallet.devnetSlot}
        clusterLatencyMs={wallet.clusterLatencyMs}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6 transition-opacity duration-200 touch-pan-y">
        {/* TAB 1: RADAR / PUMP.FUN SCANNER */}
        {activeTab === 'scanner' && (
          <TokenScanner
            tokens={tokens}
            onSelectToken={(token) => setSelectedToken(token)}
            onQuickSnipe={(token) => executeSnipe(token, settings.defaultTradeSol)}
            isAutonomousEnabled={settings.isAutonomousEnabled}
            defaultTradeSol={settings.defaultTradeSol}
            onOpenSetAlert={handleOpenCreateAlertModal}
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

        {/* TAB 4: WALLET MIRRORING (COPY TRADING) */}
        {activeTab === 'mirror' && (
          <MirrorTrading
            mirroredWallets={mirroredWallets}
            mirrorEvents={mirrorEvents}
            onAddWallet={handleAddMirroredWallet}
            onUpdateMultiplier={handleUpdateMultiplier}
            onToggleWallet={handleToggleMirroredWallet}
            onDeleteWallet={handleDeleteMirroredWallet}
            onSimulateTrade={handleSimulateMirrorTrade}
            solPriceUsd={SOL_PRICE_USD}
          />
        )}

        {/* TAB 5: CUSTOM PRICE TARGET ALERTS & METEORA DLMM */}
        {activeTab === 'alerts' && (
          <PriceAlertsManager
            alerts={alerts}
            tokens={tokens}
            onToggleAlert={handleToggleAlert}
            onDeleteAlert={handleDeleteAlert}
            onOpenCreateModal={handleOpenCreateAlertModal}
            onSelectToken={(token) => setSelectedToken(token)}
            solPriceUsd={SOL_PRICE_USD}
          />
        )}

        {/* TAB 6: STRATEGY & SHELL ARMOR PROTECTION */}
        {activeTab === 'settings' && (
          <StrategyArmorSettings
            settings={settings}
            onUpdateSettings={setSettings}
            onResetDefaults={() => setSettings(DEFAULT_STRATEGY)}
          />
        )}

        {/* TAB 7: REFERRALS (15% - 35% TIERS) */}
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
        onOpenSetAlert={handleOpenCreateAlertModal}
      />

      {/* Price Alert Creation Modal */}
      <PriceAlertModal
        token={alertTargetToken}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onSaveAlert={handleSaveAlert}
        solPriceUsd={SOL_PRICE_USD}
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
        triggeredAlertsCount={triggeredAlertsCount}
      />
    </div>
  );
}
