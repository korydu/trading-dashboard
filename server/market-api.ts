import yahooFinance from "yahoo-finance2";

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

interface YahooRecord {
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
  date?: Date;
}

const cache = new Map<string, { data: any; fetchedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const SYMBOL_MAP: Record<string, string> = {
  SPY: "SPY",
  QQQ: "QQQ",
  XLK: "XLK",
  XLF: "XLF",
  XLE: "XLE",
  XLV: "XLV",
  XLI: "XLI",
  XLY: "XLY",
  XLP: "XLP",
  XLU: "XLU",
  XLB: "XLB",
  XLRE: "XLRE",
  XLC: "XLC",
  VIX: "^VIX",
  DXY: "DX-Y.NYB",
  TNX: "^TNX",
};

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.fetchedAt < CACHE_TTL) return entry.data as T;
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, fetchedAt: Date.now() });
}

function toDateString(value?: Date) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function normalizeQuote(summary: any): Quote {
  const price = summary.regularMarketPrice ?? summary.postMarketPrice ?? summary.preMarketPrice ?? 0;
  const prevClose = summary.regularMarketPreviousClose ?? summary.previousClose ?? 0;
  const change = summary.regularMarketChange ?? (price - prevClose);
  const rawChangePct = summary.regularMarketChangePercent;
  const changePct = typeof rawChangePct === "number"
    ? rawChangePct
    : prevClose
      ? (change / prevClose) * 100
      : 0;

  return {
    price: Number(price) || 0,
    change: Number(change) || 0,
    changePct: Number(changePct) || 0,
    prevClose: Number(prevClose) || 0,
    high: Number(summary.regularMarketDayHigh ?? price) || 0,
    low: Number(summary.regularMarketDayLow ?? price) || 0,
    open: Number(summary.regularMarketOpen ?? prevClose ?? price) || 0,
    volume: Number(summary.regularMarketVolume) || 0,
    avgVolume: Number(summary.averageDailyVolume3Month ?? summary.averageDailyVolume10Day) || 0,
    yearHigh: Number(summary.fiftyTwoWeekHigh ?? price) || 0,
    yearLow: Number(summary.fiftyTwoWeekLow ?? price) || 0,
  };
}

async function fetchQuote(symbol: string): Promise<Quote | null> {
  const cached = getCached<Quote>(`quote:${symbol}`);
  if (cached) return cached;

  try {
    const yahooSymbol = SYMBOL_MAP[symbol] ?? symbol;
    const summary = await yahooFinance.quoteSummary(yahooSymbol, {
      modules: ["price", "summaryDetail"],
    });
    const merged = { ...(summary.price || {}), ...(summary.summaryDetail || {}) };
    const quote = normalizeQuote(merged);
    setCache(`quote:${symbol}`, quote);
    return quote;
  } catch (err) {
    console.error(`Failed to fetch Yahoo quote for ${symbol}:`, err);
    return null;
  }
}

async function fetchDailyHistory(symbol: string): Promise<HistoryPoint[]> {
  const cached = getCached<HistoryPoint[]>(`history:${symbol}`);
  if (cached) return cached;

  try {
    const yahooSymbol = SYMBOL_MAP[symbol] ?? symbol;
    const rows = await yahooFinance.chart(yahooSymbol, {
      period1: new Date(Date.now() - 370 * 24 * 60 * 60 * 1000),
      interval: "1d",
    });

    const quotes = (rows.quotes || []) as YahooRecord[];
    const history = quotes
      .filter((row) => row.date && typeof row.close === "number")
      .map((row) => ({
        date: toDateString(row.date),
        close: Number(row.close) || 0,
      }))
      .filter((row) => row.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    setCache(`history:${symbol}`, history);
    return history;
  } catch (err) {
    console.error(`Failed to fetch Yahoo history for ${symbol}:`, err);
    return [];
  }
}

export async function fetchAllMarketData() {
  const tickers = ["SPY", "QQQ", "XLK", "XLF", "XLE", "XLV", "XLI", "XLY", "XLP", "XLU", "XLB", "XLRE", "XLC", "VIX", "DXY", "TNX"];

  const quoteResults = await Promise.all(
    tickers.map(async (ticker) => [ticker, await fetchQuote(ticker)] as const),
  );

  const quotes = Object.fromEntries(
    quoteResults
      .filter(([, quote]) => quote)
      .map(([ticker, quote]) => [ticker, quote]),
  ) as Record<string, Quote>;

  const [spyHistory, qqqHistory, vixHistory] = await Promise.all([
    fetchDailyHistory("SPY"),
    fetchDailyHistory("QQQ"),
    fetchDailyHistory("VIX"),
  ]);

  if (!quotes.DXY) {
    quotes.DXY = {
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

  if (!quotes.TNX) {
    quotes.TNX = {
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

  if (!quotes.VIX) {
    quotes.VIX = {
      price: 20,
      change: 0,
      changePct: 0,
      prevClose: 20,
      high: 20,
      low: 20,
      open: 20,
      volume: 0,
      avgVolume: 0,
      yearHigh: 30,
      yearLow: 12,
    };
  }

  const vixPrice = quotes.VIX?.price || 20;
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
