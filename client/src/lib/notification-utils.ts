import type { ChatType, MessageType } from "@/types/chat.type";
import { getAttachmentPreview, getChatKind, getMediaUrl, getOtherUserAndGroup } from "./helper";

const APP_TITLE = "Kabar";

export const getMessagePreview = (message: MessageType): string => {
  if (message.image) {
    return getAttachmentPreview(message.image, "plain") ?? "Attachment";
  }
  return message.content?.trim() || "New message";
};

export const getNotificationTitle = (
  chat: ChatType | undefined,
  message: MessageType,
  currentUserId: string
): string => {
  const senderName = message.sender?.name || "Someone";
  if (!chat) return senderName;

  const { name } = getOtherUserAndGroup(chat, currentUserId);
  const isGroup = getChatKind(chat) !== "dm";

  return isGroup ? `${senderName} in ${name}` : senderName;
};

export const updateDocumentTitle = (unreadCount: number) => {
  document.title =
    unreadCount > 0 ? `(${unreadCount}) ${APP_TITLE}` : APP_TITLE;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
};

export const showBrowserNotification = (options: {
  title: string;
  body: string;
  tag: string;
  icon?: string;
  onClick?: () => void;
}) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    tag: options.tag,
    icon: options.icon,
  });

  notification.onclick = () => {
    window.focus();
    options.onClick?.();
    notification.close();
  };
};

export const getNotificationIcon = (chat?: ChatType, currentUserId?: string) => {
  if (!chat || !currentUserId) return undefined;
  const { avatar, isGroup } = getOtherUserAndGroup(chat, currentUserId);
  if (isGroup || !avatar) return undefined;
  return getMediaUrl(avatar) || undefined;
};

export const shouldNotifyForMessage = ({
  chatId,
  message,
  currentUserId,
  activeChatId,
  activeTopicId,
}: {
  chatId: string;
  message: MessageType;
  currentUserId: string;
  activeChatId: string | null;
  activeTopicId: string | null;
}): boolean => {
  if (message.sender?._id === currentUserId) return false;

  const isViewingChat = activeChatId === chatId;
  const messageTopicId = message.topicId ?? null;
  const isSameTopic =
    !messageTopicId ||
    !activeTopicId ||
    messageTopicId === activeTopicId;

  if (document.hidden) return true;

  if (isViewingChat && isSameTopic) return false;

  return true;
};
