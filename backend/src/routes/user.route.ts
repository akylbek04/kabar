import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { uploadAvatar } from "../config/multer.config";
import {
  getUsersController,
  updateProfileController,
} from "../controllers/user.controller";

const userRoutes = Router()
  .use(passportAuthenticateJwt)
  .get("/all", getUsersController)
  .put(
    "/profile",
    uploadAvatar.single("avatar"),
    updateProfileController
  );

export default userRoutes;
