import type { Express } from "express";
import type { Server } from "http";
import { fetchAllMarketData } from "./market-api";

const INITIAL_MARKET_DATA = {
  lastUpdated: new Date().toISOString(),
  fetchedAt: "2026-03-19T16:45:00Z",
  quotes: {
    SPY:  { price: 658.13, change: -3.30, changePct: -0.50, prevClose: 661.43, high: 659.71, low: 655.17, open: 656.97, volume: 50314147, avgVolume: 91720435, yearHigh: 697.84, yearLow: 481.80 },
    QQQ:  { price: 590.67, change: -4.23, changePct: -0.71, prevClose: 594.90, high: 593.13, low: 587.08, open: 589.53, volume: 38429435, avgVolume: 68046039, yearHigh: 637.01, yearLow: 402.39 },
    VIX:  { price: 24.97, change: -0.12, changePct: -0.48, prevClose: 25.09, high: 27.52, low: 24.85, open: 25.60, volume: 0, avgVolume: 0, yearHigh: 60.13, yearLow: 13.38 },
    DXY:  { price: 99.38, change: -0.20, changePct: -0.20, prevClose: 99.58, high: 100.23, low: 99.32, open: 100.23, volume: 0, avgVolume: 0, yearHigh: 104.68, yearLow: 95.55 },
    TNX:  { price: 4.27, change: 0.01, changePct: 0.33, prevClose: 4.26, high: 4.33, low: 4.26, open: 4.31, volume: 0, avgVolume: 0, yearHigh: 5.00, yearLow: 3.35 },
    XLK:  { price: 137.73, change: -0.23, changePct: -0.17, prevClose: 137.96, high: 138.31, low: 135.44, open: 136.00, volume: 9678756, avgVolume: 18596630, yearHigh: 153.00, yearLow: 86.22 },
    XLF:  { price: 48.77, change: -0.20, changePct: -0.42, prevClose: 48.97, high: 49.18, low: 48.52, open: 48.89, volume: 24180000, avgVolume: 51679927, yearHigh: 56.52, yearLow: 42.21 },
    XLE:  { price: 59.65, change: 1.22, changePct: 2.08, prevClose: 58.43, high: 59.78, low: 58.55, open: 58.72, volume: 21500000, avgVolume: 53793393, yearHigh: 59.78, yearLow: 37.24 },
    XLV:  { price: 147.21, change: 0.07, changePct: 0.05, prevClose: 147.14, high: 148.10, low: 146.80, open: 147.50, volume: 7200000, avgVolume: 13268254, yearHigh: 160.59, yearLow: 127.35 },
    XLI:  { price: 163.24, change: -1.94, changePct: -1.17, prevClose: 165.18, high: 165.30, low: 163.10, open: 164.80, volume: 5800000, avgVolume: 12197711, yearHigh: 179.31, yearLow: 112.75 },
    XLY:  { price: 109.32, change: -1.25, changePct: -1.13, prevClose: 110.57, high: 110.80, low: 109.10, open: 110.20, volume: 5400000, avgVolume: 10926101, yearHigh: 125.01, yearLow: 86.55 },
    XLP:  { price: 82.12, change: -0.52, changePct: -0.63, prevClose: 82.64, high: 82.80, low: 81.90, open: 82.50, volume: 9600000, avgVolume: 20537611, yearHigh: 90.14, yearLow: 75.16 },
    XLU:  { price: 46.28, change: -0.45, changePct: -0.96, prevClose: 46.73, high: 46.85, low: 46.15, open: 46.70, volume: 15200000, avgVolume: 26067461, yearHigh: 47.80, yearLow: 35.51 },
    XLB:  { price: 47.59, change: -0.89, changePct: -1.84, prevClose: 48.48, high: 48.60, low: 47.45, open: 48.30, volume: 8300000, avgVolume: 16686674, yearHigh: 54.14, yearLow: 36.56 },
    XLRE: { price: 41.82, change: -0.20, changePct: -0.48, prevClose: 42.02, high: 42.15, low: 41.70, open: 42.00, volume: 3200000, avgVolume: 9334323, yearHigh: 44.07, yearLow: 35.76 },
    XLC:  { price: 112.91, change: -0.75, changePct: -0.66, prevClose: 113.66, high: 113.80, low: 112.60, open: 113.40, volume: 3500000, avgVolume: 7360291, yearHigh: 120.41, yearLow: 84.02 },
  },
  spyHistory: [
    { date: "2025-03-19", close: 567.13 }, { date: "2025-04-01", close: 560.97 }, { date: "2025-05-01", close: 558.47 },
    { date: "2025-06-02", close: 592.71 }, { date: "2025-07-01", close: 617.65 }, { date: "2025-08-01", close: 621.72 },
    { date: "2025-09-02", close: 640.27 }, { date: "2025-10-01", close: 668.45 }, { date: "2025-11-03", close: 683.34 },
    { date: "2025-12-01", close: 680.27 }, { date: "2026-01-02", close: 683.17 }, { date: "2026-02-02", close: 695.41 },
    { date: "2026-03-02", close: 686.38 }, { date: "2026-03-06", close: 672.38 }, { date: "2026-03-09", close: 678.27 },
    { date: "2026-03-10", close: 677.18 }, { date: "2026-03-11", close: 676.33 }, { date: "2026-03-12", close: 666.06 },
    { date: "2026-03-13", close: 662.29 }, { date: "2026-03-16", close: 669.03 }, { date: "2026-03-17", close: 670.79 },
    { date: "2026-03-18", close: 661.43 }, { date: "2026-03-19", close: 658.13 },
  ],
  qqqHistory: [
    { date: "2025-03-21", close: 480.84 }, { date: "2025-04-04", close: 422.67 }, { date: "2025-05-02", close: 488.83 },
    { date: "2025-06-06", close: 529.92 }, { date: "2025-07-03", close: 556.22 }, { date: "2025-08-01", close: 553.88 },
    { date: "2025-09-05", close: 576.06 }, { date: "2025-10-03", close: 603.18 }, { date: "2025-11-07", close: 609.74 },
    { date: "2025-12-05", close: 625.48 }, { date: "2026-01-02", close: 613.12 }, { date: "2026-03-04", close: 610.75 },
    { date: "2026-03-05", close: 608.91 }, { date: "2026-03-06", close: 599.75 }, { date: "2026-03-09", close: 607.76 },
    { date: "2026-03-10", close: 607.77 }, { date: "2026-03-11", close: 607.69 }, { date: "2026-03-12", close: 597.26 },
    { date: "2026-03-13", close: 593.72 }, { date: "2026-03-16", close: 600.38 }, { date: "2026-03-17", close: 603.31 },
    { date: "2026-03-18", close: 594.90 }, { date: "2026-03-19", close: 590.67 },
  ],
  vixHistory: [
    { date: "2025-03-21", close: 19.28 }, { date: "2025-04-04", close: 45.31 }, { date: "2025-05-02", close: 22.68 },
    { date: "2025-06-06", close: 16.77 }, { date: "2025-07-03", close: 16.38 }, { date: "2025-08-01", close: 20.38 },
    { date: "2025-09-05", close: 15.18 }, { date: "2025-10-03", close: 16.65 }, { date: "2025-11-07", close: 19.08 },
    { date: "2025-12-05", close: 15.41 }, { date: "2026-01-02", close: 14.51 }, { date: "2026-03-04", close: 21.15 },
    { date: "2026-03-05", close: 23.75 }, { date: "2026-03-06", close: 29.49 }, { date: "2026-03-09", close: 25.50 },
    { date: "2026-03-10", close: 24.93 }, { date: "2026-03-11", close: 24.23 }, { date: "2026-03-12", close: 27.29 },
    { date: "2026-03-13", close: 27.19 }, { date: "2026-03-16", close: 23.51 }, { date: "2026-03-17", close: 22.37 },
    { date: "2026-03-18", close: 25.09 }, { date: "2026-03-19", close: 24.97 },
  ],
  sentiment: "bearish",
};

