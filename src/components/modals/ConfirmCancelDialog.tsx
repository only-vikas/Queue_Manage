"use client";

import { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmCancelDialogProps {
  isOpen: boolean;
  token: {
    _id: string;
    tokenNumber: string;
    personName: string;
    waitDuration?: string;
  } | null;
  onClose: () => void;
  onConfirm: (tokenId: string) => Promise<void>;
  isLoading?: boolean;
}

export function ConfirmCancelDialog({
  isOpen,
  token,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmCancelDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !token) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
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
        aria-labelledby="cancel-dialog-title"
        style={{
          width: "100%",
          maxWidth: "320px",
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
        <div style={{ padding: "20px 16px 16px 16px", display: "flex", flexDirection: "column" }}>
          {/* Flat Danger Square Icon (32x32px) */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              backgroundColor: "var(--status-cancelled-bg)",
              border: "1px solid #FECACA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--status-cancelled-text)",
            }}
          >
            <X size={18} strokeWidth={2.2} />
          </div>

          <h2
            id="cancel-dialog-title"
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginTop: "12px",
              marginBottom: "6px",
              letterSpacing: "-0.01em",
            }}
          >
            Cancel this token?
          </h2>

          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.5,
              color: "var(--text-secondary)",
              marginBottom: "14px",
            }}
          >
            <strong style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {token.tokenNumber} · {token.personName}
            </strong>{" "}
            will be removed from the waiting list. This action cannot be undone.
          </p>

          {/* Token Inset Card */}
          <div
            style={{
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "4px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              [{token.tokenNumber}]
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {token.personName}
            </span>
            {token.waitDuration && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginLeft: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                Waiting {token.waitDuration}
              </span>
            )}
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
            disabled={isLoading}
            onClick={onClose}
            style={{
              height: "32px",
              padding: "0 12px",
              border: "1px solid var(--border-strong)",
              backgroundColor: "transparent",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Keep Token
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onConfirm(token._id)}
            style={{
              height: "32px",
              padding: "0 14px",
              border: "none",
              backgroundColor: "var(--status-cancelled-text)",
              color: "#FFFFFF",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#991B1B")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--status-cancelled-text)")}
          >
            {isLoading ? "Cancelling..." : "Cancel Token"}
          </button>
        </div>
      </div>
    </div>
  );
}

