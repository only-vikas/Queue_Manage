"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface CreateQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQueueCreated: (queue: { _id: string; name: string; prefix: string }) => void;
}

export function CreateQueueModal({
  isOpen,
  onClose,
  onQueueCreated,
}: CreateQueueModalProps) {
  const { success, error: toastError } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("A");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPrefix("A");
      setDescription("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Queue name cannot be empty");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          prefix: (prefix.trim() || "A").toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create queue");
      }

      success(`Queue '${data.queue.name}' created`, `Prefix ${data.queue.prefix}-001 initialized`);
      onQueueCreated(data.queue);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create queue";
      setError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
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
        aria-labelledby="new-queue-title"
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
          animation: "modalEnter 200ms cubic-bezier(0, 0, 0.2, 1) forwards",
        }}
      >
        <style>{`
          @keyframes modalEnter {
            from { opacity: 0; transform: scale(0.97) translateY(4px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            id="new-queue-title"
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            New Queue
          </h3>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
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
              transition: "background-color 120ms ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Queue Name input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label
                  htmlFor="create-queue-name"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                  }}
                >
                  Queue Name *
                </label>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {name.length} / 50
                </span>
              </div>
              <input
                ref={inputRef}
                id="create-queue-name"
                type="text"
                maxLength={50}
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. OPD Counter 1, Billing Desk"
                style={{
                  height: "36px",
                  padding: "0 12px",
                  backgroundColor: "var(--bg-input)",
                  border: error ? "1px solid var(--status-danger)" : "1px solid var(--border-strong)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 120ms ease",
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = "var(--border-focus)";
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = "var(--border-strong)";
                }}
              />
              {error && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--status-danger)",
                    marginTop: "2px",
                  }}
                >
                  {error}
                </span>
              )}
            </div>

            {/* Token Prefix */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="create-queue-prefix"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                }}
              >
                Token Prefix
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  id="create-queue-prefix"
                  type="text"
                  maxLength={4}
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  placeholder="A"
                  style={{
                    width: "80px",
                    height: "36px",
                    padding: "0 12px",
                    backgroundColor: "var(--bg-input)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "4px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Generates {prefix || "A"}-001, {prefix || "A"}-002...
                </span>
              </div>
            </div>

            {/* Optional Description */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label
                  htmlFor="create-queue-desc"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                  }}
                >
                  Description
                </label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Optional</span>
              </div>
              <textarea
                id="create-queue-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief intake criteria or desk instructions..."
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

          {/* Footer Actions */}
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
                padding: "0 14px",
                borderRadius: "4px",
                border: "1px solid var(--border-strong)",
                backgroundColor: "transparent",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              style={{
                height: "32px",
                padding: "0 16px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "var(--accent-primary)",
                color: "var(--text-on-accent)",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: isSubmitting || !name.trim() ? "not-allowed" : "pointer",
                opacity: isSubmitting || !name.trim() ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!isSubmitting && name.trim()) {
                  e.currentTarget.style.backgroundColor = "var(--accent-primary-hover)";
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "var(--accent-primary)";
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Queue</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

