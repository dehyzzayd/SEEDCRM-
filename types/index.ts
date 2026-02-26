// ─── Enums (mirroring Prisma) ─────────────────────────────────────────────────

export type UserRole = "ADMIN" | "TRADER" | "ANALYST" | "VIEWER";
export type SubscriptionTier = "FREE" | "PRO" | "ENTERPRISE";
export type CounterpartyType =
  | "PRODUCER"
  | "MARKETER"
  | "UTILITY"
  | "INDUSTRIAL"
  | "FINANCIAL"
  | "GENERATOR"
  | "RETAIL_PROVIDER"
  | "OTHER";
export type CounterpartyStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING_REVIEW";
export type CreditRating =
  | "AAA"
  | "AA_PLUS"
  | "AA"
  | "AA_MINUS"
  | "A_PLUS"
  | "A"
  | "A_MINUS"
  | "BBB_PLUS"
  | "BBB"
  | "BBB_MINUS"
  | "BB_PLUS"
  | "BB"
  | "BB_MINUS"
  | "B_PLUS"
  | "B"
  | "B_MINUS"
  | "CCC"
  | "CC"
  | "C"
  | "D"
  | "UNRATED";
export type DealDirection = "BUY" | "SELL";
export type Commodity =
  | "NATURAL_GAS"
  | "CRUDE_OIL_WTI"
  | "CRUDE_OIL_BRENT"
  | "POWER"
  | "NGLS"
  | "REFINED_PRODUCTS"
  | "CARBON_CREDITS"
  | "RENEWABLE_ENERGY_CREDITS"
  | "OTHER";
export type ProductType =
  | "PHYSICAL"
  | "FINANCIAL_SWAP"
  | "FINANCIAL_OPTION"
  | "BASIS_SWAP"
  | "HEAT_RATE"
  | "PPA"
  | "TOLLING"
  | "OTHER";
export type VolumeUnit = "MMBTU" | "MWH" | "BBL" | "GAL" | "MT" | "CONTRACTS";
export type PriceType =
  | "FIXED"
  | "INDEX_PLUS"
  | "INDEX_MINUS"
  | "PERCENTAGE_OF_INDEX"
  | "COLLAR"
  | "PARTICIPATING";
export type Currency = "USD" | "EUR" | "GBP";
export type DealStage =
  | "ORIGINATION"
  | "INDICATIVE"
  | "FIRM_BID"
  | "CREDIT_REVIEW"
  | "LEGAL_REVIEW"
  | "EXECUTED"
  | "DELIVERING"
  | "SETTLED"
  | "DEAD";
export type DealSource =
  | "DIRECT"
  | "BROKER"
  | "ICE"
  | "CME"
  | "PLATFORM"
  | "REFERRAL";
export type ContractType =
  | "ISDA_MASTER"
  | "NAESB"
  | "PPA"
  | "CUSTOM"
  | "AMENDMENT";
export type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";
export type DocumentType =
  | "TERM_SHEET"
  | "CONFIRMATION"
  | "ISDA_SCHEDULE"
  | "CREDIT_APPLICATION"
  | "REGULATORY_FILING"
  | "OTHER";
export type ActivityType =
  | "NOTE"
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "STAGE_CHANGE"
  | "DOCUMENT_UPLOAD"
  | "PRICE_UPDATE"
  | "SYSTEM";
export type PriceSource = "EIA" | "ERCOT" | "CME_DELAYED" | "ICE_DELAYED" | "MANUAL";
export type AlertType =
  | "CONTRACT_EXPIRING"
  | "CREDIT_LIMIT_BREACH"
  | "DEAL_STALE"
  | "PRICE_MOVE"
  | "CUSTOM";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  logoUrl: string | null;
  timezone: string;
  defaultCurrency: Currency;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Counterparty {
  id: string;
  organizationId: string;
  name: string;
  shortName: string;
  type: CounterpartyType;
  creditRating: CreditRating;
  creditLimit: number;
  currentExposure: number;
  isdaMasterAgreement: boolean;
  isdaDate: Date | null;
  naesb: boolean;
  naesbDate: Date | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  primaryContactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  notes: string | null;
  tags: string[];
  status: CounterpartyStatus;
  createdAt: Date;
  updatedAt: Date;
  _count?: { deals: number };
}

export interface CounterpartyContact {
  id: string;
  counterpartyId: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  notes: string | null;
}

