import { useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { useCall } from "@/hooks/use-call";
import { Button } from "../ui/button";
import AvatarWithBadge from "../avatar-with-badge";
import { cn } from "@/lib/utils";

const CallOverlay = () => {
  const {
    status,
    peer,
    type,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const isVisible = status !== "idle" && status !== "ended";

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isVisible || !peer) return null;

  const isVideoCall = type === "video";
  const isActive = status === "active";
  const isIncoming = status === "incoming";
  const isOutgoing = status === "outgoing";
  const isConnecting = status === "connecting";

  const statusLabel = isIncoming
    ? "Incoming call"
    : isOutgoing
      ? "Calling..."
      : isConnecting
        ? "Connecting..."
        : "In call";

  return (
    <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col">
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {isVideoCall && isActive && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <AvatarWithBadge
              name={peer.name}
              src={peer.avatar ?? ""}
              size="w-28 h-28"
            />
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">{peer.name}</h2>
              <p className="text-white/70 mt-1">{statusLabel}</p>
            </div>
          </div>
        )}

        {isVideoCall && localStream && (isActive || isConnecting || isOutgoing) && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "absolute bottom-24 right-4 w-36 h-48 rounded-xl object-cover",
              "border-2 border-white/20 shadow-lg bg-black",
              isVideoOff && "opacity-0 pointer-events-none"
            )}
          />
        )}
      </div>

      <div className="p-6 pb-10 flex flex-col items-center gap-6">
        {!isActive && (
          <p className="text-white/80 text-sm">
            {isVideoCall ? "Video call" : "Voice call"}
          </p>
        )}

        <div className="flex items-center gap-4">
          {isIncoming ? (
            <>
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full h-14 w-14 p-0"
                onClick={rejectCall}
              >
                <PhoneOff className="size-6" />
              </Button>
              <Button
                size="lg"
                className="rounded-full h-14 w-14 p-0 bg-green-600 hover:bg-green-700"
                onClick={() => void acceptCall()}
              >
                <Phone className="size-6" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full h-12 w-12 p-0"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <MicOff className="size-5" />
                ) : (
                  <Mic className="size-5" />
                )}
              </Button>

              {isVideoCall && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full h-12 w-12 p-0"
                  onClick={toggleVideo}
                >
                  {isVideoOff ? (
                    <VideoOff className="size-5" />
                  ) : (
                    <Video className="size-5" />
                  )}
                </Button>
              )}

              <Button
                size="lg"
                variant="destructive"
                className="rounded-full h-14 w-14 p-0"
                onClick={endCall}
              >
                <PhoneOff className="size-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;
