import { z } from "zod";

export const VGetDistance = z
  .object({
    starting_post_code: z.string().min(1, "This is required"),
    destination_post_code: z.string().min(1, "This is required"),
  })
  .strict();

export const VGetDistanceBatch = z
  .object({
    destination_post_code: z.string().min(1, "This is required"),
    starting_post_codes: z.array(z.string().min(1, "This is required")),
  })
  .strict();
