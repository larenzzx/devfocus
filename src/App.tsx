import { useState, useEffect } from "react";
import { Sparkles, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { TimerWidget } from "@/components/TimerWidget";
import { TaskBoardWidget } from "@/components/TaskBoardWidget";
import { StatsWidget } from "@/components/StatsWidget";
import { AmbientNoiseWidget } from "@/components/AmbientNoiseWidget";
import { DeveloperLogWidget } from "@/components/DeveloperLogWidget";
import { QuoteFooter } from "@/components/QuoteFooter";

import { useOneSignal } from "@/hooks/useOneSignal";
import { useTimer } from "@/hooks/useTimer";
import { useTasks } from "@/hooks/useTasks";
import { useAudioSynthesizer } from "@/hooks/useAudioSynthesizer";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function App() {
  // Live Time state for Header clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Custom Hooks
  const {
    oneSignalId,
    showIOSPrompt,
    setShowIOSPrompt,
    notificationStatus,
    requestNotificationPermission,
    scheduleNotification,
    cancelNotification,
  } = useOneSignal();

  const {
    timerMode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    progressValue,
    minutes,
    seconds,
    onModeTabClick,
    onResetClick,
    onSkipClick,
    toggleTimer,
    showConfirmSwitchDialog,
    setShowConfirmSwitchDialog,
    pendingAction,
    showCompletionDialog,
    setShowCompletionDialog,
    completedMode,
    cancelSwitch,
    confirmSwitch,
  } = useTimer(scheduleNotification, cancelNotification);

  const {
    tasks,
    taskInput,
    setTaskInput,
    taskFilter,
    setTaskFilter,
    addTask,
    toggleTask,
    deleteTask,
    filteredTasks,
    completedTasksCount,
    totalTasksCount,
    efficiency,
  } = useTasks();

  const {
    soundMode,
    volume,
    setVolume,
    handleSoundToggle,
  } = useAudioSynthesizer();

  const totalFocusMinutes = sessionsCompleted * 25;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 md:p-8 select-none">
      
      {/* HEADER */}
      <Header 
        time={time} 
        oneSignalId={oneSignalId} 
        requestNotificationPermission={requestNotificationPermission} 
      />

      {/* MAIN BENTO GRID */}
      <main className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        
        {/* TIMER WIDGET */}
        <TimerWidget
          timerMode={timerMode}
          timeLeft={timeLeft}
          isRunning={isRunning}
          sessionsCompleted={sessionsCompleted}
          progressValue={progressValue}
          minutes={minutes}
          seconds={seconds}
          onModeTabClick={onModeTabClick}
          onResetClick={onResetClick}
          onSkipClick={onSkipClick}
          toggleTimer={toggleTimer}
          notificationStatus={notificationStatus}
        />

        {/* TASK BOARD WIDGET */}
        <TaskBoardWidget
          tasks={tasks}
          taskInput={taskInput}
          setTaskInput={setTaskInput}
          taskFilter={taskFilter}
          setTaskFilter={setTaskFilter}
          addTask={addTask}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          filteredTasks={filteredTasks}
          completedTasksCount={completedTasksCount}
          totalTasksCount={totalTasksCount}
        />

      </main>

      {/* LOWER WIDGETS ROW */}
      <section className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        
        {/* METRICS / STATS */}
        <StatsWidget
          totalFocusMinutes={totalFocusMinutes}
          completedTasksCount={completedTasksCount}
          efficiency={efficiency}
        />

        {/* AUDIO ENGINE */}
        <AmbientNoiseWidget
          soundMode={soundMode}
          volume={volume}
          setVolume={setVolume}
          handleSoundToggle={handleSoundToggle}
        />

        {/* PERSISTENT LOG */}
        <DeveloperLogWidget />

      </section>

      {/* QUOTE FOOTER */}
      <QuoteFooter />

      {/* iOS PWA Installation Prompt Dialog */}
      <Dialog open={showIOSPrompt} onOpenChange={setShowIOSPrompt}>
        <DialogContent className="bg-slate-900 border border-white/8 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 font-mono">
              <Sparkles className="size-4.5 text-primary animate-pulse" /> Install DevFocus
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              To enable mobile alerts on iOS, Safari requires you to install this app to your Home Screen:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-2 text-xs font-mono text-slate-300">
            <div className="flex gap-2.5 items-start bg-slate-950/40 p-2.5 border border-white/5 rounded-xl">
              <div className="bg-primary/10 text-primary text-[10px] size-5 rounded-full flex items-center justify-center shrink-0 border border-primary/20">1</div>
              <p>Tap the <span className="font-bold text-white">Share</span> button in Safari (square with an up arrow).</p>
            </div>
            <div className="flex gap-2.5 items-start bg-slate-950/40 p-2.5 border border-white/5 rounded-xl">
              <div className="bg-primary/10 text-primary text-[10px] size-5 rounded-full flex items-center justify-center shrink-0 border border-primary/20">2</div>
              <p>Scroll down the list and tap <span className="font-bold text-white">Add to Home Screen</span>.</p>
            </div>
            <div className="flex gap-2.5 items-start bg-slate-950/40 p-2.5 border border-white/5 rounded-xl">
              <div className="bg-primary/10 text-primary text-[10px] size-5 rounded-full flex items-center justify-center shrink-0 border border-primary/20">3</div>
              <p>Launch <span className="font-bold text-white">DevFocus</span> from your Home Screen and enable alerts.</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowIOSPrompt(false)} 
            className="cursor-pointer w-full bg-primary text-primary-foreground font-mono text-xs font-bold py-2 rounded-xl"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>

      {/* Active Timer Switch Confirmation Dialog */}
      <Dialog open={showConfirmSwitchDialog} onOpenChange={setShowConfirmSwitchDialog}>
        <DialogContent className="bg-slate-900 border border-white/8 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 font-mono">
              <Clock className="size-4.5 text-red-400" />
              {pendingAction === "reset" ? "Reset Running Timer?" : 
               pendingAction === "skip" ? "Skip Running Timer?" : "Stop Running Timer?"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {pendingAction === "reset" 
                ? "You currently have an active timer running. Resetting now will stop your progress and restart the countdown."
                : pendingAction === "skip"
                ? "You currently have an active timer running. Skipping now will stop your progress and move to the next session."
                : "You currently have an active focus or break timer running. Switching tabs now will stop your progress."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button 
              variant="outline"
              onClick={cancelSwitch} 
              className="cursor-pointer flex-1 border-white/10 hover:border-white/20 hover:bg-slate-800 text-white font-mono text-xs font-bold py-2.5 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmSwitch} 
              className="cursor-pointer flex-1 bg-red-500 hover:bg-red-650 text-white font-mono text-xs font-bold py-2.5 rounded-xl"
            >
              {pendingAction === "reset" ? "Reset" : pendingAction === "skip" ? "Skip" : "Stop & Switch"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timer Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="bg-slate-900 border border-white/8 text-white max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="bg-primary/10 p-3 rounded-full border border-primary/20 text-primary w-fit animate-bounce mb-2">
              <Sparkles className="size-8" />
            </div>
            <DialogTitle className="text-white text-lg font-bold font-mono">
              {completedMode === "focus" ? "Session Complete! 🎉" : "Break Over! ☕"}
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs mt-1">
              {completedMode === "focus" 
                ? "Excellent job staying focused! Your work block is complete. Time to take a well-deserved break." 
                : "Your break time has finished. Ready to get back into the zone and write some code?"}
            </DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => setShowCompletionDialog(false)} 
            className="cursor-pointer w-full bg-primary text-primary-foreground font-mono text-xs font-bold py-2 rounded-xl mt-4"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}
