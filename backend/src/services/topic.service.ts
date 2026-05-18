import TopicModel from "../models/topic.model";
import ChatModel, { type ChatType } from "../models/chat.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";

export const resolveChatType = (chat: {
  chatType?: ChatType;
  isGroup?: boolean;
}): ChatType => {
  if (chat.chatType) return chat.chatType;
  return chat.isGroup ? "group" : "dm";
};

export const createGeneralTopic = async (
  chatId: string,
  userId: string
) => {
  return TopicModel.create({
    chatId,
    title: "General",
    createdBy: userId,
    isGeneral: true,
  });
};

export const getTopicsForChatService = async (chatId: string, userId: string) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: { $in: [userId] },
  });

  if (!chat) {
    throw new NotFoundException("Chat not found or you are not authorized");
  }

  if (resolveChatType(chat) !== "supergroup") {
    throw new BadRequestException("Topics are only available in super groups");
  }

  const topics = await TopicModel.find({ chatId })
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ isGeneral: -1, updatedAt: -1 });

  return topics;
};

export const createTopicService = async (
  chatId: string,
  userId: string,
  title: string
) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: { $in: [userId] },
  });

  if (!chat) {
    throw new NotFoundException("Chat not found or you are not authorized");
  }

  if (resolveChatType(chat) !== "supergroup") {
    throw new BadRequestException("Topics can only be created in super groups");
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new BadRequestException("Topic title is required");
  }

  const existing = await TopicModel.findOne({ chatId, title: trimmedTitle });
  if (existing) {
    throw new BadRequestException("A topic with this name already exists");
  }

  const topic = await TopicModel.create({
    chatId,
    title: trimmedTitle,
    createdBy: userId,
  });

  return topic;
};

export const getTopicForChat = async (
  chatId: string,
  topicId: string,
  userId: string
) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: { $in: [userId] },
  });

  if (!chat) {
    throw new NotFoundException("Chat not found or you are not authorized");
  }

  const topic = await TopicModel.findOne({ _id: topicId, chatId });
  if (!topic) throw new NotFoundException("Topic not found");

  return topic;
};

export const getDefaultTopicForChat = async (chatId: string) => {
  let topic = await TopicModel.findOne({ chatId, isGeneral: true });
  if (!topic) {
    topic = await TopicModel.findOne({ chatId }).sort({ createdAt: 1 });
  }
  return topic;
};
