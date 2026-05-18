import type { UserType } from "./auth.type";

export type ChatKind = "dm" | "group" | "supergroup";

export type ChatType = {
  _id: string;
  lastMessage: MessageType;
  participants: UserType[];
  isGroup: boolean;
  chatType?: ChatKind;
  isAiChat: boolean;
  createdBy: string;
  groupName?: string;
  createdAt: string;
  updatedAt: string;
};

export type TopicType = {
  _id: string;
  chatId: string;
  title: string;
  createdBy: string;
  isGeneral: boolean;
  lastMessage?: MessageType | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageType = {
  _id: string;
  content: string | null;
  image: string | null;
  sender: UserType | null;
  replyTo: MessageType | null;
  chatId: string;
  topicId?: string | null;
  createdAt: string;
  updatedAt: string;
  //only frontend
  status?: string;
  streaming?: boolean;
};

export type CreateChatType = {
  participantId?: string;
  isGroup?: boolean;
  isSuperGroup?: boolean;
  participants?: string[];
  groupName?: string;
};

export type CreateMessageType = {
  chatId: string | null;
  topicId?: string | null;
  content?: string;
  file?: File;
  replyTo?: MessageType | null;
};
