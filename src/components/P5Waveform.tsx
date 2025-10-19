import { useEffect, useRef } from "react";
import p5 from "p5";

interface P5WaveformProps {
  audioUrl: string;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  height?: number;
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onError?: (error: string) => void;
  onDurationChange?: (duration: number) => void;
}

export default function P5Waveform({
  audioUrl,
  waveColor = "#d6c7ff",
  progressColor = "#5a189a",
  cursorColor = "#5a189a",
  height = 96,
  audioRef: externalAudioRef,
  onReady,
  onPlay,
  onPause,
  onTimeUpdate,
  onError,
  onDurationChange,
}: P5WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = externalAudioRef || internalAudioRef;
  const isPlayingRef = useRef(false);
  const waveformDataRef = useRef<number[]>([]);
  const isReadyRef = useRef(false);
  const isDraggingRef = useRef(false);
  const hasLoggedDrawRef = useRef(false);
  const wasPlayingBeforeDragRef = useRef(false);

  // Store callbacks in refs to avoid re-creating the effect
  const onReadyRef = useRef(onReady);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onErrorRef = useRef(onError);
  const onDurationChangeRef = useRef(onDurationChange);

  // Update refs when callbacks change
  useEffect(() => {
    onReadyRef.current = onReady;
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
    onTimeUpdateRef.current = onTimeUpdate;
    onErrorRef.current = onError;
    onDurationChangeRef.current = onDurationChange;
  });

  useEffect(() => {
    console.log("P5Waveform: useEffect triggered", {
      audioUrl,
      hasContainer: !!containerRef.current,
    });
    if (!containerRef.current) {
      console.warn("P5Waveform: No container ref, returning early");
      return;
    }

    let animationFrameId: number | null = null;
    let audio: HTMLAudioElement | null = null;
    let audioContext: AudioContext | null = null;

    const sketch = (p: p5) => {
      p.setup = () => {
        console.log("P5Waveform: p5 setup starting");
        const canvas = p.createCanvas(
          containerRef.current?.clientWidth || 800,
          height
        );
        canvas.parent(containerRef.current!);
        p.noLoop();
        console.log("P5Waveform: Canvas created", {
          width: canvas.width,
          height: canvas.height,
        });

        // Initial draw to show canvas is working
        p.redraw();

        // Create and setup audio element
        audio = new Audio();
        audio.crossOrigin = "use-credentials";
        audio.preload = "auto"; // Force full preload
        audioRef.current = audio;
        console.log("P5Waveform: Audio element created and assigned to ref");

        // Add progress event to monitor buffering
        audio.addEventListener("progress", () => {
          if (audio!.seekable.length > 0) {
            console.log(
              "P5Waveform: Buffering progress - seekable:",
              audio!.seekable.end(0),
              "/",
              audio!.duration
            );
          }
        });

        // Load audio and generate waveform
        audio.addEventListener("loadedmetadata", async () => {
          console.log(
            "P5Waveform: Audio metadata loaded, duration:",
            audio!.duration
          );
          try {
            await generateWaveformData();
            isReadyRef.current = true;
            console.log("P5Waveform: Waveform generated, calling onReady");
            p.redraw(); // Force redraw to show the waveform
            onReadyRef.current?.();
            if (onDurationChangeRef.current) {
              onDurationChangeRef.current(audio!.duration);
            }
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to load audio";
            console.error("P5Waveform: Error generating waveform:", message);
            onErrorRef.current?.(message);
          }
        });

        audio.addEventListener("error", () => {
          const errorMessage = audio?.error
            ? `Audio error (code ${audio.error.code}): ${audio.error.message}`
            : "Failed to load audio";
          console.error("P5Waveform: Audio error event fired", errorMessage);
          onErrorRef.current?.(errorMessage);
        });

        audio.addEventListener("canplay", () => {
          console.log("P5Waveform: Audio can play");
        });

        audio.addEventListener("loadstart", () => {
          console.log("P5Waveform: Audio load started");
        });

        audio.addEventListener("play", () => {
          isPlayingRef.current = true;
          onPlayRef.current?.();
          startAnimation();
        });

        audio.addEventListener("pause", () => {
          isPlayingRef.current = false;
          onPauseRef.current?.();
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        });

        audio.addEventListener("timeupdate", () => {
          if (audio && !isDraggingRef.current) {
            onTimeUpdateRef.current?.(audio.currentTime);
            p.redraw();
          }
        });

        console.log("P5Waveform: Setting audio source:", audioUrl);
        audio.src = audioUrl;
        audio.load();
      };

      const generateWaveformData = async () => {
        try {
          // Create audio context for waveform generation
          audioContext = new AudioContext();
          const response = await fetch(audioUrl, {
            credentials: "include",
          });
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Extract audio data
          const channelData = audioBuffer.getChannelData(0);
          const samples = 1000; // Number of bars in waveform
          const blockSize = Math.floor(channelData.length / samples);
          const waveform: number[] = [];

          for (let i = 0; i < samples; i++) {
            const start = i * blockSize;
            const end = start + blockSize;
            let sum = 0;

            for (let j = start; j < end; j++) {
              sum += Math.abs(channelData[j]);
            }

            waveform.push(sum / blockSize);
          }

          // Normalize waveform data
          const max = Math.max(...waveform);
          waveformDataRef.current = waveform.map((v) => v / max);
          p.redraw();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          throw new Error(`Failed to generate waveform: ${message}`);
        }
      };

      const startAnimation = () => {
        const animate = () => {
          if (isPlayingRef.current) {
            p.redraw();
            animationFrameId = requestAnimationFrame(animate);
          }
        };
        animate();
      };

      p.draw = () => {
        p.clear();
        p.background(0, 0, 0, 0);

        if (!isReadyRef.current || waveformDataRef.current.length === 0) {
          // Draw a simple line to show the canvas is working
          p.stroke(100);
          p.strokeWeight(1);
          p.line(0, height / 2, p.width, height / 2);
          if (!hasLoggedDrawRef.current) {
            console.log("P5Waveform: Drawing placeholder line (not ready)");
          }
          return;
        }

        if (!hasLoggedDrawRef.current) {
          console.log("P5Waveform: Drawing waveform", {
            dataLength: waveformDataRef.current.length,
            canvasWidth: p.width,
            audioTime: audio?.currentTime,
            audioDuration: audio?.duration,
          });
          hasLoggedDrawRef.current = true;
        }

        const waveformData = waveformDataRef.current;
        const currentTime = audio?.currentTime || 0;
        const duration = audio?.duration || 1;
        const progress = duration > 0 ? currentTime / duration : 0;

        const barWidth = 2;
        const barGap = 1;
        const totalBarWidth = barWidth + barGap;
        const numBars = Math.floor(p.width / totalBarWidth);
        const samplesPerBar = Math.ceil(waveformData.length / numBars);

        for (let i = 0; i < numBars; i++) {
          const x = i * totalBarWidth;
          const barProgress = i / numBars;

          // Calculate bar height from waveform data
          let amplitude = 0;
          for (let j = 0; j < samplesPerBar; j++) {
            const index = i * samplesPerBar + j;
            if (index < waveformData.length) {
              amplitude = Math.max(amplitude, waveformData[index]);
            }
          }

          const barHeight = Math.max(2, amplitude * height * 0.9);
          const y = (height - barHeight) / 2;

          // Set color based on progress
          if (barProgress <= progress) {
            p.fill(progressColor);
          } else {
            p.fill(waveColor);
          }

          p.noStroke();
          p.rect(x, y, barWidth, barHeight);
        }

        // Draw cursor at current position
        const cursorX = progress * p.width;
        p.stroke(cursorColor);
        p.strokeWeight(2);
        p.line(cursorX, 0, cursorX, height);
      };

      p.mousePressed = () => {
        if (!isReadyRef.current || !audio) return;
        if (
          p.mouseX >= 0 &&
          p.mouseX <= p.width &&
          p.mouseY >= 0 &&
          p.mouseY <= height
        ) {
          isDraggingRef.current = true;

          // Use audioRef.current to ensure we have the latest audio element
          const currentAudio = audioRef.current;
          if (
            !currentAudio ||
            !currentAudio.duration ||
            currentAudio.readyState < 1
          ) {
            console.warn("P5Waveform: Audio not ready for interaction", {
              hasAudio: !!currentAudio,
              duration: currentAudio?.duration,
              readyState: currentAudio?.readyState,
            });
            isDraggingRef.current = false;
            return;
          }

          wasPlayingBeforeDragRef.current = !currentAudio.paused;
          const progress = p.mouseX / p.width;
          const newTime = progress * currentAudio.duration;

          console.log("P5Waveform: Mouse pressed on waveform", {
            progress,
            newTime,
            wasPlaying: wasPlayingBeforeDragRef.current,
            audioDuration: currentAudio.duration,
            currentTime: currentAudio.currentTime,
            readyState: currentAudio.readyState,
          });

          // Pause if needed
          if (wasPlayingBeforeDragRef.current) {
            currentAudio.pause();
          }

          // Clamp time to valid duration range
          const clampedTime = Math.max(
            0,
            Math.min(newTime, currentAudio.duration)
          );

          console.log(
            "P5Waveform: Seeking from:",
            currentAudio.currentTime,
            "to:",
            clampedTime
          );

          currentAudio.currentTime = clampedTime;

          onTimeUpdateRef.current?.(clampedTime);
          p.redraw();
        }
      };

      p.mouseDragged = () => {
        if (!isReadyRef.current || !isDraggingRef.current) return;
        const currentAudio = audioRef.current;
        if (
          !currentAudio ||
          !currentAudio.duration ||
          currentAudio.readyState < 1
        )
          return;

        if (p.mouseX >= 0 && p.mouseX <= p.width) {
          const progress = Math.max(0, Math.min(1, p.mouseX / p.width));
          const newTime = progress * currentAudio.duration;

          // Clamp time to valid duration range
          const clampedTime = Math.max(
            0,
            Math.min(newTime, currentAudio.duration)
          );

          // Update currentTime during drag
          try {
            currentAudio.currentTime = clampedTime;
          } catch (error) {
            console.error(
              "P5Waveform: Error setting currentTime during drag:",
              error
            );
          }

          onTimeUpdateRef.current?.(clampedTime);
          p.redraw();
        }
      };

      p.mouseReleased = () => {
        if (isDraggingRef.current) {
          const currentAudio = audioRef.current;
          if (!currentAudio) {
            isDraggingRef.current = false;
            wasPlayingBeforeDragRef.current = false;
            return;
          }

          console.log("P5Waveform: Mouse released", {
            wasPlaying: wasPlayingBeforeDragRef.current,
            currentTime: currentAudio.currentTime,
            readyState: currentAudio.readyState,
          });

          // If audio was playing when we started dragging, resume playback
          if (wasPlayingBeforeDragRef.current) {
            // Wait for seek to complete before resuming playback
            const resumePlayback = () => {
              console.log(
                "P5Waveform: Resuming playback from",
                currentAudio!.currentTime
              );
              currentAudio!
                .play()
                .catch((err) =>
                  console.error("Failed to resume playback after drag:", err)
                );
            };

            // If audio is currently seeking, wait for it to complete
            if (currentAudio.seeking) {
              console.log(
                "P5Waveform: Audio is seeking, waiting for seeked event"
              );
              currentAudio.addEventListener("seeked", resumePlayback, {
                once: true,
              });
            } else {
              resumePlayback();
            }
          }

          wasPlayingBeforeDragRef.current = false;
        }
        isDraggingRef.current = false;
      };

      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(containerRef.current.clientWidth, height);
          p.redraw();
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
        audioRef.current = null;
      }
      if (audioContext) {
        audioContext.close();
      }
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
      isReadyRef.current = false;
      waveformDataRef.current = [];
      hasLoggedDrawRef.current = false;
      wasPlayingBeforeDragRef.current = false;
    };
  }, [audioUrl, height, waveColor, progressColor, cursorColor, audioRef]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${height}px`,
        position: "relative",
        display: "block",
        cursor: "pointer",
      }}
    />
  );
}