let MARKET_DATA: any = INITIAL_MARKET_DATA;
let lastFetch = 0;
let refreshPromise: Promise<void> | null = null;
const REFRESH_INTERVAL = 5 * 60 * 1000;

function refreshMarketDataInBackground() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const freshData = await fetchAllMarketData();
      MARKET_DATA = freshData;
      lastFetch = Date.now();
    } catch (err) {
      console.error("Failed to refresh market data:", err);
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function getMarketData() {
  if (!MARKET_DATA) {
    MARKET_DATA = INITIAL_MARKET_DATA;
  }

  if (lastFetch === 0) {
    void refreshMarketDataInBackground();
    return MARKET_DATA;
  }

  if (Date.now() - lastFetch > REFRESH_INTERVAL) {
    void refreshMarketDataInBackground();
  }

  return MARKET_DATA;
}

interface ScoreBreakdown {
  volatility: { score: number; weight: number; details: any };
  momentum: { score: number; weight: number; details: any };
  trend: { score: number; weight: number; details: any };
  breadth: { score: number; weight: number; details: any };
  macro: { score: number; weight: number; details: any };
}

function computeScores(data: any) {
  const q = data.quotes;

  const vix = q.VIX.price;
  const vixYearHigh = q.VIX.yearHigh;
  const vixYearLow = q.VIX.yearLow;
  const vixPercentile = Math.round(((vix - vixYearLow) / (vixYearHigh - vixYearLow)) * 100);

  const recentVix = data.vixHistory.slice(-5);
  const vix5dSlope = recentVix.length >= 2 ?
    (recentVix[recentVix.length - 1].close - recentVix[0].close) / recentVix.length : 0;

  const putCallEstimate = vix > 25 ? 1.15 : vix > 20 ? 0.95 : vix > 15 ? 0.85 : 0.75;

  let volScore = 100;
  if (vix > 35) volScore = 10;
  else if (vix > 30) volScore = 25;
  else if (vix > 25) volScore = 40;
  else if (vix > 20) volScore = 60;
  else if (vix > 15) volScore = 80;

  if (vix5dSlope > 1) volScore -= 15;
  else if (vix5dSlope > 0.5) volScore -= 8;

  if (vixPercentile > 70) volScore -= 10;

  volScore = Math.max(0, Math.min(100, volScore));

  const spyPrice = q.SPY.price;
  const spyHist = data.spyHistory;

  const last20 = spyHist.slice(-20);
  const last50 = spyHist.slice(-50);
  const last200 = spyHist.slice(-200);

  const sma20 = last20.reduce((s: number, d: any) => s + d.close, 0) / Math.max(1, last20.length);
  const sma50 = last50.reduce((s: number, d: any) => s + d.close, 0) / Math.max(1, last50.length);
  const sma200 = last200.reduce((s: number, d: any) => s + d.close, 0) / Math.max(1, last200.length);

  const aboveSma20 = spyPrice > sma20;
  const aboveSma50 = spyPrice > sma50;
  const aboveSma200 = spyPrice > sma200;

  const qqqHist = data.qqqHistory;
  const qqq50slice = qqqHist.slice(-50);
  const qqq50 = qqq50slice.reduce((s: number, d: any) => s + d.close, 0) / Math.max(1, qqq50slice.length);
  const qqqAbove50 = q.QQQ.price > qqq50;

  const spyReturns = [];
  for (let i = 1; i < spyHist.length; i++) {
    spyReturns.push(spyHist[i].close - spyHist[i - 1].close);
  }
  const last14returns = spyReturns.slice(-14);
  const avgGain = last14returns.filter((r: number) => r > 0).reduce((s: number, r: number) => s + r, 0) / 14;
  const avgLoss = Math.abs(last14returns.filter((r: number) => r < 0).reduce((s: number, r: number) => s + r, 0)) / 14;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  let regime: "uptrend" | "downtrend" | "chop" = "chop";
  if (aboveSma20 && aboveSma50 && aboveSma200) regime = "uptrend";
  else if (!aboveSma20 && !aboveSma50) regime = "downtrend";

  let trendScore = 40;
  if (aboveSma200) trendScore += 15;
  if (aboveSma50) trendScore += 10;
  if (aboveSma20) trendScore += 10;
  if (qqqAbove50) trendScore += 8;
  if (rsi > 30 && rsi < 70) trendScore += 5;
  if (rsi < 30) trendScore -= 15;
  if (rsi > 70) trendScore -= 5;
  if (regime === "downtrend") trendScore -= 15;
  if (q.SPY.changePct < -1) trendScore -= 10;
  if (q.SPY.changePct < -2) trendScore -= 5;

  trendScore = Math.max(0, Math.min(100, trendScore));

  const sectors = ['XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE', 'XLC'] as const;
  const sectorChanges = sectors.map(s => ({ symbol: s, changePct: q[s].changePct }));
  const positiveCount = sectorChanges.filter(s => s.changePct > 0).length;
  const negativeCount = sectorChanges.filter(s => s.changePct < 0).length;

  const adRatio = positiveCount / Math.max(1, negativeCount);
  const pctAbove20d = positiveCount >= 6 ? 55 : positiveCount >= 3 ? 40 : 25;
  const pctAbove50d = spyPrice > sma50 ? 52 : 38;
  const pctAbove200d = spyPrice > sma200 ? 62 : 45;

  let breadthScore = 30;
  if (positiveCount >= 7) breadthScore += 30;
  else if (positiveCount >= 5) breadthScore += 15;

  if (pctAbove200d > 60) breadthScore += 15;
  else if (pctAbove200d > 50) breadthScore += 10;

  if (pctAbove50d > 50) breadthScore += 10;
  if (adRatio > 1.5) breadthScore += 10;
  else if (adRatio < 0.5) breadthScore -= 10;

  breadthScore = Math.max(0, Math.min(100, breadthScore));

  const sortedSectors = [...sectorChanges].sort((a, b) => b.changePct - a.changePct);
  const top3 = sortedSectors.slice(0, 3);
  const bottom3 = sortedSectors.slice(-3);
  const top3avg = top3.reduce((s, x) => s + x.changePct, 0) / 3;
  const bottom3avg = bottom3.reduce((s, x) => s + x.changePct, 0) / 3;
  const relStrengthSpread = top3avg - bottom3avg;

  let momentumScore = 40;
  if (q.SPY.changePct > 0) momentumScore += 15;
  else if (q.SPY.changePct > -1) momentumScore += 5;
  else momentumScore -= 10;

  if (relStrengthSpread < 1) momentumScore -= 10;
  if (relStrengthSpread > 2) momentumScore += 10;

  const avgVolumeRatio = q.SPY.avgVolume > 0 ? q.SPY.volume / q.SPY.avgVolume : 1;
  if (avgVolumeRatio > 1.2 && q.SPY.changePct > 0) momentumScore += 10;
  if (avgVolumeRatio > 1.2 && q.SPY.changePct < 0) momentumScore -= 5;

  if (top3avg > 0) momentumScore += 10;

  momentumScore = Math.max(0, Math.min(100, momentumScore));

  const tnx = q.TNX.price;
  const dxy = q.DXY.price;

  let fedStance: "hawkish" | "neutral" | "dovish" = "neutral";
  if (tnx > 4.5) fedStance = "hawkish";
  else if (tnx < 3.5) fedStance = "dovish";

  const fomcDates = [
    "2026-01-28","2026-03-18","2026-04-29","2026-06-17","2026-07-29","2026-09-16","2026-10-28","2026-12-16",
  ];
  const dataDate = data.fetchedAt ? data.fetchedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const fomcSoon = fomcDates.some(fd => {
    const diff = Math.abs(new Date(fd).getTime() - new Date(dataDate).getTime());
    return diff <= 3 * 24 * 60 * 60 * 1000;
  });

  let macroScore = 55;
  if (tnx < 4.0) macroScore += 10;
  else if (tnx > 4.5) macroScore -= 10;

  if (dxy < 100) macroScore += 5;
  else if (dxy > 105) macroScore -= 10;

  if (fomcSoon) macroScore -= 10;
  if (fedStance === "dovish") macroScore += 10;
  if (fedStance === "hawkish") macroScore -= 10;

  macroScore = Math.max(0, Math.min(100, macroScore));

  let execScore = 45;
  const dayRange = q.SPY.high - q.SPY.low;
  const closeInRange = dayRange > 0 ? (q.SPY.price - q.SPY.low) / dayRange : 0.5;
  if (closeInRange < 0.3) execScore -= 10;
  else if (closeInRange < 0.5) execScore -= 5;
  else if (closeInRange > 0.7) execScore += 10;

  if (q.SPY.changePct < -1) execScore -= 8;
  if (q.QQQ.changePct < -1) execScore -= 5;
  if (top3avg < 0) execScore -= 8;
  else if (top3avg > 0.5) execScore += 10;
  if (q.VIX.changePct > 10) execScore -= 8;
  else if (q.VIX.changePct > 5) execScore -= 4;
  if (negativeCount >= 9) execScore -= 5;

  execScore = Math.max(5, Math.min(100, execScore));

  const marketQuality = Math.round(
    volScore * 0.25 + momentumScore * 0.25 + trendScore * 0.20 + breadthScore * 0.20 + macroScore * 0.10
  );

  let decision: "YES" | "CAUTION" | "NO" = "CAUTION";
  let decisionText = "";
  if (marketQuality >= 80) {
    decision = "YES";
    decisionText = "Full position sizing, press risk";
  } else if (marketQuality >= 60) {
    decision = "CAUTION";
    decisionText = "Half size, A+ setups only";
  } else {
    decision = "NO";
    decisionText = "Avoid trading, preserve capital";
  }

  const analysisLines: string[] = [];
  if (vix > 25) analysisLines.push(`Elevated volatility (VIX ${vix.toFixed(1)}) signals heightened fear and wider risk premiums.`);
  if (regime === "downtrend") analysisLines.push("SPY is below key moving averages indicating a developing downtrend.");
  else if (regime === "chop") analysisLines.push("Market structure is mixed — SPY is above the 200d but below shorter-term averages, creating choppy conditions.");
  if (negativeCount >= 9) analysisLines.push("Broad-based selling across sectors — no safe haven within equities today.");
  if (fomcSoon) analysisLines.push("FOMC decision imminent — expect increased uncertainty and whipsaws.");
  if (decision === "NO") analysisLines.push("This is a risk-off environment. Stand aside and preserve capital until conditions improve.");
  else if (decision === "CAUTION") analysisLines.push("Selective swing trades possible, but reduce size and focus only on high-conviction setups with clear risk/reward.");

  return {
    decision,
    decisionText,
    marketQuality,
    executionWindow: execScore,
    scores: {
      volatility: {
        score: volScore, weight: 25,
        details: { vix, vix5dSlope: +vix5dSlope.toFixed(2), vixPercentile, putCallEstimate, vixYearHigh, vixYearLow }
      },
      momentum: {
        score: momentumScore, weight: 25,
        details: { top3: top3.map(s => ({ symbol: s.symbol, changePct: s.changePct })), bottom3: bottom3.map(s => ({ symbol: s.symbol, changePct: s.changePct })), relStrengthSpread: +relStrengthSpread.toFixed(2), volumeRatio: +avgVolumeRatio.toFixed(2) }
      },
      trend: {
        score: trendScore, weight: 20,
        details: {
          spyPrice, sma20: +sma20.toFixed(2), sma50: +sma50.toFixed(2), sma200: +sma200.toFixed(2),
          aboveSma20, aboveSma50, aboveSma200, qqqAbove50, rsi: +rsi.toFixed(1), regime
        }
      },
      breadth: {
        score: breadthScore, weight: 20,
        details: {
          positiveCount, negativeCount, adRatio: +adRatio.toFixed(2),
          pctAbove20d, pctAbove50d, pctAbove200d
        }
      },
      macro: {
        score: macroScore, weight: 10,
        details: { tnx, dxy, fedStance, fomcSoon }
      },
    } satisfies ScoreBreakdown,
    analysis: analysisLines.join(" "),
    sectorData: sectorChanges.sort((a, b) => b.changePct - a.changePct),
    executionDetails: {
      closeInRange: +closeInRange.toFixed(2),
      breakoutsHolding: closeInRange > 0.5,
      pullbacksBought: q.SPY.changePct > -0.5,
      multiDayFollowThrough: q.SPY.changePct > 0,
      leadersHolding: top3avg > 0,
    }
  };
}

export async function registerRoutes(server: Server, app: Express) {
  app.get("/api/market-data", async (_req, res) => {
    try {
      const data = await getMarketData();
      const scores = computeScores(data);
      return res.json({
        ...scores,
        quotes: data.quotes,
        spyHistory: data.spyHistory,
        vixHistory: data.vixHistory,
        sentiment: data.sentiment,
        lastUpdated: data.fetchedAt,
      });
    } catch (err: any) {
      console.error("/api/market-data failed:", err);
      return res.status(500).json({ error: "Failed to fetch market data", detail: err?.message || String(err) });
    }
  });

  app.get("/api/market-data/historical", async (_req, res) => {
    res.status(501).json({
      error: "Historical data requires a paid API tier. The live dashboard works with the free tier."
    });
  });
}
