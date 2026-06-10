import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, SkipForward, Plus, Check, Trash2, 
  Volume2, VolumeX, Brain, Clock, ListTodo, BarChart3, Quote, FileText, Sparkles, Terminal, RefreshCw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


// Motivational quotes for developers
const QUOTES = [
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" }
];

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function App() {
  // --- Live Time ---
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Quote Generator ---
  const [quote, setQuote] = useState(QUOTES[0]);
  const changeQuote = () => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  };

  // --- OneSignal Push Notification State ---
  const [oneSignalId, setOneSignalId] = useState<string | null>(null);
  const activeNotificationIdRef = useRef<string | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  useEffect(() => {
    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    (window as any).OneSignalDeferred.push(async function(OneSignal: any) {
      await OneSignal.init({
        appId: "fb88458d-29aa-47c2-ba1c-ab3c117132fe",
      });

      // Get current subscription ID
      const subId = OneSignal.User.PushSubscription.id;
      setOneSignalId(subId || null);

      // Listen for subscription changes
      OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
        setOneSignalId(event.current.id || null);
      });
    });
  }, []);

  const requestNotificationPermission = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      setShowIOSPrompt(true);
      return;
    }

    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    (window as any).OneSignalDeferred.push(async function(OneSignal: any) {
      try {
        await OneSignal.Notifications.requestPermission();
        const subId = OneSignal.User.PushSubscription.id;
        if (subId) {
          setOneSignalId(subId);
        }
      } catch (err) {
        console.error("Failed to request permission:", err);
      }
    });
  };

  // Schedule background alert
  const scheduleNotification = async (seconds: number) => {
    if (!oneSignalId) {
      setNotificationStatus("No subscription ID found");
      return;
    }
    await cancelNotification(); // Cancel existing scheduled alert first
    setNotificationStatus("Scheduling background alarm...");

    const title = timerMode === "focus" ? "Break Time! ☕" : "Focus Time! 💻";
    const message = timerMode === "focus" 
      ? "Great job focusing! Take a well-deserved break." 
      : "Break is over. Let's get back to building!";

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: oneSignalId,
          seconds,
          title,
          message
        })
      });
      const data = await response.json();
      if (response.ok && data.notificationId) {
        activeNotificationIdRef.current = data.notificationId;
        setNotificationStatus("Alarm scheduled in background");
      } else {
        setNotificationStatus(`Failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      console.error("Failed to schedule background notification:", err);
      setNotificationStatus(`Network error: ${err.message || 'Failed to connect'}`);
    }
  };

  // Cancel background alert
  const cancelNotification = async () => {
    if (!activeNotificationIdRef.current) return;
    try {
      setNotificationStatus("Cancelling background alarm...");
      const response = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: activeNotificationIdRef.current
        })
      });
      const data = await response.json();
      if (response.ok) {
        activeNotificationIdRef.current = null;
        setNotificationStatus(null);
      } else {
        setNotificationStatus(`Cancel Failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      console.error("Failed to cancel background notification:", err);
      setNotificationStatus(`Cancel error: ${err.message || 'Failed'}`);
    }
  };

  // --- Pomodoro Timer State ---
  const DURATIONS = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  };

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
      scheduleNotification(timeLeft);
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
          activeNotificationIdRef.current = null;

          if (timerMode === "focus") {
            const updatedSessions = sessionsCompleted + 1;
            setSessionsCompleted(updatedSessions);
            localStorage.setItem("devfocus_sessions", updatedSessions.toString());
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

  // play simple synthesized tone when timer ends
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

  // --- Task Board State ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("devfocus_tasks");
    return saved ? JSON.parse(saved) : [
      { id: "1", title: "Review pull requests", completed: true, createdAt: new Date().toISOString() },
      { id: "2", title: "Setup Vite and Tailwind config", completed: true, createdAt: new Date().toISOString() },
      { id: "3", title: "Implement Bento Grid UI", completed: false, createdAt: new Date().toISOString() },
      { id: "4", title: "Test synthesized audio player", completed: false, createdAt: new Date().toISOString() },
    ];
  });
  const [taskInput, setTaskInput] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    localStorage.setItem("devfocus_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskInput.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setTaskInput("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === "active") return !t.completed;
    if (taskFilter === "completed") return t.completed;
    return true;
  });

  // --- Notepad State ---
  const [note, setNote] = useState(() => {
    return localStorage.getItem("devfocus_note") || "// Quick notepad for scratch code & thoughts\n// Saved automatically...\n\nfunction initFocus() {\n  console.log('Stay focused, build things.');\n}";
  });

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    localStorage.setItem("devfocus_note", e.target.value);
  };

  // --- Audio Synthesis Engine ---
  const [soundMode, setSoundMode] = useState<"none" | "white" | "ocean" | "beats">("none");
  const [volume, setVolume] = useState(0.4);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);
  const sourceNodeRef2 = useRef<AudioNode | null>(null);

  // Initialize Audio Context
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  }, [volume]);

  // Generate White Noise Buffer
  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  // Play Sound Logic
  const startSound = (type: "white" | "ocean" | "beats") => {
    initAudio();
    stopSound();

    const ctx = audioContextRef.current!;
    const mainGain = gainNodeRef.current!;

    if (type === "white") {
      // White Noise
      const buffer = createNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // Lowpass filter to make it sound like gentle static/rain
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      source.connect(filter);
      filter.connect(mainGain);
      source.start(0);
      sourceNodeRef.current = source;

    } else if (type === "ocean") {
      // Ocean waves - modulated white noise
      const buffer = createNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, ctx.currentTime);

      // LFO to modulate volume like waves washing in/out
      const waveGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // Slow cycle (~12 seconds)

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);

      lfo.connect(lfoGain);
      // Offset values so volume doesn't hit zero completely
      const constantSource = ctx.createConstantSource ? ctx.createConstantSource() : null;
      if (constantSource) {
        constantSource.offset.setValueAtTime(0.5, ctx.currentTime);
        constantSource.connect(waveGain.gain);
        lfoGain.connect(waveGain.gain);
        constantSource.start();
        sourceNodeRef2.current = constantSource;
      } else {
        // Fallback if ConstantSourceNode is not supported
        lfoGain.connect(waveGain.gain);
      }

      source.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(mainGain);

      lfo.start(0);
      source.start(0);
      
      sourceNodeRef.current = source;

    } else if (type === "beats") {
      // Binaural Beats - Two detuned sine waves
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      oscLeft.type = "sine";
      oscLeft.frequency.setValueAtTime(140, ctx.currentTime); // 140Hz

      oscRight.type = "sine";
      oscRight.frequency.setValueAtTime(144, ctx.currentTime); // 144Hz (4Hz binaural difference = Theta wave)

      if (pannerLeft && pannerRight) {
        pannerLeft.pan.setValueAtTime(-1, ctx.currentTime);
        pannerRight.pan.setValueAtTime(1, ctx.currentTime);
        
        oscLeft.connect(pannerLeft);
        pannerLeft.connect(mainGain);

        oscRight.connect(pannerRight);
        pannerRight.connect(mainGain);
      } else {
        // Fallback to mono merging
        oscLeft.connect(mainGain);
        oscRight.connect(mainGain);
      }

      oscLeft.start(0);
      oscRight.start(0);

      // Keep references to stop them later
      sourceNodeRef.current = oscLeft;
      sourceNodeRef2.current = oscRight;
    }
  };

  const stopSound = () => {
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as any).stop();
      } catch (e) {}
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (sourceNodeRef2.current) {
      try {
        (sourceNodeRef2.current as any).stop();
      } catch (e) {}
      sourceNodeRef2.current.disconnect();
      sourceNodeRef2.current = null;
    }
  };

  const handleSoundToggle = (type: "white" | "ocean" | "beats") => {
    if (soundMode === type) {
      stopSound();
      setSoundMode("none");
    } else {
      startSound(type);
      setSoundMode(type);
    }
  };

  // Cleanup audio nodes on unmount
  useEffect(() => {
    return () => {
      stopSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // --- Calculations ---
  const progressValue = ((DURATIONS[timerMode] - timeLeft) / DURATIONS[timerMode]) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const efficiency = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const totalFocusMinutes = sessionsCompleted * 25;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 md:p-8 select-none">
      
      {/* HEADER WIDGET (Spans full width) */}
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

      {/* MAIN BENTO GRID */}
      <main className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        
        {/* WIDGET 1: POMODORO TIMER (Spans 2 columns on MD) */}
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
                    ? "bg-red-500 hover:bg-red-600 text-white" 
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

        {/* WIDGET 2: TASK BOARD (Spans 1 column, full height) */}
        <Card className="bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-2xl shadow-xl flex flex-col h-full justify-between">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-white flex items-center gap-2">
              <ListTodo className="size-4 text-primary" /> Task Board
            </CardTitle>
            <CardDescription>Plan and check off your workflow</CardDescription>
          </CardHeader>
          
          <CardContent className="py-4 flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Add Task input form */}
            <form onSubmit={addTask} className="flex gap-2">
              <Input
                type="text"
                placeholder="New feature to code..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                className="flex-1 bg-slate-950/40 border-white/8 text-white placeholder:text-slate-500 focus-visible:ring-primary/40 focus-visible:border-primary/50 text-xs"
              />
              <Button type="submit" size="icon" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                <Plus className="size-4" />
              </Button>
            </form>

            {/* Task Filter */}
            <div className="flex bg-slate-950/45 p-0.5 rounded-lg border border-white/5 justify-between">
              {(["all", "active", "completed"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTaskFilter(filter)}
                  className={`cursor-pointer flex-1 py-1 rounded-md text-[10px] font-mono capitalize transition-all ${
                    taskFilter === filter 
                      ? "bg-slate-800 text-white font-bold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Task list container */}
            <div className="flex-1 overflow-y-auto max-h-60 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {filteredTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                  <Terminal className="size-8 opacity-20 mb-2" />
                  <p className="text-xs">No tasks found</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {filteredTasks.map((task) => (
                    <li 
                      key={task.id} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        task.completed 
                          ? "bg-slate-950/20 border-white/5 opacity-55" 
                          : "bg-slate-950/40 border-white/8 hover:border-white/12"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className={`cursor-pointer size-4.5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            task.completed 
                              ? "bg-primary border-primary text-primary-foreground" 
                              : "border-slate-500 hover:border-primary"
                          }`}
                        >
                          {task.completed && <Check className="size-3 stroke-[3]" />}
                        </button>
                        <span className={`text-xs text-slate-100 truncate ${task.completed ? "line-through text-slate-500" : ""}`}>
                          {task.title}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="cursor-pointer text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </CardContent>
          
          {/* Card footer summary */}
          <div className="p-3 bg-slate-950/40 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>Total Tasks: {totalTasksCount}</span>
            <span>Completed: {completedTasksCount}</span>
          </div>
        </Card>

      </main>

      {/* LOWER WIDGETS ROW (Bento row) */}
      <section className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        
        {/* WIDGET 3: FOCUS STATS */}
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

        {/* WIDGET 4: AMBIENT SOUND GENERATOR */}
        <Card className="bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-2xl shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Volume2 className="size-4 text-primary" /> Ambient Noise
            </CardTitle>
            <CardDescription>Synthesized audio signals for focus</CardDescription>
          </CardHeader>

          <CardContent className="py-4 flex flex-col justify-between flex-1 gap-4">
            
            {/* Visualizer animation that dances if sound is playing */}
            <div className="h-10 bg-slate-950/45 border border-white/5 rounded-xl flex items-center justify-center gap-1 overflow-hidden px-4">
              {soundMode === "none" ? (
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <VolumeX className="size-3.5" /> Noise synthesizer offline
                </div>
              ) : (
                <div className="flex items-end h-6 gap-1">
                  {[...Array(9)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-primary rounded-t-full animate-bounce" 
                      style={{ 
                        height: `${((i * 13) % 70) + 20}%`, 
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sound Toggle Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "white" as const, label: "Rain Static" },
                { type: "ocean" as const, label: "Waves" },
                { type: "beats" as const, label: "Binaural" },
              ].map((sound) => (
                <button
                  key={sound.type}
                  type="button"
                  onClick={() => handleSoundToggle(sound.type)}
                  className={`cursor-pointer py-2 px-1 rounded-xl border text-[10px] font-mono transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    soundMode === sound.type 
                      ? "bg-primary/20 border-primary text-white font-bold shadow-md shadow-primary/5" 
                      : "bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10"
                  }`}
                >
                  {soundMode === sound.type ? (
                    <Volume2 className="size-3.5 text-primary" />
                  ) : (
                    <VolumeX className="size-3.5" />
                  )}
                  {sound.label}
                </button>
              ))}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 bg-slate-950/20 px-2 py-1.5 rounded-lg border border-white/5">
              <VolumeX className="size-3.5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="cursor-pointer flex-1 h-1 bg-slate-800 rounded-lg appearance-none accent-primary"
              />
              <Volume2 className="size-3.5 text-slate-400" />
            </div>

          </CardContent>
        </Card>

        {/* WIDGET 5: SCRATCH NOTEPAD */}
        <Card className="bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-2xl shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="size-4 text-primary" /> Developer Log
            </CardTitle>
            <CardDescription>Persistent scratchpad & snippets</CardDescription>
          </CardHeader>

          <CardContent className="py-2 flex-1">
            <textarea
              value={note}
              onChange={handleNoteChange}
              className="w-full h-32 bg-slate-950/50 border border-white/8 rounded-xl p-3 text-xs font-mono text-slate-300 placeholder:text-slate-600 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
              spellCheck="false"
            />
          </CardContent>
        </Card>

      </section>

      {/* PERSISTENT MOTIVATIONAL QUOTE FOOTER */}
      <footer className="max-w-6xl w-full mx-auto mt-6 p-4 bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-2xl shadow-lg flex items-center justify-between text-xs gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Quote className="size-3.5 text-primary shrink-0" />
          <span className="italic font-mono">"{quote.text}"</span>
          <span className="text-slate-500">— {quote.author}</span>
        </div>
        <button 
          onClick={changeQuote} 
          className="cursor-pointer text-slate-400 hover:text-white transition-colors bg-slate-950/50 hover:bg-slate-850 px-2 py-1 rounded border border-white/5 flex items-center gap-1 font-mono text-[10px]"
        >
          <RefreshCw className="size-3" /> Next
        </button>
      </footer>

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
              onClick={() => {
                setShowConfirmSwitchDialog(false);
                setPendingMode(null);
                setPendingAction(null);
              }} 
              className="cursor-pointer flex-1 border-white/10 hover:border-white/20 hover:bg-slate-800 text-white font-mono text-xs font-bold py-2.5 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
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
              }} 
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
