export const getUploadUrl = (folder: string, filename: string) =>
  `/uploads/${folder}/${filename}`;

export const getFileUrlFromUpload = (
  file: Express.Multer.File,
  folder: string
) => getUploadUrl(folder, file.filename);
