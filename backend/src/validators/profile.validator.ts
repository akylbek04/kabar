import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50).optional(),
  description: z
    .string()
    .trim()
    .max(200, "Description must be 200 characters or less")
    .optional(),
  status: z
    .string()
    .trim()
    .max(100, "Status must be 100 characters or less")
    .optional(),
});

export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;
