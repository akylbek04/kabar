import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  chatIdSchema,
  createChatSchema,
  getSingleChatQuerySchema,
} from "../validators/chat.validator";
import {
  createChatService,
  getSingleChatService,
  getUserChatsService,
} from "../services/chat.service";

export const createChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = createChatSchema.parse(req.body);

    const chat = await createChatService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Chat created or retrieved successfully",
      chat,
    });
  }
);

export const getUserChatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const chats = await getUserChatsService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User chats retrieved successfully",
      chats,
    });
  }
);

export const getSingleChatController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id } = chatIdSchema.parse(req.params);
    const { topicId } = getSingleChatQuerySchema.parse(req.query);

    const { chat, messages, topics, activeTopicId } =
      await getSingleChatService(id, userId, topicId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User chats retrieved successfully",
      chat,
      messages,
      topics,
      activeTopicId,
    });
  }
);
