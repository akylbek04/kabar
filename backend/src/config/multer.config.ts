import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";
import { BadRequestException } from "../utils/app-error";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

/** 10 MB */
export const AVATAR_MAX_SIZE = 10 * 1024 * 1024;
/** 50 MB */
export const MESSAGE_FILE_MAX_SIZE = 50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/mpeg",
  "video/ogg",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/flac",
  "audio/mp4",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/rtf",
  // Archives
  "application/zip",
  "application/x-rar-compressed",
  "application/gzip",
  "application/x-7z-compressed",
]);

const ensureUploadDir = (subdir: string) => {
  const dir = path.join(UPLOAD_ROOT, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const createStorage = (subdir: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, ensureUploadDir(subdir));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  });

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new BadRequestException(`File type "${file.mimetype}" is not supported`));
};

export const uploadAvatar = multer({
  storage: createStorage("avatars"),
  fileFilter,
  limits: { fileSize: AVATAR_MAX_SIZE },
});

export const uploadMessageFile = multer({
  storage: createStorage("messages"),
  fileFilter,
  limits: { fileSize: MESSAGE_FILE_MAX_SIZE },
});
