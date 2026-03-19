import { AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  message: string;
}

export default function AlertBanner({ message }: AlertBannerProps) {
  return (
    <div 
      data-testid="alert-banner"
      className="flex items-center gap-2 px-4 py-1.5 alert-flash"
      style={{ 
        background: "rgba(255, 165, 2, 0.12)", 
        borderBottom: "1px solid rgba(255, 165, 2, 0.3)" 
      }}
    >
      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--terminal-amber)" }} />
      <span className="text-xs font-semibold tracking-wide" style={{ color: "var(--terminal-amber)" }}>
        {message}
      </span>
    </div>
  );
}
