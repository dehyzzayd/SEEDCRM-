import type { DealStage, Commodity, VolumeUnit, PriceType, ProductType, DealSource, CounterpartyType, CreditRating, ContractType } from "@/types";

export const DEAL_STAGES: { value: DealStage; label: string; probability: number; color: string }[] = [
  { value: "ORIGINATION", label: "Origination", probability: 10, color: "#64748B" },
  { value: "INDICATIVE", label: "Indicative", probability: 25, color: "#8B5CF6" },
  { value: "FIRM_BID", label: "Firm Bid", probability: 50, color: "#3B82F6" },
  { value: "CREDIT_REVIEW", label: "Credit Review", probability: 70, color: "#F59E0B" },
  { value: "LEGAL_REVIEW", label: "Legal Review", probability: 85, color: "#00D4AA" },
  { value: "EXECUTED", label: "Executed", probability: 100, color: "#10B981" },
  { value: "DELIVERING", label: "Delivering", probability: 100, color: "#10B981" },
  { value: "SETTLED", label: "Settled", probability: 100, color: "#94A3B8" },
  { value: "DEAD", label: "Dead", probability: 0, color: "#EF4444" },
];

export const ACTIVE_STAGES: DealStage[] = [
  "ORIGINATION",
  "INDICATIVE",
  "FIRM_BID",
  "CREDIT_REVIEW",
  "LEGAL_REVIEW",
  "EXECUTED",
  "DELIVERING",
];

export const PIPELINE_STAGES: DealStage[] = [
  "ORIGINATION",
  "INDICATIVE",
  "FIRM_BID",
  "CREDIT_REVIEW",
  "LEGAL_REVIEW",
];

export const COMMODITIES: { value: Commodity; label: string; unit: VolumeUnit; icon: string }[] = [
  { value: "NATURAL_GAS", label: "Natural Gas", unit: "MMBTU", icon: "🔥" },
  { value: "CRUDE_OIL_WTI", label: "Crude Oil (WTI)", unit: "BBL", icon: "🛢️" },
  { value: "CRUDE_OIL_BRENT", label: "Crude Oil (Brent)", unit: "BBL", icon: "🛢️" },
  { value: "POWER", label: "Power", unit: "MWH", icon: "⚡" },
  { value: "NGLS", label: "NGLs", unit: "BBL", icon: "💧" },
  { value: "REFINED_PRODUCTS", label: "Refined Products", unit: "GAL", icon: "⛽" },
  { value: "CARBON_CREDITS", label: "Carbon Credits", unit: "MT", icon: "🌿" },
  { value: "RENEWABLE_ENERGY_CREDITS", label: "RECs", unit: "MWH", icon: "☀️" },
  { value: "OTHER", label: "Other", unit: "CONTRACTS", icon: "📦" },
];

export const DELIVERY_POINTS: Record<Commodity, string[]> = {
  NATURAL_GAS: [
    "Henry Hub",
    "Houston Ship Channel",
    "Waha",
    "Chicago Citygate",
    "SoCal Citygate",
    "Dominion South",
    "Transco Zone 6 NY",
    "Dawn",
    "AECO",
    "Permian Basin",
  ],
  CRUDE_OIL_WTI: ["Cushing, OK", "Midland, TX", "Houston, TX", "Corpus Christi"],
  CRUDE_OIL_BRENT: ["North Sea", "Rotterdam", "Singapore"],
  POWER: [
    "ERCOT North Hub",
    "ERCOT Houston Hub",
    "ERCOT South Hub",
    "ERCOT West Hub",
    "PJM Western Hub",
    "PJM AD Hub",
    "MISO Indiana Hub",
    "CAISO NP15",
    "CAISO SP15",
    "SPP South Hub",
    "NYISO Zone A",
    "NYISO Zone J",
    "ISONE Mass Hub",
  ],
  NGLS: ["Mont Belvieu", "Conway", "Midland"],
  REFINED_PRODUCTS: ["NYMEX RBOB", "NYMEX HO", "Colonial Pipeline"],
  CARBON_CREDITS: ["California CCA", "RGGI", "VCS", "Gold Standard"],
  RENEWABLE_ENERGY_CREDITS: ["Texas RECS", "PJM RECS", "MISO RECS"],
  OTHER: ["TBD"],
};

export const INDICES: Record<Commodity, string[]> = {
  NATURAL_GAS: [
    "HH First of Month",
    "HH Prompt Month",
    "HH Penultimate",
    "Platts Inside FERC",
    "NGI Houston Ship Channel",
    "NGI Waha",
  ],
  CRUDE_OIL_WTI: ["NYMEX WTI CL1", "Platts WTI Midland", "Argus WTI"],
  CRUDE_OIL_BRENT: ["ICE Brent CO1", "Platts Dated Brent"],
  POWER: [
    "ERCOT RT LZ_NORTH",
    "ERCOT RT LZ_HOUSTON",
    "ERCOT DA LZ_NORTH",
    "ERCOT DA LZ_HOUSTON",
    "PJM RT Western Hub",
    "PJM DA Western Hub",
  ],
  NGLS: ["OPIS Mont Belvieu Ethane", "OPIS Mont Belvieu Propane"],
  REFINED_PRODUCTS: ["NYMEX RBOB", "NYMEX HO", "Platts US Gulf Coast"],
  CARBON_CREDITS: ["California Allowance Price", "RGGI Allowance Price"],
  RENEWABLE_ENERGY_CREDITS: ["M-RETS", "WREGIS", "PJM GATS"],
  OTHER: ["Custom Index"],
};

