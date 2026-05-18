import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./use-auth";
import { useChat } from "./use-chat";
import useChatId from "./use-chat-id";
import { useNotifications } from "./use-notifications";
import { useSocket } from "./use-socket";
import type { MessageType } from "@/types/chat.type";
import {
  getMessagePreview,
  getNotificationIcon,
  getNotificationTitle,
  requestNotificationPermission,
  shouldNotifyForMessage,
  showBrowserNotification,
  updateDocumentTitle,
} from "@/lib/notification-utils";

export const useMessageNotifications = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  const { chats } = useChat();
  const activeChatId = useChatId();
  const activeTopicId = useChat((s) => s.singleChat?.activeTopicId ?? null);
  const { incrementUnread, getTotalUnread } = useNotifications();
  const chatsRef = useRef(chats);

  chatsRef.current = chats;

  useEffect(() => {
    updateDocumentTitle(getTotalUnread());
    return useNotifications.subscribe((state) => {
      updateDocumentTitle(state.getTotalUnread());
    });
  }, [getTotalUnread]);

  useEffect(() => {
    if (!user) return;
    void requestNotificationPermission();
  }, [user]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    const handleChatUpdate = (data: {
      chatId: string;
      lastMessage: MessageType;
    }) => {
      const { chatId, lastMessage } = data;
      if (!lastMessage?.sender) return;

      const notify = shouldNotifyForMessage({
        chatId,
        message: lastMessage,
        currentUserId: user._id,
        activeChatId,
        activeTopicId,
      });

      if (!notify) return;

      incrementUnread(chatId);

      const chat = chatsRef.current.find((c) => c._id === chatId);
      const title = getNotificationTitle(chat, lastMessage, user._id);
      const preview = getMessagePreview(lastMessage);

      toast(title, {
        description: preview,
        action: {
          label: "View",
          onClick: () => navigate(`/chat/${chatId}`),
        },
      });

      if (document.hidden) {
        showBrowserNotification({
          title,
          body: preview,
          tag: chatId,
          icon: getNotificationIcon(chat, user._id),
          onClick: () => navigate(`/chat/${chatId}`),
        });
      }
    };

    socket.on("chat:update", handleChatUpdate);
    return () => {
      socket.off("chat:update", handleChatUpdate);
    };
  }, [
    socket,
    user?._id,
    activeChatId,
    activeTopicId,
    incrementUnread,
    navigate,
  ]);
};
