import { BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface StatsWidgetProps {
  totalFocusMinutes: number;
  completedTasksCount: number;
  efficiency: number;
}

export function StatsWidget({ totalFocusMinutes, completedTasksCount, efficiency }: StatsWidgetProps) {
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
          <div className="flex justify-between items-end h-16 px-2 bg-slate-950/35 border border-white/5 rounded-xl py-2">
            {[
              { day: "M", val: 30 },
              { day: "T", val: 55 },
              { day: "W", val: 80 },
              { day: "T", val: 45 },
              { day: "F", val: 65 },
              { day: "S", val: 15 },
              { day: "S", val: 20 },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 gap-1">
                <div className="w-4 bg-slate-800 rounded-sm overflow-hidden h-12 flex items-end">
                  <div 
                    className={`w-full rounded-sm transition-all duration-500 ${
                      idx === 2 ? "bg-primary shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-slate-500"
                    }`}
                    style={{ height: `${item.val}%` }}
                    title={`${item.val} mins`}
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-400">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
