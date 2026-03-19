import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect, useCallback, useRef } from "react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import TickerBar from "@/components/TickerBar";
import HeroPanel from "@/components/HeroPanel";
import ScorePanel from "@/components/ScorePanel";
import SectorHeatmap from "@/components/SectorHeatmap";
import CategoryPanel from "@/components/CategoryPanel";
import AlertBanner from "@/components/AlertBanner";
import AnalysisPanel from "@/components/AnalysisPanel";
import ExecutionPanel from "@/components/ExecutionPanel";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { RefreshCw, Calendar, X } from "lucide-react";

function formatHistoricalLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Dashboard() {
  const [mode, setMode] = useState<"swing" | "day">("swing");
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [timeAgo, setTimeAgo] = useState("just now");
  const [historicalDate, setHistoricalDate] = useState<string | null>(null);
  const [historicalError, setHistoricalError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const isHistorical = historicalDate !== null;

  // Live data query
  const { data: liveData, isLoading: liveLoading, refetch, isFetching: liveFetching } = useQuery({
    queryKey: ["/api/market-data"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/market-data");
      return res.json();
    },
    refetchInterval: isHistorical ? false : 45000,
    staleTime: 30000,
    enabled: !isHistorical,
  });

  // Historical data query
  const { data: histData, isLoading: histLoading, isFetching: histFetching } = useQuery({
    queryKey: ["/api/market-data/historical", historicalDate],
    queryFn: async () => {
      setHistoricalError(null);
      const res = await apiRequest("GET", `/api/market-data/historical?date=${historicalDate}`);
      return res.json();
    },
    enabled: isHistorical,
    staleTime: Infinity,
    retry: false,
  });

  const data = isHistorical ? histData : liveData;
  const isLoading = isHistorical ? histLoading : liveLoading;
  const isFetching = isHistorical ? histFetching : liveFetching;

  const handleRefresh = useCallback(() => {
    if (!isHistorical) {
      refetch();
      setLastRefresh(Date.now());
    }
  }, [refetch, isHistorical]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setHistoricalDate(val);
      setHistoricalError(null);
    } else {
      setHistoricalDate(null);
      setHistoricalError(null);
    }
  }, []);

  const handleClearHistorical = useCallback(() => {
    setHistoricalDate(null);
    setHistoricalError(null);
    if (dateInputRef.current) dateInputRef.current.value = "";
    refetch();
    setLastRefresh(Date.now());
  }, [refetch]);

  // Update "time ago" display
  useEffect(() => {
    if (isHistorical) return;
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastRefresh) / 1000);
      if (seconds < 5) setTimeAgo("just now");
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefresh, isHistorical]);

  useEffect(() => {
    if (data && !isHistorical) setLastRefresh(Date.now());
  }, [data, isHistorical]);

  if (isLoading || !data) {
    return <LoadingSkeleton isHistorical={isHistorical} date={historicalDate} />;
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(218, 25%, 8%)" }}>
      {/* Alert Banner */}
      {data.scores?.macro?.details?.fomcSoon && (
        <AlertBanner message="FOMC DECISION IMMINENT — Expect elevated volatility and potential whipsaws" />
      )}

      {/* Top Ticker Bar */}
      <TickerBar quotes={data.quotes} />

      {/* Historical Mode Banner */}
      {isHistorical && (
        <div className="flex items-center justify-between px-4 py-1.5 border-b"
             style={{ borderColor: 'var(--terminal-amber)', background: 'rgba(255, 165, 2, 0.08)' }}>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--terminal-amber)' }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--terminal-amber)' }}>
              HISTORICAL — {formatHistoricalLabel(data?.historicalDate || historicalDate || "")}
            </span>
            <span className="text-xs" style={{ color: 'var(--terminal-dim)' }}>
              End of day summary
            </span>
          </div>
          <button
            data-testid="back-to-live"
            onClick={handleClearHistorical}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold hover:bg-white/10 transition-colors"
            style={{ color: 'var(--terminal-green)', border: '1px solid var(--terminal-green)' }}
          >
            <X className="w-3 h-3" />
            BACK TO LIVE
          </button>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b"
           style={{ borderColor: "var(--terminal-border)", background: "hsl(218, 22%, 9%)" }}>
        <div className="flex items-center gap-3">
          {!isHistorical ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-amber-400' : 'bg-emerald-400'} live-pulse`} />
                <span className="text-xs" style={{ color: isFetching ? '#ffa502' : '#00d26a' }}>
                  {isFetching ? 'UPDATING' : 'LIVE'}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--terminal-dim)' }}>
                Updated {timeAgo}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--terminal-amber)' }} />
              <span className="text-xs" style={{ color: 'var(--terminal-amber)' }}>
                {isFetching ? 'LOADING HISTORICAL' : 'HISTORICAL'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Historical Date Picker */}
          <div className="flex items-center gap-1.5 rounded border px-2 py-1"
               style={{ borderColor: 'var(--terminal-border)', background: 'rgba(255,255,255,0.03)' }}>
            <Calendar className="w-3 h-3" style={{ color: 'var(--terminal-dim)' }} />
            <input
              ref={dateInputRef}
              data-testid="date-picker"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={historicalDate || ""}
              onChange={handleDateChange}
              className="bg-transparent text-xs outline-none cursor-pointer"
              style={{ 
                color: isHistorical ? 'var(--terminal-amber)' : 'var(--terminal-dim)',
                colorScheme: 'dark',
                width: isHistorical ? '120px' : '105px',
              }}
              title="Select a historical date to view end-of-day summary"
            />
            {isHistorical && (
              <button
                data-testid="clear-date"
                onClick={handleClearHistorical}
                className="hover:bg-white/10 rounded p-0.5 transition-colors"
                title="Return to live data"
              >
                <X className="w-3 h-3" style={{ color: 'var(--terminal-dim)' }} />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px" style={{ background: 'var(--terminal-border)' }} />

          {/* Mode Toggle */}
          <div className="flex items-center rounded overflow-hidden border" style={{ borderColor: 'var(--terminal-border)' }}>
            <button
              data-testid="mode-swing"
              onClick={() => setMode("swing")}
              className={`px-3 py-1 text-xs transition-colors ${
                mode === "swing" 
                  ? "text-black font-semibold" 
                  : "hover:bg-white/5"
              }`}
              style={mode === "swing" ? { background: 'var(--terminal-green)' } : { color: 'var(--terminal-dim)' }}
            >
              SWING
            </button>
            <button
              data-testid="mode-day"
              onClick={() => setMode("day")}
              className={`px-3 py-1 text-xs transition-colors ${
                mode === "day" 
                  ? "text-black font-semibold" 
                  : "hover:bg-white/5"
              }`}
              style={mode === "day" ? { background: 'var(--terminal-green)' } : { color: 'var(--terminal-dim)' }}
            >
              DAY
            </button>
          </div>

          <button
            data-testid="refresh-button"
            onClick={handleRefresh}
            disabled={isHistorical}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
              isHistorical ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'
            }`}
            style={{ color: 'var(--terminal-cyan)', borderColor: 'var(--terminal-border)', border: '1px solid var(--terminal-border)' }}
          >
            <RefreshCw className={`w-3 h-3 ${isFetching && !isHistorical ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ overscrollBehavior: 'contain' }}>
        {/* Hero + Score Row */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-5">
            <HeroPanel 
              decision={data.decision} 
              decisionText={data.decisionText} 
              marketQuality={data.marketQuality}
              mode={mode}
            />
          </div>
          <div className="col-span-4">
            <ScorePanel 
              marketQuality={data.marketQuality}
              executionWindow={data.executionWindow}
            />
          </div>
          <div className="col-span-3">
            <ExecutionPanel 
              score={data.executionWindow}
              details={data.executionDetails}
            />
          </div>
        </div>

        {/* Category Panels Row */}
        <div className="grid grid-cols-5 gap-3">
          <CategoryPanel 
            title="VOLATILITY" 
            score={data.scores.volatility.score}
            weight={data.scores.volatility.weight}
            details={data.scores.volatility.details}
            type="volatility"
          />
          <CategoryPanel 
            title="TREND" 
            score={data.scores.trend.score}
            weight={data.scores.trend.weight}
            details={data.scores.trend.details}
            type="trend"
          />
          <CategoryPanel 
            title="BREADTH" 
            score={data.scores.breadth.score}
            weight={data.scores.breadth.weight}
            details={data.scores.breadth.details}
            type="breadth"
          />
          <CategoryPanel 
            title="MOMENTUM" 
            score={data.scores.momentum.score}
            weight={data.scores.momentum.weight}
            details={data.scores.momentum.details}
            type="momentum"
          />
          <CategoryPanel 
            title="MACRO" 
            score={data.scores.macro.score}
            weight={data.scores.macro.weight}
            details={data.scores.macro.details}
            type="macro"
          />
        </div>

        {/* Sector Heatmap + Score Breakdown + Analysis */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-5">
            <SectorHeatmap sectors={data.sectorData} quotes={data.quotes} />
          </div>
          <div className="col-span-4">
            <ScoreBreakdown scores={data.scores} total={data.marketQuality} />
          </div>
          <div className="col-span-3">
            <AnalysisPanel analysis={data.analysis} sentiment={data.sentiment} />
          </div>
        </div>

        {/* Attribution */}
        <div className="pt-1 pb-2">
          <PerplexityAttribution />
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ isHistorical, date }: { isHistorical?: boolean; date?: string | null }) {
  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(218, 25%, 8%)" }}>
      <div className="h-8 border-b" style={{ borderColor: 'var(--terminal-border)', background: 'hsl(218, 22%, 9%)' }}>
        <div className="h-full flex items-center px-4 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-3 w-20 rounded" style={{ background: 'var(--terminal-border)' }} />
          ))}
        </div>
      </div>
      <div className="h-8 border-b flex items-center px-4" style={{ borderColor: 'var(--terminal-border)', background: 'hsl(218, 22%, 9%)' }}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isHistorical ? '' : 'live-pulse'}`}
               style={{ background: isHistorical ? 'var(--terminal-amber)' : '#f59e0b' }} />
          <span className="text-xs" style={{ color: isHistorical ? 'var(--terminal-amber)' : '#ffa502' }}>
            {isHistorical ? `LOADING ${date ? formatHistoricalLabel(date) : 'HISTORICAL'}...` : 'LOADING'}
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-5 h-44 rounded" style={{ background: 'var(--terminal-panel)' }} />
          <div className="col-span-4 h-44 rounded" style={{ background: 'var(--terminal-panel)' }} />
          <div className="col-span-3 h-44 rounded" style={{ background: 'var(--terminal-panel)' }} />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-48 rounded" style={{ background: 'var(--terminal-panel)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
