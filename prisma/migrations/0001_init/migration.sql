-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'TRADER', 'ANALYST', 'VIEWER');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "CounterpartyType" AS ENUM ('PRODUCER', 'MARKETER', 'UTILITY', 'INDUSTRIAL', 'FINANCIAL', 'GENERATOR', 'RETAIL_PROVIDER', 'OTHER');

-- CreateEnum
CREATE TYPE "CounterpartyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "CreditRating" AS ENUM ('AAA', 'AA_PLUS', 'AA', 'AA_MINUS', 'A_PLUS', 'A', 'A_MINUS', 'BBB_PLUS', 'BBB', 'BBB_MINUS', 'BB_PLUS', 'BB', 'BB_MINUS', 'B_PLUS', 'B', 'B_MINUS', 'CCC', 'CC', 'C', 'D', 'UNRATED');

-- CreateEnum
CREATE TYPE "DealDirection" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "Commodity" AS ENUM ('NATURAL_GAS', 'CRUDE_OIL_WTI', 'CRUDE_OIL_BRENT', 'POWER', 'NGLS', 'REFINED_PRODUCTS', 'CARBON_CREDITS', 'RENEWABLE_ENERGY_CREDITS', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'FINANCIAL_SWAP', 'FINANCIAL_OPTION', 'BASIS_SWAP', 'HEAT_RATE', 'PPA', 'TOLLING', 'OTHER');

-- CreateEnum
CREATE TYPE "VolumeUnit" AS ENUM ('MMBTU', 'MWH', 'BBL', 'GAL', 'MT', 'CONTRACTS');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'INDEX_PLUS', 'INDEX_MINUS', 'PERCENTAGE_OF_INDEX', 'COLLAR', 'PARTICIPATING');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('ORIGINATION', 'INDICATIVE', 'FIRM_BID', 'CREDIT_REVIEW', 'LEGAL_REVIEW', 'EXECUTED', 'DELIVERING', 'SETTLED', 'DEAD');

