import { z } from "zod";

export const createDealSchema = z.object({
  // Accept any non-empty string for IDs (our seeded data uses custom slugs like cp_bpen, user_zayd)
  counterpartyId: z.string().min(1),
  assignedUserId: z.string().min(1).optional(),
  direction: z.enum(["BUY", "SELL"]),
  commodity: z.enum([
    "NATURAL_GAS", "CRUDE_OIL_WTI", "CRUDE_OIL_BRENT", "POWER",
    "NGLS", "REFINED_PRODUCTS", "CARBON_CREDITS", "RENEWABLE_ENERGY_CREDITS", "OTHER",
  ]),
  deliveryPoint: z.string().min(1),
  product: z.enum([
    "PHYSICAL", "FINANCIAL_SWAP", "FINANCIAL_OPTION", "BASIS_SWAP",
    "HEAT_RATE", "PPA", "TOLLING", "OTHER",
  ]).default("PHYSICAL"),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  volume: z.number().positive(),
  volumeUnit: z.enum(["MMBTU", "MWH", "BBL", "GAL", "MT", "CONTRACTS"]).default("MMBTU"),
  priceType: z.enum(["FIXED", "INDEX_PLUS", "INDEX_MINUS", "PERCENTAGE_OF_INDEX", "COLLAR", "PARTICIPATING"]).default("FIXED"),
  fixedPrice: z.number().optional().nullable(),
  indexName: z.string().optional().nullable(),
  indexAdjustment: z.number().optional().nullable(),
  currency: z.enum(["USD", "EUR", "GBP"]).default("USD"),
  stage: z.enum([
    "ORIGINATION", "INDICATIVE", "FIRM_BID", "CREDIT_REVIEW",
    "LEGAL_REVIEW", "EXECUTED", "DELIVERING", "SETTLED", "DEAD",
  ]).default("ORIGINATION"),
  probability: z.number().min(0).max(100).optional(),
  source: z.enum(["DIRECT", "BROKER", "ICE", "CME", "PLATFORM", "REFERRAL"]).default("DIRECT"),
  brokerName: z.string().optional().nullable(),
  brokerFee: z.number().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  externalNotes: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const updateDealSchema = createDealSchema.partial();

export const dealFiltersSchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(25),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  stage: z.string().optional(),
  commodity: z.string().optional(),
  direction: z.enum(["BUY", "SELL"]).optional(),
  counterpartyId: z.string().optional(),
  assignedUserId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type DealFilters = z.infer<typeof dealFiltersSchema>;