export interface Deal {
  id: string;
  organizationId: string;
  counterpartyId: string;
  assignedUserId: string;
  dealNumber: string;
  direction: DealDirection;
  commodity: Commodity;
  deliveryPoint: string;
  product: ProductType;
  startDate: Date;
  endDate: Date;
  volume: number;
  volumeUnit: VolumeUnit;
  priceType: PriceType;
  fixedPrice: number | null;
  indexName: string | null;
  indexAdjustment: number | null;
  currency: Currency;
  totalNotionalValue: number;
  currentMarketPrice: number | null;
  unrealizedPnl: number;
  stage: DealStage;
  probability: number;
  weightedValue: number;
  source: DealSource;
  brokerName: string | null;
  brokerFee: number | null;
  internalNotes: string | null;
  externalNotes: string | null;
  tags: string[];
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  counterparty?: Counterparty;
  assignedUser?: User;
  activities?: Activity[];
  milestones?: DealMilestone[];
  documents?: DealDocument[];
}

export interface DealMilestone {
  id: string;
  dealId: string;
  stage: DealStage;
  enteredAt: Date;
  exitedAt: Date | null;
  durationMinutes: number | null;
}

export interface DealDocument {
  id: string;
  dealId: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileSize: number | null;
  uploadedById: string;
  createdAt: Date;
  uploadedBy?: User;
}

export interface Contract {
  id: string;
  organizationId: string;
  counterpartyId: string;
  dealId: string | null;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  effectiveDate: Date;
  expirationDate: Date | null;
  autoRenew: boolean;
  noticePeriodDays: number;
  fileUrl: string | null;
  keyTerms: Record<string, unknown> | null;
  alertDaysBefore: number;
  createdAt: Date;
  updatedAt: Date;
  counterparty?: Counterparty;
  deal?: Deal | null;
}

export interface Activity {
  id: string;
  organizationId: string;
  dealId: string | null;
  counterpartyId: string | null;
  userId: string;
  type: ActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  user?: User;
  deal?: Deal | null;
  counterparty?: Counterparty | null;
}

export interface MarketPrice {
  id: string;
  commodity: Commodity;
  deliveryPoint: string;
  indexName: string;
  date: Date;
  settlementPrice: number;
  changeAbsolute: number;
  changePercent: number;
  source: PriceSource;
  createdAt: Date;
}

export interface Alert {
  id: string;
  organizationId: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  relatedDealId: string | null;
  relatedCounterpartyId: string | null;
  relatedContractId: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  activeDeals: number;
  activeDealsSparkline: { date: string; count: number }[];
  pipelineValue: number;
  unrealizedPnl: number;
  dealsClosingThisMonth: number;
  expiringContracts: number;
  totalExposure: number;
  totalCreditLimit: number;
  recentActivities: Activity[];
  dealsByStage: { stage: DealStage; count: number; totalValue: number }[];
  positionsByCommodity: {
    commodity: Commodity;
    buyVolume: number;
    sellVolume: number;
    netVolume: number;
    unit: VolumeUnit;
  }[];
  marketSnapshot: MarketPrice[];
  upcomingAlerts: Alert[];
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface CreateDealInput {
  counterpartyId: string;
  direction: DealDirection;
  commodity: Commodity;
  deliveryPoint: string;
  product: ProductType;
  startDate: string;
  endDate: string;
  volume: number;
  volumeUnit: VolumeUnit;
  priceType: PriceType;
  fixedPrice?: number;
  indexName?: string;
  indexAdjustment?: number;
  currency: Currency;
  stage: DealStage;
  probability: number;
  source: DealSource;
  brokerName?: string;
  brokerFee?: number;
  internalNotes?: string;
  externalNotes?: string;
  tags?: string[];
  assignedUserId: string;
}

export interface CreateCounterpartyInput {
  name: string;
  shortName: string;
  type: CounterpartyType;
  creditRating?: CreditRating;
  creditLimit?: number;
  isdaMasterAgreement?: boolean;
  isdaDate?: string;
  naesb?: boolean;
  naesbDate?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
  tags?: string[];
  status?: CounterpartyStatus;
}

export interface CreateActivityInput {
  type: ActivityType;
  title: string;
  description?: string;
  dealId?: string;
  counterpartyId?: string;
  metadata?: Record<string, unknown>;
}
