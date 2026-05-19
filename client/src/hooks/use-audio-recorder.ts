import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const DEFAULT_MAX_DURATION_MS = 5 * 60 * 1000;

const getSupportedMimeType = () => {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "audio/webm";
};

const mimeToExtension: Record<string, string> = {
  "audio/webm;codecs=opus": "webm",
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/ogg;codecs=opus": "ogg",
};

export const useAudioRecorder = (maxDurationMs = DEFAULT_MAX_DURATION_MS) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef("audio/webm");

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setDuration(0);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setDuration(0);

      const startedAt = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        setDuration(elapsed);
        if (elapsed * 1000 >= maxDurationMs) {
          mediaRecorderRef.current?.stop();
        }
      }, 250);
    } catch {
      toast.error("Microphone access denied");
    }
  }, [maxDurationMs]);

  const stopRecording = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        cleanup();
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const mimeType = mimeTypeRef.current;
        const ext = mimeToExtension[mimeType] ?? "webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        cleanup();

        if (blob.size === 0) {
          resolve(null);
          return;
        }

        resolve(
          new File([blob], `voice-message-${Date.now()}.${ext}`, {
            type: mimeType,
          })
        );
      };

      recorder.stop();
    });
  }, [cleanup]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    cleanup();
  }, [cleanup]);

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
