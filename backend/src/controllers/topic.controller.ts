import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { chatIdSchema, createTopicSchema } from "../validators/chat.validator";
import {
  createTopicService,
  getTopicsForChatService,
} from "../services/topic.service";

export const getTopicsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id } = chatIdSchema.parse(req.params);

    const topics = await getTopicsForChatService(id, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Topics retrieved successfully",
      topics,
    });
  }
);

export const createTopicController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id } = chatIdSchema.parse(req.params);
    const { title } = createTopicSchema.parse(req.body);

    const topic = await createTopicService(id, userId, title);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Topic created successfully",
      topic,
    });
  }
);
