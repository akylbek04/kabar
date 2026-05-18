/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import type { Socket } from "socket.io-client";
import {
  attachLocalTracks,
  createPeerConnection,
  getLocalMediaStream,
  stopMediaStream,
} from "@/lib/webrtc";
import type {
  CallInvitePayload,
  CallMediaType,
  CallPeer,
  CallStatus,
} from "@/types/call.type";
import { useSocket } from "./use-socket";

let peerConnection: RTCPeerConnection | null = null;

interface CallState {
  status: CallStatus;
  callId: string | null;
  chatId: string | null;
  type: CallMediaType | null;
  peer: CallPeer | null;
  isInitiator: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  error: string | null;

  startCall: (params: {
    chatId: string;
    callee: CallPeer;
    type: CallMediaType;
  }) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  reset: () => void;
  bindSocket: (socket: Socket) => () => void;
}

const cleanupPeer = () => {
  peerConnection?.close();
  peerConnection = null;
};

const getSocket = () => useSocket.getState().socket;

export const useCall = create<CallState>()((set, get) => ({
  status: "idle",
  callId: null,
  chatId: null,
  type: null,
  peer: null,
  isInitiator: false,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isVideoOff: false,
  error: null,

  reset: () => {
    const { localStream } = get();
    cleanupPeer();
    stopMediaStream(localStream);
    set({
      status: "idle",
      callId: null,
      chatId: null,
      type: null,
      peer: null,
      isInitiator: false,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      isVideoOff: false,
      error: null,
    });
  },

  endCall: () => {
    const { callId, status } = get();
    const socket = getSocket();
    if (socket && callId && status !== "idle" && status !== "ended") {
      socket.emit("call:end", { callId });
    }
    get().reset();
  },

  rejectCall: () => {
    const { callId } = get();
    const socket = getSocket();
    if (socket && callId) socket.emit("call:reject", { callId });
    get().reset();
    toast.info("Call declined");
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    set({ isMuted: !isMuted });
  },

  toggleVideo: () => {
    const { localStream, isVideoOff, type } = get();
    if (type !== "video") return;
    localStream?.getVideoTracks().forEach((t) => {
      t.enabled = isVideoOff;
    });
    set({ isVideoOff: !isVideoOff });
  },

  startCall: async ({ chatId, callee, type }) => {
    const socket = getSocket();
    if (!socket) {
      toast.error("Not connected");
      return;
    }

    try {
      const callId = uuidv4();
      const stream = await getLocalMediaStream(type === "video");

      set({
        status: "outgoing",
        callId,
        chatId,
        type,
        peer: callee,
        isInitiator: true,
        localStream: stream,
        remoteStream: null,
        error: null,
      });

      socket.emit(
        "call:invite",
        { callId, chatId, calleeId: callee._id, type },
        (err?: string) => {
          if (err) {
            toast.error(err);
            get().reset();
          }
        }
      );
    } catch (err: any) {
      toast.error(err?.message || "Could not access camera/microphone");
      get().reset();
    }
  },

  acceptCall: async () => {
    const { callId, chatId, type, localStream: existingStream } = get();
    const socket = getSocket();
    if (!socket || !callId || !type) return;

    try {
      set({ status: "connecting", error: null });

      const stream =
        existingStream ?? (await getLocalMediaStream(type === "video"));
      if (!existingStream) set({ localStream: stream });

      socket.emit("call:accept", { callId });

      const pc = createPeerConnection(
        (candidate) => {
          socket.emit("call:ice-candidate", {
            callId,
            candidate: candidate.toJSON(),
          });
        },
        (remoteStream) => {
          set({ remoteStream, status: "active" });
        }
      );

      attachLocalTracks(pc, stream);
      peerConnection = pc;

      // Callee waits for offer via socket handler
      void chatId;
    } catch (err: any) {
      toast.error(err?.message || "Could not access camera/microphone");
      get().rejectCall();
    }
  },

  bindSocket: (socket: Socket) => {
    const createOffer = async (callId: string) => {
      const { localStream, type } = get();
      if (!localStream || !type) return;

      set({ status: "connecting" });

      const pc = createPeerConnection(
        (candidate) => {
          socket.emit("call:ice-candidate", {
            callId,
            candidate: candidate.toJSON(),
          });
        },
        (remoteStream) => {
          set({ remoteStream, status: "active" });
        }
      );

      attachLocalTracks(pc, localStream);
      peerConnection = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call:offer", { callId, sdp: offer });
    };

    const handleInvite = (payload: CallInvitePayload) => {
      const state = get();
      if (state.status !== "idle") {
        socket.emit("call:reject", { callId: payload.callId });
        return;
      }

      set({
        status: "incoming",
        callId: payload.callId,
        chatId: payload.chatId,
        type: payload.type,
        peer: payload.caller,
        isInitiator: false,
      });
    };

    const handleAccept = async ({ callId }: { callId: string }) => {
      if (get().callId !== callId || !get().isInitiator) return;
      await createOffer(callId);
    };

    const handleOffer = async ({
      callId,
      sdp,
    }: {
      callId: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (get().callId !== callId) return;

      let pc = peerConnection;
      if (!pc) {
        const { localStream } = get();
        if (!localStream) return;

        pc = createPeerConnection(
          (candidate) => {
            socket.emit("call:ice-candidate", {
              callId,
              candidate: candidate.toJSON(),
            });
          },
          (remoteStream) => {
            set({ remoteStream, status: "active" });
          }
        );
        attachLocalTracks(pc, localStream);
        peerConnection = pc;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call:answer", { callId, sdp: answer });
    };

    const handleAnswer = async ({
      callId,
      sdp,
    }: {
      callId: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (get().callId !== callId || !peerConnection) return;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      set({ status: "active" });
    };

    const handleIce = async ({
      callId,
      candidate,
    }: {
      callId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (get().callId !== callId || !peerConnection) return;
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ICE can arrive before remote description
      }
    };

    const handleEnd = ({
      callId,
      reason,
    }: {
      callId: string;
      reason?: string;
    }) => {
      if (get().callId !== callId) return;
      if (reason === "rejected") toast.info("Call declined");
      else if (reason === "busy") toast.info("User is busy");
      get().reset();
    };

    const handleBusy = ({ callId }: { callId: string }) => {
      if (get().callId !== callId) return;
      toast.info("User is busy");
      get().reset();
    };

    socket.on("call:invite", handleInvite);
    socket.on("call:accept", handleAccept);
    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIce);
    socket.on("call:end", handleEnd);
    socket.on("call:busy", handleBusy);

    return () => {
      socket.off("call:invite", handleInvite);
      socket.off("call:accept", handleAccept);
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIce);
      socket.off("call:end", handleEnd);
      socket.off("call:busy", handleBusy);
    };
  },
}));
