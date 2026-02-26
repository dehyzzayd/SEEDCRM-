import { z } from "zod";

export const createActivitySchema = z.object({
  type: z.enum(["NOTE", "CALL", "EMAIL", "MEETING", "STAGE_CHANGE", "DOCUMENT_UPLOAD", "PRICE_UPDATE", "SYSTEM"]),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
  counterpartyId: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
