import { z } from "zod";

export const createChatSchema = z
  .object({
    participantId: z.string().trim().min(1).optional(),
    isGroup: z.boolean().optional(),
    isSuperGroup: z.boolean().optional(),
    participants: z.array(z.string().trim().min(1)).optional(),
    groupName: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) => !(data.isGroup && data.isSuperGroup),
    { message: "A chat cannot be both a group and a super group" }
  );

export const chatIdSchema = z.object({
  id: z.string().trim().min(1),
});

export const getSingleChatQuerySchema = z.object({
  topicId: z.string().trim().min(1).optional(),
});

export const createTopicSchema = z.object({
  title: z.string().trim().min(1).max(128),
});
