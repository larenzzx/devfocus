import { Brain, Check, Sparkles } from "lucide-react";

interface HeaderProps {
  time: Date;
  oneSignalId: string | null;
  requestNotificationPermission: () => Promise<void>;
}

export function Header({ time, oneSignalId, requestNotificationPermission }: HeaderProps) {
  return (
    <header className="max-w-6xl w-full mx-auto mb-6 flex flex-col md:flex-row items-center justify-between p-6 bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-2xl shadow-xl gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 text-primary animate-pulse">
          <Brain className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-1.5">
            DEV<span className="text-primary">FOCUS</span>
          </h1>
          <p className="text-xs text-muted-foreground">Productivity bento for devs</p>
        </div>
      </div>

      {/* OneSignal Notification Button */}
      <div className="flex items-center gap-2">
        {!oneSignalId ? (
          <button
            onClick={requestNotificationPermission}
            className="cursor-pointer text-xs font-mono bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-all px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.1)] hover:shadow-[0_0_18px_rgba(34,197,94,0.2)] animate-pulse"
          >
            <Sparkles className="size-3.5" /> Enable Mobile Alerts
          </button>
        ) : (
          <div className="text-xs font-mono text-slate-400 bg-slate-950/40 border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Check className="size-3.5 text-primary" /> Alerts Active
          </div>
        )}
      </div>

      {/* Live Date / Time */}
      <div className="flex items-center gap-4 text-right">
        <div className="hidden sm:block">
          <p className="text-sm text-slate-300 font-mono">
            {time.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-xs text-muted-foreground">PH Time</p>
        </div>
        <div className="bg-slate-950/60 border border-white/5 rounded-xl px-4 py-1.5 font-mono text-lg font-bold text-white shadow-inner">
          {time.toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(/\s/g, '')}
        </div>
      </div>
    </header>
  );
}
