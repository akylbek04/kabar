export type CallMediaType = "audio" | "video";

export type CallStatus =
  | "idle"
  | "outgoing"
  | "incoming"
  | "connecting"
  | "active"
  | "ended";

export type CallPeer = {
  _id: string;
  name: string;
  avatar?: string;
};

export type CallInvitePayload = {
  callId: string;
  chatId: string;
  type: CallMediaType;
  caller: CallPeer;
};
