"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { COMMODITIES, DELIVERY_POINTS, PRODUCT_TYPES, VOLUME_UNITS, PRICE_TYPES, DEAL_SOURCES, DEAL_STAGES, STAGE_PROBABILITY_MAP } from "@/lib/constants";
import { useCreateDeal } from "@/hooks/useDeals";
import { toast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Commodity, DealStage } from "@/types";

// Client-side form schema (no ID format restrictions)
const formSchema = z.object({
  counterpartyId: z.string().min(1, "Counterparty is required"),
  assignedUserId: z.string().min(1),
  direction: z.enum(["BUY", "SELL"]),
  commodity: z.string().min(1),
  deliveryPoint: z.string().min(1, "Delivery point is required"),
  product: z.string().min(1),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  volume: z.number({ invalid_type_error: "Volume must be a number" }).positive("Volume must be positive"),
  volumeUnit: z.string(),
  priceType: z.string(),
  fixedPrice: z.number().optional(),
  indexName: z.string().optional(),
  currency: z.enum(["USD", "EUR", "GBP"]),
  stage: z.string(),
  probability: z.number().min(0).max(100),
  source: z.string(),
  brokerName: z.string().optional(),
  internalNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const STATIC_USERS = [
  { id: "user_zayd",   name: "Zayd Al-Rashid" },
  { id: "user_sarah",  name: "Sarah Chen" },
  { id: "user_marcus", name: "Marcus Reed" },
  { id: "user_priya",  name: "Priya Nair" },
  { id: "user_james",  name: "James Okafor" },
];

export function DealForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const createDeal = useCreateDeal();
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>("NATURAL_GAS");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: cpData, isLoading: cpLoading } = useQuery<{ data: { id: string; name: string; shortName: string }[] }>({
    queryKey: ["counterparties-list"],
    queryFn: () => fetch("/api/counterparties?pageSize=100&sortBy=name&sortOrder=asc").then(r => r.json()),
    staleTime: 60000,
  });

  // These are computed once on client mount — we pass them as defaultValues
  // Using empty string initially avoids SSR/CSR hydration mismatch on date inputs
  const {

    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      direction: "BUY",
      commodity: "NATURAL_GAS",
      deliveryPoint: "Henry Hub",
      product: "PHYSICAL",
      currency: "USD",
      stage: "ORIGINATION",
      probability: 10,
      source: "DIRECT",
      priceType: "FIXED",
      volumeUnit: "MMBTU",
      fixedPrice: undefined,
      assignedUserId: "user_zayd",
      // Leave dates empty on SSR; useEffect sets them client-side
      startDate: "",
      endDate: "",
    },
  });

  // Set default dates client-side only to avoid hydration mismatch
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    setValue("startDate", today);
    setValue("endDate", nextMonth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const watchedStage = watch("stage");
  const watchedPriceType = watch("priceType");
  const watchedSource = watch("source");
  const watchedDirection = watch("direction");
  const watchedProb = watch("probability");

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      await createDeal.mutateAsync(data as never);
      toast({ type: "success", title: "Deal created", message: `${data.direction} ${data.commodity.replace(/_/g, " ")} deal submitted` });
      onSuccess?.();
      router.push("/deals");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create deal";
      setSubmitError(msg);
      toast({ type: "error", title: "Failed to create deal", message: msg });
    }
  };

  const inputClass = "w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast placeholder-text-disabled";
  const selectClass = inputClass + " cursor-pointer";
  const labelClass = "block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium";
  const fieldClass = "space-y-0.5";
  const errorClass = "text-[11px] text-danger mt-1";
  const sectionTitle = "text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4 pb-2 border-b border-border-default";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-border-default">
      {/* ── Deal Information ── */}
      <div className="p-6 space-y-4">
        <h3 className={sectionTitle}>Deal Information</h3>
        <div className="grid grid-cols-2 gap-4">

          {/* Direction */}
          <div className={fieldClass}>
            <label className={labelClass}>Direction *</label>
            <div className="flex gap-2 h-9">
              {(["BUY", "SELL"] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue("direction", d)}
                  className={cn(
                    "flex-1 rounded border text-sm font-semibold transition-fast",
                    watchedDirection === d
                      ? d === "BUY"
                        ? "bg-success/15 border-success text-success"
                        : "bg-danger/15 border-danger text-danger"
                      : "border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Commodity */}
          <div className={fieldClass}>
            <label className={labelClass}>Commodity *</label>
            <select
              {...register("commodity")}
              className={selectClass}
              onChange={e => {
                const c = e.target.value as Commodity;
                setValue("commodity", c);
                setSelectedCommodity(c);
                // auto-set first delivery point and default unit
                const firstDp = DELIVERY_POINTS[c]?.[0] ?? "";
                setValue("deliveryPoint", firstDp);
                const defaultUnit = COMMODITIES.find(x => x.value === c)?.unit ?? "MMBTU";
                setValue("volumeUnit", defaultUnit);
              }}
            >
              {COMMODITIES.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Delivery Point */}
          <div className={fieldClass}>
            <label className={labelClass}>Delivery Point *</label>
            <select {...register("deliveryPoint", { required: true })} className={selectClass}>
              {(DELIVERY_POINTS[selectedCommodity] ?? []).map(dp => (
                <option key={dp} value={dp}>{dp}</option>
              ))}
            </select>
            {errors.deliveryPoint && <p className={errorClass}>{errors.deliveryPoint.message}</p>}
          </div>

          {/* Product Type */}
          <div className={fieldClass}>
            <label className={labelClass}>Product Type *</label>
            <select {...register("product")} className={selectClass}>
              {PRODUCT_TYPES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Volume & Term ── */}
      <div className="p-6 space-y-4">
        <h3 className={sectionTitle}>Volume & Term</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className={fieldClass}>
            <label className={labelClass}>Volume *</label>
            <input
              {...register("volume", { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder="e.g. 50,000"
              className={inputClass}
            />
            {errors.volume && <p className={errorClass}>{errors.volume.message}</p>}
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Unit *</label>
            <select {...register("volumeUnit")} className={selectClass}>
              {VOLUME_UNITS.map(u => (
                <option key={u.value} value={u.value}>{u.label} — {u.fullLabel}</option>
              ))}
            </select>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Start Date *</label>
            <input {...register("startDate", { required: true })} type="date" className={inputClass} />
            {errors.startDate && <p className={errorClass}>Required</p>}
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>End Date *</label>
            <input {...register("endDate", { required: true })} type="date" className={inputClass} />
            {errors.endDate && <p className={errorClass}>Required</p>}
          </div>
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="p-6 space-y-4">
        <h3 className={sectionTitle}>Pricing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className={fieldClass}>
            <label className={labelClass}>Price Type *</label>
            <select {...register("priceType")} className={selectClass}>
              {PRICE_TYPES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className={fieldClass}>
            <label className={labelClass}>Currency</label>
            <select {...register("currency")} className={selectClass}>
              {["USD","EUR","GBP"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {watchedPriceType === "FIXED" && (
            <div className={fieldClass}>
              <label className={labelClass}>Fixed Price ($/unit)</label>
              <input
                {...register("fixedPrice", { valueAsNumber: true })}
                type="number"
                step="0.0001"
                placeholder="e.g. 3.2500"
                className={inputClass}
              />
            </div>
          )}
          {["INDEX_PLUS","INDEX_MINUS","PERCENTAGE_OF_INDEX"].includes(watchedPriceType) && (
            <div className={fieldClass}>
              <label className={labelClass}>Index Name</label>
              <input
                {...register("indexName")}
                placeholder="e.g. HH Prompt Month"
                className={inputClass}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Counterparty & Assignment ── */}
      <div className="p-6 space-y-4">
        <h3 className={sectionTitle}>Counterparty & Assignment</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className={fieldClass}>
            <label className={labelClass}>Counterparty *</label>
            <select {...register("counterpartyId", { required: true })} className={selectClass}>
              <option value="">{cpLoading ? "Loading..." : "Select counterparty..."}</option>
              {cpData?.data?.map(cp => (
                <option key={cp.id} value={cp.id}>{cp.name} ({cp.shortName})</option>
              ))}
            </select>
            {errors.counterpartyId && <p className={errorClass}>{errors.counterpartyId.message}</p>}
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>Assigned To</label>
            <select {...register("assignedUserId")} className={selectClass}>
              {STATIC_USERS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>Stage</label>
            <select
              {...register("stage")}
              className={selectClass}
              onChange={e => {
                const s = e.target.value as DealStage;
                setValue("stage", s);
                setValue("probability", STAGE_PROBABILITY_MAP[s] ?? 10);
              }}
            >
              {DEAL_STAGES.filter(s => s.value !== "DEAD").map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>Probability ({watchedProb ?? 10}%)</label>
            <input
              {...register("probability", { valueAsNumber: true })}
              type="range"
              min={0}
              max={100}
              className="w-full h-1.5 accent-accent mt-3 cursor-pointer"
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>Source</label>
            <select {...register("source")} className={selectClass}>
              {DEAL_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {watchedSource === "BROKER" && (
            <div className={fieldClass}>
              <label className={labelClass}>Broker Name</label>
              <input
                {...register("brokerName")}
                placeholder="e.g. ICAP Energy"
                className={inputClass}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="p-6 space-y-2">
        <label className={labelClass}>Internal Notes</label>
        <textarea
          {...register("internalNotes")}
          rows={3}
          placeholder="Internal notes (not shared with counterparty)..."
          className="w-full bg-bg-panel border border-border-default rounded px-3 py-2 text-sm text-text-primary focus:border-accent outline-none resize-none transition-fast placeholder-text-disabled"
        />
      </div>

      {/* ── Submit ── */}
      <div className="p-6 flex flex-col gap-3">
        {submitError && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded text-xs text-danger">
            {submitError}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-bg-base border-t-transparent rounded-full animate-spin" />
            )}
            {isSubmitting ? "Creating..." : "Create Deal"}
          </button>
        </div>
      </div>
    </form>
  );
}
