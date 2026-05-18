import { z } from "zod";

export const sendMessageSchema = z.object({
  chatId: z.string().trim().min(1),
  content: z.string().trim().optional(),
  replyToId: z.string().trim().optional(),
});

export type SendMessageSchemaType = z.infer<typeof sendMessageSchema>;
