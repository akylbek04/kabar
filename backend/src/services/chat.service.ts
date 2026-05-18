import { emitNewChatToParticpants } from "../lib/socket";
import ChatModel, { type ChatType } from "../models/chat.model";
import MessageModel from "../models/message.model";
import UserModel from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import {
  createGeneralTopic,
  getDefaultTopicForChat,
  getTopicsForChatService,
  resolveChatType,
} from "./topic.service";

export const createChatService = async (
  userId: string,
  body: {
    participantId?: string;
    isGroup?: boolean;
    isSuperGroup?: boolean;
    participants?: string[];
    groupName?: string;
  }
) => {
  const { participantId, isGroup, isSuperGroup, participants, groupName } =
    body;

  let chat;
  let allParticipantIds: string[] = [];

  const isGroupChat = isGroup || isSuperGroup;

  if (isGroupChat && participants?.length && groupName) {
    const chatType: ChatType = isSuperGroup ? "supergroup" : "group";
    allParticipantIds = [userId, ...participants];
    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup: true,
      chatType,
      groupName,
      createdBy: userId,
    });

    if (chatType === "supergroup") {
      await createGeneralTopic(chat._id.toString(), userId);
    }
  } else if (participantId) {
    const otherUser = await UserModel.findById(participantId);
    if (!otherUser) throw new NotFoundException("User not found");

    allParticipantIds = [userId, participantId];
    const existingChat = await ChatModel.findOne({
      participants: {
        $all: allParticipantIds,
        $size: 2,
      },
      isGroup: false,
    }).populate("participants", "name avatar");

    if (existingChat) return existingChat;

    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup: false,
      chatType: "dm",
      createdBy: userId,
    });
  } else {
    throw new BadRequestException(
      "Invalid chat payload. Provide participantId for DM or group details for groups."
    );
  }

  const populatedChat = await chat?.populate(
    "participants",
    "name avatar isAI"
  );
  const particpantIdStrings = populatedChat?.participants?.map((p) => {
    return p._id?.toString();
  });

  emitNewChatToParticpants(particpantIdStrings, populatedChat);

  return chat;
};

export const getUserChatsService = async (userId: string) => {
  const chats = await ChatModel.find({
    participants: {
      $in: [userId],
    },
  })
    .populate("participants", "name avatar")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ updatedAt: -1 });
  return chats;
};

export const getSingleChatService = async (
  chatId: string,
  userId: string,
  topicId?: string
) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  }).populate("participants", "name avatar");

  if (!chat)
    throw new BadRequestException(
      "Chat not found or you are not authorized to view this chat"
    );

  const chatType = resolveChatType(chat);

  if (chatType === "supergroup") {
    const topics = await getTopicsForChatService(chatId, userId);

    let activeTopic = topicId
      ? topics.find((t) => t._id.toString() === topicId)
      : null;

    if (!activeTopic) {
      activeTopic =
        topics.find((t) => t.isGeneral) ||
        (await getDefaultTopicForChat(chatId));
    }

    if (!activeTopic) {
      throw new BadRequestException("No topics found for this super group");
    }

    const activeTopicId = activeTopic._id.toString();

    const messages = await MessageModel.find({
      chatId,
      topicId: activeTopicId,
    })
      .populate("sender", "name avatar")
      .populate({
        path: "replyTo",
        select: "content image sender",
        populate: {
          path: "sender",
          select: "name avatar",
        },
      })
      .sort({ createdAt: 1 });

    return {
      chat,
      messages,
      topics,
      activeTopicId,
    };
  }

  const messages = await MessageModel.find({ chatId })
    .populate("sender", "name avatar")
    .populate({
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ createdAt: 1 });

  return {
    chat,
    messages,
    topics: [],
    activeTopicId: null,
  };
};

export const validateChatParticipant = async (
  chatId: string,
  userId: string
) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });
  if (!chat) throw new BadRequestException("User not a participant in chat");
  return chat;
};