-- CreateEnum
CREATE TYPE "DealSource" AS ENUM ('DIRECT', 'BROKER', 'ICE', 'CME', 'PLATFORM', 'REFERRAL');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('ISDA_MASTER', 'NAESB', 'PPA', 'CUSTOM', 'AMENDMENT');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TERM_SHEET', 'CONFIRMATION', 'ISDA_SCHEDULE', 'CREDIT_APPLICATION', 'REGULATORY_FILING', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('NOTE', 'CALL', 'EMAIL', 'MEETING', 'STAGE_CHANGE', 'DOCUMENT_UPLOAD', 'PRICE_UPDATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('EIA', 'ERCOT', 'CME_DELAYED', 'ICE_DELAYED', 'MANUAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('CONTRACT_EXPIRING', 'CREDIT_LIMIT_BREACH', 'DEAL_STALE', 'PRICE_MOVE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "defaultCurrency" "Currency" NOT NULL DEFAULT 'USD',
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TRADER',
    "organizationId" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Counterparty" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" VARCHAR(6) NOT NULL,
    "type" "CounterpartyType" NOT NULL,
    "creditRating" "CreditRating" NOT NULL DEFAULT 'UNRATED',
    "creditLimit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currentExposure" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "isdaMasterAgreement" BOOLEAN NOT NULL DEFAULT false,
    "isdaDate" TIMESTAMP(3),
    "naesb" BOOLEAN NOT NULL DEFAULT false,
    "naesbDate" TIMESTAMP(3),
    "primaryContactName" TEXT,
    "primaryContactEmail" TEXT,
    "primaryContactPhone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'USA',
    "notes" TEXT,
    "tags" TEXT[],
    "status" "CounterpartyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Counterparty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounterpartyContact" (
    "id" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "CounterpartyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "assignedUserId" TEXT NOT NULL,
    "dealNumber" TEXT NOT NULL,
    "direction" "DealDirection" NOT NULL,
    "commodity" "Commodity" NOT NULL,
    "deliveryPoint" TEXT NOT NULL,
    "product" "ProductType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "volume" DECIMAL(18,4) NOT NULL,
    "volumeUnit" "VolumeUnit" NOT NULL,
    "priceType" "PriceType" NOT NULL,
    "fixedPrice" DECIMAL(18,6),
    "indexName" TEXT,
    "indexAdjustment" DECIMAL(18,6),
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "totalNotionalValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currentMarketPrice" DECIMAL(18,6),
    "unrealizedPnl" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "stage" "DealStage" NOT NULL DEFAULT 'ORIGINATION',
    "probability" INTEGER NOT NULL DEFAULT 10,
    "weightedValue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "source" "DealSource" NOT NULL DEFAULT 'DIRECT',
    "brokerName" TEXT,
    "brokerFee" DECIMAL(18,2),
    "internalNotes" TEXT,
    "externalNotes" TEXT,
    "tags" TEXT[],
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealMilestone" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "stage" "DealStage" NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,

    CONSTRAINT "DealMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealDocument" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "dealId" TEXT,
    "contractNumber" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "noticePeriodDays" INTEGER NOT NULL DEFAULT 30,
    "fileUrl" TEXT,
    "keyTerms" JSONB,
    "alertDaysBefore" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "dealId" TEXT,
    "counterpartyId" TEXT,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketPrice" (
    "id" TEXT NOT NULL,
    "commodity" "Commodity" NOT NULL,
    "deliveryPoint" TEXT NOT NULL,
    "indexName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "settlementPrice" DECIMAL(18,6) NOT NULL,
    "changeAbsolute" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "changePercent" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "source" "PriceSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'INFO',
    "relatedDealId" TEXT,
    "relatedCounterpartyId" TEXT,
    "relatedContractId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Counterparty_organizationId_name_idx" ON "Counterparty"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Counterparty_organizationId_type_idx" ON "Counterparty"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Counterparty_organizationId_status_idx" ON "Counterparty"("organizationId", "status");

-- CreateIndex
CREATE INDEX "CounterpartyContact_counterpartyId_idx" ON "CounterpartyContact"("counterpartyId");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_dealNumber_key" ON "Deal"("dealNumber");

-- CreateIndex
CREATE INDEX "Deal_organizationId_stage_idx" ON "Deal"("organizationId", "stage");

-- CreateIndex
CREATE INDEX "Deal_organizationId_counterpartyId_idx" ON "Deal"("organizationId", "counterpartyId");

-- CreateIndex
CREATE INDEX "Deal_organizationId_commodity_idx" ON "Deal"("organizationId", "commodity");

-- CreateIndex
CREATE INDEX "Deal_createdAt_idx" ON "Deal"("createdAt");

-- CreateIndex
CREATE INDEX "Deal_dealNumber_idx" ON "Deal"("dealNumber");

-- CreateIndex
CREATE INDEX "DealMilestone_dealId_idx" ON "DealMilestone"("dealId");

-- CreateIndex
CREATE INDEX "DealDocument_dealId_idx" ON "DealDocument"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- CreateIndex
CREATE INDEX "Contract_organizationId_counterpartyId_idx" ON "Contract"("organizationId", "counterpartyId");

-- CreateIndex
CREATE INDEX "Contract_organizationId_status_idx" ON "Contract"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Contract_expirationDate_idx" ON "Contract"("expirationDate");

-- CreateIndex
CREATE INDEX "Activity_dealId_createdAt_idx" ON "Activity"("dealId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_counterpartyId_createdAt_idx" ON "Activity"("counterpartyId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_organizationId_createdAt_idx" ON "Activity"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "MarketPrice_commodity_deliveryPoint_idx" ON "MarketPrice"("commodity", "deliveryPoint");

-- CreateIndex
CREATE INDEX "MarketPrice_date_idx" ON "MarketPrice"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MarketPrice_commodity_deliveryPoint_date_key" ON "MarketPrice"("commodity", "deliveryPoint", "date");

-- CreateIndex
CREATE INDEX "Alert_organizationId_userId_isRead_idx" ON "Alert"("organizationId", "userId", "isRead");

-- CreateIndex
CREATE INDEX "Alert_organizationId_createdAt_idx" ON "Alert"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Counterparty" ADD CONSTRAINT "Counterparty_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounterpartyContact" ADD CONSTRAINT "CounterpartyContact_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealMilestone" ADD CONSTRAINT "DealMilestone_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealDocument" ADD CONSTRAINT "DealDocument_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealDocument" ADD CONSTRAINT "DealDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_relatedDealId_fkey" FOREIGN KEY ("relatedDealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_relatedCounterpartyId_fkey" FOREIGN KEY ("relatedCounterpartyId") REFERENCES "Counterparty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_relatedContractId_fkey" FOREIGN KEY ("relatedContractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
