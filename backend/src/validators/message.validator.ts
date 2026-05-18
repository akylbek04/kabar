import { z } from "zod";

export const sendMessageSchema = z.object({
  chatId: z.string().trim().min(1),
  topicId: z.string().trim().min(1).optional(),
  content: z.string().trim().optional(),
  replyToId: z.string().trim().optional(),
});

export type SendMessageSchemaType = z.infer<typeof sendMessageSchema>;
