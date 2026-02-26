"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X, FileText, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface Props {
  open:    boolean;
  onClose: () => void;
}

const CONTRACT_TYPES = [
  { value: "ISDA_MASTER", label: "ISDA Master Agreement" },
  { value: "NAESB",       label: "NAESB Base Contract"   },
  { value: "PPA",         label: "Power Purchase Agreement" },
  { value: "CUSTOM",      label: "Custom Contract"        },
  { value: "AMENDMENT",   label: "Amendment"              },
];

const CONTRACT_STATUSES = [
  { value: "DRAFT",      label: "Draft"      },
  { value: "ACTIVE",     label: "Active"     },
  { value: "EXPIRED",    label: "Expired"    },
  { value: "TERMINATED", label: "Terminated" },
];

export function NewContractSlideOver({ open, onClose }: Props) {
  const qc = useQueryClient();

  const [form, setForm] = useState({
    contractNumber:   "",
    counterpartyId:   "",
    dealId:           "",
    type:             "ISDA_MASTER",
    status:           "DRAFT",
    effectiveDate:    "",
    expirationDate:   "",
    autoRenew:        false,
    noticePeriodDays: 30,
    alertDaysBefore:  30,
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Load counterparties for dropdown
  const { data: cpData } = useQuery({
    queryKey: ["counterparties-all"],
    queryFn:  () => fetch("/api/counterparties?pageSize=100").then(r => r.json()),
    enabled:  open,
  });

  // Load deals for optional linking
  const { data: dealData } = useQuery({
    queryKey: ["deals-all"],
    queryFn:  () => fetch("/api/deals?pageSize=100").then(r => r.json()),
    enabled:  open,
  });

  const counterparties = cpData?.data   ?? [];
  const deals          = dealData?.data ?? [];

  function set(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        contractNumber:   form.contractNumber,
        counterpartyId:   form.counterpartyId,
        dealId:           form.dealId || null,
        type:             form.type,
        status:           form.status,
        effectiveDate:    form.effectiveDate,
        expirationDate:   form.expirationDate || null,
        autoRenew:        form.autoRenew,
        noticePeriodDays: Number(form.noticePeriodDays),
        alertDaysBefore:  Number(form.alertDaysBefore),
      };

      const res = await fetch("/api/contracts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create contract");
      }

      await qc.invalidateQueries({ queryKey: ["contracts"] });
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      contractNumber:   "",
      counterpartyId:   "",
      dealId:           "",
      type:             "ISDA_MASTER",
      status:           "DRAFT",
      effectiveDate:    "",
      expirationDate:   "",
      autoRenew:        false,
      noticePeriodDays: 30,
      alertDaysBefore:  30,
    });
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 flex flex-col shadow-2xl"
           style={{ background: "var(--bg-panel)", borderLeft: "1px solid var(--border-default)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: "var(--border-default)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: "rgba(0,212,170,0.10)", border: "1px solid rgba(0,212,170,0.20)" }}>
              <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">New Contract</h2>
              <p className="text-xs text-text-tertiary">Create a master agreement or deal contract</p>
            </div>
          </div>
          <button onClick={handleClose}
                  className="w-7 h-7 rounded flex items-center justify-center hover:bg-bg-hover transition-fast">
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {error && (
            <div className="p-3 rounded-lg text-xs text-red-400"
                 style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)" }}>
              {error}
            </div>
          )}

          {/* Contract number */}
          <Field label="Contract Number" required>
            <input
              value={form.contractNumber}
              onChange={e => set("contractNumber", e.target.value)}
              required
              placeholder="e.g. ISDA-2026-001"
              className="input-field"
            />
          </Field>

          {/* Counterparty */}
          <Field label="Counterparty" required>
            <select
              value={form.counterpartyId}
              onChange={e => set("counterpartyId", e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select counterparty…</option>
              {counterparties.map((cp: { id: string; name: string; shortName: string }) => (
                <option key={cp.id} value={cp.id}>
                  {cp.name} ({cp.shortName})
                </option>
              ))}
            </select>
          </Field>

          {/* Type + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contract Type" required>
              <select
                value={form.type}
                onChange={e => set("type", e.target.value)}
                className="input-field"
              >
                {CONTRACT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className="input-field"
              >
                {CONTRACT_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Effective + Expiration row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Effective Date" required>
              <input
                type="date"
                value={form.effectiveDate}
                onChange={e => set("effectiveDate", e.target.value)}
                required
                className="input-field"
              />
            </Field>
            <Field label="Expiration Date">
              <input
                type="date"
                value={form.expirationDate}
                onChange={e => set("expirationDate", e.target.value)}
                className="input-field"
              />
            </Field>
          </div>

          {/* Notice period + Alert days row */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Notice Period (days)">
              <input
                type="number"
                min={0}
                value={form.noticePeriodDays}
                onChange={e => set("noticePeriodDays", e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="Alert Days Before Expiry">
              <input
                type="number"
                min={0}
                value={form.alertDaysBefore}
                onChange={e => set("alertDaysBefore", e.target.value)}
                className="input-field"
              />
            </Field>
          </div>

          {/* Linked deal (optional) */}
          <Field label="Link to Deal (optional)">
            <select
              value={form.dealId}
              onChange={e => set("dealId", e.target.value)}
              className="input-field"
            >
              <option value="">No linked deal</option>
              {deals.map((d: { id: string; dealNumber: string; commodity: string }) => (
                <option key={d.id} value={d.id}>
                  {d.dealNumber} — {d.commodity.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>

          {/* Auto-renew toggle */}
          <div className="flex items-center justify-between py-3 px-4 rounded-lg"
               style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
            <div>
              <p className="text-xs font-medium text-text-primary">Auto-Renew</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                Automatically renew this contract before expiration
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("autoRenew", !form.autoRenew)}
              className={cn(
                "w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0",
                form.autoRenew ? "bg-accent" : "bg-bg-hover"
              )}
              style={form.autoRenew ? { background: "var(--accent)" } : { background: "var(--bg-hover)" }}
            >
              <span className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
                form.autoRenew ? "left-[18px]" : "left-0.5"
              )} />
            </button>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3"
             style={{ borderColor: "var(--border-default)" }}>
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="contract-form"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? "Creating…" : "Create Contract"}
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-text-secondary">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
