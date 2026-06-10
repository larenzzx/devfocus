import { BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface DailyStat {
  day: string;
  date: string;
  val: number;
  isToday: boolean;
}

interface StatsWidgetProps {
  totalFocusMinutes: number;
  completedTasksCount: number;
  efficiency: number;
  weekData: DailyStat[];
}

export function StatsWidget({ totalFocusMinutes, completedTasksCount, efficiency, weekData }: StatsWidgetProps) {
  // Find the maximum focus minutes in the week to scale the bar heights dynamically (minimum 100 to look natural)
  const maxMinutes = Math.max(...weekData.map((d) => d.val), 100);

  const formatDateLabel = (dateStr: string): string => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card className="bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-2xl shadow-xl flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" /> Daily Focus Stats
        </CardTitle>
        <CardDescription>Track your weekly efficiency metrics</CardDescription>
      </CardHeader>

      <CardContent className="py-4 flex flex-col justify-between flex-1 gap-4">
        
        {/* Stat numbers */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 uppercase block">Total</span>
            <span className="text-lg font-bold text-white">{totalFocusMinutes}m</span>
          </div>
          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 uppercase block">Done</span>
            <span className="text-lg font-bold text-white">{completedTasksCount}</span>
          </div>
          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 uppercase block">Rate</span>
            <span className="text-lg font-bold text-primary">{efficiency}%</span>
          </div>
        </div>

        {/* Custom CSS Mini Bar Chart */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end px-2 bg-slate-950/35 border border-white/5 rounded-xl py-3.5">
            {weekData.map((item, idx) => {
              const heightPercent = Math.min(100, Math.max(0, (item.val / maxMinutes) * 100));
              return (
                <div key={idx} className="flex flex-col items-center flex-1 gap-1">
                  <div className="w-4 bg-slate-800/50 rounded-sm h-12 flex items-end">
                    <div 
                      className={`w-full rounded-sm transition-all duration-500 cursor-pointer ${
                        item.isToday 
                          ? "bg-primary shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                          : "bg-slate-500 hover:bg-slate-400"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${formatDateLabel(item.date)}: ${item.val} mins`}
                    />
                  </div>
                  <span className={`text-[9px] font-mono ${item.isToday ? "text-primary font-bold" : "text-slate-400"}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
