"use client";

import { useState, useEffect } from "react";
import { X, Save, Ban, Edit3, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface TokenDetailDrawerProps {
  isOpen: boolean;
  token: {
    _id: string;
    tokenNumber: string;
    personName: string;
    phone?: string;
    notes?: string;
    status: "WAITING" | "SERVING" | "COMPLETED" | "CANCELLED";
    position?: number;
    createdAt?: string;
    servedAt?: string;
    completedAt?: string;
  } | null;
  onClose: () => void;
  onTokenUpdated: (updated: { _id: string; personName: string; phone?: string; notes?: string }) => void;
  onRequestCancel: (token: { _id: string; tokenNumber: string; personName: string }) => void;
}

export function TokenDetailDrawer({
  isOpen,
  token,
  onClose,
  onTokenUpdated,
  onRequestCancel,
}: TokenDetailDrawerProps) {
  const { success, error: toastError } = useToast();

  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (token) {
      setPersonName(token.personName || "");
      setPhone(token.phone || "");
      setNotes(token.notes || "");
    }
  }, [token]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !token) return null;

  const handleSave = async () => {
    if (!personName.trim()) {
      toastError("Person name cannot be blank");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/tokens/${token._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personName: personName.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update token");

      success(`Token ${token.tokenNumber} updated`, `Changes saved for ${personName}`);
      onTokenUpdated({
        _id: token._id,
        personName: personName.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const formattedCreatedTime = token.createdAt
    ? new Date(token.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const formattedServedTime = token.servedAt
    ? new Date(token.servedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Pending";

  const formattedCompletedTime = token.completedAt
    ? new Date(token.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.20)",
          zIndex: 50,
          transition: "opacity 150ms ease",
        }}
        onClick={onClose}
      />

      {/* 320px Right Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Token Details"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "320px",
          maxWidth: "100%",
          backgroundColor: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-hairline)",
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 16px rgba(0,0,0,0.06)",
          animation: "drawerSlide 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <style>{`
          @keyframes drawerSlide {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* 52px Header */}
        <div
          style={{
            height: "52px",
            padding: "0 16px",
            borderBottom: "1px solid var(--border-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-surface)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.01em",
              }}
            >
              {token.tokenNumber}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                color:
                  token.status === "SERVING"
                    ? "var(--status-serving-text)"
                    : token.status === "CANCELLED"
                    ? "var(--status-cancelled-text)"
                    : "var(--text-secondary)",
                backgroundColor:
                  token.status === "SERVING"
                    ? "var(--status-serving-bg)"
                    : token.status === "CANCELLED"
                    ? "var(--status-cancelled-bg)"
                    : "var(--bg-input)",
                border: "1px solid var(--border-hairline)",
                padding: "2px 6px",
                borderRadius: "4px",
                textTransform: "uppercase",
              }}
            >
              {token.status}
            </span>
          </div>

          <button
            type="button"
            aria-label="Close drawer"
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* SECTION 1: PERSON */}
          <section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                PERSON
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "var(--accent-primary)",
                  textTransform: "uppercase",
                }}
              >
                EDITABLE
              </span>
            </div>

            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label
                htmlFor="drawer-person-name"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="drawer-person-name"
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "32px",
                    padding: "0 28px 0 10px",
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-focus)",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
                <Edit3
                  size={13}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--accent-primary)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label
                htmlFor="drawer-person-phone"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                Phone
              </label>
              <input
                id="drawer-person-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
                style={{
                  width: "100%",
                  height: "32px",
                  padding: "0 10px",
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>

            {/* Notes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label
                htmlFor="drawer-person-notes"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                Notes / Triage Info
              </label>
              <textarea
                id="drawer-person-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Intake notes, symptoms, or desk instructions..."
                style={{
                  padding: "8px 10px",
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none",
                  resize: "none",
                  lineHeight: 1.4,
                }}
              />
            </div>
          </section>

          {/* SECTION 2: QUEUE STATUS */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingTop: "14px",
              borderTop: "1px solid var(--border-hairline)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              QUEUE STATUS
            </span>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-hairline)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              {token.position !== undefined && (
                <div
                  style={{
                    height: "32px",
                    padding: "0 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-hairline)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Position</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    #{token.position}
                  </span>
                </div>
              )}

              <div
                style={{
                  height: "32px",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Issued At</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formattedCreatedTime}
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 3: TIMELINE */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingTop: "14px",
              borderTop: "1px solid var(--border-hairline)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              TIMELINE
            </span>

            <div style={{ position: "relative", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "16px", paddingTop: "4px" }}>
              {/* Continuous 1px Vertical Spine */}
              <div
                style={{
                  position: "absolute",
                  left: "3px",
                  top: "6px",
                  bottom: "6px",
                  width: "1px",
                  backgroundColor: "var(--border-hairline)",
                }}
              />

              {/* Node 1: Created */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "-18px",
                    top: "4px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "var(--text-primary)",
                  }}
                />
                <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>
                  Created &amp; Triaged
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                  {formattedCreatedTime}
                </span>
              </div>

              {/* Node 2: Serving */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "-18px",
                    top: "4px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: token.status === "SERVING" || token.status === "COMPLETED" ? "var(--status-serving-text)" : "var(--bg-surface)",
                    border: "1px solid var(--border-strong)",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: token.status === "SERVING" ? "var(--status-serving-text)" : "var(--text-muted)",
                    fontWeight: token.status === "SERVING" ? 600 : 400,
                  }}
                >
                  Serving Desk
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                  {formattedServedTime}
                </span>
              </div>

              {/* Node 3: Completed */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "-18px",
                    top: "4px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: token.status === "COMPLETED" ? "var(--status-completed-text)" : "var(--bg-surface)",
                    border: "1px solid var(--border-hairline)",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: token.status === "COMPLETED" ? "var(--status-completed-text)" : "var(--text-muted)",
                    fontWeight: token.status === "COMPLETED" ? 600 : 400,
                  }}
                >
                  Completed &amp; Discharged
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                  {formattedCompletedTime}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid var(--border-hairline)",
            backgroundColor: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            style={{
              width: "100%",
              height: "32px",
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-on-accent)",
              border: "none",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: isSaving ? "not-allowed" : "pointer",
              transition: "background-color 120ms ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-primary-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-primary)")}
          >
            <Save size={14} />
            <span>{isSaving ? "Saving Changes..." : "Save Changes"}</span>
          </button>

          {token.status === "WAITING" && (
            <button
              type="button"
              onClick={() => {
                onRequestCancel({
                  _id: token._id,
                  tokenNumber: token.tokenNumber,
                  personName: token.personName,
                });
                onClose();
              }}
              style={{
                width: "100%",
                height: "32px",
                backgroundColor: "transparent",
                border: "1px solid var(--border-hairline)",
                borderRadius: "4px",
                color: "var(--status-cancelled-text)",
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--status-cancelled-bg)";
                e.currentTarget.style.borderColor = "#FCA5A5";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "var(--border-hairline)";
              }}
            >
              <Ban size={14} />
              <span>Cancel Token</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
