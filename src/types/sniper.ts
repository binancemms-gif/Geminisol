export interface Token {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  description: string;
  iconUrl?: string;
  category: string;
  marketCap: number; // in USD
  priceSol: number;
  priceUsd: number;
  liquiditySol: number;
  bondingCurveProgress: number; // 0 - 100%
  devAddress: string;
  devHoldingPercent: number; // e.g. 3.2%
  devRugCount: number; // past rugged tokens by dev
  createdAt: number; // timestamp
  volume24hSol: number;
  buyCount: number;
  sellCount: number;
  holdersCount: number;
  armorScore: number; // 0 - 100
  mintAuthorityRevoked: boolean;
  freezeAuthorityDisabled: boolean;
  top10HoldersPercent: number;
  honeypotPassed: boolean;
  isScamKeyword: boolean;
  status: 'NEW' | 'PUMPING' | 'GRADUATING' | 'RUGGED';
}

export interface StrategySettings {
  isAutonomousEnabled: boolean;
  executionMode: 'LIVE_RPC' | 'SIMULATION';
  minInvestmentSol: number;
  maxInvestmentSol: number;
  defaultTradeSol: number;
  slippagePercent: number;
  takeProfitPercent: number;
  takeProfitHalfAt: number;
  stopLossPercent: number;
  maxDevHoldingPercent: number;
  minArmorScore: number;
  autoSellOnBondingCurvePercent: number;
  trailingStopLossPercent: number;
  jitoTipSol: number;
  priorityFeeMicroLamports: number;
  antiMevEnabled: boolean;
  autoSellStagnantSeconds: number;
  soundAlertsEnabled: boolean;
}

export interface Position {
  id: string;
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;
  category: string;
  entryPriceSol: number;
  currentPriceSol: number;
  entryPriceUsd: number;
  currentPriceUsd: number;
  amountTokens: number;
  investedSol: number;
  currentSolValue: number;
  pnlSol: number;
  pnlPercent: number;
  openedAt: number;
  highestPnlPercent: number;
  bondingCurveProgress: number;
  status: 'OPEN' | 'CLOSED';
}

export interface TradeLog {
  id: string;
  timestamp: number;
  type: 'BUY' | 'SELL' | 'TAKE_PROFIT' | 'STOP_LOSS' | 'PANIC_SELL';
  tokenSymbol: string;
  tokenMint: string;
  amountSol: number;
  priceSol: number;
  latencyMs: number;
  blockSlot: number;
  signature: string;
  jitoTipSol: number;
  pnlSol?: number;
  pnlPercent?: number;
}

export interface AgentThought {
  id: string;
  timestamp: number;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  tokenSymbol?: string;
  message: string;
  actionTaken?: 'SNIPED' | 'SKIPPED' | 'WATCHLIST' | 'SOLD';
  latencyMs?: number;
}

export interface ReferralTier {
  tierNumber: number;
  name: string;
  minReferrals: number;
  commissionRate: number; // 0.15 to 0.35
  perks: string[];
}

export interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  activeTraders: number;
  currentTierNumber: number;
  commissionPercent: number; // 15, 22, 28, 35
  lifetimeEarningsSol: number;
  unclaimedRewardsSol: number;
  claimedHistory: {
    id: string;
    date: string;
    amountSol: number;
    txHash: string;
  }[];
}

export interface WalletState {
  address: string;
  connected: boolean;
  balanceSol: number;
  balanceUsd: number;
  solPriceUsd: number;
  walletProvider: 'Phantom' | 'Solflare' | 'Backpack' | 'Internal Paper Wallet';
}
