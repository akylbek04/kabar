import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { sendMessageSchema } from "../validators/message.validator";
import { HTTPSTATUS } from "../config/http.config";
import { sendMessageService } from "../services/message.service";
import { getFileUrlFromUpload } from "../utils/upload.util";
import { BadRequestException } from "../utils/app-error";

export const sendMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user?._id).toString();
    const body = sendMessageSchema.parse(req.body);
    const file = req.file;

    if (!body.content && !file) {
      throw new BadRequestException("Either content or a file must be provided");
    }

    const image = file ? getFileUrlFromUpload(file, "messages") : undefined;

    const result = await sendMessageService(userId, {
      ...body,
      image,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Message sent successfully",
      ...result,
    });
  }
);
