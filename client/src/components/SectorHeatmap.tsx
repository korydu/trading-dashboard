interface SectorData {
  symbol: string;
  changePct: number;
}

interface SectorHeatmapProps {
  sectors: SectorData[];
  quotes: Record<string, { price: number; change: number; changePct: number }>;
}

const SECTOR_NAMES: Record<string, string> = {
  XLK: "Technology",
  XLF: "Financials",
  XLE: "Energy",
  XLV: "Healthcare",
  XLI: "Industrials",
  XLY: "Cons. Disc.",
  XLP: "Cons. Staples",
  XLU: "Utilities",
  XLB: "Materials",
  XLRE: "Real Estate",
  XLC: "Comm. Svcs",
};

export default function SectorHeatmap({ sectors, quotes }: SectorHeatmapProps) {
  const maxAbs = Math.max(...sectors.map(s => Math.abs(s.changePct)), 0.5);

  return (
    <div
      data-testid="sector-heatmap"
      className="rounded-lg p-3 h-full flex flex-col"
      style={{ 
        background: "var(--terminal-panel)", 
        border: "1px solid var(--terminal-border)" 
      }}
    >
      <div className="text-xs font-semibold mb-3" style={{ color: "var(--terminal-cyan)" }}>
        SECTOR PERFORMANCE
      </div>
      
      <div className="flex-1 space-y-1.5">
        {sectors.map((sector, i) => {
          const q = quotes[sector.symbol];
          const isUp = sector.changePct >= 0;
          const barWidth = Math.abs(sector.changePct) / maxAbs * 100;
          const color = isUp ? "var(--terminal-green)" : "var(--terminal-red)";
          const bgColor = isUp ? "rgba(0, 210, 106, 0.15)" : "rgba(255, 71, 87, 0.15)";
          const isLeader = i < 3;
          const isLaggard = i >= sectors.length - 3;

          return (
            <div key={sector.symbol} className="flex items-center gap-2">
              <div className="w-12 text-right">
                <span className="text-xs font-medium" style={{ 
                  color: isLeader ? "var(--terminal-green)" : isLaggard ? "var(--terminal-red)" : "hsl(210, 20%, 75%)" 
                }}>
                  {sector.symbol}
                </span>
              </div>
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-4 rounded-sm overflow-hidden relative" style={{ background: "hsl(216, 18%, 12%)" }}>
                  <div 
                    className="h-full rounded-sm transition-all duration-700 flex items-center"
                    style={{ 
                      width: `${Math.max(barWidth, 2)}%`, 
                      background: bgColor,
                      borderRight: `2px solid ${color}`,
                    }}
                  >
                    <span className="text-xs px-1.5 whitespace-nowrap" style={{ color, fontSize: "10px" }}>
                      {SECTOR_NAMES[sector.symbol]}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-14 text-right">
                <span className="text-xs font-medium" style={{ color }}>
                  {isUp ? "+" : ""}{sector.changePct.toFixed(2)}%
                </span>
              </div>
              {isLeader && (
                <span className="text-xs px-1 rounded" style={{ background: "rgba(0, 210, 106, 0.15)", color: "var(--terminal-green)", fontSize: "9px" }}>
                  TOP
                </span>
              )}
              {isLaggard && (
                <span className="text-xs px-1 rounded" style={{ background: "rgba(255, 71, 87, 0.15)", color: "var(--terminal-red)", fontSize: "9px" }}>
                  BTM
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
