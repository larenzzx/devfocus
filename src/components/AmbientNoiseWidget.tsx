import { Volume2, VolumeX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface AmbientNoiseWidgetProps {
  soundMode: "none" | "white" | "ocean" | "beats";
  volume: number;
  setVolume: (val: number) => void;
  handleSoundToggle: (type: "white" | "ocean" | "beats") => void;
}

export function AmbientNoiseWidget({
  soundMode,
  volume,
  setVolume,
  handleSoundToggle,
}: AmbientNoiseWidgetProps) {
  return (
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
  );
}
