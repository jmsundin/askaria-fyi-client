export interface P5WaveformHandle {
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
  seekTo: (progress: number) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
}

export const createP5WaveformHandle = (
  audioRef: React.RefObject<HTMLAudioElement | null>
): P5WaveformHandle => {
  return {
    play: () => {
      audioRef.current?.play();
    },
    pause: () => {
      audioRef.current?.pause();
    },
    isPlaying: () => {
      return !(audioRef.current?.paused ?? true);
    },
    seekTo: (progress: number) => {
      if (audioRef.current) {
        const newTime = progress * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
      }
    },
    getDuration: () => {
      return audioRef.current?.duration || 0;
    },
    getCurrentTime: () => {
      return audioRef.current?.currentTime || 0;
    },
  };
};
