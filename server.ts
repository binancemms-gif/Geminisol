import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Deep AI Agent Token Audit endpoint powered by server-side Gemini
  app.post('/api/gemini/analyze-token', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Token data is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.startsWith('MY_')) {
        return res.json({
          source: 'autonomous_local_agent',
          analysis: generateLocalAgentAnalysis(token),
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are the TryCua ShellArmor Autonomous Solana Trading Sniper Agent (sub-50ms engine v2.4).
Analyze this newly discovered Pump.fun token launch:
- Token: ${token.name} ($${token.symbol})
- Mint Address: ${token.mint}
- Market Cap: $${token.marketCap?.toLocaleString() || 'N/A'}
- Initial Liquidity: ${token.liquiditySol || 30} SOL
- Bonding Curve: ${token.bondingCurveProgress || 0}%
- Developer Holding: ${token.devHoldingPercent || 0}%
- Shell Armor Protection Score: ${token.armorScore || 0}/100
- Mint Authority: ${token.mintAuthorityRevoked ? 'Revoked (Immutable)' : 'Active (High Risk)'}
- Freeze Authority: ${token.freezeAuthorityDisabled ? 'Disabled (Safe)' : 'Active (Honeypot Risk)'}
- Top 10 Concentration: ${token.top10HoldersPercent || 0}%
- Narrative / Category: ${token.category || 'Meme / Culture'}

Provide an ultra-sharp, quantitative autonomous trading assessment in strict JSON format:
{
  "recommendation": "SNIPE" | "PASS" | "WATCHLIST",
  "confidenceScore": number (0 to 100),
  "riskRating": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "targetMultiplier": string (e.g. "2.4x - 4.0x"),
  "suggestedSlippage": number (e.g. 12),
  "suggestedPositionSol": number (e.g. 0.5),
  "rationale": "2-3 crisp sentences detailing why the autonomous agent recommends this, dev wallet forensic check, and bonding curve safety",
  "threatFlags": ["array of specific detected security or liquidity risks, if any"],
  "momentumSignals": ["array of positive execution or social momentum signals"]
}`;

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.15,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI audit timeout')), 4500)
      );

      const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        source: 'gemini-3.8-flash',
        analysis: parsed,
      });
    } catch (err: any) {
      console.warn('Gemini analysis failed, falling back to local reasoning:', err?.message || err);
      const { token } = req.body;
      return res.json({
        source: 'autonomous_local_fallback',
        analysis: generateLocalAgentAnalysis(token || {}),
      });
    }
  });

  // RPC Health and ping simulation for sub-50ms validator connections
  app.get('/api/rpc-status', (req, res) => {
    res.json({
      status: 'nominal',
      activeRpc: 'Jito-Block-Engine-Amsterdam',
      measuredLatencyMs: Math.floor(28 + Math.random() * 18),
      tps: 3412 + Math.floor(Math.random() * 400),
      currentSlot: 312894100 + Math.floor(Date.now() / 400),
      engineVersion: 'v2.4.2-CUA',
    });
  });

  // Serve static assets in production or Vite middleware in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShellArmor Sniper] Running on http://0.0.0.0:${PORT}`);
  });
}

function generateLocalAgentAnalysis(token: any) {
  const armor = Number(token.armorScore) || 75;
  const devHolding = Number(token.devHoldingPercent) || 4.2;
  const bonding = Number(token.bondingCurveProgress) || 12;
  const mintRevoked = Boolean(token.mintAuthorityRevoked);
  const freezeDisabled = Boolean(token.freezeAuthorityDisabled);

  const isSafe = armor >= 80 && devHolding <= 6 && mintRevoked && freezeDisabled;
  const isRisky = devHolding > 8 || armor < 60 || !freezeDisabled;

  let recommendation: 'SNIPE' | 'PASS' | 'WATCHLIST' = 'WATCHLIST';
  let riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
  let confidence = 70;

  if (isSafe && bonding <= 50) {
    recommendation = 'SNIPE';
    riskRating = armor > 90 ? 'LOW' : 'MEDIUM';
    confidence = 88;
  } else if (isRisky) {
    recommendation = 'PASS';
    riskRating = devHolding > 10 ? 'CRITICAL' : 'HIGH';
    confidence = 92;
  }

  const threatFlags: string[] = [];
  if (devHolding > 6) threatFlags.push(`Developer wallet holds ${devHolding}% (above 6% safety cap)`);
  if (!freezeDisabled) threatFlags.push('Freeze authority is not disabled');
  if (!mintRevoked) threatFlags.push('Mint authority remains active');
  if (bonding > 75) threatFlags.push('High bonding curve saturation: Raydium migration dump risk');

  const momentumSignals: string[] = [];
  if (armor >= 85) momentumSignals.push('Passed Shell Armor zero-rug automated invariant validation');
  if (devHolding <= 4) momentumSignals.push(`Low dev allocation: ${devHolding}%`);
  if (bonding >= 5 && bonding <= 35) momentumSignals.push('Early bonding phase with accelerating transaction rate');

  return {
    recommendation,
    confidenceScore: confidence,
    riskRating,
    targetMultiplier: recommendation === 'SNIPE' ? '2.8x - 4.5x' : recommendation === 'WATCHLIST' ? '1.8x' : '0.5x',
    suggestedSlippage: recommendation === 'SNIPE' ? 15 : 20,
    suggestedPositionSol: recommendation === 'SNIPE' ? 0.5 : 0.1,
    rationale: recommendation === 'SNIPE'
      ? `High-velocity contract verification passed. Dev allocation of ${devHolding}% is within safe bounds with immutable token authorities. Safe to bundle with Jito anti-MEV tip.`
      : recommendation === 'PASS'
      ? `Threat detected: Developer holding or contract authorities fail Shell Armor risk threshold. High probability of dump or honeypot behavior.`
      : `Moderate signal strength: Token demonstrates initial liquidity interest but requires volume confirmation before automated execution.`,
    threatFlags,
    momentumSignals,
  };
}

startServer();
