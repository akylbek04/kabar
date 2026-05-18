/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { UserType } from "@/types/auth.type";
import type {
  ChatType,
  CreateChatType,
  CreateMessageType,
  MessageType,
  TopicType,
} from "@/types/chat.type";
import { API } from "@/lib/axios-client";
import { toast } from "sonner";
import { useAuth } from "./use-auth";
import { generateUUID } from "@/lib/helper";

interface ChatState {
  chats: ChatType[];
  users: UserType[];
  singleChat: {
    chat: ChatType;
    messages: MessageType[];
    topics: TopicType[];
    activeTopicId: string | null;
  } | null;

  currentAIStreamId: string | null;

  isChatsLoading: boolean;
  isUsersLoading: boolean;
  isCreatingChat: boolean;
  isSingleChatLoading: boolean;
  isSendingMsg: boolean;
  isCreatingTopic: boolean;

  fetchAllUsers: () => void;
  fetchChats: () => void;
  createChat: (payload: CreateChatType) => Promise<ChatType | null>;
  fetchSingleChat: (chatId: string, topicId?: string) => void;
  createTopic: (chatId: string, title: string) => Promise<TopicType | null>;
  sendMessage: (payload: CreateMessageType) => void;

  addNewChat: (newChat: ChatType) => void;
  updateChatLastMessage: (chatId: string, lastMessage: MessageType) => void;
  addNewMessage: (chatId: string, message: MessageType) => void;
  updateUserInChats: (updatedUser: UserType) => void;
}

export const useChat = create<ChatState>()((set, get) => ({
  chats: [],
  users: [],
  singleChat: null,

  isChatsLoading: false,
  isUsersLoading: false,
  isCreatingChat: false,
  isSingleChatLoading: false,
  isSendingMsg: false,
  isCreatingTopic: false,

  currentAIStreamId: null,

  fetchAllUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { data } = await API.get("/user/all");
      set({ users: data.users });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  fetchChats: async () => {
    set({ isChatsLoading: true });
    try {
      const { data } = await API.get("/chat/all");
      set({ chats: data.chats });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch chats");
    } finally {
      set({ isChatsLoading: false });
    }
  },

  createChat: async (payload: CreateChatType) => {
    set({ isCreatingChat: true });
    try {
      const response = await API.post("/chat/create", {
        ...payload,
      });
      get().addNewChat(response.data.chat);
      const label = payload.isSuperGroup
        ? "Super group"
        : payload.isGroup
          ? "Group"
          : "Chat";
      toast.success(`${label} created successfully`);
      return response.data.chat;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create chat");
      return null;
    } finally {
      set({ isCreatingChat: false });
    }
  },

  fetchSingleChat: async (chatId: string, topicId?: string) => {
    set({ isSingleChatLoading: true });
    try {
      const { data } = await API.get(`/chat/${chatId}`, {
        params: topicId ? { topicId } : undefined,
      });
      set({
        singleChat: {
          chat: data.chat,
          messages: data.messages,
          topics: data.topics || [],
          activeTopicId: data.activeTopicId || null,
        },
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch chat");
    } finally {
      set({ isSingleChatLoading: false });
    }
  },

  createTopic: async (chatId: string, title: string) => {
    set({ isCreatingTopic: true });
    try {
      const { data } = await API.post(`/chat/${chatId}/topics`, { title });
      const topic = data.topic as TopicType;

      set((state) => {
        if (state.singleChat?.chat._id !== chatId) return state;
        return {
          singleChat: {
            ...state.singleChat,
            topics: [topic, ...state.singleChat.topics],
          },
        };
      });

      toast.success("Topic created");
      return topic;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create topic");
      return null;
    } finally {
      set({ isCreatingTopic: false });
    }
  },

  sendMessage: async (payload: CreateMessageType) => {
    set({ isSendingMsg: true });
    const { chatId, topicId, replyTo, content, file } = payload;
    const { user } = useAuth.getState();

    if (!chatId || !user?._id) return;

    const tempUserId = generateUUID();
    const tempImageUrl = file
      ? file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : file.name
      : null;

    const tempMessage = {
      _id: tempUserId,
      chatId,
      topicId: topicId || null,
      content: content || "",
      image: tempImageUrl,
      sender: user,
      replyTo: replyTo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "sending...",
    };

    set((state) => {
      if (state.singleChat?.chat?._id !== chatId) return state;
      return {
        singleChat: {
          ...state.singleChat,
          messages: [...state.singleChat.messages, tempMessage],
        },
      };
    });

    try {
      const formData = new FormData();
      formData.append("chatId", chatId);
      if (topicId) formData.append("topicId", topicId);
      if (content?.trim()) formData.append("content", content.trim());
      if (replyTo?._id) formData.append("replyToId", replyTo._id);
      if (file) formData.append("file", file);

      const { data } = await API.post("/chat/message/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { userMessage } = data;

      if (tempImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(tempImageUrl);
      }

      set((state) => {
        if (!state.singleChat) return state;
        return {
          singleChat: {
            ...state.singleChat,
            messages: state.singleChat.messages.map((msg) =>
              msg._id === tempUserId ? userMessage : msg
            ),
          },
        };
      });
    } catch (error: any) {
      if (tempImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(tempImageUrl);
      }
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      set({ isSendingMsg: false });
    }
  },

  addNewChat: (newChat: ChatType) => {
    set((state) => {
      const existingChatIndex = state.chats.findIndex(
        (c) => c._id === newChat._id
      );
      if (existingChatIndex !== -1) {
        return {
          chats: [newChat, ...state.chats.filter((c) => c._id !== newChat._id)],
        };
      } else {
        return {
          chats: [newChat, ...state.chats],
        };
      }
    });
  },

  updateChatLastMessage: (chatId, lastMessage) => {
    set((state) => {
      const chat = state.chats.find((c) => c._id === chatId);
      if (!chat) return state;
      return {
        chats: [
          { ...chat, lastMessage },
          ...state.chats.filter((c) => c._id !== chatId),
        ],
      };
    });
  },

  addNewMessage: (chatId, message) => {
    const chat = get().singleChat;
    if (chat?.chat._id === chatId) {
      const activeTopicId = chat.activeTopicId;
      if (
        activeTopicId &&
        message.topicId &&
        message.topicId !== activeTopicId
      ) {
        return;
      }
      set({
        singleChat: {
          ...chat,
          messages: [...chat.messages, message],
        },
      });
    }
  },

  updateUserInChats: (updatedUser: UserType) => {
    set((state) => {
      const replaceUser = (user: UserType) =>
        user._id === updatedUser._id ? { ...user, ...updatedUser } : user;

      const chats = state.chats.map((chat) => ({
        ...chat,
        participants: chat.participants.map(replaceUser),
        lastMessage: chat.lastMessage
          ? {
              ...chat.lastMessage,
              sender: chat.lastMessage.sender
                ? replaceUser(chat.lastMessage.sender)
                : null,
            }
          : chat.lastMessage,
      }));

      const users = state.users.map(replaceUser);

      const singleChat = state.singleChat
        ? {
            chat: {
              ...state.singleChat.chat,
              participants:
                state.singleChat.chat.participants.map(replaceUser),
            },
            messages: state.singleChat.messages.map((msg) => ({
              ...msg,
              sender: msg.sender ? replaceUser(msg.sender) : null,
            })),
            topics: state.singleChat.topics,
            activeTopicId: state.singleChat.activeTopicId,
          }
        : null;

      return { chats, users, singleChat };
    });
  },
}));
