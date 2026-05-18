import type { Server, Socket } from "socket.io";
import { validateChatParticipant } from "../services/chat.service";
import UserModel from "../models/user.model";

export type CallMediaType = "audio" | "video";

export interface CallUserPayload {
  _id: string;
  name: string;
  avatar?: string;
}

export interface CallInvitePayload {
  callId: string;
  chatId: string;
  type: CallMediaType;
  caller: CallUserPayload;
}

interface CallSession {
  callId: string;
  chatId: string;
  callerId: string;
  calleeId: string;
  type: CallMediaType;
}

const activeCalls = new Map<string, CallSession>();
const userActiveCall = new Map<string, string>();

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const emitToUser = (
  io: Server,
  userId: string,
  event: string,
  payload: unknown
) => {
  io.to(`user:${userId}`).emit(event, payload);
};

const getOtherParticipant = (session: CallSession, userId: string) =>
  session.callerId === userId ? session.calleeId : session.callerId;

const endCall = (
  io: Server,
  callId: string,
  reason: "ended" | "rejected" | "busy" | "unavailable" = "ended"
) => {
  const session = activeCalls.get(callId);
  if (!session) return;

  activeCalls.delete(callId);
  userActiveCall.delete(session.callerId);
  userActiveCall.delete(session.calleeId);

  const payload = { callId, reason };
  emitToUser(io, session.callerId, "call:end", payload);
  emitToUser(io, session.calleeId, "call:end", payload);
};

const cleanupUserCalls = (io: Server, userId: string) => {
  const callId = userActiveCall.get(userId);
  if (callId) endCall(io, callId, "ended");
};

export const registerCallSignaling = (
  io: Server,
  socket: AuthenticatedSocket
) => {
  const userId = socket.userId!;

  socket.on(
    "call:invite",
    async (
      payload: {
        callId: string;
        chatId: string;
        calleeId: string;
        type: CallMediaType;
      },
      callback?: (err?: string) => void
    ) => {
      try {
        const { callId, chatId, calleeId, type } = payload;

        if (!callId || !chatId || !calleeId || !type) {
          callback?.("Invalid call payload");
          return;
        }

        if (userActiveCall.has(userId)) {
          callback?.("You are already in a call");
          return;
        }

        if (userActiveCall.has(calleeId)) {
          emitToUser(io, userId, "call:busy", { callId, chatId });
          callback?.("User is busy");
          return;
        }

        await validateChatParticipant(chatId, userId);
        await validateChatParticipant(chatId, calleeId);

        const caller = await UserModel.findById(userId).select("name avatar");
        if (!caller) {
          callback?.("Caller not found");
          return;
        }

        const callee = await UserModel.findById(calleeId).select("name avatar");
        if (!callee) {
          callback?.("User not found");
          return;
        }

        const session: CallSession = {
          callId,
          chatId,
          callerId: userId,
          calleeId,
          type,
        };

        activeCalls.set(callId, session);
        userActiveCall.set(userId, callId);
        userActiveCall.set(calleeId, callId);

        const invitePayload: CallInvitePayload = {
          callId,
          chatId,
          type,
          caller: {
            _id: caller._id.toString(),
            name: caller.name,
            avatar: caller.avatar ?? undefined,
          },
        };

        emitToUser(io, calleeId, "call:invite", invitePayload);
        callback?.();
      } catch {
        callback?.("Failed to start call");
      }
    }
  );

  socket.on("call:accept", (payload: { callId: string }) => {
    const session = activeCalls.get(payload.callId);
    if (!session || session.calleeId !== userId) return;

    emitToUser(io, session.callerId, "call:accept", {
      callId: payload.callId,
      chatId: session.chatId,
    });
  });

  socket.on("call:reject", (payload: { callId: string }) => {
    const session = activeCalls.get(payload.callId);
    if (!session) return;
    if (session.calleeId !== userId && session.callerId !== userId) return;

    endCall(io, payload.callId, "rejected");
  });

  socket.on(
    "call:offer",
    (payload: { callId: string; sdp: unknown }) => {
      const session = activeCalls.get(payload.callId);
      if (!session) return;

      const targetId = getOtherParticipant(session, userId);
      emitToUser(io, targetId, "call:offer", {
        callId: payload.callId,
        sdp: payload.sdp,
      });
    }
  );

  socket.on(
    "call:answer",
    (payload: { callId: string; sdp: unknown }) => {
      const session = activeCalls.get(payload.callId);
      if (!session) return;

      const targetId = getOtherParticipant(session, userId);
      emitToUser(io, targetId, "call:answer", {
        callId: payload.callId,
        sdp: payload.sdp,
      });
    }
  );

  socket.on(
    "call:ice-candidate",
    (payload: { callId: string; candidate: unknown }) => {
      const session = activeCalls.get(payload.callId);
      if (!session) return;

      const targetId = getOtherParticipant(session, userId);
      emitToUser(io, targetId, "call:ice-candidate", {
        callId: payload.callId,
        candidate: payload.candidate,
      });
    }
  );

  socket.on("call:end", (payload: { callId: string }) => {
    const session = activeCalls.get(payload.callId);
    if (!session) return;
    if (session.callerId !== userId && session.calleeId !== userId) return;

    endCall(io, payload.callId, "ended");
  });

  socket.on("disconnect", () => {
    cleanupUserCalls(io, userId);
  });
};
