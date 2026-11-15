"use client";

import { useState, useEffect, useRef } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface AddTokenModalProps {
  isOpen: boolean;
  queueId: string;
  queueName: string;
  onClose: () => void;
  onTokenAdded: (token: any) => void;
}

export function AddTokenModal({
  isOpen,
  queueId,
  queueName,
  onClose,
  onTokenAdded,
}: AddTokenModalProps) {
  const { success, error: toastError } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPersonName("");
      setPhone("");
      setNotes("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueId,
          personName: personName.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue token");

      success(
        `Token ${data.token.tokenNumber} issued`,
        `${data.token.personName} added to ${queueName}`
      );
      onTokenAdded(data.token);
      onClose();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Failed to issue token");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(24, 24, 22, 0.40)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-token-title"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "6px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalEnter 180ms cubic-bezier(0, 0, 0.2, 1) forwards",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <UserPlus size={16} style={{ color: "var(--accent-primary)" }} />
            <h3
              id="add-token-title"
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Issue New Token
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              background: "none",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label
                htmlFor="modal-token-name"
                style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}
              >
                Person / Client Name *
              </label>
              <input
                ref={inputRef}
                id="modal-token-name"
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Priya Nair"
                style={{
                  height: "36px",
                  padding: "0 12px",
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label
                htmlFor="modal-token-phone"
                style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}
              >
                Phone / Contact
              </label>
              <input
                id="modal-token-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
                style={{
                  height: "36px",
                  padding: "0 12px",
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

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label
                htmlFor="modal-token-notes"
                style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}
              >
                Triage Notes / Reason
              </label>
              <textarea
                id="modal-token-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief reason for visit or desk instruction..."
                style={{
                  padding: "8px 12px",
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none",
                  resize: "none",
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border-hairline)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "8px",
              backgroundColor: "var(--bg-surface)",
            }}
          >
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              style={{
                height: "32px",
                padding: "0 12px",
                borderRadius: "4px",
                border: "1px solid var(--border-strong)",
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !personName.trim()}
              style={{
                height: "32px",
                padding: "0 14px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "var(--accent-primary)",
                color: "var(--text-on-accent)",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: isSubmitting || !personName.trim() ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Issuing...</span>
                </>
              ) : (
                <span>Issue Token →</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
