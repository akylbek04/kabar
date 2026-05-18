import mongoose from "mongoose";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import TopicModel from "../models/topic.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import {
  emitLastMessageToParticipants,
  emitNewMessageToChatRoom,
} from "../lib/socket";
import { resolveChatType } from "./topic.service";

export const sendMessageService = async (
  userId: string,
  body: {
    chatId: string;
    topicId?: string;
    content?: string;
    image?: string;
    replyToId?: string;
  }
) => {
  const { chatId, topicId, content, image, replyToId } = body;

  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found or unauthorized");

  const chatType = resolveChatType(chat);
  let resolvedTopicId: string | null = null;

  if (chatType === "supergroup") {
    if (topicId) {
      const topic = await TopicModel.findOne({ _id: topicId, chatId });
      if (!topic) throw new NotFoundException("Topic not found");
      resolvedTopicId = topicId;
    } else {
      const generalTopic = await TopicModel.findOne({ chatId, isGeneral: true });
      if (!generalTopic) {
        throw new BadRequestException("No topic selected for this super group");
      }
      resolvedTopicId = generalTopic._id.toString();
    }
  }

  if (replyToId) {
    const replyFilter: Record<string, unknown> = {
      _id: replyToId,
      chatId,
    };
    if (resolvedTopicId) replyFilter.topicId = resolvedTopicId;

    const replyMessage = await MessageModel.findOne(replyFilter);
    if (!replyMessage) throw new NotFoundException("Reply message not found");
  }

  const newMessage = await MessageModel.create({
    chatId,
    topicId: resolvedTopicId,
    sender: userId,
    content,
    image,
    replyTo: replyToId || null,
  });

  await newMessage.populate([
    { path: "sender", select: "name avatar" },
    {
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    },
  ]);

  chat.lastMessage = newMessage._id as mongoose.Types.ObjectId;
  await chat.save();

  if (resolvedTopicId) {
    await TopicModel.findByIdAndUpdate(resolvedTopicId, {
      lastMessage: newMessage._id,
    });
  }

  emitNewMessageToChatRoom(userId, chatId, newMessage);
  const allParticipantIds = chat.participants.map((id) => id.toString());
  emitLastMessageToParticipants(allParticipantIds, chatId, newMessage);

  return {
    userMessage: newMessage,
    chat,
  };
};
