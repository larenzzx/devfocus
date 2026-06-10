import { useState, useEffect } from "react";

export interface DailyStat {
  day: string;
  date: string;
  val: number;
  isToday: boolean;
}

const DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const getManilaDateString = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const getManilaWeekDates = (date: Date = new Date()): string[] => {
  const dayOfWeekName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "long"
  }).format(date);
  
  const dayMap: { [key: string]: number } = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
  };
  
  const dayOfWeek = dayMap[dayOfWeekName];
  const mondayDelta = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const deltaDays = mondayDelta + i;
    const shiftedDate = new Date(date.getTime() + deltaDays * 24 * 60 * 60 * 1000);
    weekDates.push(getManilaDateString(shiftedDate));
  }
  return weekDates;
};

const preseedHistoryIfNeeded = () => {
  const historyKey = "devfocus_history";
  const existingHistory = localStorage.getItem(historyKey);
  
  if (!existingHistory) {
    const todayStr = getManilaDateString();
    const weekDates = getManilaWeekDates();
    const newHistory: { [key: string]: number } = {};
    
    const seedValues = [50, 100, 75, 50, 75, 25, 0];
    let preseededSessionsCount = 0;
    
    weekDates.forEach((dateStr, idx) => {
      if (dateStr < todayStr) {
        newHistory[dateStr] = seedValues[idx];
        preseededSessionsCount += seedValues[idx] / 25;
      } else {
        newHistory[dateStr] = 0;
      }
    });
    
    localStorage.setItem(historyKey, JSON.stringify(newHistory));
    
    const existingSessions = localStorage.getItem("devfocus_sessions");
    if (!existingSessions || parseInt(existingSessions, 10) === 0) {
      localStorage.setItem("devfocus_sessions", preseededSessionsCount.toString());
    }
  }
};

