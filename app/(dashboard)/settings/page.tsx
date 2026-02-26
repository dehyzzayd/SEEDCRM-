"use client";

import { useState, useEffect } from "react";
import { useSession }          from "next-auth/react";
import { PageHeader }          from "@/components/shared/PageHeader";
import { cn }                  from "@/lib/utils";
import {
  User, Building2, Users, CreditCard,
  Plug, Bell, Loader2, Check, AlertCircle,
} from "lucide-react";

/* ─── tab config ─────────────────────────────────── */
const TABS = [
  { value: "profile",       label: "Profile",       icon: User       },
  { value: "organization",  label: "Organization",  icon: Building2  },
  { value: "team",          label: "Team",          icon: Users      },
  { value: "billing",       label: "Billing",       icon: CreditCard },
  { value: "integrations",  label: "Integrations",  icon: Plug       },
  { value: "notifications", label: "Notifications", icon: Bell       },
];

/* ─── tiny toast ─────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-xs font-medium shadow-lg",
      type === "success"
        ? "bg-success/10 border-success/30 text-success"
        : "bg-danger/10  border-danger/30  text-danger",
    )}>
      {type === "success" ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
      {msg}
    </div>
  );
}

/* ─── reusable save hook ─────────────────────────── */
function useSave() {
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState<{ msg: string; type: "success"|"error" } | null>(null);

  const save = async (url: string, body: object) => {
    setSaving(true);
    setToast(null);
    try {
      const res  = await fetch(url, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ msg: "Saved successfully", type: "success" });
      } else {
        setToast({ msg: data.error ?? "Save failed", type: "error" });
      }
    } catch {
      setToast({ msg: "Network error — please try again", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return { saving, toast, save };
}

/* ═══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and organization settings" />

      <div className="p-6 flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs transition-fast",
                  activeTab === value
                    ? "bg-bg-card text-text-primary border border-border-default"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-bg-panel",
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", activeTab === value ? "text-accent" : "")} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-xl">
          <div className="card p-6">
            {activeTab === "profile"       && <ProfileSettings />}
            {activeTab === "organization"  && <OrganizationSettings />}
            {activeTab === "team"          && <TeamSettings />}
            {activeTab === "billing"       && <BillingSettings />}
            {activeTab === "integrations"  && <IntegrationSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PROFILE
══════════════════════════════════════════════════ */
function ProfileSettings() {
  const { data: session, update } = useSession();
  const { saving, toast, save }   = useSave();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [title,    setTitle]    = useState("");

  /* password change */
  const [curPw,    setCurPw]    = useState("");
  const [newPw,    setNewPw]    = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwToast,  setPwToast]  = useState<{ msg: string; type: "success"|"error" } | null>(null);

  /* seed from session once ready */
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name  ?? "");
      setEmail(session.user.email ?? "");
      setTitle((session.user as { title?: string }).title ?? "");
    }
  }, [session]);

  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await save("/api/user/profile", { name, email, title });
    await update({ name, email }); // refresh NextAuth session client-side
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    setPwToast(null);
    try {
      const res  = await fetch("/api/user/password", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwToast({ msg: "Password updated", type: "success" });
        setCurPw(""); setNewPw("");
      } else {
        setPwToast({ msg: data.error ?? "Failed", type: "error" });
      }
    } catch {
      setPwToast({ msg: "Network error", type: "error" });
    } finally {
      setPwSaving(false);
      setTimeout(() => setPwToast(null), 3500);
    }
  };

  return (
    <div>
      {toast    && <Toast msg={toast.msg}   type={toast.type}   />}
      {pwToast  && <Toast msg={pwToast.msg} type={pwToast.type} />}

      <h3 className="text-sm font-semibold text-text-primary mb-4">Profile Settings</h3>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-default">
        <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-semibold">
          {initials}
        </div>
        <div>
          <p className="text-xs font-medium text-text-primary">{name || "—"}</p>
          <p className="text-[10px] text-text-tertiary">{email || "—"}</p>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfile} className="space-y-4">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">Full Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Head of Trading"
            className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>

      {/* Password change */}
      <div className="mt-8 pt-6 border-t border-border-default">
        <h4 className="text-xs font-semibold text-text-primary mb-4">Change Password</h4>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="text-xs text-text-tertiary block mb-1">Current Password</label>
            <input
              type="password"
              value={curPw}
              onChange={e => setCurPw(e.target.value)}
              required
              className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
            />
          </div>
          <div>
            <label className="text-xs text-text-tertiary block mb-1">New Password</label>
            <input
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
            />
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className="btn-secondary flex items-center gap-2 disabled:opacity-60"
          >
            {pwSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ORGANIZATION
══════════════════════════════════════════════════ */
function OrganizationSettings() {
  const { data: session }       = useSession();
  const { saving, toast, save } = useSave();

  const [orgName,   setOrgName]   = useState("");
  const [timezone,  setTimezone]  = useState("America/Chicago");
  const [currency,  setCurrency]  = useState("USD");

  useEffect(() => {
    if (session?.user) {
      setOrgName((session.user as { orgName?: string }).orgName ?? "");
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await save("/api/user/org", { name: orgName, timezone, currency });
  };

  const isAdmin = ["ADMIN", "SUPERADMIN"].includes(
    (session?.user as { role?: string })?.role ?? ""
  );

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <h3 className="text-sm font-semibold text-text-primary mb-4">Organization</h3>

      {!isAdmin && (
        <div className="mb-4 px-3 py-2.5 rounded bg-bg-panel border border-border-default text-xs text-text-tertiary">
          Only organization admins can edit these settings.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">Organization Name</label>
          <input
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            required
            disabled={!isAdmin}
            className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none transition-fast disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">Timezone</label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            disabled={!isAdmin}
            className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none disabled:opacity-50"
          >
            <option value="America/Chicago">America/Chicago (CT)</option>
            <option value="America/New_York">America/New_York (ET)</option>
            <option value="America/Denver">America/Denver (MT)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">Default Currency</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            disabled={!isAdmin}
            className="w-full h-9 bg-bg-panel border border-border-default rounded px-3 text-sm text-text-primary focus:border-accent outline-none disabled:opacity-50"
          >
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="CAD">CAD — Canadian Dollar</option>
          </select>
        </div>
        {isAdmin && (
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        )}
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TEAM  (real DB data)
══════════════════════════════════════════════════ */
function TeamSettings() {
  const [members, setMembers] = useState<
    { name: string | null; email: string; role: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/org")
      .then(r => r.json())
      .then(d => { if (d.members) setMembers(d.members); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roleColors: Record<string, string> = {
    ADMIN:      "bg-accent/15 text-accent",
    TRADER:     "bg-blue-500/15 text-blue-400",
    ANALYST:    "bg-[#8B5CF6]/15 text-[#8B5CF6]",
    VIEWER:     "bg-text-tertiary/15 text-text-tertiary",
    SUPERADMIN: "bg-orange-500/15 text-orange-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Team Members</h3>
        <button className="btn-primary text-xs">+ Invite User</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
        </div>
      ) : members.length === 0 ? (
        <p className="text-xs text-text-tertiary py-4 text-center">No team members found.</p>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.email} className="flex items-center justify-between py-2 border-b border-border-default/50">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-bg-hover flex items-center justify-center text-xs font-medium text-text-secondary">
                  {(m.name ?? m.email).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-text-primary">{m.name ?? "—"}</p>
                  <p className="text-[10px] text-text-tertiary">{m.email}</p>
                </div>
              </div>
              <span className={cn("badge text-[10px]", roleColors[m.role] ?? "bg-bg-hover text-text-secondary")}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BILLING  (unchanged — already works)
══════════════════════════════════════════════════ */
function BillingSettings() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const openPortal = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Could not open billing portal.");
    } catch { setError("Network error."); }
    finally   { setLoading(false); }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-4">Billing & Subscription</h3>
      <div className="card p-4 bg-accent/5 border-accent/20 mb-4">
        <p className="text-xs font-medium text-accent mb-1">Current Plan</p>
        <p className="text-xs text-text-secondary">Manage your plan, invoices, and payment method via Stripe.</p>
      </div>
      {error && <p className="text-xs text-danger mb-3">{error}</p>}
      <div className="flex gap-2">
        <button onClick={openPortal} disabled={loading} className="btn-secondary text-xs disabled:opacity-50">
          {loading ? "Opening…" : "Manage Subscription via Stripe →"}
        </button>
        <a href="/pricing" className="btn-secondary text-xs">View Plans</a>
      </div>
      <p className="text-[10px] text-text-disabled mt-3">
        Stripe portal is only available after subscribing to a paid plan.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   INTEGRATIONS  (unchanged)
══════════════════════════════════════════════════ */
function IntegrationSettings() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-4">API Integrations</h3>
      <div className="space-y-4">
        {[
          { name: "EIA API",             description: "US Energy Information Administration — Natural gas & oil prices", connected: true  },
          { name: "ERCOT Public API",    description: "Texas electricity grid data and settlement prices",              connected: false },
          { name: "CME Group Delayed Data", description: "NYMEX futures delayed price data",                           connected: false },
        ].map(int => (
          <div key={int.name} className="flex items-center justify-between py-3 border-b border-border-default/50">
            <div>
              <p className="text-xs font-medium text-text-primary">{int.name}</p>
              <p className="text-[10px] text-text-tertiary">{int.description}</p>
            </div>
            <button className={cn(
              "px-3 h-7 rounded text-[11px] border transition-fast",
              int.connected
                ? "border-success bg-success/10 text-success"
                : "border-border-default text-text-tertiary hover:border-border-hover",
            )}>
              {int.connected ? "Connected" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NOTIFICATIONS  (with real toggle state)
══════════════════════════════════════════════════ */
function NotificationSettings() {
  const [prefs, setPrefs] = useState([
    { key: "contract_expiry",   label: "Contract expiration alerts (30 days before)", enabled: true  },
    { key: "credit_breach",     label: "Credit limit breach notifications",            enabled: true  },
    { key: "stale_deal",        label: "Stale deal alerts (14+ days in stage)",        enabled: true  },
    { key: "price_move",        label: "Price move alerts (>5% daily change)",         enabled: false },
    { key: "daily_summary",     label: "Daily pipeline summary email",                 enabled: false },
    { key: "deal_assigned",     label: "New deal assigned to me",                      enabled: true  },
  ]);

  const toggle = (key: string) =>
    setPrefs(p => p.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n));

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-4">Notification Preferences</h3>
      <div className="space-y-3">
        {prefs.map(n => (
          <div key={n.key} className="flex items-center justify-between py-2 border-b border-border-default/50">
            <p className="text-xs text-text-secondary">{n.label}</p>
            <button
              onClick={() => toggle(n.key)}
              className={cn(
                "w-8 h-4 rounded-full transition-all relative flex-shrink-0",
                n.enabled ? "bg-accent" : "bg-bg-hover border border-border-default",
              )}
            >
              <div className={cn(
                "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                n.enabled ? "right-0.5" : "left-0.5",
              )} />
            </button>
          </div>
        ))}
      </div>
      <button className="btn-primary mt-6 text-xs">Save Preferences</button>
    </div>
  );
}
