import { Clock, RotateCcw, Pause, Play, SkipForward, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TimerWidgetProps {
  timerMode: "focus" | "short" | "long";
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  progressValue: number;
  minutes: number;
  seconds: number;
  onModeTabClick: (mode: "focus" | "short" | "long") => void;
  onResetClick: () => void;
  onSkipClick: () => void;
  toggleTimer: () => void;
  notificationStatus: string | null;
}

export function TimerWidget({
  timerMode,
  sessionsCompleted,
  progressValue,
  minutes,
  seconds,
  isRunning,
  onModeTabClick,
  onResetClick,
  onSkipClick,
  toggleTimer,
  notificationStatus,
}: TimerWidgetProps) {
  return (
    <Card className="md:col-span-2 bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-2xl shadow-xl flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="size-4 text-primary" /> Session Timer
          </CardTitle>
          <CardDescription>Stay focused, one block at a time</CardDescription>
        </div>
        
        {/* Quick Session Tracker */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/50 border border-white/5 px-2.5 py-1 rounded-full font-mono">
          <Sparkles className="size-3 text-primary animate-bounce" />
          <span>{sessionsCompleted} Pomodoros</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center justify-center py-6 flex-1 gap-6">
        
        {/* Mode Selector Tab buttons */}
        <div className="flex bg-slate-950/50 border border-white/5 p-1 rounded-xl w-fit">
          <button
            onClick={() => onModeTabClick("focus")}
            className={`cursor-pointer px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              timerMode === "focus" 
                ? "bg-primary text-primary-foreground font-bold shadow-md" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => onModeTabClick("short")}
            className={`cursor-pointer px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              timerMode === "short" 
                ? "bg-accent text-accent-foreground font-bold shadow-md" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => onModeTabClick("long")}
            className={`cursor-pointer px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              timerMode === "long" 
                ? "bg-slate-800 text-white font-bold shadow-md" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Circular Digital Clock Layout */}
        <div className="relative flex flex-col items-center justify-center py-4 select-none">
          <div className="font-mono text-7xl md:text-8xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(34,197,94,0.15)]">
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
          </div>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mt-2">
            {isRunning ? "Session in progress" : "Timer Paused"}
          </p>
          {isRunning && notificationStatus && (
            <p className="text-[10px] font-mono text-slate-400 mt-2 animate-pulse">
              📡 {notificationStatus}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md flex flex-col gap-1.5">
          <Progress value={progressValue} className="h-1.5 bg-slate-950/60" />
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>{progressValue.toFixed(0)}% Completed</span>
            <span>{minutes}m remaining</span>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onResetClick}
            className="cursor-pointer border-white/10 hover:border-white/20 hover:bg-slate-800 rounded-full"
            title="Reset timer"
          >
            <RotateCcw className="size-4 text-slate-300" />
          </Button>

          <Button
            size="lg"
            onClick={toggleTimer}
            className={`cursor-pointer rounded-full w-28 h-10 shadow-lg transition-transform active:scale-95 text-xs font-bold font-mono tracking-wider ${
              isRunning 
                ? "bg-red-500 hover:bg-red-650 text-white" 
                : "bg-primary hover:bg-primary/95 text-primary-foreground"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="size-4 mr-1.5 fill-current" /> PAUSE
              </>
            ) : (
              <>
                <Play className="size-4 mr-1.5 fill-current" /> FOCUS
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={onSkipClick}
            className="cursor-pointer border-white/10 hover:border-white/20 hover:bg-slate-800 rounded-full"
            title="Skip session"
          >
            <SkipForward className="size-4 text-slate-300" />
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
