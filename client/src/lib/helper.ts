import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "@/hooks/use-socket";
import type { ChatKind, ChatType } from "@/types/chat.type";

/** 10 MB — keep in sync with backend AVATAR_MAX_SIZE */
export const AVATAR_MAX_BYTES = 10 * 1024 * 1024;
/** 50 MB — keep in sync with backend MESSAGE_FILE_MAX_SIZE */
export const MESSAGE_FILE_MAX_BYTES = 50 * 1024 * 1024;

export const formatMaxFileSize = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb}MB` : `${bytes / 1024}KB`;
};

export const isUserOnline = (userId?: string) => {
  if (!userId) return false;
  const { onlineUsers } = useSocket.getState();
  return onlineUsers.includes(userId);
};

export const getChatKind = (chat: ChatType): ChatKind => {
  if (chat.chatType) return chat.chatType;
  return chat.isGroup ? "group" : "dm";
};

export const getOtherUserAndGroup = (
  chat: ChatType,
  currentUserId: string | null
) => {
  const chatKind = getChatKind(chat);
  const isGroup = chatKind !== "dm";
  const isSuperGroup = chatKind === "supergroup";

  if (isGroup) {
    return {
      name: chat.groupName || "Unnamed Group",
      subheading: isSuperGroup
        ? `${chat.participants.length} members · Super group`
        : `${chat.participants.length} members`,
      avatar: "",
      isGroup,
      isSuperGroup,
      chatKind,
    };
  }

  const other = chat?.participants.find((p) => p._id !== currentUserId);
  const isOnline = isUserOnline(other?._id ?? "");

  return {
    name: other?.name || "Unknown",
    subheading: isOnline ? "Online" : "Offline",
    avatar: other?.avatar || "",
    status: other?.status || "",
    isGroup: false,
    isSuperGroup: false,
    chatKind: "dm" as ChatKind,
    isOnline,
    isAI: other?.isAI || false,
  };
};

export const formatChatTime = (date: string | Date) => {
  if (!date) return "";
  const newDate = new Date(date);
  if (isNaN(newDate.getTime())) return "Invalid date";

  if (isToday(newDate)) return format(newDate, "h:mm a");
  if (isYesterday(newDate)) return "Yesterday";
  if (isThisWeek(newDate)) return format(newDate, "EEEE");
  return format(newDate, "M/d");
};

export function generateUUID(): string {
  return uuidv4();
}

export const getMediaUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;

  const base =
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_API_URL
      : window.location.origin;

  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
};

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|bmp|tiff?|heic|heif)$/i;

export const isImageUrl = (url?: string | null) => {
  if (!url) return false;
  if (url.startsWith("data:image/")) return true;
  return IMAGE_EXTENSIONS.test(url.split("?")[0]);
};

export const getFileNameFromUrl = (url: string) => {
  const parts = url.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "attachment");
};
