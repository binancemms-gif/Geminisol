import { Token } from '../types/sniper';

const TOKEN_NAMES = [
  { name: 'Neural Velocity', symbol: 'NVEL', cat: 'AI / Compute' },
  { name: 'Solana Cyber Wolf', symbol: 'WOLF', cat: 'Meme' },
  { name: 'DeFi Quantum Liquidity', symbol: 'DQUANT', cat: 'DeFi' },
  { name: 'TryCua Agentic Swarm', symbol: 'SWARM', cat: 'AI Agent' },
  { name: 'Laser Eyes Chad', symbol: 'CHAD', cat: 'Meme' },
  { name: 'Ghost Protocol Solana', symbol: 'GHOST', cat: 'Privacy' },
  { name: 'Baby Pepe Solana', symbol: 'BPEPE', cat: 'Meme' },
  { name: 'Jito Fast Bundle', symbol: 'JBUNDLE', cat: 'Infra' },
  { name: 'Hyper Matrix 3000', symbol: 'MATRIX', cat: 'AI' },
  { name: 'Moon Rocket Doge', symbol: 'MDOGE', cat: 'Meme' },
];

function randomChars(len: number) {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export function generateRandomToken(): Token {
  const template = TOKEN_NAMES[Math.floor(Math.random() * TOKEN_NAMES.length)];
  const isRugScam = Math.random() < 0.22; // ~22% are scams to test Shell Armor!
  
  const devHolding = isRugScam 
    ? Number((9 + Math.random() * 18).toFixed(1)) 
    : Number((1.5 + Math.random() * 4.2).toFixed(1));

  const armorScore = isRugScam
    ? Math.floor(20 + Math.random() * 45)
    : Math.floor(82 + Math.random() * 17);

  const priceSol = Number((0.000012 + Math.random() * 0.000045).toFixed(7));
  const solPriceUsd = 182.40;
  const priceUsd = Number((priceSol * solPriceUsd).toFixed(5));
  const mcap = Math.floor(priceSol * 1000000000 * solPriceUsd * 0.0001) + 12000;

  return {
    id: `tok-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    mint: `${randomChars(38)}pump`,
    name: `${template.name} ${Math.floor(Math.random() * 99)}`,
    symbol: template.symbol,
    description: `Community-driven launch on Pump.fun bonding curve. Verified on Solana slot #${312894000 + Math.floor(Math.random() * 500)}.`,
    category: template.cat,
    marketCap: mcap,
    priceSol,
    priceUsd,
    liquiditySol: Number((24 + Math.random() * 25).toFixed(1)),
    bondingCurveProgress: Number((4 + Math.random() * 22).toFixed(1)),
    devAddress: `${randomChars(4)}...${randomChars(4)}`,
    devHoldingPercent: devHolding,
    devRugCount: isRugScam ? Math.floor(1 + Math.random() * 5) : 0,
    createdAt: Date.now(),
    volume24hSol: Number((12 + Math.random() * 40).toFixed(1)),
    buyCount: Math.floor(8 + Math.random() * 30),
    sellCount: isRugScam ? Math.floor(15 + Math.random() * 40) : Math.floor(1 + Math.random() * 8),
    holdersCount: Math.floor(18 + Math.random() * 60),
    armorScore,
    mintAuthorityRevoked: !isRugScam || Math.random() > 0.6,
    freezeAuthorityDisabled: !isRugScam,
    top10HoldersPercent: isRugScam ? Number((35 + Math.random() * 30).toFixed(1)) : Number((14 + Math.random() * 10).toFixed(1)),
    honeypotPassed: !isRugScam,
    isScamKeyword: isRugScam && Math.random() > 0.5,
    status: isRugScam ? 'RUGGED' : 'NEW',
  };
}
