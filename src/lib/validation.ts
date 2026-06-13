import { z } from "zod";

export const chatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(8000),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(4000),
  history: z.array(chatTurnSchema).max(20).optional().default([]),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
