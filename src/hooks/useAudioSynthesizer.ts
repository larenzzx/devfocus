import { useState, useEffect, useRef } from "react";

export function useAudioSynthesizer() {
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

  return {
    soundMode,
    volume,
    setVolume,
    handleSoundToggle,
  };
}
