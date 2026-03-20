import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect, useCallback } from "react";
import TickerBar from "@/components/TickerBar";
import HeroPanel from "@/components/HeroPanel";
import ScorePanel from "@/components/ScorePanel";
import SectorHeatmap from "@/components/SectorHeatmap";
import CategoryPanel from "@/components/CategoryPanel";
import AlertBanner from "@/components/AlertBanner";
import AnalysisPanel from "@/components/AnalysisPanel";
import ExecutionPanel from "@/components/ExecutionPanel";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [mode, setMode] = useState<"swing" | "day">("swing");
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [timeAgo, setTimeAgo] = useState("just now");

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["/api/market-data"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/market-data");
      return res.json();
    },
    refetchInterval: 45000,
    staleTime: 30000,
  });

  const handleRefresh = useCallback(() => {
    refetch();
    setLastRefresh(Date.now());
  }, [refetch]);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastRefresh) / 1000);
      if (seconds < 5) setTimeAgo("just now");
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefresh]);

  useEffect(() => {
    if (data) setLastRefresh(Date.now());
  }, [data]);

  if (isLoading || !data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(218, 25%, 8%)" }}>
      {data.scores?.macro?.details?.fomcSoon && (
        <AlertBanner message="FOMC DECISION IMMINENT — Expect elevated volatility and potential whipsaws" />
      )}

      <TickerBar quotes={data.quotes} />

      <div className="flex items-center justify-between px-4 py-1.5 border-b"
           style={{ borderColor: "var(--terminal-border)", background: "hsl(218, 22%, 9%)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-amber-400' : 'bg-emerald-400'} live-pulse`} />
            <span className="text-xs" style={{ color: isFetching ? '#ffa502' : '#00d26a' }}>
              {isFetching ? 'UPDATING' : 'LIVE'}
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--terminal-dim)' }}>
            Updated {timeAgo}
          </span>
        </div>

        <div className="flex items-center gap-3">
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors hover:bg-white/5"
            style={{ color: 'var(--terminal-cyan)', borderColor: 'var(--terminal-border)', border: '1px solid var(--terminal-border)' }}
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ overscrollBehavior: 'contain' }}>
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

        <div className="grid grid-cols-5 gap-3">
          <CategoryPanel title="VOLATILITY" score={data.scores.volatility.score} weight={data.scores.volatility.weight} details={data.scores.volatility.details} type="volatility" />
          <CategoryPanel title="TREND" score={data.scores.trend.score} weight={data.scores.trend.weight} details={data.scores.trend.details} type="trend" />
          <CategoryPanel title="BREADTH" score={data.scores.breadth.score} weight={data.scores.breadth.weight} details={data.scores.breadth.details} type="breadth" />
          <CategoryPanel title="MOMENTUM" score={data.scores.momentum.score} weight={data.scores.momentum.weight} details={data.scores.momentum.details} type="momentum" />
          <CategoryPanel title="MACRO" score={data.scores.macro.score} weight={data.scores.macro.weight} details={data.scores.macro.details} type="macro" />
        </div>

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
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(218, 25%, 8%)" }}>
      <div className="h-8 border-b" style={{ borderColor: 'var(--terminal-border)', background: 'hsl(218, 22%, 9%)' }}>
        <div className="h-full flex items-center px-4 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-3 w-20 rounded" style={{ background: 'var(--terminal-border)' }} />
          ))}
        </div>
      </div>
      <div className="h-8 border-b flex items-center px-4" style={{ borderColor: 'var(--terminal-border)', background: 'hsl(218, 22%, 9%)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full live-pulse" style={{ background: '#f59e0b' }} />
          <span className="text-xs" style={{ color: '#ffa502' }}>LOADING</span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-5 h-44 rounded" style={{ background: 'var(--terminal-panel)' }} />
          <div className="col-span-4 h-44 rounded" style={{ background: 'var(--terminal-panel)' }} />
          <div className="col-span-3 h-44 rounded" style={{ background: 'var(--terminal-panel)' }} />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-48 rounded" style={{ background: 'var(--terminal-panel)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
