// server/market-api.ts
// Fetches live market data from Alpha Vantage (free tier)

const API_KEY = process.env.ALPHA_VANTAGE_KEY || "demo";

export interface Quote {
  price: number;
  change: number;
  changePct: number;
  prevClose: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  avgVolume: number;
  yearHigh: number;
  yearLow: number;
}

interface HistoryPoint {
  date: string;
  close: number;
}

const cache = new Map<string, { data: any; fetchedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.fetchedAt < CACHE_TTL) return entry.data as T;
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, fetchedAt: Date.now() });
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Alpha Vantage request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<any>;
}

async function fetchQuote(symbol: string): Promise<Quote | null> {
  const cached = getCached<Quote>(`quote:${symbol}`);
  if (cached) return cached;

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const json = await fetchJson(url);
    const q = json["Global Quote"];
    if (!q) return null;

    const quote: Quote = {
      price: parseFloat(q["05. price"]) || 0,
      change: parseFloat(q["09. change"]) || 0,
      changePct: parseFloat(q["10. change percent"]?.replace("%", "")) || 0,
      prevClose: parseFloat(q["08. previous close"]) || 0,
      high: parseFloat(q["03. high"]) || 0,
      low: parseFloat(q["04. low"]) || 0,
      open: parseFloat(q["02. open"]) || 0,
      volume: parseInt(q["06. volume"]) || 0,
      avgVolume: 0,
      yearHigh: 0,
      yearLow: 0,
    };

    setCache(`quote:${symbol}`, quote);
    return quote;
  } catch (err) {
    console.error(`Failed to fetch quote for ${symbol}:`, err);
    return null;
  }
}

async function fetchDailyHistory(symbol: string): Promise<HistoryPoint[]> {
  const cached = getCached<HistoryPoint[]>(`history:${symbol}`);
  if (cached) return cached;

  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${API_KEY}`;
    const json = await fetchJson(url);
    const timeSeries = json["Time Series (Daily)"];
    if (!timeSeries) return [];

    const history: HistoryPoint[] = Object.entries(timeSeries)
      .map(([date, vals]: [string, any]) => ({
        date,
        close: parseFloat(vals["4. close"]) || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setCache(`history:${symbol}`, history);
    return history;
  } catch (err) {
    console.error(`Failed to fetch history for ${symbol}:`, err);
    return [];
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchAllMarketData() {
  const tickers = ["SPY", "QQQ", "XLK", "XLF", "XLE", "XLV", "XLI", "XLY", "XLP", "XLU", "XLB", "XLRE", "XLC"];
  const quotes: Record<string, Quote> = {};

  for (const ticker of tickers) {
    const quote = await fetchQuote(ticker);
    if (quote) quotes[ticker] = quote;
    await sleep(13000);
  }

  const vixQuote = await fetchQuote("VIX");
  if (vixQuote) quotes["VIX"] = vixQuote;
  await sleep(13000);

  if (!quotes["DXY"]) {
    quotes["DXY"] = {
      price: 100,
      change: 0,
      changePct: 0,
      prevClose: 100,
      high: 100,
      low: 100,
      open: 100,
      volume: 0,
      avgVolume: 0,
      yearHigh: 105,
      yearLow: 95,
    };
  }

  if (!quotes["TNX"]) {
    quotes["TNX"] = {
      price: 4.0,
      change: 0,
      changePct: 0,
      prevClose: 4.0,
      high: 4.0,
      low: 4.0,
      open: 4.0,
      volume: 0,
      avgVolume: 0,
      yearHigh: 5.0,
      yearLow: 3.5,
    };
  }

  const spyHistory = await fetchDailyHistory("SPY");
  await sleep(13000);
  const qqqHistory = await fetchDailyHistory("QQQ");
  await sleep(13000);
  const vixHistory = await fetchDailyHistory("VIX");

  const vixPrice = quotes["VIX"]?.price || 20;
  const sentiment = vixPrice > 30 ? "bearish" : vixPrice > 20 ? "neutral" : "bullish";

  return {
    lastUpdated: new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    quotes,
    spyHistory: spyHistory.slice(-250),
    qqqHistory: qqqHistory.slice(-250),
    vixHistory: vixHistory.slice(-250),
    sentiment,
  };
}
