"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NumberFlow from "@number-flow/react";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Plus,
  Play,
  RotateCw,
  Clock,
  Phone,
  User,
  Zap,
  Trash2,
  ChevronRight,
  Sparkles,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { CreateQueueModal } from "@/components/modals/CreateQueueModal";
import { AddTokenModal } from "@/components/modals/AddTokenModal";
import { ConfirmCancelDialog } from "@/components/modals/ConfirmCancelDialog";
import { ConfirmDeleteQueueDialog } from "@/components/modals/ConfirmDeleteQueueDialog";
import { TokenDetailDrawer } from "@/components/modals/TokenDetailDrawer";

export interface TokenItem {
  _id: string;
  tokenNumber: string;
  sequenceNumber: number;
  personName: string;
  phone?: string;
  notes?: string;
  status: "WAITING" | "SERVING" | "COMPLETED" | "CANCELLED";
  position: number;
  createdAt: string;
  servedAt?: string;
  completedAt?: string;
}

export interface QueueData {
  _id: string;
  name: string;
  prefix: string;
  waitingCount: number;
}

function QueueWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeQueueId = searchParams.get("id");
  const { success, error: toastError, serving: toastServing } = useToast();

  const [queues, setQueues] = useState<QueueData[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<QueueData | null>(null);
  const [servingToken, setServingToken] = useState<TokenItem | null>(null);
  const [waitingTokens, setWaitingTokens] = useState<TokenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [servingElapsed, setServingElapsed] = useState("00m 00s");

  // Quick-Add inputs
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickCategory, setQuickCategory] = useState("Consultation");
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // Active / Expanded Row on mobile
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const [tokenToCancel, setTokenToCancel] = useState<TokenItem | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTokenForDrawer, setSelectedTokenForDrawer] = useState<TokenItem | null>(null);

  // Live Timer for Serving Token
  useEffect(() => {
    if (!servingToken?.servedAt) {
      setServingElapsed("00m 00s");
      return;
    }

    const servedTime = new Date(servingToken.servedAt).getTime();

    const updateTimer = () => {
      const diffMs = Math.max(0, Date.now() - servedTime);
      const totalSec = Math.floor(diffMs / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      setServingElapsed(
        `${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [servingToken?.servedAt]);

  // Load all active queues
  const loadQueues = useCallback(async () => {
    try {
      const res = await fetch("/api/queues");
      if (res.status === 401) {
        router.push("/login");
        return null;
      }
      if (res.ok) {
        const data = await res.json();
        setQueues(data.queues || []);
        return data.queues as QueueData[];
      }
    } catch (e) {
      console.error("Error loading queues:", e);
    }
    return null;
  }, [router]);

  // Load specific queue details
  const loadQueueDetails = useCallback(
    async (queueId: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/queues/${queueId}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedQueue(data.queue);
          setServingToken(data.servingToken);
          setWaitingTokens(data.waitingTokens || []);
        } else if (res.status === 404) {
          // Fall back to first queue if active ID is obsolete
          const all = await loadQueues();
          if (all && all.length > 0) {
            router.push(`/queues?id=${all[0]._id}`);
          }
        }
      } catch (e) {
        console.error("Error fetching queue details:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [loadQueues, router]
  );

  useEffect(() => {
    loadQueues().then((allQueues) => {
      if (allQueues && allQueues.length > 0) {
        const targetId = activeQueueId || allQueues[0]._id;
        loadQueueDetails(targetId);
      } else {
        setIsLoading(false);
      }
    });
  }, [activeQueueId, loadQueues, loadQueueDetails]);

  // Quick Add submission
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !selectedQueue) return;

    setIsQuickAdding(true);
    const tempName = quickName.trim();
    const tempPhone = quickPhone.trim();
    const tempCategory = quickCategory;

    // Clear input immediately for rapid entry
    setQuickName("");
    setQuickPhone("");

    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueId: selectedQueue._id,
          personName: tempName,
          phone: tempPhone,
          notes: tempCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue token");

      setWaitingTokens((prev) => [...prev, data.token]);
      success(
        `Token ${data.token.tokenNumber} issued`,
        `${data.token.personName} added to ${selectedQueue.name} (Pos #${data.token.position / 1000})`
      );
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Error issuing token");
    } finally {
      setIsQuickAdding(false);
    }
  };

  // Assign Next / Serve Top Token CTA
  const handleAssignNext = async () => {
    if (!selectedQueue || isAssigning || waitingTokens.length === 0) return;

    setIsAssigning(true);
    try {
      const res = await fetch("/api/tokens/assign-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId: selectedQueue._id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign next token");

      setServingToken(data.servingToken);
      setWaitingTokens((prev) => prev.slice(1));

      if (data.servingToken) {
        toastServing(
          `Now serving ${data.servingToken.tokenNumber} • ${data.servingToken.personName}`,
          `Dispatched to Desk // ${selectedQueue.name}`
        );
      }
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Failed to assign next token");
    } finally {
      setIsAssigning(false);
    }
  };

  // Complete Serving Token
  const handleCompleteServing = async () => {
    if (!servingToken) return;

    try {
      const res = await fetch(`/api/tokens/${servingToken._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete consultation");
      }

      success(
        `Consultation finished for ${servingToken.tokenNumber}`,
        `${servingToken.personName} marked as completed`
      );
      setServingToken(null);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Error completing consultation");
    }
  };

  // Cancel Token Handler
  const handleConfirmCancel = async (tokenId: string) => {
    setIsCancelLoading(true);
    try {
      const res = await fetch(`/api/tokens/${tokenId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel token");
      }

      setWaitingTokens((prev) => prev.filter((t) => t._id !== tokenId));
      if (servingToken?._id === tokenId) {
        setServingToken(null);
      }

      success("Token cancelled", "Queue position updated");
      setIsCancelModalOpen(false);
      setTokenToCancel(null);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Failed to cancel token");
    } finally {
      setIsCancelLoading(false);
    }
  };

  // Reorder tokens (Move Up / Down)
  const handleReorder = async (token: TokenItem, direction: "UP" | "DOWN", index: number) => {
    if (
      (direction === "UP" && index === 0) ||
      (direction === "DOWN" && index === waitingTokens.length - 1)
    ) {
      return;
    }

    const swapTarget = direction === "UP" ? waitingTokens[index - 1] : waitingTokens[index + 1];
    if (!swapTarget) return;

    // Optimistic UI swap
    const nextList = [...waitingTokens];
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    nextList[index] = swapTarget;
    nextList[targetIdx] = token;
    setWaitingTokens(nextList);

    try {
      const res = await fetch(`/api/tokens/${token._id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reorder token");
      }
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Reorder sync failed");
      // Revert if error
      if (selectedQueue) loadQueueDetails(selectedQueue._id);
    }
  };

  // Calculate elapsed waiting duration string
  const getElapsedWait = (createdAt: string) => {
    const diff = Math.max(0, Date.now() - new Date(createdAt).getTime());
    const totalSec = Math.floor(diff / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  // ---------------------------------------------------------------------------
  // SCREEN 03: ZERO QUEUES FIRST-TIME EMPTY STATE
  // ---------------------------------------------------------------------------
  if (!isLoading && queues.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          textAlign: "center",
          backgroundColor: "var(--bg-canvas)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "48px",
            fontWeight: 700,
            color: "var(--border-hairline)",
            lineHeight: 1,
            marginBottom: "12px",
          }}
        >
          0
        </div>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            marginBottom: "8px",
          }}
        >
          No Queues Initialized
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            maxWidth: "340px",
            lineHeight: 1.5,
            marginBottom: "20px",
          }}
        >
          Create your first consultation or intake queue to begin issuing, ordering, and serving
          sequential tokens.
        </p>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            height: "36px",
            padding: "0 18px",
            backgroundColor: "var(--accent-primary)",
            color: "var(--text-on-accent)",
            border: "none",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "background-color 120ms ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-primary-hover)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-primary)")}
        >
          <Plus size={15} />
          <span>Create Your First Queue</span>
        </button>

        <CreateQueueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onQueueCreated={(newQ) => {
            loadQueues().then(() => router.push(`/queues?id=${newQ._id}`));
          }}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN OPERATING DESK (SCREENS 04 & 05)
  // ---------------------------------------------------------------------------
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "var(--bg-canvas)",
      }}
    >
      {/* 52px Queue Panel Header */}
      <div
        style={{
          height: "52px",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-hairline)",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <h1
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedQueue?.name || "Queue Desk"}
          </h1>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: "var(--bg-canvas)",
              border: "1px solid var(--border-hairline)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
            }}
          >
            <NumberFlow value={waitingTokens.length} /> waiting
          </span>

          <div
            className="mobile-hide"
            style={{
              height: "14px",
              width: "1px",
              backgroundColor: "var(--border-hairline)",
            }}
          />

          <span
            className="mobile-hide"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            PREFIX: [{selectedQueue?.prefix || "A"}]
          </span>
        </div>

        {/* Top Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Delete / Archive Queue Button */}
          {selectedQueue && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              title="Delete or Archive Queue"
              aria-label="Delete queue"
              style={{
                height: "32px",
                width: "32px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
                border: "1px solid var(--border-strong)",
                borderRadius: "4px",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "var(--status-cancelled-text)";
                e.currentTarget.style.backgroundColor = "var(--status-cancelled-bg)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Trash2 size={14} />
            </button>
          )}

          {/* Add Token CTA */}
          <button
            type="button"
            onClick={() => setIsAddTokenModalOpen(true)}
            style={{
              height: "32px",
              padding: "0 12px",
              backgroundColor: "transparent",
              border: "1px solid var(--border-strong)",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Plus size={14} />
            <span className="mobile-hide">Add Token</span>
          </button>

          {/* Primary CTA: Assign Next Token */}
          <button
            type="button"
            disabled={isAssigning || waitingTokens.length === 0}
            onClick={handleAssignNext}
            style={{
              height: "32px",
              padding: "0 14px",
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-on-accent)",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: isAssigning || waitingTokens.length === 0 ? "not-allowed" : "pointer",
              opacity: isAssigning || waitingTokens.length === 0 ? 0.45 : 1,
              transition: "background-color 120ms ease, opacity 120ms ease",
            }}
            onMouseOver={(e) => {
              if (!isAssigning && waitingTokens.length > 0) {
                e.currentTarget.style.backgroundColor = "var(--accent-primary-hover)";
              }
            }}
            onMouseOut={(e) => {
              if (!isAssigning && waitingTokens.length > 0) {
                e.currentTarget.style.backgroundColor = "var(--accent-primary)";
              }
            }}
          >
            <span>{isAssigning ? "Assigning..." : "Assign Next"}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 64px Currently Serving Banner */}
      {servingToken ? (
        <div
          data-flip-id="serving-banner"
          style={{
            minHeight: "64px",
            backgroundColor: "var(--bg-serving)",
            borderBottom: "2px solid var(--border-serving)",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
            {/* Status Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--status-serving-text)",
                  display: "inline-block",
                  animation: "pulse 1.8s infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--status-serving-text)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                SERVING
              </span>
            </div>

            <div
              style={{
                height: "24px",
                width: "1px",
                backgroundColor: "var(--border-serving)",
              }}
            />

            {/* Token ID + Person */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", minWidth: 0 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--status-serving-text)",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.01em",
                }}
              >
                {servingToken.tokenNumber}
              </span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {servingToken.personName}
              </span>
              {servingToken.notes && (
                <span
                  className="mobile-hide"
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  ({servingToken.notes})
                </span>
              )}
            </div>

            {/* Live Serving Elapsed Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "4px",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-serving)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--status-serving-text)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <Clock size={13} />
              <span>{servingElapsed}</span>
            </div>
          </div>

          {/* Complete / Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={handleCompleteServing}
              style={{
                height: "32px",
                padding: "0 14px",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--status-serving-text)",
                borderRadius: "4px",
                color: "var(--status-serving-text)",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--status-serving-bg)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-surface)";
              }}
            >
              <Check size={14} />
              <span>Finish Consultation</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* 48px Quick-Add Bar */}
      <form
        onSubmit={handleQuickAdd}
        style={{
          height: "48px",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-hairline)",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >
          <Zap size={14} style={{ color: "var(--accent-primary)" }} />
          <span className="mobile-hide">Quick Add:</span>
        </div>

        {/* Patient Name */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: "340px" }}>
          <input
            type="text"
            required
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Patient / Client Name..."
            style={{
              width: "100%",
              height: "32px",
              padding: "0 10px",
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "4px",
              fontSize: "13px",
              color: "var(--text-primary)",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-hairline)")}
          />
        </div>

        {/* Contact Input */}
        <div className="mobile-hide" style={{ width: "180px" }}>
          <input
            type="text"
            value={quickPhone}
            onChange={(e) => setQuickPhone(e.target.value)}
            placeholder="Contact (+91...)"
            style={{
              width: "100%",
              height: "32px",
              padding: "0 10px",
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "4px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-primary)",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-hairline)")}
          />
        </div>

        {/* Category Select */}
        <div className="mobile-hide" style={{ width: "130px" }}>
          <select
            value={quickCategory}
            onChange={(e) => setQuickCategory(e.target.value)}
            style={{
              width: "100%",
              height: "32px",
              padding: "0 8px",
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "4px",
              fontSize: "12px",
              color: "var(--text-secondary)",
              outline: "none",
            }}
          >
            <option value="Consultation">Consultation</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Billing">Billing</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        {/* Issue Token Button */}
        <button
          type="submit"
          disabled={isQuickAdding || !quickName.trim()}
          title="Issue Token (Enter)"
          aria-label="Submit quick add"
          style={{
            height: "32px",
            padding: "0 12px",
            backgroundColor: "var(--bg-hover)",
            border: "1px solid var(--border-strong)",
            borderRadius: "4px",
            color: "var(--text-primary)",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: isQuickAdding || !quickName.trim() ? "not-allowed" : "pointer",
            opacity: isQuickAdding || !quickName.trim() ? 0.6 : 1,
            flexShrink: 0,
          }}
          onMouseOver={(e) => {
            if (quickName.trim()) e.currentTarget.style.backgroundColor = "var(--border-hairline)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-hover)";
          }}
        >
          <Plus size={14} />
          <span className="mobile-hide">Issue Token</span>
        </button>
      </form>

      {/* Main List Area */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Table Column Headers */}
        <div
          style={{
            height: "32px",
            backgroundColor: "var(--bg-canvas)",
            borderBottom: "1px solid var(--border-hairline)",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          <div style={{ width: "36px", flexShrink: 0 }}>POS</div>
          <div style={{ width: "90px", flexShrink: 0, paddingLeft: "4px" }}>TOKEN</div>
          <div style={{ flex: 1, minWidth: 0, padding: "0 12px" }}>PERSON / DETAILS</div>
          <div style={{ width: "100px", textAlign: "right", paddingRight: "16px", flexShrink: 0 }}>
            WAIT TIME
          </div>
          <div style={{ width: "108px", textAlign: "right", flexShrink: 0 }}>ACTIONS</div>
        </div>

        {/* -------------------------------------------------------------
            SCREEN 05: EMPTY QUEUE STATE (0 WAITING TOKENS)
           ------------------------------------------------------------- */}
        {waitingTokens.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 16px",
              textAlign: "center",
              backgroundColor: "var(--bg-surface)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "48px",
                fontWeight: 700,
                color: "var(--border-hairline)",
                lineHeight: 1,
                marginBottom: "8px",
              }}
            >
              0
            </div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              Queue is empty
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                maxWidth: "280px",
                lineHeight: 1.5,
              }}
            >
              Issue a token using the quick-entry bar above or click &quot;+ Add Token&quot;.
            </p>
          </div>
        ) : (
          /* Token Rows List */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--bg-surface)",
            }}
          >
            {waitingTokens.map((token, index) => {
              const isFirst = index === 0;
              const isLast = index === waitingTokens.length - 1;
              const isExpanded = expandedRowId === token._id;

              return (
                <div
                  key={token._id}
                  data-flip-id={`token-${token._id}`}
                  onClick={() => {
                    // Toggle expand on mobile / open drawer on double click or click
                    setExpandedRowId(isExpanded ? null : token._id);
                  }}
                  style={{
                    minHeight: isExpanded ? "74px" : "44px",
                    padding: "0 16px",
                    display: "flex",
                    flexDirection: isExpanded ? "column" : "row",
                    justifyContent: isExpanded ? "center" : "flex-start",
                    alignItems: isExpanded ? "stretch" : "center",
                    gap: isExpanded ? "8px" : "0",
                    borderBottom: "1px solid var(--border-hairline)",
                    borderLeft: isFirst ? "2px solid var(--border-focus)" : "2px solid transparent",
                    backgroundColor: isExpanded
                      ? "var(--bg-hover)"
                      : isFirst
                      ? "var(--bg-active-row)"
                      : "var(--bg-surface)",
                    transition: "all 140ms ease",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => {
                    if (!isFirst && !isExpanded) {
                      e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isFirst && !isExpanded) {
                      e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                    }
                  }}
                >
                  {/* Standard Row Layout */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      height: "44px",
                    }}
                  >
                    {/* Position */}
                    <div
                      style={{
                        width: "36px",
                        flexShrink: 0,
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        fontWeight: isFirst ? 700 : 500,
                        color: isFirst ? "var(--accent-primary)" : "var(--text-muted)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      #{(index + 1).toString().padStart(2, "0")}
                    </div>

                    {/* Token Number */}
                    <div
                      style={{
                        width: "90px",
                        flexShrink: 0,
                        paddingLeft: "4px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: isFirst ? "var(--accent-primary)" : "var(--text-primary)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {token.tokenNumber}
                    </div>

                    {/* Person Details */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: "0 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {token.personName}
                      </span>
                      {token.notes && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            backgroundColor: "var(--bg-canvas)",
                            border: "1px solid var(--border-hairline)",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {token.notes}
                        </span>
                      )}
                    </div>

                    {/* Wait Time */}
                    <div
                      style={{
                        width: "100px",
                        textAlign: "right",
                        paddingRight: "16px",
                        flexShrink: 0,
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {getElapsedWait(token.createdAt)}
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        width: "108px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "4px",
                        flexShrink: 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={isFirst}
                        title="Move Up"
                        aria-label="Move Up"
                        onClick={() => handleReorder(token, "UP", index)}
                        style={{
                          width: "26px",
                          height: "26px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "3px",
                          color: isFirst ? "var(--border-strong)" : "var(--text-secondary)",
                          cursor: isFirst ? "not-allowed" : "pointer",
                        }}
                        onMouseOver={(e) => {
                          if (!isFirst) {
                            e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isFirst) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }
                        }}
                      >
                        <ArrowUp size={14} />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={isLast}
                        title="Move Down"
                        aria-label="Move Down"
                        onClick={() => handleReorder(token, "DOWN", index)}
                        style={{
                          width: "26px",
                          height: "26px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "3px",
                          color: isLast ? "var(--border-strong)" : "var(--text-secondary)",
                          cursor: isLast ? "not-allowed" : "pointer",
                        }}
                        onMouseOver={(e) => {
                          if (!isLast) {
                            e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isLast) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                          }
                        }}
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Cancel Token */}
                      <button
                        type="button"
                        title="Cancel Token"
                        aria-label="Cancel Token"
                        onClick={() => {
                          setTokenToCancel(token);
                          setIsCancelModalOpen(true);
                        }}
                        style={{
                          width: "26px",
                          height: "26px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "3px",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--status-cancelled-bg)";
                          e.currentTarget.style.color = "var(--status-cancelled-text)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "var(--text-muted)";
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Expanded Touch State (74px) */}
                  {isExpanded && (
                    <div
                      className="md-hide"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBottom: "8px",
                        gap: "8px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleReorder(token, "UP", index)}
                          style={{
                            height: "26px",
                            padding: "0 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--border-strong)",
                            backgroundColor: "var(--bg-surface)",
                            fontSize: "11px",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <ArrowUp size={12} />
                          <span>Up</span>
                        </button>

                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleReorder(token, "DOWN", index)}
                          style={{
                            height: "26px",
                            padding: "0 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--border-strong)",
                            backgroundColor: "var(--bg-surface)",
                            fontSize: "11px",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <ArrowDown size={12} />
                          <span>Down</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedTokenForDrawer(token)}
                          style={{
                            height: "26px",
                            padding: "0 8px",
                            borderRadius: "4px",
                            border: "1px solid var(--border-hairline)",
                            backgroundColor: "var(--bg-surface)",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: "var(--text-secondary)",
                          }}
                        >
                          Detail
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTokenToCancel(token);
                          setIsCancelModalOpen(true);
                        }}
                        style={{
                          height: "26px",
                          padding: "0 8px",
                          borderRadius: "4px",
                          border: "1px solid #FECACA",
                          backgroundColor: "var(--status-cancelled-bg)",
                          color: "var(--status-cancelled-text)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <X size={12} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tonal Bottom Status Bar */}
      <footer
        style={{
          height: "36px",
          backgroundColor: "var(--bg-canvas)",
          borderTop: "1px solid var(--border-hairline)",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>
            STATION STATUS: <strong style={{ color: "var(--text-primary)" }}>ONLINE</strong>
          </span>
          <span>•</span>
          <span className="mobile-hide">
            DISPATCH MODE: <strong style={{ color: "var(--text-primary)" }}>GAP-INDEXED (1000)</strong>
          </span>
        </div>
        <div>
          <span>LIVE SYNC: </span>
          <span style={{ color: "var(--status-completed-text)", fontWeight: 600 }}>100% LOCK</span>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <CreateQueueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onQueueCreated={(newQ) => {
          loadQueues().then(() => router.push(`/queues?id=${newQ._id}`));
        }}
      />

      {selectedQueue && (
        <AddTokenModal
          isOpen={isAddTokenModalOpen}
          queueId={selectedQueue._id}
          queueName={selectedQueue.name}
          onClose={() => setIsAddTokenModalOpen(false)}
          onTokenAdded={(newToken) => {
            setWaitingTokens((prev) => [...prev, newToken]);
          }}
        />
      )}

      <ConfirmCancelDialog
        isOpen={isCancelModalOpen}
        token={
          tokenToCancel
            ? {
                _id: tokenToCancel._id,
                tokenNumber: tokenToCancel.tokenNumber,
                personName: tokenToCancel.personName,
                waitDuration: getElapsedWait(tokenToCancel.createdAt),
              }
            : null
        }
        isLoading={isCancelLoading}
        onClose={() => {
          setIsCancelModalOpen(false);
          setTokenToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
      />

      <ConfirmDeleteQueueDialog
        isOpen={isDeleteModalOpen}
        queue={
          selectedQueue
            ? {
                _id: selectedQueue._id,
                name: selectedQueue.name,
                waitingCount: waitingTokens.length,
              }
            : null
        }
        onClose={() => setIsDeleteModalOpen(false)}
        onQueueDeleted={async () => {
          const remaining = await loadQueues();
          if (remaining && remaining.length > 0) {
            router.push(`/queues?id=${remaining[0]._id}`);
          } else {
            setSelectedQueue(null);
            setWaitingTokens([]);
            setServingToken(null);
          }
        }}
      />

      <TokenDetailDrawer
        isOpen={!!selectedTokenForDrawer}
        token={selectedTokenForDrawer}
        onClose={() => setSelectedTokenForDrawer(null)}
        onTokenUpdated={(updated) => {
          setWaitingTokens((prev) =>
            prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t))
          );
          if (servingToken?._id === updated._id) {
            setServingToken((prev) => (prev ? { ...prev, ...updated } : null));
          }
        }}
        onRequestCancel={(tok) => {
          const found = waitingTokens.find((t) => t._id === tok._id);
          if (found) {
            setTokenToCancel(found);
            setIsCancelModalOpen(true);
          }
        }}
      />
    </div>
  );
}

export default function QueuesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "24px", color: "var(--text-muted)" }}>Loading Workspace...</div>}>
      <QueueWorkspace />
    </Suspense>
  );
}
