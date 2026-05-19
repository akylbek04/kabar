import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAudioDuration } from "@/lib/helper";
import { Button } from "../ui/button";

interface Props {
  src: string;
  isCurrentUser?: boolean;
}

const AudioMessagePlayer = ({ src, isCurrentUser }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play();
      setIsPlaying(true);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayTime =
    isPlaying || currentTime > 0 ? currentTime : duration;

  return (
    <div className="flex items-center gap-2 min-w-[200px] max-w-[280px] py-1">
      <audio ref={audioRef} src={src} preload="metadata" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={cn(
          "shrink-0 rounded-full size-9",
          isCurrentUser
            ? "bg-primary/20 hover:bg-primary/30"
            : "bg-background/80 hover:bg-background"
        )}
      >
        {isPlaying ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current ml-0.5" />
        )}
      </Button>
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div
          className={cn(
            "h-1 rounded-full overflow-hidden",
            isCurrentUser ? "bg-primary/30" : "bg-muted-foreground/25"
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-100",
              isCurrentUser ? "bg-primary" : "bg-foreground/70"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {formatAudioDuration(displayTime)}
        </span>
      </div>
    </div>
  );
};

export default AudioMessagePlayer;
