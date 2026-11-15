"use client";

import { useEffect, useState } from "react";
import { Trash2, AlertTriangle, Archive, X } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface ConfirmDeleteQueueDialogProps {
  isOpen: boolean;
  queue: {
    _id: string;
    name: string;
    waitingCount: number;
  } | null;
  onClose: () => void;
  onQueueDeleted: (queueId: string) => void;
}

export function ConfirmDeleteQueueDialog({
  isOpen,
  queue,
  onClose,
  onQueueDeleted,
}: ConfirmDeleteQueueDialogProps) {
  const { success, error: toastError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !queue) return null;

  const isBlocked = (queue.waitingCount || 0) > 0;

  const handleArchive = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/queues/${queue._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to archive queue");

      success(`Queue '${queue.name}' archived`, "Active queue list updated");
      onQueueDeleted(queue._id);
      onClose();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Archive failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePermanentDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/queues/${queue._id}?hard=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete queue");

      success(`Queue '${queue.name}' deleted permanently`, "All data cleared");
      onQueueDeleted(queue._id);
      onClose();
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

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
        aria-labelledby="delete-dialog-title"
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-strong)",
          borderRadius: "6px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalEnter 180ms cubic-bezier(0, 0, 0.2, 1) forwards",
        }}
      >
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {isBlocked ? (
            /* Variant A: Blocked */
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 700,
                    backgroundColor: "#FEF3C7",
                    border: "1px solid #FDE68A",
                    color: "#92400E",
                  }}
                >
                  !
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h2
                    id="delete-dialog-title"
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    This queue has waiting tokens
                  </h2>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    <strong style={{ color: "var(--text-primary)" }}>{queue.waitingCount}</strong> people
                    are currently waiting in {queue.name}. Remove all tokens or complete the queue before
                    deleting it.
                  </p>
                </div>
              </div>

              {/* Inset Token Notice Card */}
              <div
                style={{
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#EA580C",
                    }}
                  />
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{queue.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {queue.waitingCount}
                  </span>{" "}
                  waiting
                  <span style={{ color: "var(--text-muted)" }}>•</span>
                  <span style={{ color: "#0F766E", fontWeight: 500 }}>Active</span>
                </div>
              </div>
            </>
          ) : (
            /* Variant B: Safe to delete */
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "var(--status-cancelled-bg)",
                    border: "1px solid #FECACA",
                    color: "var(--status-cancelled-text)",
                  }}
                >
                  <Trash2 size={16} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h2
                    id="delete-dialog-title"
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    Delete this queue?
                  </h2>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    <strong style={{ color: "var(--text-primary)" }}>{queue.name}</strong> will be
                    permanently deleted. Historical analytics data will be preserved.
                  </p>
                </div>
              </div>

              {/* Inset Safe Badge Card */}
              <div
                style={{
                  backgroundColor: "var(--bg-input)",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "var(--text-muted)",
                    }}
                  />
                  <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{queue.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    0
                  </span>{" "}
                  active tokens
                  <span>•</span>
                  <span style={{ color: "var(--status-completed-text)", fontWeight: 500 }}>
                    Safe to delete
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <button
            type="button"
            disabled={isDeleting}
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
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {isBlocked ? "Keep Queue" : "Cancel"}
          </button>

          {isBlocked ? (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleArchive}
              style={{
                height: "32px",
                padding: "0 14px",
                borderRadius: "4px",
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: isDeleting ? "not-allowed" : "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-input)")}
            >
              <Archive size={14} style={{ color: "var(--text-secondary)" }} />
              <span>Archive Queue</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handlePermanentDelete}
              style={{
                height: "32px",
                padding: "0 14px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "var(--status-cancelled-text)",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: isDeleting ? "not-allowed" : "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#991B1B")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--status-cancelled-text)")}
            >
              <Trash2 size={14} />
              <span>{isDeleting ? "Deleting..." : "Delete Queue"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