const recordSessionInHistory = () => {
  const historyKey = "devfocus_history";
  const todayStr = getManilaDateString();
  
  let history: { [key: string]: number } = {};
  try {
    const raw = localStorage.getItem(historyKey);
    if (raw) {
      history = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse devfocus_history", e);
  }
  
  history[todayStr] = (history[todayStr] || 0) + 25;
  localStorage.setItem(historyKey, JSON.stringify(history));
};

const getWeekDataList = (): DailyStat[] => {
  const historyKey = "devfocus_history";
  const todayStr = getManilaDateString();
  const weekDates = getManilaWeekDates();
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  
  let history: { [key: string]: number } = {};
  try {
    const raw = localStorage.getItem(historyKey);
    if (raw) {
      history = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse devfocus_history", e);
  }
  
  return weekDates.map((dateStr, idx) => {
    return {
      day: dayLabels[idx],
      date: dateStr,
      val: history[dateStr] || 0,
      isToday: dateStr === todayStr,
    };
  });
};

export function useTimer(
  scheduleNotification: (seconds: number, mode: "focus" | "short" | "long") => Promise<void>,
  cancelNotification: () => Promise<void>
) {
  // Ensure history is preseeded before any state initializations
  preseedHistoryIfNeeded();

  const [timerMode, setTimerMode] = useState<"focus" | "short" | "long">(() => {
    const saved = localStorage.getItem("devfocus_timer_mode");
    return (saved === "focus" || saved === "short" || saved === "long") ? saved : "focus";
  });

  const [isRunning, setIsRunning] = useState(() => {
    return localStorage.getItem("devfocus_is_running") === "true";
  });

  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    return parseInt(localStorage.getItem("devfocus_sessions") || "0", 10);
  });

  const [weekData, setWeekData] = useState<DailyStat[]>(() => {
    return getWeekDataList();
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const savedIsRunning = localStorage.getItem("devfocus_is_running") === "true";
    const saved = localStorage.getItem("devfocus_timer_mode");
    const savedMode = (saved === "focus" || saved === "short" || saved === "long") ? saved : "focus";
    const duration = DURATIONS[savedMode];

    if (savedIsRunning) {
      const savedEndTime = localStorage.getItem("devfocus_end_time");
      if (savedEndTime) {
        const remaining = Math.ceil((parseInt(savedEndTime, 10) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
    }
    const savedTimeLeft = localStorage.getItem("devfocus_time_left");
    return savedTimeLeft ? parseInt(savedTimeLeft, 10) : duration;
  });

  const [showConfirmSwitchDialog, setShowConfirmSwitchDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<"focus" | "short" | "long" | null>(null);
  const [pendingAction, setPendingAction] = useState<"switch" | "reset" | "skip" | null>(null);

  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completedMode, setCompletedMode] = useState<"focus" | "short" | "long" | null>(null);

  // Sync mode changes with time
  const handleModeChange = (mode: "focus" | "short" | "long") => {
    setTimerMode(mode);
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);

    localStorage.setItem("devfocus_timer_mode", mode);
    localStorage.setItem("devfocus_is_running", "false");
    localStorage.setItem("devfocus_time_left", DURATIONS[mode].toString());
    localStorage.removeItem("devfocus_end_time");

    cancelNotification();
  };

  const onModeTabClick = (mode: "focus" | "short" | "long") => {
    if (isRunning && timerMode !== mode) {
      setPendingAction("switch");
      setPendingMode(mode);
      setShowConfirmSwitchDialog(true);
    } else {
      handleModeChange(mode);
    }
  };

  const onResetClick = () => {
    if (isRunning) {
      setPendingAction("reset");
      setShowConfirmSwitchDialog(true);
    } else {
      handleModeChange(timerMode);
    }
  };

  const onSkipClick = () => {
    const nextMode = timerMode === "focus" ? "short" : "focus";
    if (isRunning) {
      setPendingAction("skip");
      setPendingMode(nextMode);
      setShowConfirmSwitchDialog(true);
    } else {
      handleModeChange(nextMode);
    }
  };

  const toggleTimer = () => {
    const nextIsRunning = !isRunning;
    setIsRunning(nextIsRunning);
    localStorage.setItem("devfocus_is_running", nextIsRunning.toString());

    if (nextIsRunning) {
      const targetEnd = Date.now() + timeLeft * 1000;
      localStorage.setItem("devfocus_end_time", targetEnd.toString());
      localStorage.setItem("devfocus_timer_mode", timerMode);
      scheduleNotification(timeLeft, timerMode);
    } else {
      localStorage.setItem("devfocus_time_left", timeLeft.toString());
      localStorage.removeItem("devfocus_end_time");
      cancelNotification();
    }
  };

  // Timer Tick Logic
  useEffect(() => {
    let intervalId: any = null;

    if (isRunning) {
      const savedEndTime = localStorage.getItem("devfocus_end_time");
      let targetEndTime = savedEndTime ? parseInt(savedEndTime, 10) : Date.now() + timeLeft * 1000;
      if (!savedEndTime) {
        localStorage.setItem("devfocus_end_time", targetEndTime.toString());
      }

      const checkTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((targetEndTime - now) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(intervalId);
          setIsRunning(false);
          localStorage.setItem("devfocus_is_running", "false");
          localStorage.removeItem("devfocus_end_time");

          // Only play alarm sound if the timer completed within the last 10 seconds.
          if (now - targetEndTime < 10000) {
            playAlarmSound();
          }

          if (timerMode === "focus") {
            const updatedSessions = sessionsCompleted + 1;
            setSessionsCompleted(updatedSessions);
            localStorage.setItem("devfocus_sessions", updatedSessions.toString());
            recordSessionInHistory();
            setWeekData(getWeekDataList());
          }

          // Show completion modal
          setCompletedMode(timerMode);
          setShowCompletionDialog(true);

          // Switch mode automatically
          const nextMode = timerMode === "focus" ? "short" : "focus";
          setTimerMode(nextMode);
          localStorage.setItem("devfocus_timer_mode", nextMode);
          setTimeLeft(DURATIONS[nextMode]);
          localStorage.setItem("devfocus_time_left", DURATIONS[nextMode].toString());
          cancelNotification();
        }
      };

      checkTimer();
      intervalId = setInterval(checkTimer, 200);
    } else {
      localStorage.setItem("devfocus_time_left", timeLeft.toString());
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timerMode, sessionsCompleted]);

  // Update browser tab title with remaining time
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    const modeLabel = timerMode === "focus" ? "Focus" : "Break";
    document.title = isRunning ? `(${formattedTime}) ${modeLabel} | DevFocus` : "DevFocus";
  }, [timeLeft, isRunning, timerMode]);

  // Hook for page visibility changes to snap the timer when returning
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isRunning) {
        const savedEndTime = localStorage.getItem("devfocus_end_time");
        if (savedEndTime) {
          const remaining = Math.max(0, Math.ceil((parseInt(savedEndTime, 10) - Date.now()) / 1000));
          setTimeLeft(remaining);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning]);

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.error("AudioContext block", e);
    }
  };

  const cancelSwitch = () => {
    setShowConfirmSwitchDialog(false);
    setPendingMode(null);
    setPendingAction(null);
  };

  const confirmSwitch = () => {
    if (pendingAction === "reset") {
      handleModeChange(timerMode);
    } else if (pendingAction === "skip" && pendingMode) {
      handleModeChange(pendingMode);
    } else if (pendingAction === "switch" && pendingMode) {
      handleModeChange(pendingMode);
    }
    setShowConfirmSwitchDialog(false);
    setPendingMode(null);
    setPendingAction(null);
  };

  const progressValue = ((DURATIONS[timerMode] - timeLeft) / DURATIONS[timerMode]) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return {
    timerMode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    progressValue,
    minutes,
    seconds,
    handleModeChange,
    onModeTabClick,
    onResetClick,
    onSkipClick,
    toggleTimer,
    showConfirmSwitchDialog,
    setShowConfirmSwitchDialog,
    pendingMode,
    pendingAction,
    showCompletionDialog,
    setShowCompletionDialog,
    completedMode,
    DURATIONS,
    cancelSwitch,
    confirmSwitch,
    weekData,
  };
}
