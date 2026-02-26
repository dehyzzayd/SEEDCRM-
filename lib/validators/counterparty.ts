import { z } from "zod";

export const createCounterpartySchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1).max(6).toUpperCase(),
  type: z.enum([
    "PRODUCER", "MARKETER", "UTILITY", "INDUSTRIAL",
    "FINANCIAL", "GENERATOR", "RETAIL_PROVIDER", "OTHER",
  ]),
  creditRating: z.enum([
    "AAA","AA_PLUS","AA","AA_MINUS","A_PLUS","A","A_MINUS",
    "BBB_PLUS","BBB","BBB_MINUS","BB_PLUS","BB","BB_MINUS",
    "B_PLUS","B","B_MINUS","CCC","CC","C","D","UNRATED",
  ]).default("UNRATED"),
  creditLimit: z.number().min(0).default(0),
  isdaMasterAgreement: z.boolean().default(false),
  isdaDate: z.string().optional().nullable().transform(s => s ? new Date(s) : null),
  naesb: z.boolean().default(false),
  naesbDate: z.string().optional().nullable().transform(s => s ? new Date(s) : null),
  primaryContactName: z.string().optional().nullable(),
  primaryContactEmail: z.string().email().optional().nullable(),
  primaryContactPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default("USA"),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_REVIEW"]).default("ACTIVE"),
});

export const updateCounterpartySchema = createCounterpartySchema.partial();

export type CreateCounterpartyInput = z.infer<typeof createCounterpartySchema>;
export type UpdateCounterpartyInput = z.infer<typeof updateCounterpartySchema>;
