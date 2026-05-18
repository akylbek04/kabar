import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { uploadMessageFile } from "../config/multer.config";
import {
  createChatController,
  getSingleChatController,
  getUserChatsController,
} from "../controllers/chat.controller";
import { sendMessageController } from "../controllers/message.controller";
import {
  createTopicController,
  getTopicsController,
} from "../controllers/topic.controller";

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  .post(
    "/message/send",
    uploadMessageFile.single("file"),
    sendMessageController
  )
  .get("/all", getUserChatsController)
  .get("/:id/topics", getTopicsController)
  .post("/:id/topics", createTopicController)
  .get("/:id", getSingleChatController);

export default chatRoutes;