export const VOLUME_UNITS: { value: VolumeUnit; label: string; fullLabel: string }[] = [
  { value: "MMBTU", label: "MMBtu", fullLabel: "Million British Thermal Units" },
  { value: "MWH", label: "MWh", fullLabel: "Megawatt Hours" },
  { value: "BBL", label: "Bbl", fullLabel: "Barrels" },
  { value: "GAL", label: "Gal", fullLabel: "Gallons" },
  { value: "MT", label: "MT", fullLabel: "Metric Tonnes" },
  { value: "CONTRACTS", label: "Contracts", fullLabel: "Contracts" },
];

export const PRICE_TYPES: { value: PriceType; label: string }[] = [
  { value: "FIXED", label: "Fixed Price" },
  { value: "INDEX_PLUS", label: "Index +" },
  { value: "INDEX_MINUS", label: "Index -" },
  { value: "PERCENTAGE_OF_INDEX", label: "% of Index" },
  { value: "COLLAR", label: "Collar" },
  { value: "PARTICIPATING", label: "Participating" },
];

export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "PHYSICAL", label: "Physical" },
  { value: "FINANCIAL_SWAP", label: "Financial Swap" },
  { value: "FINANCIAL_OPTION", label: "Financial Option" },
  { value: "BASIS_SWAP", label: "Basis Swap" },
  { value: "HEAT_RATE", label: "Heat Rate" },
  { value: "PPA", label: "PPA" },
  { value: "TOLLING", label: "Tolling" },
  { value: "OTHER", label: "Other" },
];

export const DEAL_SOURCES: { value: DealSource; label: string }[] = [
  { value: "DIRECT", label: "Direct" },
  { value: "BROKER", label: "Broker" },
  { value: "ICE", label: "ICE" },
  { value: "CME", label: "CME" },
  { value: "PLATFORM", label: "Platform" },
  { value: "REFERRAL", label: "Referral" },
];

export const COUNTERPARTY_TYPES: { value: CounterpartyType; label: string }[] = [
  { value: "PRODUCER", label: "Producer" },
  { value: "MARKETER", label: "Marketer" },
  { value: "UTILITY", label: "Utility" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "FINANCIAL", label: "Financial" },
  { value: "GENERATOR", label: "Generator" },
  { value: "RETAIL_PROVIDER", label: "Retail Provider" },
  { value: "OTHER", label: "Other" },
];

export const CREDIT_RATINGS: { value: CreditRating; label: string; tier: "investment" | "speculative" | "distressed" | "unrated" }[] = [
  { value: "AAA", label: "AAA", tier: "investment" },
  { value: "AA_PLUS", label: "AA+", tier: "investment" },
  { value: "AA", label: "AA", tier: "investment" },
  { value: "AA_MINUS", label: "AA-", tier: "investment" },
  { value: "A_PLUS", label: "A+", tier: "investment" },
  { value: "A", label: "A", tier: "investment" },
  { value: "A_MINUS", label: "A-", tier: "investment" },
  { value: "BBB_PLUS", label: "BBB+", tier: "investment" },
  { value: "BBB", label: "BBB", tier: "investment" },
  { value: "BBB_MINUS", label: "BBB-", tier: "investment" },
  { value: "BB_PLUS", label: "BB+", tier: "speculative" },
  { value: "BB", label: "BB", tier: "speculative" },
  { value: "BB_MINUS", label: "BB-", tier: "speculative" },
  { value: "B_PLUS", label: "B+", tier: "speculative" },
  { value: "B", label: "B", tier: "speculative" },
  { value: "B_MINUS", label: "B-", tier: "speculative" },
  { value: "CCC", label: "CCC", tier: "distressed" },
  { value: "CC", label: "CC", tier: "distressed" },
  { value: "C", label: "C", tier: "distressed" },
  { value: "D", label: "D", tier: "distressed" },
  { value: "UNRATED", label: "NR", tier: "unrated" },
];

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: "ISDA_MASTER", label: "ISDA Master" },
  { value: "NAESB", label: "NAESB" },
  { value: "PPA", label: "PPA" },
  { value: "CUSTOM", label: "Custom" },
  { value: "AMENDMENT", label: "Amendment" },
];

export const STAGE_PROBABILITY_MAP: Record<DealStage, number> = {
  ORIGINATION: 10,
  INDICATIVE: 25,
  FIRM_BID: 50,
  CREDIT_REVIEW: 70,
  LEGAL_REVIEW: 85,
  EXECUTED: 100,
  DELIVERING: 100,
  SETTLED: 100,
  DEAD: 0,
};

export const MARKET_INDICES = [
  { commodity: "NATURAL_GAS" as Commodity, deliveryPoint: "Henry Hub", indexName: "HH Prompt Month" },
  { commodity: "CRUDE_OIL_WTI" as Commodity, deliveryPoint: "Cushing, OK", indexName: "NYMEX WTI CL1" },
  { commodity: "CRUDE_OIL_BRENT" as Commodity, deliveryPoint: "North Sea", indexName: "ICE Brent CO1" },
  { commodity: "POWER" as Commodity, deliveryPoint: "ERCOT North Hub", indexName: "ERCOT RT LZ_NORTH" },
  { commodity: "POWER" as Commodity, deliveryPoint: "PJM Western Hub", indexName: "PJM DA Western Hub" },
  { commodity: "NATURAL_GAS" as Commodity, deliveryPoint: "Waha", indexName: "NGI Waha" },
];
